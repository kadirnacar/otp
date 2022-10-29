import * as WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { Camera as CameraModel } from '@autopark/models';

export default class WebSocketService {
  constructor(wss: WebSocket.Server) {
    this.wss = wss;
    this.clients = {};

    this.wss.on('connection', async (ws: WebSocket, request: IncomingMessage) => {
      const urlSplit = request.url?.split('?');
      let id = '';
      if (urlSplit && urlSplit.length > 1) {
        id = urlSplit.pop();
      }

      if (!id) {
        ws.close();
        return;
      }
      console.log('connected', id);

      const device = await this.initClient(id, ws);
      var json = {
        server: {},
        streams: { disable_audio: true, on_demand: false },
        recording: {
          camurl: 'http://192.168.1.108/onvif/device_service',
          campassword: 'admin',
          camusername: 'admin',
          aiduration: 250,
          saveduration: 10000,
          path: './records',
          paths: [],
          encrypted: false,
        },
      };

      ws.send(JSON.stringify({ Command: 'init', Data: JSON.stringify(json) }));

      ws.on('message', (data: WebSocket.RawData, isBinary: boolean) => {
        console.log(isBinary, data.toString(), id);
      });

      ws.on('close', () => {
        if (this.clients[id]) {
          console.log('Ws Client Closed :', id);
          delete this.clients[id];
        }
      });
    });
  }

  wss: WebSocket.Server;
  clients: { [id: string]: { ws: WebSocket; device: CameraModel } };

  async getCamera(id: number) {
    const camItem = await CameraModel.findOne({
      where: {
        id: id,
      },
    });
    return camItem;
  }

  async initClient(id, ws: WebSocket) {
    if (this.clients[id]) {
      return this.clients[id];
    }

    // let device = await this.getCamera(id);

    // const item = { ws, device };

    this.clients[id] = {} as any;
  }
}
