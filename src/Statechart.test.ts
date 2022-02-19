import {NodeOpts, NodeBody, SendFn} from './types';
import Node from './Node';
import Statechart from './Statechart';

interface Ctx {
  ops: {type: 'enter' | 'exit'; path: string}[];
}

type Evt = {type: 'goto'; from: string; to: string | string[]} | {type: 'noop'};

const trace = (s: Node<Ctx, Evt>): void => {
  s.enter(ctx => ({
    context: {...ctx, ops: [...ctx.ops, {type: 'enter', path: s.path}]},
  }));

  s.exit(ctx => ({
    context: {...ctx, ops: [...ctx.ops, {type: 'exit', path: s.path}]},
  }));
};

const tstate = (
  s: Node<Ctx, Evt>,
  name: string,
  opts: NodeOpts,
  body?: NodeBody<Ctx, Evt>,
) => {
  s.state(name, opts, s => {
    trace(s);
    s.on('goto', (_ctx, evt) =>
      s.path === evt.from ? {goto: evt.to} : undefined,
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

const sc3 = new Statechart<Ctx, Evt>({ops: []}, s => {
  trace(s);
  tstate(s, 'a', {});
  tstate(s, 'b', {}, s => {
    tstate(s, 'c', {H: true}, s => {
      tstate(s, 'e', {});
      tstate(s, 'f', {});
      tstate(s, 'g', {});
    });
    tstate(s, 'd', {H: '*'}, s => {
      tstate(s, 'h', {}, s => {
        tstate(s, 'j', {});
        tstate(s, 'k', {});
      });
      tstate(s, 'i', {}, s => {
        tstate(s, 'l', {});
        tstate(s, 'm', {});
      });
    });
  });
});

describe('Statechart constructor', () => {
  it('throws an error when a state does not have a name', () => {
    expect(() => {
      new Statechart<Ctx, Evt>({ops: []}, s => {
        s.state('');
      });
    }).toThrow(new Error('Node#state: state must have a name'));
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

describe('Statechart#goto', () => {
  it('transitions the statechart to the given state(s)', () => {
    let state = sc1.initialState;
    expect(state.current.map(s => s.path)).toEqual(['/a/c']);

    state = sc1.goto(state, ['/b/f/i/k/m']);
    expect(state.current.map(s => s.path)).toEqual(['/b/f/i/k/m']);
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
        {type: 'enter', path: '/b/f/i/k/m'},
      ],
    });
  });
});

describe('Statechart#send', () => {
  it('exits current state to the pivot state and then enters to the destination state', () => {
    const state = sc1.send(sc1.initialState, {
      type: 'goto',
      from: '/a/c',
      to: '/b/f/h',
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
      to: '/b/f/i/j',
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
      to: '../d',
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
      to: '/b/f',
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
      to: '/b/f/i',
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
      to: '/b',
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
      to: '/b',
    });

    state = sc2.send(state, {
      type: 'goto',
      from: '/b/b1/c',
      to: '/a',
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

  it('exits and re-enters the current states when a self transition is indicated', () => {
    const state = sc1.send(sc1.initialState, {
      type: 'goto',
      from: '/a',
      to: '.',
    });

    expect(state.current.map(n => n.path)).toEqual(['/a/c']);
    expect(state.context).toEqual({
      ops: [
        {type: 'enter', path: '/'},
        {type: 'enter', path: '/a'},
        {type: 'enter', path: '/a/c'},
        {type: 'exit', path: '/a/c'},
        {type: 'exit', path: '/a'},
        {type: 'enter', path: '/a'},
        {type: 'enter', path: '/a/c'},
      ],
    });
    expect(state.effects).toEqual([]);
  });

  it('does nothing on events that are not handled', () => {
    const state = sc1.send(sc1.initialState, {type: 'noop'});

    expect(state.current.map(n => n.path)).toEqual(['/a/c']);
    expect(state.context).toEqual({
      ops: [
        {type: 'enter', path: '/'},
        {type: 'enter', path: '/a'},
        {type: 'enter', path: '/a/c'},
      ],
    });
    expect(state.effects).toEqual([]);
  });

  it('handles transitions in nested concurrent states', () => {
    let state = sc2.send(sc2.initialState, {
      type: 'goto',
      from: '/a',
      to: '/b',
    });

    expect(state.current.map(n => n.path)).toEqual([
      '/b/b1/c',
      '/b/b2/e',
      '/b/b3/g',
    ]);

    state = sc2.send(state, {
      type: 'goto',
      from: '/b/b3/g',
      to: '../h',
    });

    expect(state.current.map(n => n.path)).toEqual([
      '/b/b1/c',
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
        {type: 'enter', path: '/b/b1/c'},
        {type: 'enter', path: '/b/b2'},
        {type: 'enter', path: '/b/b2/e'},
        {type: 'enter', path: '/b/b3'},
        {type: 'enter', path: '/b/b3/g'},
        {type: 'exit', path: '/b/b3/g'},
        {type: 'enter', path: '/b/b3/h'},
      ],
    });
    expect(state.effects).toEqual([]);
  });

  it('handles multiple transitions across concurrent states', () => {
    type Ctx = {};
    type Evt = {type: 'foo'};

    const sc = new Statechart<Ctx, Evt>({}, s => {
      s.state('b', {concurrent: true}, s => {
        s.state('b1', s => {
          s.state('x', s => {
            s.on('foo', '../y');
          });
          s.state('y');
        });
        s.state('b2', s => {
          s.state('x');
          s.state('y');
        });
        s.state('b3', s => {
          s.state('x', s => {
            s.on('foo', '../y');
          });
          s.state('y');
        });
      });
    });

    const state = sc.send(sc.initialState, {type: 'foo'});

    expect(state.current.map(n => n.path)).toEqual([
      '/b/b2/x',
      '/b/b1/y',
      '/b/b3/y',
    ]);
  });

  it('handles shallow history states', () => {
    let state = sc3.send(sc3.initialState, {
      type: 'goto',
      from: '/a',
      to: '/b/c/f',
    });

    expect(state.current.map(n => n.path)).toEqual(['/b/c/f']);
    expect(state.context).toEqual({
      ops: [
        {type: 'enter', path: '/'},
        {type: 'enter', path: '/a'},
        {type: 'exit', path: '/a'},
        {type: 'enter', path: '/b'},
        {type: 'enter', path: '/b/c'},
        {type: 'enter', path: '/b/c/f'},
      ],
    });

    state = sc3.send(state, {
      type: 'goto',
      from: '/b',
      to: '/a',
    });

    expect(state.current.map(n => n.path)).toEqual(['/a']);
    expect(state.context).toEqual({
      ops: [
        {type: 'enter', path: '/'},
        {type: 'enter', path: '/a'},
        {type: 'exit', path: '/a'},
        {type: 'enter', path: '/b'},
        {type: 'enter', path: '/b/c'},
        {type: 'enter', path: '/b/c/f'},
        {type: 'exit', path: '/b/c/f'},
        {type: 'exit', path: '/b/c'},
        {type: 'exit', path: '/b'},
        {type: 'enter', path: '/a'},
      ],
    });

    state = sc3.send(state, {
      type: 'goto',
      from: '/a',
      to: '/b/c',
    });

    expect(state.current.map(n => n.path)).toEqual(['/b/c/f']);
    expect(state.context).toEqual({
      ops: [
        {type: 'enter', path: '/'},
        {type: 'enter', path: '/a'},
        {type: 'exit', path: '/a'},
        {type: 'enter', path: '/b'},
        {type: 'enter', path: '/b/c'},
        {type: 'enter', path: '/b/c/f'},
        {type: 'exit', path: '/b/c/f'},
        {type: 'exit', path: '/b/c'},
        {type: 'exit', path: '/b'},
        {type: 'enter', path: '/a'},
        {type: 'exit', path: '/a'},
        {type: 'enter', path: '/b'},
        {type: 'enter', path: '/b/c'},
        {type: 'enter', path: '/b/c/f'},
      ],
    });
  });

  it('handles deep history states', () => {
    let state = sc3.send(sc3.initialState, {
      type: 'goto',
      from: '/a',
      to: '/b/d/i/m',
    });

    expect(state.current.map(n => n.path)).toEqual(['/b/d/i/m']);
    expect(state.context).toEqual({
      ops: [
        {type: 'enter', path: '/'},
        {type: 'enter', path: '/a'},
        {type: 'exit', path: '/a'},
        {type: 'enter', path: '/b'},
        {type: 'enter', path: '/b/d'},
        {type: 'enter', path: '/b/d/i'},
        {type: 'enter', path: '/b/d/i/m'},
      ],
    });

    state = sc3.send(state, {
      type: 'goto',
      from: '/b',
      to: '/a',
    });

    expect(state.current.map(n => n.path)).toEqual(['/a']);
    expect(state.context).toEqual({
      ops: [
        {type: 'enter', path: '/'},
        {type: 'enter', path: '/a'},
        {type: 'exit', path: '/a'},
        {type: 'enter', path: '/b'},
        {type: 'enter', path: '/b/d'},
        {type: 'enter', path: '/b/d/i'},
        {type: 'enter', path: '/b/d/i/m'},
        {type: 'exit', path: '/b/d/i/m'},
        {type: 'exit', path: '/b/d/i'},
        {type: 'exit', path: '/b/d'},
        {type: 'exit', path: '/b'},
        {type: 'enter', path: '/a'},
      ],
    });

    state = sc3.send(state, {
      type: 'goto',
      from: '/a',
      to: '/b/d',
    });

    expect(state.current.map(n => n.path)).toEqual(['/b/d/i/m']);
    expect(state.context).toEqual({
      ops: [
        {type: 'enter', path: '/'},
        {type: 'enter', path: '/a'},
        {type: 'exit', path: '/a'},
        {type: 'enter', path: '/b'},
        {type: 'enter', path: '/b/d'},
        {type: 'enter', path: '/b/d/i'},
        {type: 'enter', path: '/b/d/i/m'},
        {type: 'exit', path: '/b/d/i/m'},
        {type: 'exit', path: '/b/d/i'},
        {type: 'exit', path: '/b/d'},
        {type: 'exit', path: '/b'},
        {type: 'enter', path: '/a'},
        {type: 'exit', path: '/a'},
        {type: 'enter', path: '/b'},
        {type: 'enter', path: '/b/d'},
        {type: 'enter', path: '/b/d/i'},
        {type: 'enter', path: '/b/d/i/m'},
      ],
    });
  });

  it('throws an exception when multiple pivot states are found', () => {
    expect(() => {
      sc1.send(sc1.initialState, {
        type: 'goto',
        from: '/a/c',
        to: ['/a/d', '/b'],
      });
    }).toThrow(
      new Error(
        'Statechart#send: invalid transition, multiple pivot states found between /a/c and /a/d,/b',
      ),
    );
  });

  it('throws an exception when a concurrency boundary is crossed', () => {
    let state = sc2.send(sc2.initialState, {
      type: 'goto',
      from: '/a',
      to: '/b',
    });

    expect(state.current.map(n => n.path)).toEqual([
      '/b/b1/c',
      '/b/b2/e',
      '/b/b3/g',
    ]);

    expect(() => {
      sc2.send(state, {
        type: 'goto',
        from: '/b/b1/c',
        to: '../../b2/e',
      });
    }).toThrow(
      new Error(
        'Statechart#send: invalid transition, /b/b1/c to /b/b2/e crosses a concurrency boundary',
      ),
    );
  });

  it('throws an exception when multiple cluster destination states are indicated', () => {
    expect(() => {
      sc1.send(sc1.initialState, {
        type: 'goto',
        from: '/a/c',
        to: ['/b/e', '/b/f'],
      });
    }).toThrow(
      new Error(
        'Node#childToEnter: invalid transition, cannot enter multiple child states of cluster state /b',
      ),
    );
  });

  describe('effects', () => {
    interface Ctx {}
    type Evt = {type: 'x'} | {type: 'y'} | {type: 'z'};

    const effc1 = (): Promise<Evt> => Promise.resolve({type: 'z'});
    const effc2 = (): Promise<Evt> => Promise.resolve({type: 'z'});
    const effc3 = (): Promise<Evt> => Promise.resolve({type: 'z'});
    const effc4 = (): Promise<Evt> => Promise.resolve({type: 'z'});
    const effd1 = (): Promise<Evt> => Promise.resolve({type: 'z'});
    const effd2 = (): Promise<Evt> => Promise.resolve({type: 'z'});
    const effb1 = (): Promise<Evt> => Promise.resolve({type: 'z'});
    const effg1 = (): Promise<Evt> => Promise.resolve({type: 'z'});
    const effg2 = (): Promise<Evt> => Promise.resolve({type: 'z'});
    const effi1 = (): Promise<Evt> => Promise.resolve({type: 'z'});
    const effi2 = (): Promise<Evt> => Promise.resolve({type: 'z'});
    const effi3 = (): Promise<Evt> => Promise.resolve({type: 'z'});

    const sc = new Statechart<Ctx, Evt>({}, s => {
      s.state('a', s => {
        s.state('c', s => {
          s.enter(() => ({effects: [effc1]}));
          s.exit(() => ({effects: [effc2]}));
          s.on('x', '../d');
          s.on('y', () => ({effects: [effc3]}));
          s.on('z', () => ({effects: [effc4], goto: '/b'}));
        });
        s.state('d', s => {
          s.enter(() => ({effects: [effd1, effd2]}));
          s.on('x', '/b');
        });
      });
      s.state('b', {concurrent: true}, s => {
        s.enter(() => ({effects: [effb1]}));

        s.state('e', s => {
          s.state('g', s => {
            s.enter(() => ({effects: [effg1]}));
            s.exit(() => ({effects: [effg2]}));
          });
          s.state('h');
        });
        s.state('f', s => {
          s.state('i', s => {
            s.enter(() => ({effects: [effi1, effi2]}));
            s.exit(() => ({effects: [effi3]}));
          });
          s.state('j');
        });

        s.on('x', '../a');
      });
    });

    it('gathers effects from enter and exit handlers', () => {
      let state = sc.initialState;
      expect(state.current.map(n => n.path)).toEqual(['/a/c']);
      expect(state.effects).toEqual([effc1]);

      state = sc.send(state, {type: 'x'});
      expect(state.current.map(n => n.path)).toEqual(['/a/d']);
      expect(state.effects).toEqual([effc2, effd1, effd2]);

      state = sc.send(state, {type: 'x'});
      expect(state.current.map(n => n.path)).toEqual(['/b/e/g', '/b/f/i']);
      expect(state.effects).toEqual([effb1, effg1, effi1, effi2]);

      state = sc.send(state, {type: 'x'});
      expect(state.current.map(n => n.path)).toEqual(['/a/c']);
      expect(state.effects).toEqual([effg2, effi3, effc1]);
    });

    it('gathers effects from event handlers', () => {
      let state = sc.initialState;
      expect(state.current.map(n => n.path)).toEqual(['/a/c']);

      state = sc.send(state, {type: 'y'});
      expect(state.current.map(n => n.path)).toEqual(['/a/c']);
      expect(state.effects).toEqual([effc3]);

      state = sc.send(state, {type: 'z'});
      expect(state.current.map(n => n.path)).toEqual(['/b/e/g', '/b/f/i']);
      expect(state.effects).toEqual([effc4, effc2, effb1, effg1, effi1, effi2]);
    });
  });

  describe('activities', () => {
    interface Ctx {}
    type Evt = {type: 'x'};

    const acta1 = {start(_send: SendFn<Evt>): void {}, stop(): void {}};
    const actc1 = {start(_send: SendFn<Evt>): void {}, stop(): void {}};
    const actc2 = {start(_send: SendFn<Evt>): void {}, stop(): void {}};
    const actd1 = {start(_send: SendFn<Evt>): void {}, stop(): void {}};
    const actb1 = {start(_send: SendFn<Evt>): void {}, stop(): void {}};
    const actg1 = {start(_send: SendFn<Evt>): void {}, stop(): void {}};
    const acti1 = {start(_send: SendFn<Evt>): void {}, stop(): void {}};

    const sc = new Statechart<Ctx, Evt>({}, s => {
      s.state('a', s => {
        s.enter(() => ({activities: [acta1]}));

        s.state('c', s => {
          s.enter(() => ({activities: [actc1, actc2]}));
          s.on('x', '../d');
        });
        s.state('d', s => {
          s.enter(() => ({activities: [actd1]}));
          s.on('x', '../../b');
        });
      });
      s.state('b', {concurrent: true}, s => {
        s.enter(() => ({activities: [actb1]}));

        s.state('e', s => {
          s.state('g', s => {
            s.enter(() => ({activities: [actg1]}));
          });
          s.state('h');
        });
        s.state('f', s => {
          s.state('i', s => {
            s.enter(() => ({activities: [acti1]}));
          });
          s.state('j');
        });

        s.on('x', '/a');
      });
    });

    it('adds activities to activities.current and activities.start as states are entered and moves them to stop when states are exited', () => {
      let state = sc.initialState;
      expect(state.current.map(n => n.path)).toEqual(['/a/c']);
      expect(state.activities.current).toEqual({
        '/a': [acta1],
        '/a/c': [actc1, actc2],
      });
      expect(state.activities.start).toEqual([acta1, actc1, actc2]);
      expect(state.activities.stop).toEqual([]);

      state = sc.send(state, {type: 'x'});
      expect(state.current.map(n => n.path)).toEqual(['/a/d']);
      expect(state.activities.current).toEqual({
        '/a': [acta1],
        '/a/d': [actd1],
      });
      expect(state.activities.start).toEqual([actd1]);
      expect(state.activities.stop).toEqual([actc1, actc2]);

      state = sc.send(state, {type: 'x'});
      expect(state.current.map(n => n.path)).toEqual(['/b/e/g', '/b/f/i']);
      expect(state.activities.current).toEqual({
        '/b': [actb1],
        '/b/e/g': [actg1],
        '/b/f/i': [acti1],
      });
      expect(state.activities.start).toEqual([actb1, actg1, acti1]);
      expect(state.activities.stop).toEqual([actd1, acta1]);

      state = sc.send(state, {type: 'x'});
      expect(state.current.map(n => n.path)).toEqual(['/a/c']);
      expect(state.activities.current).toEqual({
        '/a': [acta1],
        '/a/c': [actc1, actc2],
      });
      expect(state.activities.start).toEqual([acta1, actc1, actc2]);
      expect(state.activities.stop).toEqual([actg1, acti1, actb1]);
    });
  });
});

describe('Statechart#inspect', () => {
  it('returns a tree representation of the statechart and indicates the current state(s)', () => {
    let s1 = sc1.initialState;
    expect(sc1.inspect(s1)).toBe(`/ *
├── a *
│   ├── c *
│   └── d
└── b
    ├── e
    └── f
        ├── g
        ├── h
        └── i
            ├── j
            └── k
                ├── l
                └── m
`);

    s1 = sc1.goto(s1, ['/b/f/i/k/m']);

    expect(sc1.inspect(s1)).toBe(`/ *
├── a
│   ├── c
│   └── d
└── b *
    ├── e
    └── f *
        ├── g
        ├── h
        └── i *
            ├── j
            └── k *
                ├── l
                └── m *
`);

    let s2 = sc2.initialState;
    expect(sc2.inspect(s2)).toEqual(
      `/ *
├── a *
└── b
    ├┄┄ b1
    │   ├── c
    │   └── d
    ├┄┄ b2
    │   ├── e
    │   └── f
    └┄┄ b3
        ├── g
        └── h
`,
    );

    s2 = sc2.goto(s2, ['/b']);
    expect(sc2.inspect(s2)).toEqual(
      `/ *
├── a
└── b *
    ├┄┄ b1 *
    │   ├── c *
    │   └── d
    ├┄┄ b2 *
    │   ├── e *
    │   └── f
    └┄┄ b3 *
        ├── g *
        └── h
`,
    );
  });
});
