import { Camera } from '@autopark/models';
import { CircularProgress } from '@mui/material';
import React, { Component } from 'react';
import { CameraManagement } from './CameraManagement';

type Props = {
  stream?: MediaStream;
  camera?: Camera;
};

type State = {
  loaded: boolean;
};

export default class VideoPlayer extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.video = React.createRef<HTMLVideoElement>();
    this.canvas = React.createRef<HTMLCanvasElement>();

    this.state = {
      loaded: false,
    };
  }

  static defaultProps = {
    boxes: [],
    searchBoxes: [],
    selectedBoxIndex: -1,
  };

  video: React.RefObject<HTMLVideoElement>;
  canvas: React.RefObject<HTMLCanvasElement>;
  cameraManagement?: CameraManagement;

  override async componentDidMount() {
    if (this.canvas.current && this.video.current && this.props.camera) {
      this.cameraManagement = new CameraManagement(this.canvas.current, this.video.current);
      this.cameraManagement.onVideoLoaded = () => {
        this.setState({ loaded: true });
      };
      this.cameraManagement.init();
    }
  }

  override async componentDidUpdate(prevProp, prevState) {
    if (this.video.current) {
      this.video.current.srcObject = this.props.stream || null;
    }

    if (this.cameraManagement) {
    }
  }

  override async componentWillUnmount() {
    if (this.cameraManagement) {
      this.cameraManagement.stop();
    }
  }

  override render() {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',

          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'center',
          alignContent: 'center',
        }}
      >
        {!this.state.loaded ? (
          <div
            style={{
              position: 'absolute',
              background: '#cccccc70',
              display: 'flex',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
            }}
          >
            <CircularProgress style={{ margin: 'auto' }} />
          </div>
        ) : null}
        <canvas
          ref={this.canvas}
          style={{
            width: 'auto',
            height: 'auto',
            maxWidth: '100%',
            maxHeight: '100%',
            margin: 'auto',
          }}
        ></canvas>

        <video
          autoPlay
          controls={false}
          style={{
            width: 0,
            visibility: 'hidden',
            height: 0,
          }}
          ref={this.video}
        ></video>
      </div>
    );
  }
}
