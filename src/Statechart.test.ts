import Node, {NodeOpts} from './Node';
import Statechart from './Statechart';

interface Ctx {
  ops: {type: 'enter' | 'exit'; path: string}[];
}

type Evt = {type: 'goto'; from: string; to: string[]};

const trace = (s: Node<Ctx, Evt>): void => {
  s.enter(ctx => [
    {...ctx, ops: [...ctx.ops, {type: 'enter', path: s.path}]},
    [],
  ]);

  s.exit(ctx => [
    {...ctx, ops: [...ctx.ops, {type: 'exit', path: s.path}]},
    [],
  ]);
};

const tstate = (
  s: Node<Ctx, Evt>,
  name: string,
  opts: NodeOpts,
  body?: (n: Node<Ctx, Evt>) => void,
) => {
  s.state(name, opts, s => {
    trace(s);
    s.on('goto', (ctx, evt) =>
      s.path === evt.from ? [ctx, [], evt.to] : undefined,
    );

    if (body) body(s);
  });
};

const sc1 = new Statechart<Ctx, Evt>({ops: []}, s => {
  trace(s);
  tstate(s, 'a', {}, s => {
    tstate(s, 'c', {});
    tstate(s, 'd', {});
  });
  tstate(s, 'b', {}, s => {
    tstate(s, 'e', {});
    tstate(s, 'f', {}, s => {
      tstate(s, 'g', {});
      tstate(s, 'h', {});
      tstate(s, 'i', {}, s => {
        s.C(() => 'k');
        tstate(s, 'j', {});
        tstate(s, 'k', {}, s => {
          tstate(s, 'l', {});
          tstate(s, 'm', {});
        });
      });
    });
  });
});

const sc2 = new Statechart<Ctx, Evt>({ops: []}, s => {
  trace(s);
  tstate(s, 'a', {});
  tstate(s, 'b', {concurrent: true}, s => {
    tstate(s, 'b1', {}, s => {
      tstate(s, 'c', {});
      tstate(s, 'd', {});
    });
    tstate(s, 'b2', {}, s => {
      tstate(s, 'e', {});
      tstate(s, 'f', {});
    });
    tstate(s, 'b3', {}, s => {
      tstate(s, 'g', {});
      tstate(s, 'h', {});
    });
  });
});

describe('Statechart#initialState', () => {
  it('is the result of entering the root state', () => {
    const state = sc1.initialState;
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

describe('Statechart#send', () => {
  it('exits current state to the pivot state and then enters to the destination state', () => {
    const state = sc1.send(sc1.initialState, {
      type: 'goto',
      from: '/a/c',
      to: ['/b/f/h'],
    });

    expect(state.current.map(n => n.path)).toEqual(['/b/f/h']);
    expect(state.context).toEqual({
      ops: [
        {type: 'enter', path: '/'},
        {type: 'enter', path: '/a'},
        {type: 'enter', path: '/a/c'},
        {type: 'exit', path: '/a/c'},
        {type: 'exit', path: '/a'},
        {type: 'enter', path: '/b'},
        {type: 'enter', path: '/b/f'},
        {type: 'enter', path: '/b/f/h'},
      ],
    });
    expect(state.effects).toEqual([]);
  });

  it('handles events at non-leaf states', () => {
    const state = sc1.send(sc1.initialState, {
      type: 'goto',
      from: '/a',
      to: ['/b/f/i/j'],
    });

    expect(state.current.map(n => n.path)).toEqual(['/b/f/i/j']);
    expect(state.context).toEqual({
      ops: [
        {type: 'enter', path: '/'},
        {type: 'enter', path: '/a'},
        {type: 'enter', path: '/a/c'},
        {type: 'exit', path: '/a/c'},
        {type: 'exit', path: '/a'},
        {type: 'enter', path: '/b'},
        {type: 'enter', path: '/b/f'},
        {type: 'enter', path: '/b/f/i'},
        {type: 'enter', path: '/b/f/i/j'},
      ],
    });
    expect(state.effects).toEqual([]);
  });

  it('transitions to paths that are relative to the handler', () => {
    const state = sc1.send(sc1.initialState, {
      type: 'goto',
      from: '/a/c',
      to: ['../d'],
    });

    expect(state.current.map(n => n.path)).toEqual(['/a/d']);
    expect(state.context).toEqual({
      ops: [
        {type: 'enter', path: '/'},
        {type: 'enter', path: '/a'},
        {type: 'enter', path: '/a/c'},
        {type: 'exit', path: '/a/c'},
        {type: 'enter', path: '/a/d'},
      ],
    });
    expect(state.effects).toEqual([]);
  });

  it('enters to a leaf state when the destination is not a leaf state', () => {
    const state = sc1.send(sc1.initialState, {
      type: 'goto',
      from: '/a/c',
      to: ['/b/f'],
    });

    expect(state.current.map(n => n.path)).toEqual(['/b/f/g']);
    expect(state.context).toEqual({
      ops: [
        {type: 'enter', path: '/'},
        {type: 'enter', path: '/a'},
        {type: 'enter', path: '/a/c'},
        {type: 'exit', path: '/a/c'},
        {type: 'exit', path: '/a'},
        {type: 'enter', path: '/b'},
        {type: 'enter', path: '/b/f'},
        {type: 'enter', path: '/b/f/g'},
      ],
    });
    expect(state.effects).toEqual([]);
  });

  it('uses condition function when present to determine child state to enter', () => {
    const state = sc1.send(sc1.initialState, {
      type: 'goto',
      from: '/a/c',
      to: ['/b/f/i'],
    });

    expect(state.current.map(n => n.path)).toEqual(['/b/f/i/k/l']);
    expect(state.context).toEqual({
      ops: [
        {type: 'enter', path: '/'},
        {type: 'enter', path: '/a'},
        {type: 'enter', path: '/a/c'},
        {type: 'exit', path: '/a/c'},
        {type: 'exit', path: '/a'},
        {type: 'enter', path: '/b'},
        {type: 'enter', path: '/b/f'},
        {type: 'enter', path: '/b/f/i'},
        {type: 'enter', path: '/b/f/i/k'},
        {type: 'enter', path: '/b/f/i/k/l'},
      ],
    });
    expect(state.effects).toEqual([]);
  });

  it('enters all child states of a concurrent state', () => {
    const state = sc2.send(sc2.initialState, {
      type: 'goto',
      from: '/a',
      to: ['/b'],
    });

    expect(state.current.map(n => n.path)).toEqual([
      '/b/b1/c',
      '/b/b2/e',
      '/b/b3/g',
    ]);
    expect(state.context).toEqual({
      ops: [
        {type: 'enter', path: '/'},
        {type: 'enter', path: '/a'},
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
    expect(state.effects).toEqual([]);
  });

  it('enters the specified substates of a concurrent state', () => {
    const state = sc2.send(sc2.initialState, {
      type: 'goto',
      from: '/a',
      to: ['/b/b1/d', '/b/b3/h'],
    });

    expect(state.current.map(n => n.path)).toEqual([
      '/b/b1/d',
      '/b/b2/e',
      '/b/b3/h',
    ]);
    expect(state.context).toEqual({
      ops: [
        {type: 'enter', path: '/'},
        {type: 'enter', path: '/a'},
        {type: 'exit', path: '/a'},
        {type: 'enter', path: '/b'},
        {type: 'enter', path: '/b/b1'},
        {type: 'enter', path: '/b/b1/d'},
        {type: 'enter', path: '/b/b2'},
        {type: 'enter', path: '/b/b2/e'},
        {type: 'enter', path: '/b/b3'},
        {type: 'enter', path: '/b/b3/h'},
      ],
    });
    expect(state.effects).toEqual([]);
  });

  it('exits all child states of a concurrent state', () => {
    let state = sc2.send(sc2.initialState, {
      type: 'goto',
      from: '/a',
      to: ['/b'],
    });

    state = sc2.send(state, {
      type: 'goto',
      from: '/b/b1/c',
      to: ['/a'],
    });

    expect(state.current.map(n => n.path)).toEqual(['/a']);
    expect(state.context).toEqual({
      ops: [
        {type: 'enter', path: '/'},
        {type: 'enter', path: '/a'},
        {type: 'exit', path: '/a'},
        {type: 'enter', path: '/b'},
        {type: 'enter', path: '/b/b1'},
        {type: 'enter', path: '/b/b1/c'},
        {type: 'enter', path: '/b/b2'},
        {type: 'enter', path: '/b/b2/e'},
        {type: 'enter', path: '/b/b3'},
        {type: 'enter', path: '/b/b3/g'},
        {type: 'exit', path: '/b/b1/c'},
        {type: 'exit', path: '/b/b1'},
        {type: 'exit', path: '/b/b2/e'},
        {type: 'exit', path: '/b/b2'},
        {type: 'exit', path: '/b/b3/g'},
        {type: 'exit', path: '/b/b3'},
        {type: 'exit', path: '/b'},
        {type: 'enter', path: '/a'},
      ],
    });
    expect(state.effects).toEqual([]);
  });
});
