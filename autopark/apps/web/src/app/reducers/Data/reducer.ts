/* eslint-disable no-case-declarations */
import { Action, Reducer } from 'redux';
import { BaseKnownAction } from '../Base';
import {
  Actions,
  DataState,
  IClearCache,
  IReceiveCreateDataAction,
  IReceiveDeleteDataAction,
  IReceiveItemDataAction,
  IReceiveListDataAction,
  IReceiveUpdateDataAction,
  IReceiveUploadAction,
  IRequestCreateDataAction,
  IRequestDeleteDataAction,
  IRequestItemDataAction,
  IRequestListDataAction,
  IRequestUpdateDataAction,
  IRequestUploadAction,
  ISetItemDataAction,
} from './state';

const unloadedState: DataState = {
};

export type KnownAction =
  | BaseKnownAction
  | IReceiveListDataAction
  | IRequestListDataAction
  | IReceiveCreateDataAction
  | IRequestCreateDataAction
  | IReceiveItemDataAction
  | IRequestItemDataAction
  | IReceiveDeleteDataAction
  | IRequestDeleteDataAction
  | IReceiveUpdateDataAction
  | IRequestUpdateDataAction
  | IReceiveUploadAction
  | IRequestUploadAction
  | ISetItemDataAction
  | IClearCache;

export const reducer: Reducer<DataState> = (
  currentState: DataState = unloadedState,
  incomingAction: Action
) => {
  const action = incomingAction as KnownAction;

  switch (action.type) {
    case Actions.SetCurrentData:
      currentState[action.entityName].operationLoading = false;
      if (action.payload) {
        currentState[action.entityName].CurrentItem = action.payload;
      }
      return { ...currentState };
    case Actions.ClearCache:
      currentState[action.entityName].operationLoading = false;
      currentState[action.entityName].CurrentItem = null;
      currentState[action.entityName].List = [];
      return { ...currentState };

    case Actions.ReceiveItemData:
      currentState[action.entityName].operationLoading = false;
      if (action.payload) currentState[action.entityName].CurrentItem = action.payload;
      return { ...currentState };
    case Actions.RequestItemData:
      currentState[action.entityName].operationLoading = true;
      return { ...currentState };
    case Actions.RequestUpload:
      currentState[action.entityName].operationLoading = true;
      return { ...currentState };
    case Actions.ReceiveUpload:
      currentState[action.entityName].operationLoading = false;
      return { ...currentState };
    case Actions.ReceiveListData:
      currentState[action.entityName].operationLoading = false;
      currentState[action.entityName].List = action.payload;
      return { ...currentState };
    case Actions.RequestListData:
      currentState[action.entityName].operationLoading = true;
      return { ...currentState };
    case Actions.ReceiveCreateData:
      currentState[action.entityName].operationLoading = false;
      currentState[action.entityName].List.push(action.payload);
      return { ...currentState };
    case Actions.RequestCreateData:
      currentState[action.entityName].operationLoading = true;
      return { ...currentState };
    case Actions.ReceiveDeleteData:
      currentState[action.entityName].operationLoading = false;
      const index = currentState[action.entityName].List.findIndex((itm) => itm.id === action.id);
      currentState[action.entityName].List.splice(index, 1);
      return { ...currentState };
    case Actions.RequestDeleteData:
      currentState[action.entityName].operationLoading = true;
      return { ...currentState };
    case Actions.ReceiveUpdateData:
      currentState[action.entityName].operationLoading = false;
      const updateItemIndex = currentState[action.entityName].List.findIndex(
        (itm) => itm.id === action.payload.Id
      );
      currentState[action.entityName].List[updateItemIndex] = action.payload;
      return { ...currentState };
    case Actions.RequestUpdateData:
      currentState[action.entityName].operationLoading = true;
      return { ...currentState };
    default:
      break;
  }
  return currentState || unloadedState;
};
