import React from 'react';

export interface CounterProps {
  on: boolean;
  auto: boolean;
  count: number;
  step: number;
  onToggleOnOff: () => void;
  onToggleAuto: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onChangeSpeed: () => void;
}

const Counter: React.FC<CounterProps> = ({
  on,
  auto,
  count,
  step,
  onToggleOnOff,
  onToggleAuto,
  onIncrement,
  onDecrement,
  onChangeSpeed,
}) => {
  return (
    <div className="Counter">
      <button onClick={onToggleOnOff}>{on ? 'Turn Off' : 'Turn On'}</button>
      <button disabled={!on || auto} onClick={onIncrement}>
        Increment
      </button>
      <button disabled={!on || auto} onClick={onDecrement}>
        Decrement
      </button>
      <button disabled={!on} onClick={onToggleAuto}>
        {auto ? 'Turn Auto Off' : 'Turn Auto On'}
      </button>
      <button disabled={!on} onClick={onChangeSpeed}>
        Change Speed
      </button>
      <h1>{count}</h1>
      <h6>Step: {on ? step : '-'}</h6>
    </div>
  );
};

export default Counter;
