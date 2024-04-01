import { Event, Action, Activity } from './types';
import Node from './Node';

/**
 * `State` objects are immutable objects that track the current state of a
 * statechart.
 */
export default class State<C, E extends Event> {
  /** The current context. */
  context: C;
  /** A list of the current leaf state nodes. */
  current: Node<C, E>[];
  /**
   * A list of [[Action]] objects queued by the last [[default.send | send]].
   * You must either call these directly if they are [[ActionFn | functions]] or
   * call their [[ActionObj.exec | exec]] method if they are
   * [[ActionObj | objects]] in order for the side effects to actually run.
   */
  actions: Action<E>[];
  /** @internal */
  history: { [path: string]: string };
  /** The current [[Activity]] state. */
  activities: {
    /** The list of activities that are currently running. */
    current: { [path: string]: Activity<E>[] };
    /**
     * The list of activities that were queued by the last
     * [[default.send | send]] and thus must be started by calling their
     * [[Activity.start | start]] method.
     */
    start: Activity<E>[];
    /**
     * The list of activities that must be stopped by calling their
     * [[Activity.stop | stop]] method since the state that originally queued
     * them is no longer current.
     */
    stop: Activity<E>[];
  };

  /** @internal */
  constructor({
    context,
    current = [],
    actions = [],
    history = {},
    activities = { current: {}, start: [], stop: [] },
  }: {
    context: C;
    current?: Node<C, E>[];
    actions?: Action<E>[];
    history?: { [path: string]: string };
    activities?: {
      current: { [path: string]: Activity<E>[] };
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

  /** Returns the paths of the current states. */
  get paths(): string[] {
    return this.current.map((n) => n.path);
  }

  /**
   * Used to check if some state is current. The `path` parameter can be a path
   * to any state in the statechart (leaf state or otherwise). Throws an `Error`
   * if the given path cannot be resolved.
   */
  matches(path: string): boolean {
    return this.current.some((n) => n.matches(path));
  }

  /** @internal */
  update(data: Partial<this>): State<C, E> {
    return new State({ ...this, ...data });
  }
}
