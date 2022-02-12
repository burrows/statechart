import Node from './Node';
import Statechart from './Statechart';

interface Ctx {
  ops: {type: 'enter' | 'exit'; path: string}[];
}
type Evt = {type: 'x'};

const trace = (s: Node<Ctx, Evt>): void => {
  s.enter(ctx => [
    {...ctx, ops: [...ctx.ops, {type: 'enter', path: s.toString()}]},
    [],
  ]);
  s.exit(ctx => [
    {...ctx, ops: [...ctx.ops, {type: 'exit', path: s.toString()}]},
    [],
  ]);
};

const sc1 = new Statechart<Ctx, Evt>({ops: []}, s => {
  trace(s);

  s.state('a', s => {
    trace(s);
    s.state('c', s => trace(s));
    s.state('d', s => trace(s));
  });

  s.state('b', s => {
    trace(s);
    s.state('e', s => trace(s));
    s.state('f', s => {
      trace(s);
      s.state('g', s => trace(s));
      s.state('h', s => trace(s));
      s.state('i', s => {
        trace(s);
        s.C(() => 'k');
        s.state('j', s => trace(s));
        s.state('k', s => {
          trace(s);
          s.state('l', s => trace(s));
          s.state('m', s => trace(s));
        });
      });
    });
  });
});

const sc2 = new Statechart<Ctx, Evt>({ops: []}, s => {
  trace(s);
  s.state('a', s => trace(s));

  s.state('b', {concurrent: true}, s => {
    trace(s);
    s.state('b1', s => {
      trace(s);
      s.state('c', s => trace(s));
      s.state('d', s => trace(s));
    });
    s.state('b2', s => {
      trace(s);
      s.state('e', s => trace(s));
      s.state('f', s => trace(s));
    });
    s.state('b3', s => {
      trace(s);
      s.state('g', s => trace(s));
      s.state('h', s => trace(s));
    });
  });
});

describe('Statechart#initialState', () => {
  it('is the result of entering the root state', () => {
    const state = sc1.initialState;
    expect(state.current.map(s => s.toString())).toEqual(['/a/c']);
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
    const [ctx, effects, nodes] = sc1._transition(
      {ops: []},
      {type: 'x'},
      sc1._root.resolve('/a/c')!,
      [sc1._root.resolve('/a/c')!],
      [sc1._root.resolve('/b/f/h')!],
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
    expect(nodes).toEqual([sc1._root.resolve('/b/f/h')]);
  });

  it('enters to a leaf state when the destination is not a leaf state', () => {
    const [ctx, effects, nodes] = sc1._transition(
      {ops: []},
      {type: 'x'},
      sc1._root.resolve('/a/c')!,
      [sc1._root.resolve('/a/c')!],
      [sc1._root.resolve('/b/f')!],
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
    expect(nodes).toEqual([sc1._root.resolve('/b/f/g')]);
  });

  it('uses condition function to determine child state to enter when present', () => {
    const [ctx, effects, nodes] = sc1._transition(
      {ops: []},
      {type: 'x'},
      sc1._root.resolve('/a/c')!,
      [sc1._root.resolve('/a/c')!],
      [sc1._root.resolve('/b/f/i')!],
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
    expect(nodes).toEqual([sc1._root.resolve('/b/f/i/k/l')]);
  });

  it('enters all child states of a concurrent state', () => {
    const [ctx, effects, nodes] = sc2._transition(
      {ops: []},
      {type: 'x'},
      sc2._root.resolve('/a')!,
      [sc2._root.resolve('/a')!],
      [sc2._root.resolve('/b')!],
    );

    expect(ctx).toEqual({
      ops: [
        {type: 'exit', path: '/a'},
        {type: 'enter', path: '/b'},
        {type: 'enter', path: '/b/b1'},
        {type: 'enter', path: '/b/b1/c'},
        {type: 'enter', path: '/b/b2'},
        {type: 'enter', path: '/b/b2/e'},
        {type: 'enter', path: '/b/b3'},
        {type: 'enter', path: '/b/b3/g'},
      ],
    });
    expect(effects).toEqual([]);
    expect(nodes).toEqual([
      sc2._root.resolve('/b/b1/c'),
      sc2._root.resolve('/b/b2/e'),
      sc2._root.resolve('/b/b3/g'),
    ]);
  });

  it('exits all child states of a concurrent state', () => {
    const [ctx, effects, nodes] = sc2._transition(
      {ops: []},
      {type: 'x'},
      sc2._root.resolve('/b/b1/c')!,
      [
        sc2._root.resolve('/b/b1/c')!,
        sc2._root.resolve('/b/b2/f')!,
        sc2._root.resolve('/b/b3/g')!,
      ],
      [sc2._root.resolve('/a')!],
    );

    expect(ctx).toEqual({
      ops: [
        {type: 'exit', path: '/b/b1/c'},
        {type: 'exit', path: '/b/b2/f'},
        {type: 'exit', path: '/b/b3/g'},
        {type: 'exit', path: '/b/b1'},
        {type: 'exit', path: '/b/b2'},
        {type: 'exit', path: '/b/b3'},
        {type: 'exit', path: '/b'},
        {type: 'enter', path: '/a'},
      ],
    });
    expect(effects).toEqual([]);
    expect(nodes).toEqual([sc2._root.resolve('/a')]);
  });
});
