export const initEvent = {type: '__init__'} as const;

export interface Event {
  type: string;
}

export interface Effect<E extends Event> {
  run(send: (event: E) => void): Promise<E | undefined>;
}

export type NodeBody<C, E extends Event> = (s: Node<C, E>) => void;

export type EnterHandler<C, E extends Event> = (
  ctx: C,
  evt: E,
) => [C, Effect<E>[]];

export type ExitHandler<C, E extends Event> = (
  ctx: C,
  evt: E,
) => [C, Effect<E>[]];

export type EventHandler<C, E extends Event> = (
  ctx: C,
  evt: E,
) => [C, Effect<E>[], string[]];

export type ConditionHandler<C, E> = (ctx: C, evt: E) => string[];

export class Node<C, E extends Event> {
  public name: string;

  constructor(name: string, body: NodeBody<C, E>) {
    this.name = name;
    body(this);
  }

  public state(name: string, body: NodeBody<C, E>): this {
    return this;
  }

  public enter(handler: EnterHandler<C, E | typeof initEvent>): this {
    return this;
  }

  public exit(handler: ExitHandler<C, E>): this {
    return this;
  }

  public on<T extends E['type']>(
    event: T,
    handler: EventHandler<C, Extract<E, {type: T}>>,
  ): this {
    return this;
  }

  public C(handler: ConditionHandler<C, E | typeof initEvent>): this {
    return this;
  }
}
