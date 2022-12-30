import { Camera as CameraModel } from '@autopark/models';
import { spawn } from 'child_process';
import EventEmitter from 'events';
import * as path from 'path';

export class CameraService {
  public static async connect(cameraModel: CameraModel) {
    const rtspReader = new RtspReader();
    rtspReader.startStream(cameraModel);
  }
}

export class RtspReader extends EventEmitter {
  constructor() {
    super();
  }

  static readers: any = {};
  answerData: any;
  isAlive: boolean = false;
  goProcess: any;

  async stopStream() {
    this.answerData = null;
    this.isAlive = false;
    return new Promise((resolve: any) => {
      setTimeout(() => {
        resolve();
      }, 2000);
      if (!this.goProcess || this.goProcess.killed) {
        resolve();
      }
      this.goProcess.on('close', () => resolve());
      this.goProcess.kill('SIGKILL');
    });
  }

  async startStream(camItem: CameraModel) {
    // if (this.isAlive && this.answerData) {
    //   return;
    // }
    if (RtspReader.readers[camItem.id]) {
      return;
    } else {
      RtspReader.readers[camItem.id] = {};
    }
    if (camItem) {
      this.goProcess = spawn(
        path.resolve(__dirname, 'otp'),
        ['localhost:3333', camItem.id.toString()],
        {
          cwd: path.resolve(__dirname, ''),
        }
      );

      this.goProcess.stderr.on('data', async (chunk) => {
        const msg: string = chunk.toString('utf8');
        console.log('std output:', msg);

        if (msg.includes('Stream Codec Not Found') || msg.includes('panic:')) {
          this.answerData = null;
          this.isAlive = false;
          this.goProcess.kill();
          // await this.endProcess(goProcess);
          await this.stopStream();
          delete RtspReader.readers[camItem.id];
          CameraService.connect(camItem);
          // } else if (msg.includes('Stream Exit Rtsp Disconnect')) {
          //   goProcess.kill();
          //   await this.endProcess(goProcess);
          // } else if (msg.includes('WebRTC Client Offline')) {
          //   goProcess.kill();
          //   await this.endProcess(goProcess);
        }
        // else if (msg.includes('noVideo')) {
        //   this.answerData = null;
        //   this.isAlive = false;
        //   this.goProcess.kill();
        //   await this.stopStream();
        //   delete RtspReader.readers[camItem.id];
        //   CameraService.connect(camItem);
        //   // await this.endProcess(goProcess);
        //   // this.rtspgo(id, sdp, res);
        // }
      });
    }
  }
}
