import Node, {Effect, Event} from './Node';

export interface State<C, E extends Event> {
  current: Node<C, E>[];
  context: C;
  effects: Effect<E>[];
}

export default class Statechart<C, E extends Event> {
  public _root: Node<C, E>;
  private initialContext: C;

  constructor(context: C, body: (n: Node<C, E>) => void) {
    this._root = new Node('__root__', body);
    this.initialContext = context;
  }

  get initialState(): State<C, E> {
    const [context, effects, current] = this._root._enter(this.initialContext, {
      type: '__init__',
    } as E);

    return {current, context, effects};
  }

  send(state: State<C, E>, evt: E): State<C, E> {
    const nodes = state.current;
    let context = state.context;
    const effects: Effect<E>[] = [];
    const transitions: {from: Node<C, E>; to: Node<C, E>[]}[] = [];

    for (const node of nodes) {
      if (!node) continue;
      const [c, es, destNodes] = node.handle(context, evt);
      context = c;
      effects.push(...es);

      if (destNodes.length > 0) {
        transitions.push({from: node, to: destNodes});
      }
    }

    const current: Node<C, E>[] = [];

    for (const {from, to} of transitions) {
      const [c, es, ns] = this._transition(context, evt, from, to);
      context = c;
      effects.push(...es);
      current.push(...ns);
    }

    return {current, context, effects};
  }

  _transition(
    ctx: C,
    evt: E,
    from: Node<C, E>,
    to: Node<C, E>[],
  ): [C, Effect<E>[], Node<C, E>[]] {
    const pivots = to.map(n => Node.pivot(from, n));

    if (new Set(pivots).size > 1) {
      throw new Error('Statechart#transition: multiple pivot states found');
    }

    const pivot = pivots[0];

    if (!pivot) {
      throw new Error('Statechart#transition: could not find pivot node');
    }

    let effects: Effect<E>[] = [];
    let current: Node<C, E>[] = [];

    const [exitCtx, exitEffects] = pivot._pivotExit(ctx, evt, from);
    ctx = exitCtx;
    effects.push(...exitEffects);

    const [enterCtx, enterEffects, nodes] = pivot._pivotEnter(ctx, evt, to);
    ctx = enterCtx;
    effects.push(...enterEffects);
    current.push(...nodes);

    return [ctx, effects, current];
  }
}
