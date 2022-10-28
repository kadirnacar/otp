/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseState } from '../Base';

export enum Actions {
  RequestUpload = 'REQUEST_UPLOAD',
  ReceiveUpload = 'RECEIVE_UPLOAD',
  RequestItemData = 'REQUEST_ITEM_DATA',
  ReceiveItemData = 'RECEIVE_ITEM_DATA',
  ClearCache = 'CLEAR_CACHE',
  SetCurrentData = 'SET_CURRENT_DATA',
  RequestListData = 'REQUEST_LIST_DATA',
  ReceiveListData = 'RECEIVE_LIST_DATA',
  RequestCreateData = 'REQUEST_CREATE_DATA',
  ReceiveCreateData = 'RECEIVE_CREATE_DATA',
  RequestUpdateData = 'REQUEST_UPDATE_DATA',
  ReceiveUpdateData = 'RECEIVE_UPDATE_DATA',
  RequestDeleteData = 'REQUEST_DELETE_DATA',
  ReceiveDeleteData = 'RECEIVE_DELETE_DATA',
}

export interface DataItemState<T> extends BaseState {
  List: T[];
  CurrentItem?: T;
}

export interface DataState {
}

export interface ISetItemDataAction {
  type: Actions.SetCurrentData;
  entityName: string;
  payload: any;
}

export interface IClearCache {
  type: Actions.ClearCache;
  entityName: string;
}

export interface IRequestUploadAction {
  type: Actions.RequestUpload;
  entityName: string;
}

export interface IReceiveUploadAction {
  type: Actions.ReceiveUpload;
  entityName: string;
  payload: any;
}

export interface IRequestItemDataAction {
  type: Actions.RequestItemData;
  entityName: string;
}

export interface IReceiveItemDataAction {
  type: Actions.ReceiveItemData;
  entityName: string;
  payload: any;
}

export interface IRequestListDataAction {
  type: Actions.RequestListData;
  entityName: string;
}

export interface IReceiveListDataAction {
  type: Actions.ReceiveListData;
  entityName: string;
  payload: any[];
}

export interface IRequestCreateDataAction {
  type: Actions.RequestCreateData;
  entityName: string;
}

export interface IReceiveCreateDataAction {
  type: Actions.ReceiveCreateData;
  entityName: string;
  payload: any;
}

export interface IRequestUpdateDataAction {
  type: Actions.RequestUpdateData;
  entityName: string;
}

export interface IReceiveUpdateDataAction {
  type: Actions.ReceiveUpdateData;
  entityName: string;
  payload: any;
}

export interface IRequestDeleteDataAction {
  type: Actions.RequestDeleteData;
  entityName: string;
}

export interface IReceiveDeleteDataAction {
  type: Actions.ReceiveDeleteData;
  entityName: string;
  id: number;
}
