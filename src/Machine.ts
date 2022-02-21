import {Event, AllEventFields} from './types';
import Statechart from './Statechart';
import State from './State';

export default class Machine<C, E extends Event> {
  private state: State<C, E>;

  constructor(private statechart: Statechart<C, E>) {
    this.state = statechart.initialState;
  }

  start(): this {
    return this.exec(this.state);
  }

  goto(paths: string[], fields?: AllEventFields<E>): this {
    this.state = this.statechart.goto(this.state, paths, fields);
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
