import {Event, Action, Activity} from './types';
import Node from './Node';

export default class State<C, E extends Event> {
  context: C;
  current: Node<C, E>[];
  actions: Action<E>[];
  history: {[path: string]: string};
  activities: {
    current: {[path: string]: Activity<E>[]};
    start: Activity<E>[];
    stop: Activity<E>[];
  };

  constructor({
    context,
    current = [],
    actions = [],
    history = {},
    activities = {current: {}, start: [], stop: []},
  }: {
    context: C;
    current?: Node<C, E>[];
    actions?: Action<E>[];
    history?: {[path: string]: string};
    activities?: {
      current: {[path: string]: Activity<E>[]};
      start: Activity<E>[];
      stop: Activity<E>[];
    };
  }) {
    this.context = context;
    this.current = current;
    this.actions = actions;
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
