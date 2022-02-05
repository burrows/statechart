import {initEvent, Event} from './Node';
import Statechart, {State} from './Statechart';

export default class Runner<C, E extends Event> {
  private state: State<C>;

  constructor(private statechart: Statechart<C, E>) {
    this.state = statechart.initialState;
  }

  start(): this {
    return this.send(initEvent);
  }

  send(event: E | typeof initEvent): this {
    const [state, effects] = this.statechart.send(this.state, event);

    this.state = state;

    for (const effect of effects) {
      effect.run(this.send.bind(this));
    }

    return this;
  }
}
