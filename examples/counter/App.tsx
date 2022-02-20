import React, {useState, useEffect} from 'react';

import Statechart from '../../src';
import Counter from '../components/Counter';

interface AppProps {}

interface Ctx {
  count: number;
  step: number;
}
type Evt =
  | {type: 'TOGGLE_ON_OFF'}
  | {type: 'TOGGLE_AUTO'}
  | {type: 'INCREMENT'}
  | {type: 'DECREMENT'}
  | {type: 'CHANGE_SPEED'};

class Timer {
  timer?: number;

  start(send: (e: Evt) => void): void {
    this.timer = (setInterval(() => {
      send({type: 'INCREMENT'});
    }, 1000) as unknown) as number;
  }

  stop() {
    clearInterval(this.timer);
    this.timer = undefined;
  }
}

const sc = new Statechart<Ctx, Evt>({count: 0, step: 0}, s => {
  s.state('off', s => {
    s.on('TOGGLE_ON_OFF', '../on');
  });

  s.state('on', {concurrent: true, H: '*'}, s => {
    s.state('mode', s => {
      s.state('manual', s => {
        s.on('TOGGLE_AUTO', '../auto');
      });

      s.state('auto', s => {
        s.enter(() => ({activities: [new Timer()]}));
        s.on('TOGGLE_AUTO', '../manual');
      });

      s.on('INCREMENT', ctx => ({
        context: {...ctx, count: ctx.count + ctx.step},
      }));
      s.on('DECREMENT', ctx => ({
        context: {...ctx, count: ctx.count - ctx.step},
      }));
    });

    s.state('speed', s => {
      s.state('slow', s => {
        s.enter(ctx => ({context: {...ctx, step: 1}}));
        s.on('CHANGE_SPEED', '../medium');
      });
      s.state('medium', s => {
        s.enter(ctx => ({context: {...ctx, step: 10}}));
        s.on('CHANGE_SPEED', '../fast');
      });
      s.state('fast', s => {
        s.enter(ctx => ({context: {...ctx, step: 100}}));
        s.on('CHANGE_SPEED', '../slow');
      });
    });

    s.on('TOGGLE_ON_OFF', '../off');
  });
});

const App: React.FC<AppProps> = ({}) => {
  const [state, setState] = useState(sc.initialState);

  useEffect(() => {
    console.clear();
    console.log(sc.inspect(state));

    for (const activity of state.activities.start) {
      activity.start((evt: Evt) => {
        setState(state => sc.send(state, evt));
      });
    }

    for (const activity of state.activities.stop) {
      activity.stop();
    }
  }, [state]);

  const on = state.matches('/on');
  const auto = state.matches('/on/mode/auto');

  return (
    <Counter
      on={on}
      auto={auto}
      count={state.context.count}
      step={state.context.step}
      onToggleOnOff={() => {
        setState(state => sc.send(state, {type: 'TOGGLE_ON_OFF'}));
      }}
      onToggleAuto={() => {
        setState(state => sc.send(state, {type: 'TOGGLE_AUTO'}));
      }}
      onIncrement={() => {
        setState(state => sc.send(state, {type: 'INCREMENT'}));
      }}
      onDecrement={() => {
        setState(state => sc.send(state, {type: 'DECREMENT'}));
      }}
      onChangeSpeed={() => {
        setState(state => sc.send(state, {type: 'CHANGE_SPEED'}));
      }}
    />
  );
};

export default App;
