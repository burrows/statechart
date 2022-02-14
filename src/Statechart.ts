import Node, {Effect, Event, State} from './Node';

export default class Statechart<C, E extends Event> {
  private root: Node<C, E>;
  private initialContext: C;

  constructor(context: C, body: (n: Node<C, E>) => void) {
    this.root = new Node('', {}, body);
    this.initialContext = context;
  }

  get initialState(): State<C, E> {
    return this.root._enter(
      {context: this.initialContext, effects: [], current: []},
      {
        type: '__init__',
      } as E,
      [],
    );
  }

  send(state: State<C, E>, evt: E): State<C, E> {
    const seen = new Set<Node<C, E>>();
    const transitions: {
      pivot: Node<C, E>;
      to: Node<C, E>[];
      self: boolean;
    }[] = [];

    state = {...state, effects: []};

    for (const node of state.current) {
      let n: Node<C, E> | undefined = node;

      while (n && !seen.has(n)) {
        seen.add(n);

        const result = n.send(state, evt);

        if (!result) {
          n = n.parent;
          continue;
        }

        state = result.state;

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

        break;
      }
    }

    for (const {pivot, to, self} of transitions) {
      state = self ? pivot._exit(state, evt) : pivot.pivotExit(state, evt);
      state = self
        ? pivot._enter(state, evt, to)
        : pivot.pivotEnter(state, evt, to);
    }

    return state;
  }
}
