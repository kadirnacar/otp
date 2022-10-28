import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { MachineService } from '../../services/MachineService';
import { ApplicationState } from '../../store';
import { BAContext } from '../../utils';
import Application from './Application';
import ThemeWrapper from './ThemeWrapper';

interface Props {
  DataActions?: DataActions<any>;
  Data?: DataState;
}

type State = {
  machineService?: MachineService;
};

class App extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  override UNSAFE_componentWillMount(): void {
    if (this.props.DataActions) {
      const machineService = new MachineService();
      // while (!machineService.isLoaded) {}
      // machineService.on('loaded', () => {
        this.setState({ machineService });
      // });
    }
  }

  override render() {
    return this.state.machineService ? (
      <BAContext.Provider
        value={{
          machine: this.state.machineService,
        }}
      >
        <ThemeWrapper>
          <Application></Application>
        </ThemeWrapper>
      </BAContext.Provider>
    ) : null;
  }
}

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions() }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
