import {Event, AllEventFields} from './types';
import Statechart from './Statechart';
import State from './State';

export default class Machine<C, E extends Event> {
  private state: State<C, E>;

  constructor(private statechart: Statechart<C, E>) {
    this.state = statechart.initialState;
  }

  start(): Promise<(E | void)[]> {
    return this.exec(this.state);
  }

  goto(paths: string[], fields?: AllEventFields<E>): Promise<(E | void)[]> {
    this.state = this.statechart.goto(this.state, paths, fields);
    return this.exec(this.state);
  }

  send(event: E): Promise<(E | void)[]> {
    this.state = this.statechart.send(this.state, event);
    return this.exec(this.state);
  }

  exec(state: State<C, E>): Promise<(E | void)[]> {
    const send = this.send.bind(this);

    for (const a of state.activities.start) {
      a.start(send);
    }

    for (const a of state.activities.stop) {
      a.stop();
    }

    return Promise.all(
      state.effects.map(e =>
        ('exec' in e ? e.exec() : e()).then(e => {
          if (e) send(e);
          return e;
        }),
      ),
    );
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
