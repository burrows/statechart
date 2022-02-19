import Statechart, {EffectFn, Machine} from './index';

interface Ctx {
  openings: number;
}

type Evt =
  | {type: 'open'}
  | {type: 'close'}
  | {type: 'knock'}
  | {type: 'knockDone'};

// class KnockEffect {
//   run(send: (e: Evt) => void): Promise<Evt> {
//     return new Promise(r => {
//       setTimeout(() => {
//         const evt: Evt = {type: 'knockDone'};
//         console.log('*knock*');
//         send(evt);
//         r(evt);
//       }, 1000);
//     });
//   }
// }

const knock: EffectFn<Evt> = () => {
  return new Promise(r => {
    setTimeout(() => {
      console.log('*knock*');
      r({type: 'knockDone'});
    }, 1000);
  });
};

class MyActivity {
  public timer?: NodeJS.Timer;

  start(send: (evt: Evt) => void): void {
    this.timer = setInterval(() => {
      console.log('MyActivity:', new Date().toISOString());
    }, 1000);
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
  }
}

const statechart = new Statechart<Ctx, Evt>({openings: 0}, s => {
  s.state('closed', s => {
    s.enter((_ctx, _evt) => {
      return {activities: [new MyActivity()]};
    });

    s.on('open', (_ctx, _evt) => {
      return {goto: '../opened'};
    });

    s.on('knock', (_ctx, _evt) => {
      return {effects: [knock]};
    });

    s.on('knockDone', (_ctx, _evt) => {
      console.log('knockDone');
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

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

(async () => {
  const machine = new Machine(statechart);
  machine.start();
  console.log('X:', machine.matches('/closed'));
  console.log('X:', machine.matches('/opened'));
  console.log('1:', machine.current, machine.context);
  await sleep(5000);
  machine.send({type: 'open'});
  console.log('2:', machine.current, machine.context);
  await sleep(5000);
  machine.send({type: 'close'});
  console.log('3:', machine.current, machine.context);
  await sleep(5000);
  machine.send({type: 'knock'});
  await sleep(5000);
  machine.send({type: 'open'});
  console.log('4:', machine.current, machine.context);
  await sleep(5000);
})();
