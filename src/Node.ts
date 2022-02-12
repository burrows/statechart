export interface Event {
  type: string;
}

export interface Effect<E> {
  run(send: (event: E) => void): Promise<E | undefined>;
}

export interface NodeOpts {
  concurrent?: boolean;
}

export default class Node<C, E extends Event> {
  public name: string;
  public opts: NodeOpts;
  public parent?: Node<C, E>;
  public children: Map<string, Node<C, E>>;
  public defaultChild?: string;
  private enterHandler?: (ctx: C, evt: E) => [C, Effect<E>[]];
  private exitHandler?: (ctx: C, evt: E) => [C, Effect<E>[]];
  private condition?: (ctx: C, evt: E) => string;
  private handlers: Partial<
    {
      [T in E['type']]: (
        ctx: C,
        evt: Extract<E, {type: T}>,
      ) => [C, Effect<E>[], string[]] | undefined;
    }
  >;

  constructor(name: string, opts: NodeOpts, body?: (n: Node<C, E>) => void) {
    this.name = name;
    this.opts = opts;
    this.children = new Map();
    this.handlers = {};
    if (body) body(this);
  }

  state(name: string): this;
  state(name: string, body: (n: Node<C, E>) => void): this;
  state(name: string, opts: NodeOpts): this;
  state(name: string, opts: NodeOpts, body: (n: Node<C, E>) => void): this;
  state(name: string, ...args: any[]): this {
    let opts: NodeOpts = {};
    let body: ((n: Node<C, E>) => void) | undefined;

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

  enter(handler: (ctx: C, evt: E) => [C, Effect<E>[]]): this {
    this.enterHandler = handler;
    return this;
  }

  exit(handler: (ctx: C, evt: E) => [C, Effect<E>[]]): this {
    this.exitHandler = handler;
    return this;
  }

  on<T extends E['type']>(
    type: T,
    handler: (
      ctx: C,
      evt: Extract<E, {type: T}>,
    ) => [C, Effect<E>[], string[]] | undefined,
  ): this {
    this.handlers[type] = handler;
    return this;
  }

  C(f: (ctx: C, evt: E) => string): this {
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

  send(ctx: C, evt: E): [C, Effect<E>[], Node<C, E>[]] | undefined {
    const handler = this.handlers[evt.type as E['type']];
    if (!handler) return undefined;

    const result = handler(ctx, evt as Extract<E, {type: E['type']}>);
    if (!result) return undefined;

    return [
      result[0],
      result[1],
      result[2].map(p => {
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
  _pivotExit(ctx: C, evt: E, from: Node<C, E>[]): [C, Effect<E>[]] {
    const child = this._childToExit(from);

    if (!child) {
      throw new Error(
        `Node#_pivotExit: could not determine child state to exit`,
      );
    }

    return child._exit(ctx, evt, from);
  }

  _childToExit(from: Node<C, E>[]): Node<C, E> | undefined {
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

  _exit(ctx: C, evt: E, from: Node<C, E>[]): [C, Effect<E>[]] {
    const effects: Effect<E>[] = [];

    if (!this.isLeaf) {
      const [c, es] = this[
        this.type === 'concurrent' ? '_exitConcurrent' : '_exitCluster'
      ](ctx, evt, from);
      ctx = c;
      effects.push(...es);
    }

    if (this.exitHandler) {
      const [c, es] = this.exitHandler(ctx, evt);
      ctx = c;
      effects.push(...es);
    }

    return [ctx, effects];
  }

  _exitConcurrent(ctx: C, evt: E, from: Node<C, E>[]): [C, Effect<E>[]] {
    const effects: Effect<E>[] = [];

    for (const [, child] of this.children) {
      const [c, es] = child._exit(ctx, evt, from);
      ctx = c;
      effects.push(...es);
    }

    return [ctx, effects];
  }

  _exitCluster(ctx: C, evt: E, from: Node<C, E>[]): [C, Effect<E>[]] {
    const child = this._childToExit(from);

    if (!child) {
      throw new Error(
        `Node#_exitCluster: could not determine child state to exit`,
      );
    }

    return child._exit(ctx, evt, from);
  }

  // Enter from the receiver pivot node to the given `to` nodes.
  _pivotEnter(
    ctx: C,
    evt: E,
    to: Node<C, E>[],
  ): [C, Effect<E>[], Node<C, E>[]] {
    const child = this._childToEnter(ctx, evt, to);

    if (!child) {
      throw new Error(
        `Node#_pivotEnter: could not determine child state to enter`,
      );
    }

    return child._enter(ctx, evt, to);
  }

  _childToEnter(ctx: C, evt: E, to: Node<C, E>[]): Node<C, E> | undefined {
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

  _enter(ctx: C, evt: E, to: Node<C, E>[]): [C, Effect<E>[], Node<C, E>[]] {
    const effects: Effect<E>[] = [];

    if (this.enterHandler) {
      const [c, es] = this.enterHandler(ctx, evt);
      ctx = c;
      effects.push(...es);
    }

    if (this.isLeaf) return [ctx, effects, [this]];

    const [c, es, ns] = this[
      this.type === 'concurrent' ? '_enterConcurrent' : '_enterCluster'
    ](ctx, evt, to);
    ctx = c;
    effects.push(...es);

    return [ctx, effects, ns];
  }

  _enterConcurrent(
    ctx: C,
    evt: E,
    to: Node<C, E>[],
  ): [C, Effect<E>[], Node<C, E>[]] {
    const effects: Effect<E>[] = [];
    const current: Node<C, E>[] = [];

    for (const [, child] of this.children) {
      const [c, es, ns] = child._enter(ctx, evt, to);
      ctx = c;
      effects.push(...es);
      current.push(...ns);
    }

    return [ctx, effects, current];
  }

  _enterCluster(
    ctx: C,
    evt: E,
    to: Node<C, E>[],
  ): [C, Effect<E>[], Node<C, E>[]] {
    const child = this._childToEnter(ctx, evt, to);

    if (!child) {
      throw new Error(
        `Node#_enterCluster: could not determine child state to enter`,
      );
    }

    return child._enter(ctx, evt, to);
  }
}
