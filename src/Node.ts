export const initEvent = {type: '__init__'} as const;

export interface Event {
  type: string;
}

export interface Effect<E> {
  run(send: (event: E) => void): Promise<E | undefined>;
}

export default class Node<C, E extends Event> {
  public name: string;
  public parent?: Node<C, E>;
  public children: {[name: string]: Node<C, E>};
  private enterHandler?: (
    ctx: C,
    evt: E | typeof initEvent,
  ) => [C, Effect<E>[]];
  private exitHandler?: (ctx: C, evt: E) => [C, Effect<E>[]];
  private handlers: Partial<
    {
      [T in E['type']]: (
        ctx: C,
        evt: Extract<E, {type: T}>,
      ) => [C, Effect<E>[], string[]];
    }
  >;

  constructor(name: string, body?: (n: Node<C, E>) => void) {
    this.name = name;
    this.children = {};
    this.handlers = {};
    if (body) {
      body(this);
    }
  }

  state(name: string, body?: (n: Node<C, E>) => void): this {
    const node = new Node(name, body);
    node.parent = this;
    this.children[name] = node;
    return this;
  }

  enter(
    handler: (ctx: C, evt: E | typeof initEvent) => [C, Effect<E>[]],
  ): this {
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

  C(handler: (ctx: C, evt: E | typeof initEvent) => string[]): this {
    return this;
  }

  get root(): Node<C, E> {
    return this.parent?.root || this;
  }

  get isRoot(): boolean {
    return !this.parent;
  }

  get ancestors(): Node<C, E>[] {
    return this.parent ? [this.parent].concat(this.parent.ancestors) : [];
  }

  get path(): string {
    if (this.isRoot) return '/';

    return (
      '/' +
      [this as Node<C, E>]
        .concat(this.ancestors.slice(0, -1))
        .map(n => n.name)
        .reverse()
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
        next = this.children[head];
    }

    if (!next) {
      return;
    }

    return segments.length === 0 ? next : next.resolve(segments);
  }
}
