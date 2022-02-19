import Node, {Event, Effect, Activity} from './Node';

export default class State<C, E extends Event> {
  current: Node<C, E>[];
  context: C;
  effects: Effect<E>[];
  history: {[path: string]: string};
  activities: {
    current: {[path: string]: Activity<E>[]};
    start: Activity<E>[];
    stop: Activity<E>[];
  };

  constructor({
    current,
    context,
    effects,
    history,
    activities,
  }: {
    current: Node<C, E>[];
    context: C;
    effects: Effect<E>[];
    history: {[path: string]: string};
    activities: {
      current: {[path: string]: Activity<E>[]};
      start: Activity<E>[];
      stop: Activity<E>[];
    };
  }) {
    this.current = current;
    this.context = context;
    this.effects = effects;
    this.history = history;
    this.activities = activities;
  }

  update(data: Partial<this>): State<C, E> {
    return new State({...this, ...data});
  }

  matches(path: string): boolean {
    return this.current.some(n => n.matches(path));
  }
}
