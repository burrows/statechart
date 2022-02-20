import {Store, createStore} from 'redux';
import {State} from '../../src';

import counter, {Ctx, Evt} from '../statecharts/counter';

export type AppState = State<Ctx, Evt>;

let store: Store<AppState, Evt>;

const reducer = (state: AppState | undefined, event: Evt): AppState => {
  state = state ? counter.send(state, event) : counter.initialState;
  state.activities.start.forEach(a => a.start(store.dispatch));
  state.activities.stop.forEach(a => a.stop());
  return state;
};

store = createStore(reducer, (window as any).__REDUX_DEVTOOLS_EXTENSION__?.());

export default store;
