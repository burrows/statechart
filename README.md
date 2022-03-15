![Statechart](https://cdn.rawgit.com/burrows/statechart/90b94a845e1d7bed6707576a0cf4c1bb1baad1b6/logo.svg)

# Statechart

`Statechart` is a TypeScript library for building [Harel Statecharts](https://en.wikipedia.org/wiki/State_diagram#Harel_statechart).

## Installation

```
npm install @corey.burrows/statechart
```

## Basic Usage

```typescript
import Statechart from '@corey.burrows/statechart';

type Ctx {}
type Evt = {type: 'toggle'};

const toggle = new Statechart<Ctx, Evt>({}, s => {
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

## Documentation

* [Overview](OVERVIEW.md)
* [API Docs](docs/README.md)
* [Statecharts paper](http://www.wisdom.weizmann.ac.il/~harel/papers/Statecharts.pdf)
* [Statecharts History paper](http://www.wisdom.weizmann.ac.il/~harel/papers/Statecharts.History.pdf)

## License

Statechart is [MIT licensed](LICENSE).
