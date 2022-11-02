import {
  Add,
  AddPhotoAlternate,
  ArrowBack,
  ArrowForward,
  MonochromePhotos,
  PlayArrow,
  Remove,
  Save,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Slider,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import NumberField from '../../components/Controls/NumberField';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { UiActions } from '../../reducers/Ui/actions';
import { UiState } from '../../reducers/Ui/state';
import { ApplicationState } from '../../store';
import { BAContext } from '../../utils';
import CameraView from '../Viewer/CameraView';

interface Props {
  DataActions?: DataActions<any>;
  UiActions?: UiActions;
  Data?: DataState;
  Ui?: UiState;
  classes: any;
}

interface State {
  val: number;
}

class Home extends Component<Props, State, typeof BAContext> {
  constructor(props: Props) {
    super(props);
    this.state = { val: 50 };
  }

  static override contextType = BAContext;

  override context!: React.ContextType<typeof BAContext>;

  override async componentDidMount() {
    await this.props.DataActions?.getList('Camera');
  }

  override render() {
    const cam =
      this.props.Data?.Camera && this.props.Data?.Camera.List.length > 0
        ? this.props.Data?.Camera.List[0]
        : undefined;
    return (
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <CameraView camera={cam}></CameraView>
        </Grid>
        <Grid item xs={4}>
          <NumberField
            label={'Password'}
            name="password"
            onChange={(ev, value) => {
              this.setState({ val: value });
            }}
            fullWidth
            value={this.state.val}
          />
        </Grid>
        <Grid item xs={4}>
          <Button
            onClick={() => {
              this.context.machine?.socketService?.send({
                Command: 'snapshot',
                To: cam?.id,
                Data: "",
              });
            }}
          >
            Set Config
          </Button>
        </Grid>
        <Grid item xs={4}></Grid>
        <Grid item xs={12}></Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions() }, dispatch),
    UiActions: bindActionCreators({ ...new UiActions() }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home) as any;
