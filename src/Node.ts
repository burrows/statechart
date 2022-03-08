import {
  Event,
  EnterHandler,
  ExitHandler,
  ConditionFn,
  EventHandlerResult,
  EventHandler,
  NodeBody,
  InternalEvent,
} from './types';
import State from './State';

export default class Node<C, E extends Event> {
  public name: string;
  public type: 'cluster' | 'concurrent';
  public parent?: Node<C, E>;
  public children: Map<string, Node<C, E>>;
  private history: 'none' | 'shallow' | 'deep';
  private defaultChild?: string;
  private enterHandlers: EnterHandler<C, E>[];
  private preEnterHandlers: EnterHandler<C, E>[];
  private postEnterHandlers: EnterHandler<C, E>[];
  private exitHandlers: ExitHandler<C, E>[];
  private preExitHandlers: ExitHandler<C, E>[];
  private postExitHandlers: ExitHandler<C, E>[];
  private condition?: ConditionFn<C, E>;
  private handlers: {
    [evt: string]: (...args: any[]) => EventHandlerResult<C, E> | void;
  };

  constructor(name: string, body?: NodeBody<C, E>) {
    this.name = name;
    this.type = 'cluster';
    this.history = 'none';
    this.children = new Map();
    this.enterHandlers = [];
    this.preEnterHandlers = [];
    this.postEnterHandlers = [];
    this.exitHandlers = [];
    this.preExitHandlers = [];
    this.postExitHandlers = [];
    this.handlers = {};
    if (body) body(this);
  }

  concurrent(): this {
    this.type = 'concurrent';
    return this;
  }

  H(star?: '*'): this {
    this.history = star ? 'deep' : 'shallow';
    return this;
  }

  state(name: string, body?: NodeBody<C, E>): this {
    if (!name) throw new Error('Node#state: state must have a name');

    const node = new Node(name, body);
    node.parent = this;
    this.children.set(name, node);
    this.defaultChild = this.defaultChild || name;
    return this;
  }

  enter(
    handler: EnterHandler<C, E>,
    {type}: {type?: 'pre' | 'post'} = {},
  ): this {
    switch (type) {
      case 'pre':
        this.preEnterHandlers.push(handler);
        break;
      case 'post':
        this.postEnterHandlers.push(handler);
        break;
      default:
        this.enterHandlers.push(handler);
    }
    return this;
  }

  exit(handler: ExitHandler<C, E>, {type}: {type?: 'pre' | 'post'} = {}): this {
    switch (type) {
      case 'pre':
        this.preExitHandlers.push(handler);
        break;
      case 'post':
        this.postExitHandlers.push(handler);
        break;
      default:
        this.exitHandlers.push(handler);
    }
    return this;
  }

  on<T extends E['type']>(
    type: T,
    handler: EventHandler<C, E, T> | string | string[],
  ): this {
    this.handlers[type] =
      typeof handler === 'string' || Array.isArray(handler)
        ? () => ({goto: handler})
        : handler;
    return this;
  }

  C(f: ConditionFn<C, E>): this {
    this.condition = f;
    return this;
  }

  get root(): Node<C, E> {
    return this.parent?.root || this;
  }

  get isRoot(): boolean {
    return !this.parent;
  }

  get isLeaf(): boolean {
    return this.children.size === 0;
  }

  get lineage(): Node<C, E>[] {
    return (this.parent?.lineage || []).concat([this]);
  }

  get depth(): number {
    return this.lineage.length - 1;
  }

  get path(): string {
    return this.isRoot ? '/' : this.lineage.map(n => n.name).join('/');
  }

  get isHistory(): boolean {
    if (this.history !== 'none') return true;
    let n = this.parent;
    while (n) {
      if (n.history === 'deep') return true;
      n = n.parent;
    }
    return false;
  }

  matches(path: string): boolean {
    if (!this.resolve(path)) {
      throw new Error(`Node#matches: ${path} does not resolve`);
    }

    if (this.path === path) return true;
    if (path[path.length - 1] !== '/') {
      path = path + '/';
    }
    return !!this.path.match(path);
  }

  toString(): string {
    return this.path;
  }

  inspect({
    prefix = '',
    state,
  }: {prefix?: string; state?: State<C, E>} = {}): string {
    const current = state?.current.flatMap(n => n.lineage).includes(this);
    const opts =
      this.history !== 'none'
        ? ` (H${this.history === 'deep' ? '*' : ''})`
        : '';
    let s = `${prefix}${this.isRoot ? '/' : this.name}${opts}${
      current ? ' *' : ''
    }\n`;
    const children = Array.from(this.children.values());
    const horiz = this.type === 'concurrent' ? '┄┄' : '──';

    for (let i = 0; i < children.length; i++) {
      const last = i === children.length - 1;
      const line = (last ? '└' : '├') + horiz + ' ';
      s += children[i].inspect({
        prefix: `${prefix.replace(/[─┄└]/g, ' ').replace(/├/g, '│')}${line}`,
        state,
      });
    }

    return s;
  }

  send(
    state: State<C, E>,
    evt: InternalEvent | E,
  ): {state: State<C, E>; goto: Node<C, E>[]} | undefined {
    const handler = this.handlers[evt.type];
    if (!handler) return undefined;

    const result = handler(state.context, evt);
    if (!result) return undefined;

    state = state.update({
      context: result.context || state.context,
      actions: [...state.actions, ...(result.actions || [])],
    });

    return {
      state,
      goto: (result.goto ? [result.goto] : []).flat().map(p => {
        const n = this.resolve(p);
        if (!n) {
          throw new Error(
            `Node#send: could not resolve path ${p} from ${this}`,
          );
        }
        return n;
      }),
    };
  }

  pivot(other: Node<C, E>): Node<C, E> | undefined {
    if (this === other) return this;

    let pivot: Node<C, E> | undefined;
    const nodes1 = this.lineage;
    const nodes2 = other.lineage;
    const len = nodes1.length < nodes2.length ? nodes1.length : nodes2.length;

    for (let i = 0; i < len; i++) {
      if (nodes1[i] === nodes2[i]) {
        pivot = nodes1[i];
      } else {
        break;
      }
    }

    return pivot;
  }

  // Exit from the given `from` nodes to the receiver pivot node.
  pivotExit(state: State<C, E>, evt: InternalEvent | E): State<C, E> {
    const child = this.childToExit(state.current);

    if (!child) {
      throw new Error(
        `Node#_pivotExit: could not determine child state to exit`,
      );
    }

    return child._exit(state, evt);
  }

  // Enter from the receiver pivot node to the given `to` nodes.
  pivotEnter(
    state: State<C, E>,
    evt: InternalEvent | E,
    to: Node<C, E>[],
  ): State<C, E> {
    const child = this.childToEnter(state, evt, to);

    if (!child) {
      throw new Error(
        `Node#_pivotEnter: could not determine child state to enter`,
      );
    }

    return child._enter(state, evt, to);
  }

  _exit(state: State<C, E>, evt: InternalEvent | E): State<C, E> {
    if (!this.isLeaf) {
      state = this[
        this.type === 'concurrent' ? 'exitConcurrent' : 'exitCluster'
      ](state, evt);
    } else {
      state = state.update({current: state.current.filter(n => n !== this)});
    }

    const handlers = [
      ...this.preExitHandlers,
      ...this.exitHandlers,
      ...this.postExitHandlers,
    ];

    for (const exitHandler of handlers) {
      const r = exitHandler(state.context, evt);
      if (r) {
        state = state.update({
          context: r.context || state.context,
          actions: [...state.actions, ...(r.actions || [])],
        });
      }
    }

    const activities = state.activities.current[this.path];

    if (activities) {
      const {[this.path]: _v, ...current} = state.activities.current;

      state.activities = {
        ...state.activities,
        current,
        stop: [...state.activities.stop, ...activities],
      };
    }

    return state;
  }

  _enter(
    state: State<C, E>,
    evt: InternalEvent | E,
    to: Node<C, E>[],
  ): State<C, E> {
    const handlers = [
      ...this.preEnterHandlers,
      ...this.enterHandlers,
      ...this.postEnterHandlers,
    ];
    for (const enterHandler of handlers) {
      const r = enterHandler(state.context, evt);

      if (r) {
        state = state.update({
          context: r.context || state.context,
          actions: [...state.actions, ...(r.actions || [])],
        });
        if (r.activities?.length) {
          state.activities = {
            ...state.activities,
            current: {
              ...state.activities.current,
              [this.path]: r.activities,
            },
            start: [...state.activities.start, ...r.activities],
          };
        }
      }
    }

    if (this.isLeaf) return state.update({current: [...state.current, this]});

    return this[
      this.type === 'concurrent' ? 'enterConcurrent' : 'enterCluster'
    ](state, evt, to);
  }

  resolve(path: string | string[]): Node<C, E> | undefined {
    const segments = Array.isArray(path) ? path : path.split('/');
    let head = segments.shift();
    let next: Node<C, E> | undefined;

    if (head === undefined) return;

    switch (head) {
      case '':
        next = this.root;
        break;
      case '.':
        next = this;
        break;
      case '..':
        next = this.parent;
        break;
      default:
        next = this.children.get(head);
    }

    if (!next) {
      return;
    }

    return segments.length === 0 ? next : next.resolve(segments);
  }

  private childToExit(from: Node<C, E>[]): Node<C, E> | undefined {
    if (this.type === 'concurrent') {
      throw new Error(
        `Node#childToExit: cannot be called on a concurrent state: ${this}`,
      );
    }

    let name = from
      .map(n => n.lineage[this.depth + 1]?.name)
      .find(name => this.children.has(name));

    return name ? this.children.get(name) : undefined;
  }

  private exitConcurrent(
    state: State<C, E>,
    evt: InternalEvent | E,
  ): State<C, E> {
    for (const [, child] of this.children) {
      state = child._exit(state, evt);
    }

    return state;
  }

  private exitCluster(state: State<C, E>, evt: InternalEvent | E): State<C, E> {
    const child = this.childToExit(state.current);

    if (!child) {
      throw new Error(
        `Node#_exitCluster: could not determine child state to exit`,
      );
    }

    if (this.isHistory) {
      state = state.update({
        history: {...state.history, [this.path]: child.name},
      });
    }

    return child._exit(state, evt);
  }

  private childToEnter(
    state: State<C, E>,
    evt: InternalEvent | E,
    to: Node<C, E>[],
  ): Node<C, E> | undefined {
    if (this.type === 'concurrent') {
      throw new Error(
        `Node#childToEnter: cannot be called on a concurrent state: ${this}`,
      );
    }

    let names = to
      .map(n => n.lineage[this.depth + 1]?.name)
      .filter(name => this.children.has(name));
    if (names.length > 0) {
      if (new Set(names).size > 1) {
        throw new Error(
          `Node#childToEnter: invalid transition, cannot enter multiple child states of cluster state ${this}`,
        );
      }
      return this.children.get(names[0]);
    }

    if (this.condition) {
      return this.children.get(this.condition(state.context, evt));
    }

    let name = state.history[this.path] || this.defaultChild;
    return name ? this.children.get(name) : undefined;
  }

  private enterConcurrent(
    state: State<C, E>,
    evt: InternalEvent | E,
    to: Node<C, E>[],
  ): State<C, E> {
    for (const [, child] of this.children) {
      state = child._enter(state, evt, to);
    }

    return state;
  }

  private enterCluster(
    state: State<C, E>,
    evt: InternalEvent | E,
    to: Node<C, E>[],
  ): State<C, E> {
    const child = this.childToEnter(state, evt, to);

    if (!child) {
      throw new Error(
        `Node#enterCluster: could not determine child state to enter`,
      );
    }

    return child._enter(state, evt, to);
  }
}
