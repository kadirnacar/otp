import { Camera } from '@autopark/models';
import { CircularProgress } from '@mui/material';
import React, { Component } from 'react';
import { BAContext, IBAContext } from '../../utils';
import { CameraManagement } from './CameraManagement';

type Props = {
  stream?: MediaStream;
  camera?: Camera;
  playing?: boolean;
};

type State = {
  loaded: boolean;
};

export default class VideoPlayer extends Component<Props, State, typeof BAContext> {
  constructor(props) {
    super(props);

    this.video = React.createRef<HTMLVideoElement>();
    this.canvas = React.createRef<HTMLCanvasElement>();

    this.state = {
      loaded: false,
    };
  }

  static override contextType = BAContext;

  override context!: React.ContextType<typeof BAContext>;
  static defaultProps = {
    boxes: [],
    searchBoxes: [],
    selectedBoxIndex: -1,
  };

  video: React.RefObject<HTMLVideoElement>;
  canvas: React.RefObject<HTMLCanvasElement>;
  cameraManagement?: CameraManagement;

  mse?: MediaSource;
  videoStarted: boolean = false;
  mseSourceBuffer?: SourceBuffer;
  mseStreamingStarted: boolean = false;
  mseQueue: any[] = [];

  playMse = () => {
    if (this.video.current) {
      this.mse = new MediaSource();
      this.video.current.src = window.URL.createObjectURL(this.mse);
      this.mse.addEventListener(
        'sourceopen',
        async () => {
          // this.videoStarted = true;
          await this.video.current?.play();
        },
        false
      );
    }
  };

  Utf8ArrayToStr = (array) => {
    var out, i, len, c;
    var char2, char3;
    out = '';
    len = array.length;
    i = 0;
    while (i < len) {
      c = array[i++];
      switch (c >> 4) {
        case 7:
          out += String.fromCharCode(c);
          break;
        case 13:
          char2 = array[i++];
          out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
          break;
        case 14:
          char2 = array[i++];
          char3 = array[i++];
          out += String.fromCharCode(
            ((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0)
          );
          break;
      }
    }
    return out;
  };

  pushPacket = () => {
    if (!this.mseSourceBuffer?.updating) {
      if (this.mseQueue.length > 0) {
        const packet = this.mseQueue.shift();
        // var view = new Uint8Array(packet);
        if (this.mseSourceBuffer) {
          this.mseSourceBuffer.appendBuffer(packet);
        }
      } else {
        this.mseStreamingStarted = false;
      }
    }
  };

  override componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>,
    snapshot?: React.Context<IBAContext> | undefined
  ): void {
    if (prevProps.playing != this.props.playing && this.props.playing) {
      this.playMse();
    }
  }

  override async componentDidMount() {
    if (this.canvas.current && this.video.current && this.props.camera) {
      this.cameraManagement = new CameraManagement(this.canvas.current, this.video.current);
      this.cameraManagement.onVideoLoaded = () => {
        this.setState({ loaded: true });
      };

      if (this.props.playing) {
        this.playMse();
      }

      this.context.machine?.socketService?.addListener('message', (data) => {
        try {
          const dataJson = JSON.parse(data.toString());
          if (dataJson.command == 'detect') {
            const boxes = JSON.parse(dataJson.data);
            if (this.cameraManagement) {
              this.cameraManagement.setBoxes(boxes);
            }
          }
        } catch (err) {
          console.log(err);
        }
      });

      this.context.machine?.socketService?.addListener('stream', async (dataBlob: Blob) => {
        try {
          const dataArray = await dataBlob.arrayBuffer();
          // if (this.videoStarted) {
          const data = new Uint8Array(dataArray);
          if (data[0] == 9) {
            const decoded_arr = data.slice(1);
            let mimeCodec;
            if (window.TextDecoder) {
              mimeCodec = new TextDecoder('utf-8').decode(decoded_arr);
            } else {
              mimeCodec = this.Utf8ArrayToStr(decoded_arr);
            }
            if (this.mse) {
              this.mseSourceBuffer = this.mse.addSourceBuffer(
                'video/mp4; codecs="' + mimeCodec + '"'
              );
              this.mseSourceBuffer.mode = 'segments';
              this.mseSourceBuffer.addEventListener('updateend', this.pushPacket);
            }
          } else {
            this.readPacket(dataArray);
          }
          // } else {
          //   console.log('play');
          //   this.playMse();
          // }
        } catch (err) {
          console.log(err);
        }
      });

      this.cameraManagement.init();
    }
  }

  readPacket = (packet) => {
    if (!this.mseStreamingStarted && this.mseSourceBuffer) {
      this.mseSourceBuffer.appendBuffer(packet);
      this.mseStreamingStarted = true;
      return;
    }
    this.mseQueue.push(packet);

    if (!this.mseSourceBuffer?.updating) {
      this.pushPacket();
    }
  };

  override async componentWillUnmount() {
    this.context.machine?.socketService?.send({ Command: 'close', To: this.props.camera?.id });
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
