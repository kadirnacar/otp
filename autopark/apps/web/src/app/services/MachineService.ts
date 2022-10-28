import Axios from 'axios';
import EventEmitter from 'events';
import { environment } from '../../environments/environment';
import { WebSocketService } from './WebSocketService';

export enum MsgType {
  step,
  config,
  led,
  camera,
  laser,
}
export class MachineService extends EventEmitter {
  constructor() {
    super();
    this.initSocket();
    this.config = {
      speed: 1000,
      wayLength: 6000,
      camera: {
        xclk: 20,
        pixformat: 4,
        framesize: 9,
        quality: 9,
        brightness: 0,
        saturation: -2,
        sharpness: 0,
        special_effect: 0,
        wb_mode: 0,
        awb: false,
        awb_gain: false,
        aec: true,
        aec2: false,
        ae_level: 0,
        aec_value: 604,
        agc: true,
        agc_gain: 11,
        gainceiling: 0,
        bpc: false,
        wpc: true,
        raw_gma: true,
        lenc: true,
        hmirror: true,
        vflip: true,
        dcw: true,
        colorbar: 0,
        led_intensity: -1,
        face_detect: 0,
        contrast: 1,
      },
    };
  }

  initSocket() {
    this.socketService = new WebSocketService();
    this.socketService.on('message', async (msg) => {
      try {
        if (msg.constructor.name === 'Blob') {
          this.listeners('image').forEach(async (x) => await x(msg));
        } else {
          this.listeners('message').forEach(async (x) => await x(msg));
        }
      } catch {}
    });
    this.socketService.on('open', async () => {
      await this.getConfig();
      this.listeners('loaded').forEach(async (x) => await x());
    });

    this.socketService.on('close', async () => {
      console.log('reconnect');
      this.listeners('close').forEach(async (x) => await x());
      setTimeout(() => {
        this.initSocket();
      }, 1000);
    });
  }

  socketService: WebSocketService | undefined;
  config;

  async getConfig() {
    try {
      // const result = await Axios.get(`http://${environment.machineUrl}/config.json`);
      // this.config = { ...this.config, ...result.data };
      // console.log(this.config);
    } catch {}
  }

  async setCamSettings(settings) {
    if (this.socketService) {
      this.socketService.send({
        type: MsgType.camera,
        data: { settings },
      });
    }
  }

  async startCam(isStart: boolean) {
    if (this.socketService) {
      this.socketService.send({
        type: MsgType.camera,
        data: { camera: isStart },
      });
    }
  }

  async saveConfig(config) {
    if (this.socketService) {
      this.config = config;
      this.socketService.send({
        type: MsgType.config,
        data: config,
      });
    }
  }

  async ledControl(isOn: boolean) {
    if (this.socketService) {
      this.socketService.send({
        type: MsgType.led,
        data: {
          led: isOn,
        },
      });
    }
  }

  async laserControl(isOn: boolean) {
    if (this.socketService) {
      this.socketService.send({
        type: MsgType.laser,
        data: {
          laser: isOn,
        },
      });
    }
  }

  async stepGoFront(speed) {
    if (this.socketService) {
      this.socketService.send({
        type: MsgType.step,
        data: {
          dir: 0,
          speed,
        },
      });
    }
  }

  async stepGoBack(speed) {
    if (this.socketService) {
      this.socketService.send({
        type: MsgType.step,
        data: {
          dir: 1,
          speed,
        },
      });
    }
  }

  async stepGoPos(dir, speed, pos) {
    if (this.socketService) {
      this.socketService.send({
        type: MsgType.step,
        data: {
          dir,
          speed,
          limit: pos,
        },
      });
    }
  }
}
