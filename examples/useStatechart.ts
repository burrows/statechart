import {useCallback, useEffect, useState} from 'react';
import Statechart, {Event, State, SendFn} from '../src';

const useStatechart = <C, E extends Event>(
  statechart: Statechart<C, E>,
): [State<C, E>, SendFn<E>] => {
  const [state, setState] = useState(statechart.initialState);

  const send = useCallback(
    (evt: E): void => {
      console.log('send:', evt);
      setState(state => statechart.send(state, evt));
    },
    [setState],
  );

  useEffect(() => {
    console.clear();
    console.log(statechart.inspect(state));
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

export default useStatechart;
