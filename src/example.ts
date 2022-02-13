import Statechart from './Statechart';
import Runner from './Runner';

interface Ctx {
  openings: number;
}

type Evt = {type: 'open'} | {type: 'close'};

const statechart = new Statechart<Ctx, Evt>({openings: 0}, s => {
  s.enter((ctx, evt) => {
    console.log('ROOT ENTER:', ctx, evt);
    return {};
  });

  s.state('closed', s => {
    s.enter((ctx, evt) => {
      console.log('CLOSED ENTER:', ctx, evt);
      return {};
    });

    s.exit((ctx, evt) => {
      console.log('CLOSED EXIT:', ctx, evt);
      return {};
    });

    s.on('open', (ctx, _evt) => {
      return {goto: '../opened'};
    });
  });

  s.state('opened', s => {
    s.enter((ctx, evt) => {
      console.log('OPENED ENTER:', ctx, evt);
      return {context: {...ctx, openings: ctx.openings + 1}};
    });

    s.exit((ctx, evt) => {
      console.log('OPENED EXIT:', ctx, evt);
      return {};
    });

    s.on('close', (ctx, _evt) => {
      return {goto: '../closed'};
    });
  });
});

const runner = new Runner(statechart);
runner.start();
console.log('1:', runner.current, runner.context);
runner.send({type: 'open'});
console.log('2:', runner.current, runner.context);
runner.send({type: 'close'});
console.log('3:', runner.current, runner.context);
runner.send({type: 'open'});
console.log('4:', runner.current, runner.context);
