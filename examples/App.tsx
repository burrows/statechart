import React, {useState, useEffect} from 'react';
// import './App.css';

import Statechart from '../src';

interface AppProps {}

interface Ctx {
  count: number;
}
type Evt = {type: 'x'};

const sc = new Statechart<Ctx, Evt>({count: 0}, s => {
  s.state('a', s => {
    s.enter(ctx => ({context: {...ctx, count: ctx.count + 1}}));
    s.on('x', '../b');
  });
  s.state('b', s => {
    s.enter(ctx => ({context: {...ctx, count: ctx.count + 1}}));
    s.on('x', '../a');
  });
});

function App({}: AppProps) {
  // Create the count state.
  const [count, setCount] = useState(0);
  const [state, setState] = useState(sc.initialState);

  // Create the counter (+1 every second).
  useEffect(() => {
    const timer = setTimeout(() => {
      setCount(count + 1);
      setState(state => sc.send(state, {type: 'x'}));
    }, 1000);
    return () => clearTimeout(timer);
  }, [count, setCount]);

  // Return the App component.
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <p>
          Page has been open for <code>{count}</code> seconds.
        </p>
        <pre>{JSON.stringify(state.current.map(n => n.path))}</pre>
        <pre>{JSON.stringify(state.context)}</pre>
      </header>
    </div>
  );
}

export default App;
