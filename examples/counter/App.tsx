import React from 'react';
import useStatechart from '@corey.burrows/react-use-statechart';

import Counter from '../components/Counter';
import counter from '../statecharts/counter';

interface AppProps {}

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
