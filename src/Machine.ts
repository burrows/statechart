import { Event } from './types';
import Node from './Node';
import Statechart from './Statechart';
import State from './State';

const trace = (
  event: Event | null,
  from: State<any, any> | null,
  to: State<any, any>
): void => {
  const e = event ? event.type : '__init__';
  const f = from ? JSON.stringify(from.current.map((n) => n.path)) : '(null)';
  const t = JSON.stringify(to.current.map((n) => n.path));
  console.info(`[${e}]: ${f} -> ${t}`);
};

/**
 * Provides a reference `Machine` class for maintaining the current state of a
 * statechart and executing side effects. It's perfectly valid choose to
 * implement this logic for yourself if this class doesn't suit your needs.
 */
export default class Machine<C, E extends Event> {
  private state: State<C, E>;
  private observer?: (state: State<C, E>) => void;
  private trace: boolean;

  constructor(
    private statechart: Statechart<C, E>,
    {
      observer,
      trace = false,
    }: { observer?: (state: State<C, E>) => void; trace?: boolean } = {}
  ) {
    this.state = this.statechart.initialState;
    this.observer = observer;
    this.trace = trace;
  }

  start(): this {
    if (this.trace) trace(null, null, this.state);
    this.observer?.(this.state);
    return this.exec(this.state);
  }

  stop(): this {
    this.state = this.statechart.stop(this.state);
    this.observer?.(this.state);
    return this.exec(this.state);
  }

  send(event: E): this {
    const from = this.state;
    this.state = this.statechart.send(this.state, event);
    if (this.trace) trace(event, from, this.state);
    this.observer?.(this.state);
    return this.exec(this.state);
  }

  exec(state: State<C, E>): this {
    const send = this.send.bind(this);

    state.activities.start.forEach((a) => a.start(send));
    state.activities.stop.forEach((a) => a.stop());
    state.actions.forEach((a) => {
      if ('exec' in a) {
        a.exec(send);
      } else {
        a(send);
      }
    });

    return this;
  }

  get current(): Node<C, E>[] {
    return this.state.current;
  }

  get paths(): string[] {
    return this.state.paths;
  }

  get context(): C {
    return this.state.context;
  }

  matches(path: string): boolean {
    return this.state.matches(path);
  }
}
