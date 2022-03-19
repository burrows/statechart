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
type Ctx = string[];
type Evt = {type: 'x'};

const statechart = new Statechart<Ctx, Evt>([], s => {
  s.state('a', s => {
    s.enter(ctx => ({context: [...ctx, 'enter:a']}));
    s.exit(ctx => ({context: [...ctx, 'exit:a']}));

    s.state('c', s => {
      s.enter(ctx => ({context: [...ctx, 'enter:c']}));
      s.exit(ctx => ({context: [...ctx, 'exit:c']}));

      s.on('x', (ctx, evt) => ({context: [...ctx, 'handle:x'], goto: '/b/f'}));
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

### Actions

### Activities

## Machines

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

