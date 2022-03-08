import React, {useCallback, useEffect, useState} from 'react';
import Statechart, {Event, State, SendFn} from '../../src';

import Counter from '../components/Counter';
import counter from '../statecharts/counter';

interface AppProps {}

const useStatechart = <C, E extends Event>(
  statechart: Statechart<C, E>,
): [State<C, E>, SendFn<E>] => {
  const [state, setState] = useState(statechart.initialState);

  const send = useCallback(
    (evt: E): void => {
      setState(state => statechart.send(state, evt));
    },
    [setState],
  );

  useEffect(() => {
    // console.clear();
    // console.log(statechart.inspect(state));
    state.activities.start.forEach(a => a.start(send));
    state.activities.stop.forEach(a => a.stop());
    state.actions.forEach(a => {
      if ('exec' in a) {
        a.exec(send);
      } else {
        a(send);
      }
    });
  }, [state]);

  return [state, send];
};

const App: React.FC<AppProps> = ({}) => {
  const [state, send] = useStatechart(counter);

  const on = state.matches('/on');
  const auto = state.matches('/on/mode/auto');

  return (
    <Counter
      on={on}
      auto={auto}
      count={state.context.count}
      step={state.context.step}
      onToggleOnOff={send.bind(null, {type: 'TOGGLE_ON_OFF'})}
      onToggleAuto={send.bind(null, {type: 'TOGGLE_AUTO'})}
      onIncrement={send.bind(null, {type: 'INCREMENT'})}
      onDecrement={send.bind(null, {type: 'DECREMENT'})}
      onChangeSpeed={send.bind(null, {type: 'CHANGE_SPEED'})}
    />
  );
};

export default App;
