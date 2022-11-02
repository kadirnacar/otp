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
      console.log('Ws Client Connected :', id);

      // if (!id) {
      //   ws.close();
      //   return;
      // }
      const idValue = parseInt(id);
      await this.initClient(id, ws);

      if (!isNaN(idValue)) {
        const device = await this.getCamera(idValue);
        var json = {
          server: {},
          streams: { disable_audio: true, on_demand: false },
          recording: {
            camurl: `http://${device.url}/onvif/device_service`,
            deviceurl: device.url,
            campassword: device.username,
            camusername: device.password,
            aiduration: 1000,
            saveduration: 60000,
            path: './records',
            paths: [],
            encrypted: false,
          },
        };
        ws.on('ping', (data) => {
          ws.pong('pong');
        });
        ws.send(JSON.stringify({ Command: 'init', Data: JSON.stringify(json) }));

        ws.on('message', (data: WebSocket.RawData, isBinary: boolean) => {
          try {
            if (this.clients['admin']) {
              const dataJson = JSON.parse(data.toString());
              dataJson.From = id;
              this.clients['admin'].ws.send(JSON.stringify(dataJson));
            }
          } catch (err) {
            console.log('client on msg:', err);
          }
        });
      } else if (id == 'admin') {
        ws.on('message', (data: WebSocket.RawData, isBinary: boolean) => {
          try {
            const dataJson = JSON.parse(data.toString());
            if (dataJson.To != undefined) {
              const to = this.clients[dataJson.To.toString()];
              // console.log('to:', to);
              if (to) {
                console.log('send to:', dataJson.To, data.toString());
                to.ws.send(data.toString());
              }
            }
          } catch (err) {
            console.log(err);
          }
        });
      }

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
    // if (this.clients[id]) {
    //   return this.clients[id];
    // }

    // let device = await this.getCamera(id);

    // const item = { ws, device };

    this.clients[id] = { ws } as any;
  }
}
