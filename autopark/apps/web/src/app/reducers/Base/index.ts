import { Action, Reducer } from 'redux';

export enum BaseActions {
  IndicatorStart = 'INDICATOR_START',
  IndicatorEnd = 'INDICATOR_END',
}

export interface BaseState {
  operationLoading?: boolean;
}

export interface IIndicatorStartAction {
  type: BaseActions.IndicatorStart;
}

export interface IIndicatorEndAction {
  type: BaseActions.IndicatorEnd;
}

export type BaseKnownAction = IIndicatorStartAction | IIndicatorEndAction;

const unloadedState: BaseState = {
  operationLoading: false,
};

export const baseReducer: Reducer<any> = (
  currentState: BaseState,
  incomingAction: Action
) => {
  const action = incomingAction as BaseKnownAction;
  switch (action.type) {
    case BaseActions.IndicatorStart:
      return { ...currentState, operationLoading: true };
    case BaseActions.IndicatorEnd:
      return { ...currentState, operationLoading: false };
    default:
      return { ...currentState };
  }
};
