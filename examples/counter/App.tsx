import React, {useState, useEffect} from 'react';

import Counter from '../components/Counter';
import counter, {Evt} from '../statecharts/counter';

interface AppProps {}

const App: React.FC<AppProps> = ({}) => {
  const [state, setState] = useState(counter.initialState);

  const send = (evt: Evt): void => {
    setState(state => counter.send(state, evt));
  };

  useEffect(() => {
    console.clear();
    console.log(counter.inspect(state));
    state.activities.start.forEach(a => a.start(send));
    state.activities.stop.forEach(a => a.stop());
  }, [state]);

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
