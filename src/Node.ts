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
      ) => [C, Effect<E>[], string[]];
    }
  >;

  // FIXME: make this an instance method?
  static pivot<C, E extends Event>(
    n1: Node<C, E>,
    n2: Node<C, E>,
  ): Node<C, E> | undefined {
    let pivot: Node<C, E> | undefined;
    const nodes1 = n1.lineage;
    const nodes2 = n2.lineage;
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
    handler: (ctx: C, evt: Extract<E, {type: T}>) => [C, Effect<E>[], string[]],
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

  get lineage(): Node<C, E>[] {
    return this.parent ? this.parent.lineage.concat([this]) : [this];
  }

  get type(): 'cluster' | 'concurrent' {
    return this.opts.concurrent ? 'concurrent' : 'cluster';
  }

  get path(): string {
    return (
      '/' +
      this.lineage
        .slice(1)
        .map(n => n.name)
        .join('/')
    );
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

  handles(evt: E): boolean {
    return !!this.handlers[evt.type as E['type']];
  }

  handler(evt: E): Node<C, E> | undefined {
    if (this.handles(evt)) return this;
    return this.parent?.handler(evt);
  }

  handle(ctx: C, evt: E): [C, Effect<E>[], Node<C, E>[]] {
    const handler = this.handlers[evt.type as E['type']];
    if (!handler)
      throw new Error(
        `Node#handle: event ${evt.type} not handled by ${this.path}`,
      );

    const [c, es, ps] = handler(ctx, evt as Extract<E, {type: E['type']}>);
    return [
      c,
      es,
      ps.map(p => this.resolve(p)).filter(n => !!n) as Node<C, E>[],
    ];
  }

  // Exit from the given `from` nodes to the receiver pivot node.
  _pivotExit(ctx: C, evt: E, from: Node<C, E>[]): [C, Effect<E>[]] {
    const nodes: Set<Node<C, E>> = new Set();
    const effects: Effect<E>[] = [];

    for (const node of from) {
      let n: Node<C, E> | undefined = node;

      while (n && n !== this) {
        nodes.add(n);
        n = n.parent;
      }
    }

    const sorted = [...nodes].sort((a, b) => {
      const adepth = a.lineage.length;
      const bdepth = b.lineage.length;
      return adepth === bdepth ? 0 : adepth > bdepth ? -1 : 1;
    });

    for (const node of sorted) {
      if (node.exitHandler) {
        const [c, es] = node.exitHandler(ctx, evt);
        ctx = c;
        effects.push(...es);
      }
    }

    return [ctx, effects];
  }

  // Enter from the receiver pivot node to the given `to` nodes.
  _pivotEnter(
    ctx: C,
    evt: E,
    to: Node<C, E>[],
  ): [C, Effect<E>[], Node<C, E>[]] {
    const nodes: Node<C, E>[] = [];
    const seen: Set<Node<C, E>> = new Set();
    const effects: Effect<E>[] = [];

    for (const node of to) {
      let n: Node<C, E> | undefined = node.parent;
      const ns: Node<C, E>[] = [];

      while (n && n !== this) {
        if (!seen.has(n)) {
          seen.add(n);
          ns.unshift(n);
        }
        n = n.parent;
      }

      for (const n of ns) {
        if (n.enterHandler) {
          const [c, es] = n.enterHandler(ctx, evt);
          ctx = c;
          effects.push(...es);
        }
      }

      const [c, es, leafs] = node._enter(ctx, evt);
      ctx = c;
      effects.push(...es);
      nodes.push(...leafs);
    }

    return [ctx, effects, nodes];
  }

  _enter(ctx: C, evt: E): [C, Effect<E>[], Node<C, E>[]] {
    const effects: Effect<E>[] = [];
    const current: Node<C, E>[] = [];

    if (this.enterHandler) {
      const [c, es] = this.enterHandler(ctx, evt);
      ctx = c;
      effects.push(...es);
    }

    if (this.isLeaf) {
      return [ctx, effects, [this]];
    }

    if (this.type === 'concurrent') {
      for (const [, child] of this.children.entries()) {
        const [c, es, ns] = child._enter(ctx, evt);
        ctx = c;
        effects.push(...es);
        current.push(...ns);
      }
    } else {
      const name = this.condition
        ? this.condition(ctx, evt)
        : this.defaultChild;
      const child = name ? this.children.get(name) : undefined;

      if (!child) {
        throw new Error(
          `Node#_enter: invalid child state returned by condition function: '${name}'`,
        );
      }

      const [c, es, ns] = child._enter(ctx, evt);
      ctx = c;
      effects.push(...es);
      current.push(...ns);
    }

    return [ctx, effects, current];
  }
}
