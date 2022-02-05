import Statechart from './Statechart';
import Runner from './Runner';

interface Ctx {
  count: number;
}

type Evt = {type: 'increment'} | {type: 'decrement'; n: number};

const statechart = new Statechart<Ctx, Evt>({count: 0}, s => {
  s.enter((ctx, evt) => {
    return [ctx, []];
  });

  s.on('increment', (ctx, evt) => {
    return [ctx, [], []];
  });

  s.on('decrement', (ctx, evt) => {
    return [ctx, [], []];
  });
});

const runner = new Runner(statechart);
runner.start();
