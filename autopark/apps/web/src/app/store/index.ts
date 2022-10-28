import { reducer as DataReducer } from '../reducers/Data/reducer';
import { reducer as UiReducer } from '../reducers/Ui/reducer';
import { DataState } from '../reducers/Data/state';
import { UiState } from '../reducers/Ui/state';

export interface ApplicationState {
  Data: DataState;
  Ui: UiState;
}

export const reducers = {
  Data: DataReducer,
  Ui: UiReducer,
};

export interface AppThunkAction<TAction> {
  (dispatch: (action: TAction) => void, getState: () => ApplicationState): Promise<any>;
}

export interface AppThunkActionAsync<TAction, TResult> {
  (dispatch: (action: TAction) => void, getState: () => ApplicationState): Promise<TResult>;
}
