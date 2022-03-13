import React from 'react';
import useStatechart from '@corey.burrows/react-use-statechart';
import {padStart} from 'lodash';
import Statechart, {SendFn} from '../../src';

interface Ctx {
  time: number;
  lap: number;
  laps: number[];
}

type Evt =
  | {type: 'TOGGLE'}
  | {type: 'LAP'}
  | {type: 'RESET'}
  | {type: 'TICK'; delta: number};

class Clock {
  private time?: number;
  private interval?: number;

  start(send: SendFn<Evt>) {
    this.time = new Date().valueOf();

    this.interval = setInterval(() => {
      const time = new Date().valueOf();
      const delta = time - this.time;
      this.time = time;
      send({type: 'TICK', delta});
    }, 100);
  }

  stop() {
    clearInterval(this.interval);
    this.interval = undefined;
  }
}

const defaultCtx = {time: 0, lap: 0, laps: []};

const stopwatch = new Statechart<Ctx, Evt>(defaultCtx, s => {
  s.state('inactive', s => {
    s.enter(() => ({context: defaultCtx}));
    s.on('TOGGLE', '../active');
  });

  s.state('active', s => {
    s.state('running', s => {
      s.enter(() => ({activities: [new Clock()]}));

      s.on('TICK', (ctx, evt) => ({
        context: {...ctx, time: ctx.time + evt.delta, lap: ctx.lap + evt.delta},
      }));

      s.on('LAP', ctx => ({
        context: {...ctx, laps: [...ctx.laps, ctx.lap], lap: 0},
      }));

      s.on('TOGGLE', '../paused');
    });

    s.state('paused', s => {
      s.on('TOGGLE', '../running');
      s.on('RESET', '../../inactive');
    });
  });
});

const format = (t: number): string => {
  const h = Math.floor(t / 3600000);
  const m = Math.floor((t % 3600000) / 60000);
  const s = Math.floor((t % 60000) / 1000);
  const ms = t % 1000;

  if (h > 0) {
    return (
      [
        String(h),
        padStart(String(m), 2, '0'),
        padStart(String(s), 2, '0'),
      ].join(':') +
      '.' +
      padStart(String(ms), 3, '0')
    );
  }

  return (
    [padStart(String(m), 1, '0'), padStart(String(s), 2, '0')].join(':') +
    '.' +
    padStart(String(ms), 3, '0')
  );
};

interface AppProps {}

const App: React.FC<AppProps> = ({}) => {
  const [state, send] = useStatechart(stopwatch);
  const active = state.matches('/active');
  const paused = state.matches('/active/paused');
  const running = state.matches('/active/running');

  return (
    <div>
      <p>{format(state.context.time)}</p>
      {paused ? (
        <button
          onClick={() => {
            send({type: 'RESET'});
          }}>
          Reset
        </button>
      ) : (
        <button
          disabled={!active}
          onClick={() => {
            send({type: 'LAP'});
          }}>
          Lap
        </button>
      )}
      <button
        onClick={() => {
          send({type: 'TOGGLE'});
        }}>
        {running ? 'Stop' : 'Start'}
      </button>
      <ul>
        {state.context.laps.map((lap, i) => (
          <li key={i}>
            Lap {i + 1}: {format(lap)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
