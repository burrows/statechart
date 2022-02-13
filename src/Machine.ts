import {Event} from './Node';
import Statechart, {State} from './Statechart';

export default class Machine<C, E extends Event> {
  private state: State<C, E>;

  constructor(private statechart: Statechart<C, E>) {
    this.state = statechart.initialState;
  }

  start(): this {
    return this.exec(this.state);
  }

  send(event: E): this {
    this.state = this.statechart.send(this.state, event);
    return this.exec(this.state);
  }

  exec(state: State<C, E>): this {
    for (const effect of state.effects) {
      effect.run(this.send.bind(this));
    }
    return this;
  }

  get current(): string[] {
    return this.state.current.map(n => n.path);
  }

  get context(): C {
    return this.state.context;
  }
}
