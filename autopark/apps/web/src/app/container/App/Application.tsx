import React, { Component } from 'react';
import { Route, Routes } from 'react-router-dom';
import PapperBlock from '../../components/PapperBlock';
import Home from '../../views/Home';
import Camera from '../../views/Cameras';
import CamerasEdit from '../../views/Cameras/Form';
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
        <PapperBlock showHeader={false}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cameras" element={<Camera />} />
            <Route path="/cameras/:id" element={<CamerasEdit />} />
          </Routes>
        </PapperBlock>
      </Dashboard>
    );
  }
}

export default Application;
