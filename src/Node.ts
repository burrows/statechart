export interface Event {
  type: string;
}

export interface Effect<E> {
  run(send: (event: E) => void): Promise<E | undefined>;
}

export interface NodeOpts {
  concurrent?: true;
}

export type NodeBody<C, E extends Event> = (n: Node<C, E>) => void;

export interface TransitionHandlerResult<C, E extends Event> {
  context?: C;
  effects?: Effect<E>[];
}

export type TransitionHandler<C, E extends Event> = (
  ctx: C,
  evt: E,
) => TransitionHandlerResult<C, E>;

export type EventHandlerResult<C, E extends Event> =
  | {context?: C; effects?: Effect<E>[]; goto?: string | string[]}
  | undefined;

export type EventHandler<C, E extends Event, T extends E['type']> = (
  ctx: C,
  evt: Extract<E, {type: T}>,
) => EventHandlerResult<C, E>;

export type ConditionFn<C, E extends Event> = (ctx: C, evt: E) => string;

export default class Node<C, E extends Event> {
  public name: string;
  public opts: NodeOpts;
  public parent?: Node<C, E>;
  public children: Map<string, Node<C, E>>;
  private defaultChild?: string;
  private enterHandler?: TransitionHandler<C, E>;
  private exitHandler?: TransitionHandler<C, E>;
  private condition?: ConditionFn<C, E>;
  private handlers: Partial<
    {
      [T in E['type']]: (
        ctx: C,
        evt: Extract<E, {type: T}>,
      ) => EventHandlerResult<C, E>;
    }
  >;

  constructor(name: string, opts: NodeOpts, body?: NodeBody<C, E>) {
    this.name = name;
    this.opts = opts;
    this.children = new Map();
    this.handlers = {};
    if (body) body(this);
  }

  state(name: string): this;
  state(name: string, body: NodeBody<C, E>): this;
  state(name: string, opts: NodeOpts): this;
  state(name: string, opts: NodeOpts, body: NodeBody<C, E>): this;
  state(name: string, ...args: any[]): this {
    let opts: NodeOpts = {};
    let body: NodeBody<C, E> | undefined;

    if (args[0] && args[1]) {
      opts = args[0];
      body = args[1];
    } else if (args[0]) {
      if (typeof args[0] === 'function') {
        body = args[0];
      } else {
        opts = args[0];
      }
    }

    const node = new Node(name, opts, body);
    node.parent = this;
    this.children.set(name, node);
    this.defaultChild = this.defaultChild || name;
    return this;
  }

  enter(handler: TransitionHandler<C, E>): this {
    this.enterHandler = handler;
    return this;
  }

  exit(handler: TransitionHandler<C, E>): this {
    this.exitHandler = handler;
    return this;
  }

  on<T extends E['type']>(type: T, handler: EventHandler<C, E, T>): this {
    this.handlers[type] = handler;
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

  get type(): 'cluster' | 'concurrent' {
    return this.opts.concurrent ? 'concurrent' : 'cluster';
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

  toString(): string {
    return this.path;
  }

  send(ctx: C, evt: E): [C, Effect<E>[], Node<C, E>[]] | undefined {
    const handler = this.handlers[evt.type as E['type']];
    if (!handler) return undefined;

    const result = handler(ctx, evt as Extract<E, {type: E['type']}>);
    if (!result) return undefined;

    return [
      result.context || ctx,
      result.effects || [],
      (result.goto ? [result.goto] : []).flat().map(p => {
        const n = this.resolve(p);
        if (!n) {
          throw new Error(
            `Node#send: could not resolve path ${p} from ${this}`,
          );
        }
        return n;
      }),
    ];
  }

  pivot(other: Node<C, E>): Node<C, E> | undefined {
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
  pivotExit(
    ctx: C,
    evt: E,
    from: Node<C, E>[],
  ): {context: C; effects: Effect<E>[]} {
    const child = this._childToExit(from);

    if (!child) {
      throw new Error(
        `Node#_pivotExit: could not determine child state to exit`,
      );
    }

    return child._exit(ctx, evt, from);
  }

  // Enter from the receiver pivot node to the given `to` nodes.
  pivotEnter(
    ctx: C,
    evt: E,
    to: Node<C, E>[],
  ): {context: C; effects: Effect<E>[]; current: Node<C, E>[]} {
    const child = this._childToEnter(ctx, evt, to);

    if (!child) {
      throw new Error(
        `Node#_pivotEnter: could not determine child state to enter`,
      );
    }

    return child._enter(ctx, evt, to);
  }

  _enter(
    ctx: C,
    evt: E,
    to: Node<C, E>[],
  ): {context: C; effects: Effect<E>[]; current: Node<C, E>[]} {
    const effects: Effect<E>[] = [];

    if (this.enterHandler) {
      const r = this.enterHandler(ctx, evt);
      ctx = r.context || ctx;
      effects.push(...(r.effects || []));
    }

    if (this.isLeaf) return {context: ctx, effects, current: [this]};

    const result = this[
      this.type === 'concurrent' ? '_enterConcurrent' : '_enterCluster'
    ](ctx, evt, to);
    ctx = result.context;
    effects.push(...result.effects);

    return {context: ctx, effects, current: result.current};
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

  private _childToExit(from: Node<C, E>[]): Node<C, E> | undefined {
    if (this.type === 'concurrent') {
      throw new Error(
        `Node#_childToEnter: cannot be called on a concurrent state: ${this}`,
      );
    }

    let name = from
      .map(n => n.lineage[this.depth + 1]?.name)
      .find(name => this.children.has(name));

    return name ? this.children.get(name) : undefined;
  }

  private _exit(
    ctx: C,
    evt: E,
    from: Node<C, E>[],
  ): {context: C; effects: Effect<E>[]} {
    const effects: Effect<E>[] = [];

    if (!this.isLeaf) {
      const r = this[
        this.type === 'concurrent' ? '_exitConcurrent' : '_exitCluster'
      ](ctx, evt, from);
      ctx = r.context;
      effects.push(...r.effects);
    }

    if (this.exitHandler) {
      const r = this.exitHandler(ctx, evt);
      ctx = r.context || ctx;
      effects.push(...(r.effects || []));
    }

    return {context: ctx, effects};
  }

  private _exitConcurrent(
    ctx: C,
    evt: E,
    from: Node<C, E>[],
  ): {context: C; effects: Effect<E>[]} {
    const effects: Effect<E>[] = [];

    for (const [, child] of this.children) {
      const r = child._exit(ctx, evt, from);
      ctx = r.context;
      effects.push(...r.effects);
    }

    return {context: ctx, effects};
  }

  private _exitCluster(
    ctx: C,
    evt: E,
    from: Node<C, E>[],
  ): {context: C; effects: Effect<E>[]} {
    const child = this._childToExit(from);

    if (!child) {
      throw new Error(
        `Node#_exitCluster: could not determine child state to exit`,
      );
    }

    return child._exit(ctx, evt, from);
  }

  private _childToEnter(
    ctx: C,
    evt: E,
    to: Node<C, E>[],
  ): Node<C, E> | undefined {
    if (this.type === 'concurrent') {
      throw new Error(
        `Node#_childToEnter: cannot be called on a concurrent state: ${this}`,
      );
    }

    let name = to
      .map(n => n.lineage[this.depth + 1]?.name)
      .find(name => this.children.has(name));
    if (name) return this.children.get(name);

    name = this.condition ? this.condition(ctx, evt) : this.defaultChild;
    return name ? this.children.get(name) : undefined;
  }

  private _enterConcurrent(
    ctx: C,
    evt: E,
    to: Node<C, E>[],
  ): {context: C; effects: Effect<E>[]; current: Node<C, E>[]} {
    const effects: Effect<E>[] = [];
    const current: Node<C, E>[] = [];

    for (const [, child] of this.children) {
      const r = child._enter(ctx, evt, to);
      ctx = r.context;
      effects.push(...r.effects);
      current.push(...r.current);
    }

    return {context: ctx, effects, current};
  }

  private _enterCluster(
    ctx: C,
    evt: E,
    to: Node<C, E>[],
  ): {context: C; effects: Effect<E>[]; current: Node<C, E>[]} {
    const child = this._childToEnter(ctx, evt, to);

    if (!child) {
      throw new Error(
        `Node#_enterCluster: could not determine child state to enter`,
      );
    }

    return child._enter(ctx, evt, to);
  }
}
