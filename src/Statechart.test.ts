import Statechart from './Statechart';

interface Ctx {
  ops: {type: 'enter' | 'exit'; path: string}[];
}
type Evt = {type: 'x'};

const sc = new Statechart<Ctx, Evt>({ops: []}, s => {
  s.enter(c => [{...c, ops: [...c.ops, {type: 'enter', path: s.path}]}, []]);
  s.exit(c => [{...c, ops: [...c.ops, {type: 'exit', path: s.path}]}, []]);

  s.state('a', s => {
    s.enter(c => [{...c, ops: [...c.ops, {type: 'enter', path: s.path}]}, []]);
    s.exit(c => [{...c, ops: [...c.ops, {type: 'exit', path: s.path}]}, []]);

    s.state('c', s => {
      s.enter(c => [
        {...c, ops: [...c.ops, {type: 'enter', path: s.path}]},
        [],
      ]);
      s.exit(c => [{...c, ops: [...c.ops, {type: 'exit', path: s.path}]}, []]);
    });

    s.state('d', s => {
      s.enter(c => [
        {...c, ops: [...c.ops, {type: 'enter', path: s.path}]},
        [],
      ]);
      s.exit(c => [{...c, ops: [...c.ops, {type: 'exit', path: s.path}]}, []]);
    });
  });

  s.state('b', s => {
    s.enter(c => [{...c, ops: [...c.ops, {type: 'enter', path: s.path}]}, []]);
    s.exit(c => [{...c, ops: [...c.ops, {type: 'exit', path: s.path}]}, []]);

    s.state('e', s => {
      s.enter(c => [
        {...c, ops: [...c.ops, {type: 'enter', path: s.path}]},
        [],
      ]);
      s.exit(c => [{...c, ops: [...c.ops, {type: 'exit', path: s.path}]}, []]);
    });

    s.state('f', s => {
      s.enter(c => [
        {...c, ops: [...c.ops, {type: 'enter', path: s.path}]},
        [],
      ]);
      s.exit(c => [{...c, ops: [...c.ops, {type: 'exit', path: s.path}]}, []]);

      s.state('g', s => {
        s.enter(c => [
          {...c, ops: [...c.ops, {type: 'enter', path: s.path}]},
          [],
        ]);
        s.exit(c => [
          {...c, ops: [...c.ops, {type: 'exit', path: s.path}]},
          [],
        ]);
      });

      s.state('h', s => {
        s.enter(c => [
          {...c, ops: [...c.ops, {type: 'enter', path: s.path}]},
          [],
        ]);
        s.exit(c => [
          {...c, ops: [...c.ops, {type: 'exit', path: s.path}]},
          [],
        ]);
      });

      s.state('i', s => {
        s.C(() => 'k');

        s.enter(c => [
          {...c, ops: [...c.ops, {type: 'enter', path: s.path}]},
          [],
        ]);
        s.exit(c => [
          {...c, ops: [...c.ops, {type: 'exit', path: s.path}]},
          [],
        ]);
        s.state('j', s => {
          s.enter(c => [
            {...c, ops: [...c.ops, {type: 'enter', path: s.path}]},
            [],
          ]);
          s.exit(c => [
            {...c, ops: [...c.ops, {type: 'exit', path: s.path}]},
            [],
          ]);
        });
        s.state('k', s => {
          s.enter(c => [
            {...c, ops: [...c.ops, {type: 'enter', path: s.path}]},
            [],
          ]);
          s.exit(c => [
            {...c, ops: [...c.ops, {type: 'exit', path: s.path}]},
            [],
          ]);
          s.state('l', s => {
            s.enter(c => [
              {...c, ops: [...c.ops, {type: 'enter', path: s.path}]},
              [],
            ]);
            s.exit(c => [
              {...c, ops: [...c.ops, {type: 'exit', path: s.path}]},
              [],
            ]);
          });
          s.state('m', s => {
            s.enter(c => [
              {...c, ops: [...c.ops, {type: 'enter', path: s.path}]},
              [],
            ]);
            s.exit(c => [
              {...c, ops: [...c.ops, {type: 'exit', path: s.path}]},
              [],
            ]);
          });
        });
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

  it('uses condition function to determine child state to enter when present', () => {
    const [ctx, effects, nodes] = sc._transition(
      {ops: []},
      {type: 'x'},
      sc._root.resolve('/a/c')!,
      [sc._root.resolve('/b/f/i')!],
    );

    expect(ctx).toEqual({
      ops: [
        {type: 'exit', path: '/a/c'},
        {type: 'exit', path: '/a'},
        {type: 'enter', path: '/b'},
        {type: 'enter', path: '/b/f'},
        {type: 'enter', path: '/b/f/i'},
        {type: 'enter', path: '/b/f/i/k'},
        {type: 'enter', path: '/b/f/i/k/l'},
      ],
    });
    expect(effects).toEqual([]);
    expect(nodes).toEqual([sc._root.resolve('/b/f/i/k/l')]);
  });
});
