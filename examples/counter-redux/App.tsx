import React from 'react';
import {Dispatch} from 'redux';
import {connect, ConnectedProps} from 'react-redux';

import Counter from '../components/Counter';
import {Ctx, Evt} from '../statecharts/counter';
import {AppState} from './store';

interface StateProps {
  on: boolean;
  auto: boolean;
  count: number;
  step: number;
}

const mapStateToProps = (state: AppState): StateProps => ({
  on: state.matches('/on'),
  auto: state.matches('/on/mode/auto'),
  count: state.context.count,
  step: state.context.step,
});

const connector = connect(mapStateToProps, (dispatch: Dispatch<Evt>) => ({
  dispatch,
}));

const App: React.FC<ConnectedProps<typeof connector>> = ({
  on,
  auto,
  count,
  step,
  dispatch,
}) => {
  return (
    <Counter
      on={on}
      auto={auto}
      count={count}
      step={step}
      onToggleOnOff={dispatch.bind(null, {type: 'TOGGLE_ON_OFF'})}
      onToggleAuto={dispatch.bind(null, {type: 'TOGGLE_AUTO'})}
      onIncrement={dispatch.bind(null, {type: 'INCREMENT'})}
      onDecrement={dispatch.bind(null, {type: 'DECREMENT'})}
      onChangeSpeed={dispatch.bind(null, {type: 'CHANGE_SPEED'})}
    />
  );
};

export default connector(App);
