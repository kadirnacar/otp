import { Camera } from '@autopark/models';
import { PlayCircleFilled } from '@mui/icons-material';
import { CircularProgress, Grid, IconButton, Typography } from '@mui/material';
import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { CameraService } from '../../services/CameraService';
import { ApplicationState } from '../../store';
import { BAContext } from '../../utils';
import VideoPlayer from './VideoPlayer';

interface State {
  streamSource?: MediaStream;
  loaded: boolean;
  playing: boolean;
  connected: boolean;
}

type Props = {
  DataActions?: DataActions<Camera>;
  Data?: DataState;
  camera?: Camera;
};

class CameraView extends Component<Props, State, typeof BAContext> {
  constructor(props) {
    super(props);
    this.handleConnectVideo = this.handleConnectVideo.bind(this);

    this.state = {
      streamSource: undefined,
      loaded: false,
      playing: false,
      connected: false,
    };
  }
  pc?: RTCPeerConnection;
  videoPlayer?;
  static override contextType = BAContext;

  override context!: React.ContextType<typeof BAContext>;

  override async componentWillUnmount() {
    if (this.pc) {
      this.pc.close();
    }
    this.setState({ playing: false });

    if (this.props.camera?.id) await CameraService.disconnect(this.props.camera?.id);
  }

  override async componentDidMount() {
    if (this.props.camera?.id) {
      await CameraService.connect(this.props.camera?.id);

      this.setState({
        loaded: true,
        connected: true,
      });
    }
  }

  override async componentDidUpdate(prevProps, prevState) {
    if (!this.state.connected && this.props.camera?.id) {
      await CameraService.connect(this.props.camera?.id);
      this.setState({
        loaded: true,
        connected: true,
      });
    }
  }

  handleConnectVideo(ev) {
    ev.stopPropagation();
    this.setState(
      {
        playing: true,
      },
      () => {
        this.context.machine?.socketService?.send({
          Command: 'rtsp',
          To: this.props.camera?.id,
        });
      }
    );
  }

  override render() {
    return this.state.loaded ? (
      <Grid
        container
        spacing={0}
        justifyContent="center"
        alignItems="top"
        style={{ height: '100%' }}
      >
        <Grid item xs={12} style={{ height: '100%' }}>
          <Typography>{this.props.camera?.name}</Typography>
          {!this.state.playing ? (
            <div style={{ width: '100%', height: '100%', display: 'flex' }}>
              <IconButton
                style={{ margin: 'auto' }}
                title="Kapat"
                onClick={this.handleConnectVideo}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <PlayCircleFilled style={{ fontSize: 120 }} />
              </IconButton>
            </div>
          ) : (
            <>
              <VideoPlayer camera={this.props.camera} playing={this.state.playing} />
            </>
          )}
        </Grid>
      </Grid>
    ) : (
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        <CircularProgress style={{ margin: 'auto' }} />
      </div>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Camera>() }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraView);
