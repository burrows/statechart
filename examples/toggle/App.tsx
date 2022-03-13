import React from 'react';
import useStatechart from '@corey.burrows/react-use-statechart';
import Statechart from '../../src';

type Evt = {type: 'TOGGLE'};

const toggle = new Statechart<{}, Evt>({}, s => {
  s.state('off', s => {
    s.on('TOGGLE', '../on');
  });

  s.state('on', s => {
    s.on('TOGGLE', '../off');
  });
});

interface AppProps {}

const App: React.FC<AppProps> = ({}) => {
  const [state, send] = useStatechart(toggle);

  return (
    <div>
      <button
        onClick={() => {
          send({type: 'TOGGLE'});
        }}>
        TOGGLE
      </button>
      <p>{state.matches('/on') ? 'On' : 'Off'}</p>
    </div>
  );
};

export default App;
