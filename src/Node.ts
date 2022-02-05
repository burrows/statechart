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
  public children: Node<C, E>[];
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
    this.children = [];
    this.handlers = {};
    if (body) {
      body(this);
    }
  }

  state(name: string, body?: (n: Node<C, E>) => void): this {
    const node = new Node(name, body);
    node.parent = this;
    this.children.push(node);
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

  get ancestors(): Node<C, E>[] {
    return this.parent ? [this.parent].concat(this.parent.ancestors) : [];
  }

  get path(): string {
    return (
      '/' +
      [this as Node<C, E>]
        .concat(this.ancestors)
        .map(n => n.name)
        .reverse()
        .join('/')
    );
  }
}
