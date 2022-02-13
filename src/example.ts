import Statechart from './Statechart';
import {Effect} from './Node';
import Machine from './Machine';

interface Ctx {
  openings: number;
}

type Evt =
  | {type: 'open'}
  | {type: 'close'}
  | {type: 'knock'}
  | {type: 'knockDone'};

class KnockEffect {
  run(send: (e: Evt) => void): Promise<Evt> {
    return new Promise(r => {
      setTimeout(() => {
        const evt: Evt = {type: 'knockDone'};
        console.log('*knock*');
        send(evt);
        r(evt);
      }, 1000);
    });
  }
}

const statechart = new Statechart<Ctx, Evt>({openings: 0}, s => {
  s.state('closed', s => {
    s.on('open', (_ctx, _evt) => {
      return {goto: '../opened'};
    });

    s.on('knock', (_ctx, _evt) => {
      return {effects: [new KnockEffect()]};
    });
  });

  s.state('opened', s => {
    s.enter((ctx, _evt) => {
      return {context: {...ctx, openings: ctx.openings + 1}};
    });

    s.on('close', (_ctx, _evt) => {
      return {goto: '../closed'};
    });
  });
});

(async () => {
  const machine = new Machine(statechart);
  console.log(await machine.start());
  console.log('1:', machine.current, machine.context);
  console.log(await machine.send({type: 'open'}));
  console.log('2:', machine.current, machine.context);
  console.log(await machine.send({type: 'close'}));
  console.log('3:', machine.current, machine.context);
  console.log(await machine.send({type: 'knock'}));
  console.log(await machine.send({type: 'open'}));
  console.log('4:', machine.current, machine.context);
})();
