import Node, {Effect, Event} from './Node';

export interface State<C, E extends Event> {
  current: Node<C, E>[];
  context: C;
  effects: Effect<E>[];
}

export default class Statechart<C, E extends Event> {
  private root: Node<C, E>;
  private initialContext: C;

  constructor(context: C, body: (n: Node<C, E>) => void) {
    this.root = new Node('', {}, body);
    this.initialContext = context;
  }

  get initialState(): State<C, E> {
    return this.root._enter(
      this.initialContext,
      {
        type: '__init__',
      } as E,
      [],
    );
  }

  send(state: State<C, E>, evt: E): State<C, E> {
    let context = state.context;
    const seen = new Set<Node<C, E>>();
    const effects: Effect<E>[] = [];
    const transitions: {
      pivot: Node<C, E>;
      to: Node<C, E>[];
      self: boolean;
    }[] = [];

    for (const node of state.current) {
      let n: Node<C, E> | undefined = node;

      while (n && !seen.has(n)) {
        seen.add(n);

        const result = n.send(context, evt);

        if (!result) {
          n = n.parent;
          continue;
        }

        context = result.context;
        effects.push(...result.effects);

        if (result.goto.length) {
          const pivots = new Set<Node<C, E>>();
          const self = result.goto.every(n => node.lineage.includes(n));

          for (const node of result.goto) {
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
              `Statechart#send: invalid transition, multiple pivot states found between ${n} and ${result.goto}`,
            );
          }

          transitions.push({
            pivot: Array.from(pivots)[0],
            to: result.goto,
            self,
          });
        }
      }
    }

    const current: Node<C, E>[] = [];

    for (const {pivot, to, self} of transitions) {
      const exitRes = self
        ? pivot._exit(context, evt, state.current)
        : pivot.pivotExit(context, evt, state.current);
      context = exitRes.context;
      effects.push(...exitRes.effects);

      const enterRes = self
        ? pivot._enter(context, evt, to)
        : pivot.pivotEnter(context, evt, to);
      context = enterRes.context;
      effects.push(...enterRes.effects);
      current.push(...enterRes.current);
    }

    return {current, context, effects};
  }
}
