import * as WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { Camera as CameraModel } from '@autopark/models';
import { v4 as uuidv4, v6 as uuidv6 } from 'uuid';
export default class WebSocketService {
  constructor(wss: WebSocket.Server) {
    this.wss = wss;
    this.clients = {};
    this.streamClient = {};

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

      if (id == 'admin') {
        const count = Object.keys(this.clients).filter((x) => x.includes('id')).length;
        id = `admin-${uuidv4()}`;
      }
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
        ws.on('ping', () => {
          ws.pong();
        });
        ws.on('message', (data: WebSocket.RawData, isBinary: boolean) => {
          const admins = Object.keys(this.clients)
            .filter((x) => x.includes('admin'))
            .map((x) => this.clients[x]);
          if (!isBinary) {
            try {
              if (admins.length > 0) {
                const dataJson = JSON.parse(data.toString());
                dataJson.From = id;
                admins.forEach((x) => x.ws.send(JSON.stringify(dataJson)));
              }
            } catch (err) {
              console.log('client on msg:', err);
            }
          } else {
            try {
              if (this.streamClient[id] && this.streamClient[id].headers.length < 1) {
                this.streamClient[id].headers.push(data);
              }

              if (this.streamClient[id]) {
                this.streamClient[id].clients.forEach((x) =>
                  this.clients[x].ws.send(data, { binary: true })
                );
              }

              // if (admins.length > 0) {
              //   admins.forEach((x) => x.ws.send(data, { binary: true }));
              // }
            } catch (err) {
              console.log('client on msg:', err);
            }
          }
        });
      } else if (id.includes('admin')) {
        ws.on('message', (data: WebSocket.RawData, isBinary: boolean) => {
          try {
            const dataJson = JSON.parse(data.toString());

            if (dataJson.To != undefined) {
              if (dataJson.Command == 'rtsp') {
                const streamClient = this.streamClient[dataJson.To.toString()];

                if (!streamClient) {
                  const to = this.clients[dataJson.To.toString()];

                  if (to) {
                    to.ws.send(data.toString());
                    this.streamClient[dataJson.To.toString()] = { clients: [id], headers: [] };
                  }
                } else if (!streamClient.clients.includes(id)) {
                  streamClient.clients.push(id);
                  for (let ix = 0; ix < streamClient.headers.length; ix++) {
                    const element = streamClient.headers[ix];
                    ws.send(element, { binary: true });
                  }
                }
              } else {
                const to = this.clients[dataJson.To.toString()];

                if (to) {
                  to.ws.send(data.toString());
                }
              }
            }
          } catch (err) {
            console.log(err);
          }
        });
      }
      ws.on('close', (code, reason) => {
        console.log('close:', id);
        delete this.clients[id];
        const keys = Object.keys(this.clients);

        for (let index = 0; index < keys.length; index++) {
          const element = keys[index];

          if (this.streamClient[element]) {
            const client = this.streamClient[element];
            const adminIndex = client ? client.clients.indexOf(id) : -1;

            if (adminIndex >= 0) {
              this.streamClient[element].clients.splice(adminIndex, 1);
            }
            if (this.streamClient[element] && this.streamClient[element].clients.length == 0) {
              console.log('close');
              this.clients[element].ws.close();
              delete this.clients[element];
            }
          }
        }

        delete this.streamClient[id];
      });
      // ws.on('close', () => {
      //   if (this.clients[id]) {
      //     console.log('Ws Client Closed :', id);
      //     // delete this.clients[id];
      //   }
      // });
    });
  }

  wss: WebSocket.Server;
  clients: { [id: string]: { ws: WebSocket; device: CameraModel } };
  streamClient: { [id: string]: { clients: any[]; headers: any[] } };

  async getCamera(id: number) {
    const camItem = await CameraModel.findOne({
      where: {
        id: id,
      },
    });
    return camItem;
  }

  async initClient(id, ws: WebSocket) {
    this.clients[id] = { ws } as any;
  }
}
