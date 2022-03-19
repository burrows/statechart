# Statechart

## What are statecharts?

A statechart is like a traditional state machine with states, events, and
transitions, but in a statechart each state is actually a node in a hierarchy.
State nodes can be either clustered or concurrent.

Clustered states allow you to abstract common features from a collection of
states so that the common behavior can be implemented in a single place. When a
clustered state is current, **exactly one** of its child states must be current.

Concurrent states solve the state explosion problem that is so common in
traditional state machines. With a traditional state machine, whenever the
system has sub-systems with independent behavior, you need to create states that
represent each possible combination of the sub-system states. This can easily
get out of hand with even moderately complex systems, but statecharts solve this
by allowing child states that operate independently. When a concurrent state is
current, **all** of its child states are also current. This means that the
current state of a statechart is not a single state, but a vector of states
whose length is not fixed.

## _Stateless_ statecharts

The `Statechart` class allows you to build _stateless_ statecharts. This may
seem counterintuitive at first, but it has many practical benefits. A
`Statechart` instance is an object with a `send` method that accepts a current
state and an event and returns a new state. The `send` method does not mutate
the `Statechart` instance, so you are responsible for maintaining the current
state elsewhere.

```typescript
import Statechart from '@corey.burrows/statechart';

type Evt = {type: 'toggle'};

const toggle = new Statechart<{}, Evt>({}, s => {
  s.state('on', s => {
    s.on('toggle', '../off');
  });

  s.state('off', s => {
    s.on('toggle', '../on');
  });
});

let state = toggle.initialState;
console.log(state.paths); // ['/on']
state = toggle.send(state, {type: 'toggle'});
console.log(state.paths); // ['/off']
state = toggle.send(state, {type: 'toggle'});
console.log(state.paths); // ['/on']
```

This makes testing very easy because you are just testing a pure function that
takes some inputs (current state and an event) and produces a result (the next
state). We'll see later how we can make use of this to actually perform side
effects in our statechart driven applications.

## States

A statechart is just a collection of states and events. States can specify
transitions to other states based on a given event. A statechart always has a
current set of states. When an event is sent to the statechart, each current
state gets an opportunity to handle it and optionally trigger a transition.

### State Context

Simply tracking the current state of a system is usually not enough and you'll
want to maintain some additional data (such as model objects loaded from an API)
as your statechart moves through different states. This is called the state
context and is an arbitrary object that can be updated by state enter, exit, and
event handlers. You must specify the type of this object as a generic type
parameter when instantiating `Statechart`.

The context is updated by returning an object from the enter/exit/event handler
with a `context` key pointing to the newly updated context. **You must be
careful to not perform mutable updates to the context object since that would
create a side effect.**:

```typescript
import Statechart from '@corey.burrows/statechart';

interface Ctx {
  widgetId?: number;
}
type Evt = {type: 'SELECT_WIDGET'; id: number};

const statechart = new Statechart<Ctx, Evt>({}, s => {
  s.state('home', s => {
    s.on('SELECT_WIDGET', '../widgets');
  });

  s.state('widgets', s => {
    s.enter((ctx, evt) => {
      if (evt.type === 'SELECT_WIDGET') {
        return {context: {...ctx, widgetId: evt.id}};
      }
    });
  });
});

let state = statechart.initialState;
console.log(state.paths, state.context); // [ '/home' ] {}
state = statechart.send(state, {type: 'SELECT_WIDGET', id: 123});
console.log(state.paths, state.context); // [ '/widgets' ] { widgetId: 123 }
```

If you need to update the context and trigger a transition from an event
handler, you can do so by returning an object with both `context` and `goto`
keys:

```typescript
s.on('FOO', (ctx, evt) => {
  return {context: {...ctx, foo: true}, goto: '/some/path'};
});
```

### Clustered States

Clustered states allow you to group together states that share common behavior.
For example, if you have several states that all need to trigger a transition to
the same destination state on the same event, then you could group those states
together under a clustered parent state and define the transition on the parent.

```typescript
import Statechart from '@corey.burrows/statechart';

interface Ctx {}
type Evt = {type: 'one'} | {type: 'two'} | {type: 'three'} | {type: 'four'};

const statechart = new Statechart<Ctx, Evt>({}, s => {
  s.state('A', s => {
    s.on('three', '../B');

    s.state('C', s => {
      s.on('two', '../../B');
    });

    s.state('D', s => {
      s.on('one', '../C');
    });
  });

  s.state('B', s => {
    s.on('four', '../A/D');
  });
});

let state = statechart.initialState;
console.log(state.paths); // ['/A/C']
state = statechart.send(state, {type: 'three'});
console.log(state.paths); // ['/B']
```

We can see here that states `C` and `D` are refinements of state `A`. The event
`three` will trigger a transtion to state `B` when either `C` or `D` are
current, but the event `two` will only trigger a transition when state `C` is
current.

The default state of a clustered state is the first defined child state. That is
why the initial state is `/A/C`: `A` is the first child state of the root state
and `C` is the first child state of `A`.

When a clustered state is entered during a transition it determines the child
state to enter as follows:

1. The child state specified by the given destination state.
1. If the state has a condition function defined, the child state returned by
   calling it with the current context and event.
1. If the state is marked as a history state and has been previously entered,
   the most recently exited child state.
1. The default (first) child state.

#### Condition Functions

As described above, condition functions can be defined on states to control
which child state gets entered based on either the current context or the event
that triggered the transition or a combination of both:

```typescript
import Statechart from '@corey.burrows/statechart';

interface Ctx {}
type Evt = {type: 'x'; value: number};

const statechart = new Statechart<Ctx, Evt>({}, s => {
  s.state('A', s => {
    s.on('x', '../B');
  });

  s.state('B', s => {
    s.C((ctx, evt) => (evt.type === 'x' && evt.value % 2 === 0 ? 'C' : 'D'));
    s.state('C');
    s.state('D');
  });
});

let s1 = statechart.send(statechart.initialState, {type: 'x', value: 1});
console.log(s1.paths); // ['/B/D']
let s2 = statechart.send(statechart.initialState, {type: 'x', value: 2});
console.log(s2.paths); // ['/B/C']
```

The `C` method of the state accepts a `ConditionFn` which must return the name
of a child state. It gets passed the current context and event object that
triggered the transition.

#### History States

Clustered states can also be marked as history states using the `H` method.
History states remember their most recently exited child state and will enter
that state when re-entered.

```typescript
import Statechart from '@corey.burrows/statechart';

interface Ctx {}
type Evt = {type: 'x'} | {type: 'y'} | {type: 'z'};

const statechart = new Statechart<Ctx, Evt>({}, s => {
  s.state('A', s => {
    s.on('x', '../B/D');
    s.on('y', '../B');
  });

  s.state('B', s => {
    s.H();
    s.state('C');
    s.state('D');
    s.on('z', '../A');
  });
});

let state = statechart.initialState;
console.log(state.paths); // ['/A']
state = statechart.send(state, {type: 'x'});
console.log(state.paths); // ['/B/D']
state = statechart.send(state, {type: 'z'});
console.log(state.paths); // ['/A']
state = statechart.send(state, {type: 'y'});
console.log(state.paths); // ['/B/D']
```

The `y` event handler only specifies a transtion to the `/B` state, but instead
of entering `B`'s default substate it enters substate `D` instead since it is a
history state and `D` was the most recently exited substate.

A state and all of its descendants can be recursivedly marked as history states
by passing the string `'*'` to the `H` method:

```typescript
s.state('A', s => {
  s.H('*');
  s.state('B');
  s.state('C', s => {
    // State C is automatically a history state.
    s.state('D');
    s.state('E');
  });
});
```

### Concurrent States

Concurrent states allow you to add independent behavior to your statechart
without exploding the number of states and transitions you need to define. When
a concurrent state is entered, **all** of its child states are entered. This
creates a situation where the current state of the statechart is actually
multiple states. When a concurrent state is current, events will be sent to all
of the child states. Each child state can cause transitions within itself or
outside of the concurrent state entirely, but they cannot cause transtions
between the concurrent sibling states. Similar to entering a concurrent state,
exiting a concurrent state causes all of its child states to be exited.

```typescript
import Statechart from '@corey.burrows/statechart';

interface Ctx {}
type Evt =
  | {type: 'toggleBold'}
  | {type: 'toggleUnderline'}
  | {type: 'leftClicked'}
  | {type: 'rightClicked'}
  | {type: 'centerClicked'}
  | {type: 'justifyClicked'}
  | {type: 'regularClicked'}
  | {type: 'numberClicked'}
  | {type: 'resetClicked'};

const statechart = new Statechart<Ctx, Evt>({}, s => {
  s.concurrent();

  s.state('bold', s => {
    s.state('off', s => {
      s.on('toggleBold', '../on');
    });
    s.state('on', s => {
      s.on('toggleBold', '../off');
    });
    s.on('resetClicked', './off');
  });

  s.state('underline', s => {
    s.state('off', s => {
      s.on('toggleUnderline', '../on');
    });
    s.state('on', s => {
      s.on('toggleUnderline', '../off');
    });
    s.on('resetClicked', './off');
  });

  s.state('align', s => {
    s.state('left');
    s.state('right');
    s.state('center');
    s.state('justify');

    s.on('leftClicked', './left');
    s.on('rightClicked', './right');
    s.on('centerClicked', './center');
    s.on('justifyClicked', './justify');
    s.on('resetClicked', './left');
  });

  s.state('bullets', s => {
    s.state('none', s => {
      s.on('regularClicked', '../regular');
      s.on('numberClicked', '../number');
    });
    s.state('regular', s => {
      s.on('regularClicked', '../none');
      s.on('numberClicked', '../number');
    });
    s.state('number', s => {
      s.on('regularClicked', '../regular');
      s.on('numberClicked', '../none');
    });
    s.on('resetClicked', './none');
  });

  s.on('resetClicked', [
    '/bold/off',
    '/underline/off',
    '/align/left',
    '/bullets/none',
  ]);
});

let state = statechart.initialState;
console.log(state.paths);
// [ '/bold/off', '/underline/off', '/align/left', '/bullets/none' ]
state = statechart.send(state, {type: 'toggleBold'});
console.log(state.paths);
// [ '/underline/off', '/align/left', '/bullets/none', '/bold/on' ]
state = statechart.send(state, {type: 'toggleUnderline'});
console.log(state.paths);
// [ '/align/left', '/bullets/none', '/bold/on', '/underline/on' ]
state = statechart.send(state, {type: 'rightClicked'});
console.log(state.paths);
// [ '/bullets/none', '/bold/on', '/underline/on', '/align/right' ]
state = statechart.send(state, {type: 'justifyClicked'});
console.log(state.paths);
// [ '/bullets/none', '/bold/on', '/underline/on', '/align/justify' ]
state = statechart.send(state, {type: 'regularClicked'});
console.log(state.paths);
// [ '/bold/on', '/underline/on', '/align/justify', '/bullets/regular' ]
state = statechart.send(state, {type: 'regularClicked'});
console.log(state.paths);
// [ '/bold/on', '/underline/on', '/align/justify', '/bullets/none' ]
state = statechart.send(state, {type: 'numberClicked'});
console.log(state.paths);
// [ '/bold/on', '/underline/on', '/align/justify', '/bullets/number' ]
state = statechart.send(state, {type: 'resetClicked'});
console.log(state.paths);
// [ '/bold/off', '/underline/off', '/align/left', '/bullets/none' ]
```

## Transitions

Transitions are how a statechart moves between states. They occur when an event
is sent to a statechart with a current state that handles the event and
indicates a transition should be made using the `on` method.

A transition always involves one or more current states and one or more
destination states. They work by first running the event handler on the current
state and then exiting the current state up to, but not including, a pivot
state. The pivot state is the nearest common ancestor between the current state
and the destination state. Once the pivot state has been reached, the
destination states are entered down to the final leaf states.

```typescript
import Statechart from '@corey.burrows/statechart';

type Ctx = string[];
type Evt = {type: 'x'};

const statechart = new Statechart<Ctx, Evt>([], s => {
  s.state('a', s => {
    s.enter(ctx => ({context: [...ctx, 'enter:a']}));
    s.exit(ctx => ({context: [...ctx, 'exit:a']}));

    s.state('c', s => {
      s.enter(ctx => ({context: [...ctx, 'enter:c']}));
      s.exit(ctx => ({context: [...ctx, 'exit:c']}));

      s.on('x', (ctx) => ({context: [...ctx, 'handle:x'], goto: '/b/f'}));
    });

    s.state('d', s => {
      s.enter(ctx => ({context: [...ctx, 'enter:d']}));
      s.exit(ctx => ({context: [...ctx, 'exit:d']}));
    });
  });

  s.state('b', s => {
    s.enter(ctx => ({context: [...ctx, 'enter:b']}));
    s.exit(ctx => ({context: [...ctx, 'exit:b']}));

    s.state('e', s => {
      s.enter(ctx => ({context: [...ctx, 'enter:e']}));
      s.exit(ctx => ({context: [...ctx, 'exit:e']}));
    });

    s.state('f', s => {
      s.enter(ctx => ({context: [...ctx, 'enter:f']}));
      s.exit(ctx => ({context: [...ctx, 'exit:f']}));
    });
  });
});

let state = statechart.initialState;

console.log(state.paths);
// [ '/a/c' ]
console.log(state.context);
// [ 'enter:a', 'enter:c' ]
state = statechart.send(state, {type: 'x'});
console.log(state.paths);
// [ '/b/f' ]
console.log(state.context);
// ['enter:a', 'enter:c', 'handle:x', 'exit:c', 'exit:a', 'enter:b', 'enter:f'];
```

In addition to triggering a transition with the `goto` key, event handlers can
also update the context (as shown above) and queue actions.

For simple transitions, you can also specify just the destination state(s):

```typescript
s.on('x', '../a');
s.on('y', ['../b/c', '../b/d']);
```

## Side Effects

Although explicitly tracking a system's current state and extended state (via
`context`) in a pure manner is quite useful, systems also often need to perform
(possibly asynchronous) side effects on the world such as fetching data or
rendering to the screen. `Statechart` supports two types of side effects:

* Actions: one shot side effects that can be queued by state enter/exit handlers
  or event handlers
* Activities: recurrent side effects the run for the duration that the state
  that queued them are current

Note that the term _queued_ is used to describe how states interact with side
effects. It is important to understand that a statechart does not actually
execute the effects, it simply adds them to the `state` object returned by the
`send` method where they must be executed by either the `Machine` class or a
custom machine that you provide.

### Actions

Actions are one shot side effects that can be queued by enter/exit handlers or
event handlers. An action is simply an object that implements an
`exec(send: SendFn<E>): void` method. The exec method can perform some
asynchronous action and then use the given `send` function to pass an event back
into the statechart.

```typescript
import Statechart, {SendFn, ActionObj} from '@corey.burrows/statechart';

interface Widget {
  id: number;
  name: string;
}

interface Ctx {
  loadingWidgets: boolean;
  widgets: Widget[];
}

type Evt = {type: 'FETCH_WIDGETS_SUCCESS'; widgets: Widget[]};

class FetchWidgets {
  exec(send: SendFn<Evt>): void {
    setTimeout(() => {
      send({
        type: 'FETCH_WIDGETS_SUCCESS',
        widgets: [
          {id: 1, name: 'foo'},
          {id: 2, name: 'bar'},
          {id: 3, name: 'baz'},
        ],
      });
    }, 1);
  }
}

const initCtx = {loadingWidgets: false, widgets: []};

const statechart = new Statechart<Ctx, Evt>(initCtx, s => {
  s.state('widgets', s => {
    s.state('loading', s => {
      s.enter(ctx => ({
        context: {...ctx, loadingWidgets: true},
        actions: [new FetchWidgets()],
      }));

      s.exit(ctx => ({context: {...ctx, loadingWidgets: false}}));

      s.on('FETCH_WIDGETS_SUCCESS', '../loaded');
    });

    s.state('loaded', s => {
      s.enter((ctx, evt) =>
        evt.type === 'FETCH_WIDGETS_SUCCESS'
          ? {context: {...ctx, widgets: evt.widgets}}
          : {},
      );
    });
  });
});

let state = statechart.initialState;
console.log(state.paths);
// [ '/widgets/loading' ]
console.log(state.context);
// { loadingWidgets: true, widgets: [] }
console.log(state.actions);
// [ FetchWidgets {} ]
(state.actions[0] as ActionObj<Evt>).exec((evt: Evt) => {
  state = statechart.send(state, evt);
  console.log(state.paths);
  // [ '/widgets/loaded' ]
  console.log(state.context);
  // {
  //   loadingWidgets: false,
  //   widgets: [
  //     { id: 1, name: 'foo' },
  //     { id: 2, name: 'bar' },
  //     { id: 3, name: 'baz' }
  //   ]
  // }
  console.log(state.actions);
  // []
});
```

### Activities

Activities are similar to actions, but they are active for the duration of time
that the state that queued them is current. This means that activities can only
be queued by state enter handlers. Activities are useful for performing periodic
side effects such as polling an API for new data. Activities are any object that
implements the following methods:

* `start(send: SendFn<E>): void`
* `stop(): void`

The `start` method is just like an action's `exec` method. The `stop` method
should stop whatever periodic timer the `start` method starts.

```typescript
import Statechart, {SendFn} from '@corey.burrows/statechart';

interface Ctx {
  count: number;
}

type Evt = {type: 'TICK'} | {type: 'START'} | {type: 'STOP'};

class Ticker {
  interval?: number;

  start(send: SendFn<Evt>): void {
    this.interval = (setInterval(() => {
      send({type: 'TICK'});
    }, 1000);
  }

  stop(): void {
    clearInterval(this.interval);
  }
}

const statechart = new Statechart<Ctx, Evt>({count: 0}, s => {
  s.state('off', s => {
    s.on('START', '../on');
  });

  s.state('on', s => {
    s.enter(() => ({activities: [new Ticker()]}));
    s.on('TICK', ctx => ({context: {...ctx, count: ctx.count + 1}}));
    s.on('STOP', '../off');
  });
});

let state = statechart.initialState;
state = statechart.send(state, {type: 'START'});
console.log(state.paths);
console.log(state.context);
state.activities.start[0].start((evt: Evt) => {
  state = statechart.send(state, evt);
  console.log('TICK:', state.context);
});
setTimeout(() => {
  state = statechart.send(state, {type: 'STOP'});
  console.log(state.paths);
  console.log(state.context);
  state.activities.stop[0].stop();
}, 3100);

// [ '/on' ]
// { count: 0 }
// TICK: { count: 1 }
// TICK: { count: 2 }
// TICK: { count: 3 }
// [ '/off' ]
// { count: 3 }
```

When a state enter handler queues an activty using the `activities` key, the
statechart will add that activity to the returned state's `activities.start`
property. The outside machine code is responsible for actually calling the
object's `start` method. Then whenever that state is eventually exited, the
activity will be moved to the return state's `activities.stop` property.

## Machines

As previously mentioned, a `Statechart` instance is an immutable object that
provides a pure `send` method that takes the current state and an event and
returns the next state. Any side effects are simply added to a queue, not
acutally executed.

To make use of a statechart, you'll need to provide some orchestration code to
maintain what the current state is and to execute side effects. The `Statechart`
library provides a [`Machine`](src/Machine.ts) class that does this, but you
may want to implement this yourself to depending on the needs of your
application.

Using the statechart from the activities example:

```typescript
const machine = new Machine(statechart);

machine.start();

machine.send({type: 'START'});

setTimeout(() => {
  machine.send({type: 'STOP'});

  console.log(machine.paths); // [ '/off' ]
  console.log(machine.context); // { count: 3 }
}, 3100);
```

## Bringing it all together

* Create states to represent each possible system configuration
* Design the state context to be a minimal, flat, and fully normalized
  representation of the data needed by the system
* Use selector functions over the state contex to compute derived data
* Use `enter` handlers to update the state context appropriate for the state's
  particular system configuration
* Use `enter` handlers to queue any necessary side effects that the state needs
  (e.g. load data)
* Use `exit` handlers to clean up the context

