import {Event} from './Node';
import Statechart from './Statechart';
import {State} from './Node';

export default class Machine<C, E extends Event> {
  private state: State<C, E>;

  constructor(private statechart: Statechart<C, E>) {
    this.state = statechart.initialState;
  }

  start(): Promise<(E | undefined)[]> {
    return this.exec(this.state);
  }

  send(event: E): Promise<(E | undefined)[]> {
    this.state = this.statechart.send(this.state, event);
    return this.exec(this.state);
  }

  exec(state: State<C, E>): Promise<(E | undefined)[]> {
    const send = this.send.bind(this);

    for (const a of state.activities.start) {
      a.start(send);
    }
    for (const a of state.activities.stop) {
      a.stop();
    }
    return Promise.all(
      state.effects.map(e =>
        typeof e === 'function' ? e(send) : e.exec(send),
      ),
    );
  }

  get current(): string[] {
    return this.state.current.map(n => n.path);
  }

  get context(): C {
    return this.state.context;
  }
}
