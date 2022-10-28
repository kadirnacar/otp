import '@fontsource/material-icons/base.css';
import '@fontsource/maven-pro/400.css';
import '@fontsource/maven-pro/500.css';
import '@fontsource/maven-pro/700.css';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './app/container/App';
import { loadState } from './app/store/localStorage';
import { StoreHelper } from './app/store/StoreHelper';
import './styles/layout/base.scss';
import './assets/images/spinner.gif';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

const initialState = loadState();
const store = StoreHelper.initStore(history, initialState);

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
