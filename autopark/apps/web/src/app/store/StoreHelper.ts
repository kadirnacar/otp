import { ApplicationState } from './index';
import { Store } from 'redux';
import configureStore from './configureStore';

export class StoreHelper {
  private static store: Store<ApplicationState>;
  public static initStore(history, initialState): Store<ApplicationState> {
    StoreHelper.store = configureStore(history, initialState);
    return StoreHelper.store;
  }
  public static getStore(): Store<ApplicationState> {
    return StoreHelper.store;
  }
}
