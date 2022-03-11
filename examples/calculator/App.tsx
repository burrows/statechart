import React from 'react';
import Statechart, {State} from '../../src';
import useStatechart from '../useStatechart';

interface AppProps {}

interface Ctx {
  operand1: string;
  operand2: string;
  operator?: '+' | '-' | '*' | '/';
}

type Evt =
  | {type: 'add'}
  | {type: 'subtract'}
  | {type: 'multiply'}
  | {type: 'divide'}
  | {type: 'CE'}
  | {type: 'C'}
  | {type: 'digit'; value: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}
  | {type: 'dot'}
  | {type: 'compute'};

const initCtx = {operand1: '', operand2: ''};

const display = (state: State<Ctx, Evt>): string => {
  if (state.matches('/ready')) {
    return String(state.context.operand1 ?? '');
  } else if (state.matches('/operand1')) {
    return state.context.operand1;
  } else if (state.matches('/operatorEntered')) {
    return state.context.operator!;
  } else if (state.matches('/operand2')) {
    return state.context.operand2;
  } else {
    return '';
  }
};

const statechart = new Statechart<Ctx, Evt>(initCtx, s => {
  s.state('ready', s => {
    s.state('start', s => {
      s.enter(() => ({context: initCtx}));
      s.on('subtract', '../../operand1Negative');
    });

    s.state('result', s => {
      s.enter(ctx => {
        let result = NaN;

        switch (ctx.operator) {
          case '+':
            result = parseFloat(ctx.operand1) + parseFloat(ctx.operand2);
            break;
          case '-':
            result = parseFloat(ctx.operand1) - parseFloat(ctx.operand2);
            break;
          case '*':
            result = parseFloat(ctx.operand1) * parseFloat(ctx.operand2);
            break;
          case '/':
            result = parseFloat(ctx.operand1) / parseFloat(ctx.operand2);
            break;
        }

        return {
          context: {...ctx, operand1: String(result), operand2: ''},
        };
      });

      s.on('add', '../../operatorEntered');
      s.on('subtract', '../../operatorEntered');
      s.on('multiply', '../../operatorEntered');
      s.on('divide', '../../operatorEntered');
    });

    s.on('digit', '../operand1');
    s.on('dot', '../operand1');
  });

  s.state('operand1Negative', s => {
    s.enter(ctx => ({context: {...ctx, operand1: '-'}}));
    s.on('digit', '../operand1');
    s.on('dot', '../operand1');
    s.on('CE', '../ready/start');
  });

  s.state('operand1', s => {
    s.C((_ctx, evt) => {
      if (evt.type === 'digit') {
        return evt.value === 0 ? 'zero' : 'beforeDecimalPoint';
      } else if (evt.type === 'dot') {
        return 'afterDecimalPoint';
      }
    });

    s.state('zero', s => {
      s.on('digit', (_ctx, evt) => {
        if (evt.value !== 0) {
          return {goto: '../beforeDecimalPoint'};
        }
      });
      s.on('dot', ctx => ({
        context: {...ctx, operand1: `${ctx.operand1}.`},
        goto: '../afterDecimalPoint',
      }));
    });

    s.state('beforeDecimalPoint', s => {
      s.enter((ctx, evt) => {
        if (evt.type === 'digit') {
          return {context: {...ctx, operand1: `${ctx.operand1}${evt.value}`}};
        }
      });
      s.on('digit', (ctx, evt) => ({
        context: {...ctx, operand1: `${ctx.operand1}${evt.value}`},
      }));
      s.on('dot', '../afterDecimalPoint');
    });

    s.state('afterDecimalPoint', s => {
      s.enter(ctx => ({context: {...ctx, operand1: `${ctx.operand1}.`}}));
      s.on('digit', (ctx, evt) => ({
        context: {...ctx, operand1: `${ctx.operand1}${evt.value}`},
      }));
    });

    s.on('add', '../operatorEntered');
    s.on('subtract', '../operatorEntered');
    s.on('multiply', '../operatorEntered');
    s.on('divide', '../operatorEntered');
  });

  s.state('operatorEntered', s => {
    s.enter((ctx, evt) => {
      if (evt.type === 'add') return {context: {...ctx, operator: '+'}};
      if (evt.type === 'subtract') return {context: {...ctx, operator: '-'}};
      if (evt.type === 'multiply') return {context: {...ctx, operator: '*'}};
      if (evt.type === 'divide') return {context: {...ctx, operator: '/'}};
    });

    s.on('add', ctx => ({context: {...ctx, operator: '+'}}));
    s.on('subtract', '../operator2Negative');
    s.on('multiply', ctx => ({context: {...ctx, operator: '*'}}));
    s.on('divide', ctx => ({context: {...ctx, operator: '/'}}));
    s.on('digit', '../operand2');
    s.on('dot', '../operand2');
  });

  s.state('operand2Negative', s => {
    s.enter(ctx => ({context: {...ctx, operand2: '-'}}));
    s.on('digit', '../operand2');
    s.on('dot', '../operand2');
    s.on('CE', '../operatorEntered');
    s.on('digit', '../operand2');
    s.on('dot', '../operand2');
  });

  s.state('operand2', s => {
    s.C((_ctx, evt) => {
      if (evt.type === 'digit') {
        return evt.value === 0 ? 'zero' : 'beforeDecimalPoint';
      } else if (evt.type === 'dot') {
        return 'afterDecimalPoint';
      }
    });

    s.state('zero', s => {
      s.on('digit', (_ctx, evt) => {
        if (evt.value !== 0) {
          return {goto: '../beforeDecimalPoint'};
        }
      });
      s.on('dot', ctx => ({
        context: {...ctx, operand2: `${ctx.operand2}.`},
        goto: '../afterDecimalPoint',
      }));
    });

    s.state('beforeDecimalPoint', s => {
      s.enter((ctx, evt) => {
        if (evt.type === 'digit') {
          return {context: {...ctx, operand2: `${ctx.operand2}${evt.value}`}};
        }
      });
      s.on('digit', (ctx, evt) => ({
        context: {...ctx, operand2: `${ctx.operand2}${evt.value}`},
      }));
      s.on('dot', '../afterDecimalPoint');
    });

    s.state('afterDecimalPoint', s => {
      s.enter(ctx => ({context: {...ctx, operand2: `${ctx.operand2}.`}}));
      s.on('digit', (ctx, evt) => ({
        context: {...ctx, operand2: `${ctx.operand2}${evt.value}`},
      }));
    });

    s.on('add', 'operatorEntered');
    s.on('subtract', 'operatorEntered');
    s.on('multiply', 'operatorEntered');
    s.on('divide', 'operatorEntered');

    s.on('compute', '../ready/result');
  });

  s.on('C', './ready/start');
});

const App: React.FC<AppProps> = ({}) => {
  const [state, send] = useStatechart(statechart);

  return (
    <div className="Calculator">
      <div className="Calculator-display">{display(state)}</div>
      <button onClick={() => send({type: 'digit', value: 0})}>0</button>
      <button onClick={() => send({type: 'digit', value: 1})}>1</button>
      <button onClick={() => send({type: 'digit', value: 2})}>2</button>
      <button onClick={() => send({type: 'digit', value: 3})}>3</button>
      <button onClick={() => send({type: 'digit', value: 4})}>4</button>
      <button onClick={() => send({type: 'digit', value: 5})}>5</button>
      <button onClick={() => send({type: 'digit', value: 6})}>6</button>
      <button onClick={() => send({type: 'digit', value: 7})}>7</button>
      <button onClick={() => send({type: 'digit', value: 8})}>8</button>
      <button onClick={() => send({type: 'digit', value: 9})}>9</button>
      <button onClick={() => send({type: 'dot'})}>.</button>
      <button onClick={() => send({type: 'add'})}>+</button>
      <button onClick={() => send({type: 'subtract'})}>-</button>
      <button onClick={() => send({type: 'multiply'})}>*</button>
      <button onClick={() => send({type: 'divide'})}>/</button>
      <button onClick={() => send({type: 'compute'})}>=</button>
      <button onClick={() => send({type: 'CE'})}>CE</button>
      <button onClick={() => send({type: 'C'})}>C</button>
    </div>
  );
};

export default App;
