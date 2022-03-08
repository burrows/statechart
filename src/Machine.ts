import {Event} from './types';
import Statechart from './Statechart';
import State from './State';

export default class Machine<C, E extends Event> {
  private state: State<C, E>;

  constructor(private statechart: Statechart<C, E>) {
    this.state = new State({
      context: statechart.initialContext,
      effects: [],
      current: [],
      history: {},
      activities: {
        current: {},
        start: [],
        stop: [],
      },
    });
  }

  start(): this {
    this.state = this.statechart.initialState;
    return this.exec(this.state);
  }

  stop(): this {
    this.state = this.statechart.stop(this.state);
    return this.exec(this.state);
  }

  send(event: E): this {
    this.state = this.statechart.send(this.state, event);
    return this.exec(this.state);
  }

  exec(state: State<C, E>): this {
    const send = this.send.bind(this);

    state.activities.start.forEach(a => a.start(send));
    state.activities.stop.forEach(a => a.stop());
    state.effects.forEach(e => {
      if ('exec' in e) {
        e.exec(send);
      } else {
        e(send);
      }
    });

    return this;
  }

  get current(): string[] {
    return this.state.current.map(n => n.path);
  }

  get context(): C {
    return this.state.context;
  }

  matches(path: string): boolean {
    return this.state.matches(path);
  }
}
