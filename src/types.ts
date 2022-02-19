import Node from './Node';

export interface Event {
  type: string;
}

export type InternalEvent =
  | {type: '__init__'}
  | {type: '__goto__'; paths: string[]};

export type SendFn<E> = (event: E) => void;

export interface EffectObj<E> {
  exec(): Promise<E | void>;
}

export type EffectFn<E> = () => Promise<E | void>;

export type Effect<E> = EffectObj<E> | EffectFn<E>;

export interface Activity<E> {
  start(send: SendFn<E>): void;
  stop(): void;
}

export interface NodeOpts {
  concurrent?: true;
  H?: true | '*';
}

export type NodeBody<C, E extends Event> = (n: Node<C, E>) => void;

export interface ExitHandlerResult<C, E extends Event> {
  context?: C;
  effects?: Effect<E>[];
}

export type ExitHandler<C, E extends Event> = (
  ctx: C,
  evt: InternalEvent | E,
) => ExitHandlerResult<C, E>;

export interface EnterHandlerResult<C, E extends Event> {
  context?: C;
  effects?: Effect<E>[];
  activities?: Activity<E>[];
}

export type EnterHandler<C, E extends Event> = (
  ctx: C,
  evt: InternalEvent | E,
) => EnterHandlerResult<C, E>;

export type EventHandlerResult<C, E extends Event> = {
  context?: C;
  effects?: Effect<E>[];
  goto?: string | string[];
} | void;

export type EventHandler<
  C,
  E extends Event,
  T extends E['type'] | InternalEvent['type']
> = (ctx: C, evt: Extract<E, {type: T}>) => EventHandlerResult<C, E>;

export type ConditionFn<C, E extends Event> = (
  ctx: C,
  evt: InternalEvent | E,
) => string;
