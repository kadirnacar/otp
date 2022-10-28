import { batch } from 'react-redux';
import { DataOptions, DataService } from '../../services/DataService';
import { ApplicationState } from '../../store';
import { Actions } from './state';

export class DataActions<T> {
  getByIdTreeParent = (entity: string, id: string, options?: DataOptions<T>) =>
    async function (dispatch, getState: () => ApplicationState) {
      await batch(async function () {
        await dispatch({ type: Actions.RequestItemData, entityName: entity });
        const result = await DataService.getByIdTreeParent<T>(
          entity,
          id,
          options
        );
        await dispatch({
          type: Actions.ReceiveItemData,
          entityName: entity,
          payload: result.value,
        });
      });
    };
  getById = (entity: string, id: any, options?: DataOptions<T>) =>
    async function (dispatch, getState: () => ApplicationState) {
      await batch(async function () {
        await dispatch({ type: Actions.RequestItemData, entityName: entity });
        const result = await DataService.getById<T>(entity, id, options);
        await dispatch({
          type: Actions.ReceiveItemData,
          entityName: entity,
          payload: result.value,
        });
        return result;
      });
    };
  getItem = (entity: string, options?: DataOptions<T>) =>
    async function (dispatch, getState: () => ApplicationState) {
      await batch(async function () {
        await dispatch({ type: Actions.RequestItemData, entityName: entity });
        const result = await DataService.getItem<T>(entity, options);
        await dispatch({
          type: Actions.ReceiveItemData,
          entityName: entity,
          payload: result.value,
        });
      });
    };
  getList = (
    entity: string,
    parentId?: string,
    cache = false,
    options?: DataOptions<T>
  ) =>
    async function (dispatch, getState: () => ApplicationState) {
      await batch(async function () {
        await dispatch({ type: Actions.RequestListData, entityName: entity });
        const getData = async function () {
          const result = await DataService.getList<T>(
            entity,
            parentId,
            options
          );
          await dispatch({
            type: Actions.ReceiveListData,
            entityName: entity,
            payload: result.value,
          });
        };
        if (cache) {
          const state = getState();
          if (state.Data[entity].List.length > 0) {
            await dispatch({
              type: Actions.ReceiveListData,
              entityName: entity,
              payload: state.Data[entity].List,
            });
          } else {
            await getData();
          }
        } else {
          await getData();
        }
      });
    };
  createItem = (entity: string, item: any) =>
    async function (dispatch, getState: () => ApplicationState) {
      await batch(async function () {
        await dispatch({ type: Actions.RequestCreateData, entityName: entity });
        delete item.Id;
        const result = await DataService.create<T>(entity, item);
        await dispatch({
          type: Actions.ReceiveCreateData,
          entityName: entity,
          payload: result.value,
        });
      });
    };
  updateItem = (entity: string, item: any) =>
    async function (dispatch, getState: () => ApplicationState) {
      await batch(async function () {
        await dispatch({ type: Actions.RequestUpdateData, entityName: entity });

        const result = await DataService.update<T>(entity, item);
        await dispatch({
          type: Actions.ReceiveUpdateData,
          entityName: entity,
          payload: result.value,
        });
      });
    };
  deleteItem = (entity: string, id: string) =>
    async function (dispatch, getState: () => ApplicationState) {
      await batch(async function () {
        await dispatch({ type: Actions.RequestDeleteData, entityName: entity });

        const result = await DataService.delete<T>(entity, id);
        await dispatch({
          type: Actions.ReceiveDeleteData,
          entityName: entity,
          id,
        });
      });
    };
  uploadFile = async function (files: File[]) {
    const result = await DataService.upload(files);
    return result;
  };
  clearCache = (entity: string) =>
    async function (dispatch, getState: () => ApplicationState) {
      await dispatch({ type: Actions.ClearCache, entityName: entity });
    };
}
