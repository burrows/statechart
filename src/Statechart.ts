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
    this._root = new Node('', {}, body);
    this.initialContext = context;
  }

  get initialState(): State<C, E> {
    const [context, effects, current] = this._root._enter(
      this.initialContext,
      {
        type: '__init__',
      } as E,
      [],
    );

    return {current, context, effects};
  }

  send(state: State<C, E>, evt: E): State<C, E> {
    let context = state.context;
    const seen = new Set<Node<C, E>>();
    const effects: Effect<E>[] = [];
    const transitions: {pivot: Node<C, E>; to: Node<C, E>[]}[] = [];

    for (const node of state.current) {
      let n: Node<C, E> | undefined = node;

      while (n && !seen.has(n)) {
        seen.add(n);

        const result = n.send(context, evt);

        if (!result) {
          n = n.parent;
          continue;
        }

        const [c, es, to] = result;
        context = c;
        effects.push(...es);

        const pivots = new Set<Node<C, E>>();

        for (const node of to) {
          const pivot = n.pivot(node);
          if (!pivot) {
            throw new Error(
              `Statechart#send: could not find pivot between ${n} and ${node}`,
            );
          }
          pivots.add(pivot);
        }

        if (pivots.size > 1) {
          throw new Error(
            `Statechart#send: invalid transition, multiple pivot states found between ${n} and ${to}`,
          );
        }

        transitions.push({pivot: Array.from(pivots)[0], to});
      }
    }

    const current: Node<C, E>[] = [];

    for (const {pivot, to} of transitions) {
      const [c, es, ns] = this._transition(
        context,
        evt,
        pivot,
        state.current,
        to,
      );
      context = c;
      effects.push(...es);
      current.push(...ns);
    }

    return {current, context, effects};
  }

  _transition(
    ctx: C,
    evt: E,
    pivot: Node<C, E>,
    from: Node<C, E>[],
    to: Node<C, E>[],
  ): [C, Effect<E>[], Node<C, E>[]] {
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
