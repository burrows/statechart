import Statechart from './Statechart';

interface Ctx {
  ops: {type: 'enter' | 'exit'; path: string}[];
}
type Evt = {type: 'x'};

const sc = new Statechart<Ctx, Evt>({ops: []}, s => {
  s.enter(ctx => [
    {...ctx, ops: [...ctx.ops, {type: 'enter', path: s.path}]},
    [],
  ]);
  s.exit(ctx => [
    {...ctx, ops: [...ctx.ops, {type: 'exit', path: s.path}]},
    [],
  ]);

  s.state('a', s => {
    s.enter(ctx => [
      {...ctx, ops: [...ctx.ops, {type: 'enter', path: s.path}]},
      [],
    ]);
    s.exit(ctx => [
      {...ctx, ops: [...ctx.ops, {type: 'exit', path: s.path}]},
      [],
    ]);

    s.state('c', s => {
      s.enter(ctx => [
        {...ctx, ops: [...ctx.ops, {type: 'enter', path: s.path}]},
        [],
      ]);
      s.exit(ctx => [
        {...ctx, ops: [...ctx.ops, {type: 'exit', path: s.path}]},
        [],
      ]);
    });

    s.state('d', s => {
      s.enter(ctx => [
        {...ctx, ops: [...ctx.ops, {type: 'enter', path: s.path}]},
        [],
      ]);
      s.exit(ctx => [
        {...ctx, ops: [...ctx.ops, {type: 'exit', path: s.path}]},
        [],
      ]);
    });
  });

  s.state('b', s => {
    s.enter(ctx => [
      {...ctx, ops: [...ctx.ops, {type: 'enter', path: s.path}]},
      [],
    ]);
    s.exit(ctx => [
      {...ctx, ops: [...ctx.ops, {type: 'exit', path: s.path}]},
      [],
    ]);

    s.state('e', s => {
      s.enter(ctx => [
        {...ctx, ops: [...ctx.ops, {type: 'enter', path: s.path}]},
        [],
      ]);
      s.exit(ctx => [
        {...ctx, ops: [...ctx.ops, {type: 'exit', path: s.path}]},
        [],
      ]);
    });

    s.state('f', s => {
      s.enter(ctx => [
        {...ctx, ops: [...ctx.ops, {type: 'enter', path: s.path}]},
        [],
      ]);
      s.exit(ctx => [
        {...ctx, ops: [...ctx.ops, {type: 'exit', path: s.path}]},
        [],
      ]);

      s.state('g', s => {
        s.enter(ctx => [
          {...ctx, ops: [...ctx.ops, {type: 'enter', path: s.path}]},
          [],
        ]);
        s.exit(ctx => [
          {...ctx, ops: [...ctx.ops, {type: 'exit', path: s.path}]},
          [],
        ]);
      });

      s.state('h', s => {
        s.enter(ctx => [
          {...ctx, ops: [...ctx.ops, {type: 'enter', path: s.path}]},
          [],
        ]);
        s.exit(ctx => [
          {...ctx, ops: [...ctx.ops, {type: 'exit', path: s.path}]},
          [],
        ]);
      });
    });
  });
});

describe('Statechart#initialState', () => {
  it('is the result of entering the root state', () => {
    const state = sc.initialState;
    expect(state.current.map(s => s.path)).toEqual(['/a/c']);
    expect(state.context).toEqual({
      ops: [
        {type: 'enter', path: '/'},
        {type: 'enter', path: '/a'},
        {type: 'enter', path: '/a/c'},
      ],
    });
    expect(state.effects).toEqual([]);
  });
});

describe('Statechart#_transition', () => {
  it('exits from the from state to the pivot state and then enters to the destination state', () => {
    const [ctx, effects, nodes] = sc._transition(
      {ops: []},
      {type: 'x'},
      sc._root.resolve('/a/c')!,
      [sc._root.resolve('/b/f/h')!],
    );

    expect(ctx).toEqual({
      ops: [
        {type: 'exit', path: '/a/c'},
        {type: 'exit', path: '/a'},
        {type: 'enter', path: '/b'},
        {type: 'enter', path: '/b/f'},
        {type: 'enter', path: '/b/f/h'},
      ],
    });
    expect(effects).toEqual([]);
    expect(nodes).toEqual([sc._root.resolve('/b/f/h')]);
  });

  it('enters to a leaf state when the destination is not a leaf state', () => {
    const [ctx, effects, nodes] = sc._transition(
      {ops: []},
      {type: 'x'},
      sc._root.resolve('/a/c')!,
      [sc._root.resolve('/b/f')!],
    );

    expect(ctx).toEqual({
      ops: [
        {type: 'exit', path: '/a/c'},
        {type: 'exit', path: '/a'},
        {type: 'enter', path: '/b'},
        {type: 'enter', path: '/b/f'},
        {type: 'enter', path: '/b/f/g'},
      ],
    });
    expect(effects).toEqual([]);
    expect(nodes).toEqual([sc._root.resolve('/b/f/g')]);
  });
});
