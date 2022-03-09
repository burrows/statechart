![Statechart](https://cdn.rawgit.com/burrows/statechart/90b94a845e1d7bed6707576a0cf4c1bb1baad1b6/logo.svg)

# Statechart

`Statechart` is a TypeScript library for building [Harel Statecharts](https://en.wikipedia.org/wiki/State_diagram#Harel_statechart).

## Installation

```
npm install @corey.burrows/statechart
```

## What are statecharts?

A statechart is like a traditional state machine with states, events, and
transitions, but it adds two features that make them much better at modeling
complex systems: hierarchical/clustered states and concurrent states.

Hierarchical (or clustered) states allow you to abstract common features from a
collection of states so that the common behavior can be implemented in a single
place. Each state in your statechart can actually be a tree of states with all
child states sharing the behavior of their parent states.

Concurrent states solve the state explosion problem that is so common in
traditional state machines. With a traditional state machine, whenever the
system has sub-systems with independent behavior, you need to create states that
represent each possible combination of the sub-system states. This can easily
get out of hand with even moderately complex systems, but statecharts solve this
by allowing child states that operate independently. This means that the current
state of a statechart is not a single state, but a vector of states whose length
is not fixed.

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
console.log(state.current.map(n => n.path)); //  ['/on']
state = toggle.send(state, {type: 'toggle'});
console.log(state.current.map(n => n.path)); //  ['/off']
state = toggle.send(state, {type: 'toggle'});
console.log(state.current.map(n => n.path)); //  ['/on']
```

This makes testing very easy because you are just testing a pure function that
takes some inputs (current state and an event) and produces a result (the next
state). We'll see later how side effects are handled.

A mutable `Machine` class is provided that will maintain the
current state of a statechart, but this is mainly provided as an example of how
to do it and you will most likely want to roll your own state manager (it's
quite easy).

```typescript
const toggleMachine = new Machine(toggle);

toggleMachine.start();
console.log(toggleMachine.current); // ['/on']
toggleMachine.send({type: 'toggle'});
console.log(toggleMachine.current); // ['/off']
toggleMachine.send({type: 'toggle'});
console.log(toggleMachine.current); // ['/on']
```
