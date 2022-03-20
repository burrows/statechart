import {InternalEvent, Event, NodeBody} from './types';
import State from './State';
import Node from './Node';

/**
 * ```typescript
 * const statechart = new Statechart<Ctx, Evt>(initialContext, (s) => {
 *   s.state('a');
 *   s.state('b');
 * });
 * ```
 *
 * @typeParam C The type of the statechart context. This can be any aribitray
 * object.
 * @typeParam E The event type. This must be a discriminated union with a
 * string `type` field.
 */
export default class Statechart<C, E extends Event> {
  public initialContext: C;
  private root: Node<C, E>;
  private _initialState?: State<C, E>;

  constructor(context: C, body: NodeBody<C, E>) {
    this.root = new Node('', body);
    this.initialContext = context;
  }

  /**
   * Returns the initial state of the statechart by entering from the root
   * state. Enter handlers will be passed an internal event with the type
   * `__start__`.
   */
  get initialState(): State<C, E> {
    return (
      this._initialState ||
      (this._initialState = this.root._enter(
        new State({context: this.initialContext}),
        {type: '__start__'},
        [],
      ))
    );
  }

  /**
   * Stop the statechart by exiting from the given stte up through the root
   * state. Exit handlers will be passed an internal event with the type
   * `__stop__`.
   */
  stop(state: State<C, E>): State<C, E> {
    return this.root._exit(state, {type: '__stop__'});
  }

  /**
   * Send an event to the statechart, possibily causing a transition. The event
   * will be sent to the current states as defined by the `state` param and the
   * updated state is returned.
   */
  send(state: State<C, E>, evt: InternalEvent | E): State<C, E> {
    const seen = new Set<Node<C, E>>();
    const transitions: {
      pivot: Node<C, E>;
      to: Node<C, E>[];
      self: boolean;
    }[] = [];

    state = state.update({
      actions: [],
      activities: {
        ...state.activities,
        start: [],
        stop: [],
      },
    });

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

          const pivot = Array.from(pivots)[0];

          if (pivot.type === 'concurrent') {
            throw new Error(
              `Statechart#send: invalid transition, ${n} to ${result.goto} crosses a concurrency boundary`,
            );
          }

          transitions.push({pivot, to: result.goto, self});
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

  /**
   * Returns a string representation of the statechart. If a `State` instance is
   * passed then the current state(s) will be marked in the output.
   */
  inspect(state?: State<C, E>): string {
    return this.root.inspect({state});
  }
}
