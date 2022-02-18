import Statechart from './Statechart';
import Machine from './Machine';

import {
  Event as _Event,
  EffectObj as _EffectObj,
  EffectFn as _EffectFn,
  Effect as _Effect,
} from './Node';

export type Event = _Event;
export type EffectObj<E> = _EffectObj<E>;
export type EffectFn<E> = _EffectFn<E>;
export type Effect<E> = _Effect<E>;

export {Machine};
export default Statechart;
