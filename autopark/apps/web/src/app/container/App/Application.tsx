import React, { Component } from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../../views/Home';
import Dashboard from '../Templates/Dashboard';
import { AppContext } from './AppContext';

type Props = {};

type State = {};

export class Application extends Component<Props, State> {
  static override contextType = AppContext;
  override context!: React.ContextType<typeof AppContext>;

  override render() {
    return (
      <Dashboard changeMode={this.context}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Dashboard>
    );
  }
}

export default Application;
