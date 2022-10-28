import { routerMiddleware, routerReducer } from 'react-router-redux';
import {
  applyMiddleware,
  combineReducers,
  compose,
  createStore,
  ReducersMapObject,
  Store,
  StoreEnhancerStoreCreator,
} from 'redux';
import thunk from 'redux-thunk';
import { ApplicationState, reducers } from './index';
import { saveState } from './localStorage';

export default function configureStore(history: any, initialState?: ApplicationState) {
  const windowIfDefined = typeof window === 'undefined' ? null : (window as any);
  const devToolsExtension =
    windowIfDefined && (windowIfDefined.__REDUX_DEVTOOLS_EXTENSION__ as () => any);
  const createStoreWithMiddleware = compose<any>(
    applyMiddleware(thunk, routerMiddleware(history)),
    devToolsExtension ? devToolsExtension() : <S>(next: StoreEnhancerStoreCreator<S>) => next
  )(createStore);
  const allReducers = buildRootReducer(reducers);
  const store = createStoreWithMiddleware(allReducers, initialState) as Store<ApplicationState>;
  store.subscribe(() => {
    saveState({ Ui: store.getState().Ui });
  });
  return store;
}

const buildRootReducer = (allReducers: ReducersMapObject): any => {
  return combineReducers(Object.assign({}, allReducers, { routing: routerReducer }));
};
