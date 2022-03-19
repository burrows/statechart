import React, {KeyboardEvent, useEffect, useRef} from 'react';
import Statechart, {State} from '../../src';
import useStatechart from '@corey.burrows/react-use-statechart';

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
  | {type: 'percent'}
  | {type: 'compute'};

const initCtx = {operand1: '', operand2: ''};

const display = (state: State<Ctx, Evt>): string => {
  if (state.matches('/ready')) {
    return String(state.context.operand1 ?? '');
  } else if (state.matches('/operand1') || state.matches('/operand1Negative')) {
    return state.context.operand1;
  } else if (state.matches('/operatorEntered')) {
    return state.context.operator!;
  } else if (state.matches('/operand2') || state.matches('/operand2Negative')) {
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
      s.enter((ctx, evt) => {
        if (evt.type === 'percent') {
          return {
            context: {
              ...ctx,
              operand1: String(parseFloat(ctx.operand1) / 100),
              operand2: '',
            },
          };
        }

        let result = '';

        switch (ctx.operator) {
          case '+':
            result = (
              parseFloat(ctx.operand1) + parseFloat(ctx.operand2)
            ).toFixed(6);
            break;
          case '-':
            result = (
              parseFloat(ctx.operand1) - parseFloat(ctx.operand2)
            ).toFixed(6);
            break;
          case '*':
            result = (
              parseFloat(ctx.operand1) * parseFloat(ctx.operand2)
            ).toFixed(6);
            break;
          case '/':
            result = (
              parseFloat(ctx.operand1) / parseFloat(ctx.operand2)
            ).toFixed(6);
            break;
        }

        return {
          context: {
            ...ctx,
            operand1: result.replace(/\.?0*$/, ''),
            operand2: '',
          },
        };
      });

      s.on('add', '../../operatorEntered');
      s.on('subtract', '../../operatorEntered');
      s.on('multiply', '../../operatorEntered');
      s.on('divide', '../../operatorEntered');
      s.on('percent', '.');
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
    s.on('percent', '../ready/result');
    s.on('CE', '../ready/start');
  });

  s.state('operatorEntered', s => {
    s.enter((ctx, evt) => {
      if (evt.type === 'add')
        return {context: {...ctx, operand2: '', operator: '+'}};
      if (evt.type === 'subtract')
        return {context: {...ctx, operand2: '', operator: '-'}};
      if (evt.type === 'multiply')
        return {context: {...ctx, operand2: '', operator: '*'}};
      if (evt.type === 'divide')
        return {context: {...ctx, operand2: '', operator: '/'}};

      return {context: {...ctx, operand2: ''}};
    });

    s.on('add', ctx => ({context: {...ctx, operator: '+'}}));
    s.on('subtract', '../operand2Negative');
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
        if (evt.type !== 'digit') return;
        return {context: {...ctx, operand2: `${ctx.operand2}${evt.value}`}};
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

    s.on('add', '../operatorEntered');
    s.on('subtract', '../operatorEntered');
    s.on('multiply', '../operatorEntered');
    s.on('divide', '../operatorEntered');
    s.on('CE', '../operatorEntered');

    s.on('compute', '../ready/result');
  });

  s.on('C', '.');
});

const App: React.FC<AppProps> = ({}) => {
  const [state, send] = useStatechart(statechart, {
    inspect: true,
    clear: true,
  });
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case '0':
        send({type: 'digit', value: 0});
        break;
      case '1':
        send({type: 'digit', value: 1});
        break;
      case '2':
        send({type: 'digit', value: 2});
        break;
      case '3':
        send({type: 'digit', value: 3});
        break;
      case '4':
        send({type: 'digit', value: 4});
        break;
      case '5':
        send({type: 'digit', value: 5});
        break;
      case '6':
        send({type: 'digit', value: 6});
        break;
      case '7':
        send({type: 'digit', value: 7});
        break;
      case '8':
        send({type: 'digit', value: 8});
        break;
      case '9':
        send({type: 'digit', value: 9});
        break;
      case '+':
        send({type: 'add'});
        break;
      case '-':
        send({type: 'subtract'});
        break;
      case '*':
        send({type: 'multiply'});
        break;
      case '/':
        send({type: 'divide'});
        break;
      case '=':
      case 'Enter':
        send({type: 'compute'});
        break;
      case '%':
        send({type: 'percent'});
        break;
      case '.':
        send({type: 'dot'});
        break;
      case 'Escape':
        send({type: 'C'});
        break;
    }
  };

  return (
    <main
      style={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <div className="Calculator" ref={ref} tabIndex={0} onKeyDown={onKeyDown}>
        <div className="Calculator-display">{display(state)}</div>
        <button
          className="Calculator-button"
          style={{gridArea: 'btn0'}}
          onClick={() => send({type: 'digit', value: 0})}>
          0
        </button>
        <button
          className="Calculator-button"
          style={{gridArea: 'btn1'}}
          onClick={() => send({type: 'digit', value: 1})}>
          1
        </button>
        <button
          className="Calculator-button"
          style={{gridArea: 'btn2'}}
          onClick={() => send({type: 'digit', value: 2})}>
          2
        </button>
        <button
          className="Calculator-button"
          style={{gridArea: 'btn3'}}
          onClick={() => send({type: 'digit', value: 3})}>
          3
        </button>
        <button
          className="Calculator-button"
          style={{gridArea: 'btn4'}}
          onClick={() => send({type: 'digit', value: 4})}>
          4
        </button>
        <button
          className="Calculator-button"
          style={{gridArea: 'btn5'}}
          onClick={() => send({type: 'digit', value: 5})}>
          5
        </button>
        <button
          className="Calculator-button"
          style={{gridArea: 'btn6'}}
          onClick={() => send({type: 'digit', value: 6})}>
          6
        </button>
        <button
          className="Calculator-button"
          style={{gridArea: 'btn7'}}
          onClick={() => send({type: 'digit', value: 7})}>
          7
        </button>
        <button
          className="Calculator-button"
          style={{gridArea: 'btn8'}}
          onClick={() => send({type: 'digit', value: 8})}>
          8
        </button>
        <button
          className="Calculator-button"
          style={{gridArea: 'btn9'}}
          onClick={() => send({type: 'digit', value: 9})}>
          9
        </button>
        <button
          className="Calculator-button"
          style={{gridArea: 'btnDot'}}
          onClick={() => send({type: 'dot'})}>
          .
        </button>
        <button
          className="Calculator-button"
          style={{gridArea: 'btnAdd'}}
          onClick={() => send({type: 'add'})}>
          +
        </button>
        <button
          className="Calculator-button"
          style={{gridArea: 'btnSub'}}
          onClick={() => send({type: 'subtract'})}>
          -
        </button>
        <button
          className="Calculator-button"
          style={{gridArea: 'btnMul'}}
          onClick={() => send({type: 'multiply'})}>
          *
        </button>
        <button
          className="Calculator-button"
          style={{gridArea: 'btnDiv'}}
          onClick={() => send({type: 'divide'})}>
          /
        </button>
        <button
          className="Calculator-button"
          style={{gridArea: 'btnPct'}}
          onClick={() => send({type: 'percent'})}>
          %
        </button>
        <button
          className="Calculator-button"
          style={{gridArea: 'btnEq'}}
          onClick={() => send({type: 'compute'})}>
          =
        </button>
        <button
          className="Calculator-button"
          style={{gridArea: 'btnCE'}}
          onClick={() => send({type: 'CE'})}>
          CE
        </button>
        <button
          className="Calculator-button"
          style={{gridArea: 'btnC'}}
          onClick={() => send({type: 'C'})}>
          C
        </button>
      </div>
    </main>
  );
};

export default App;
