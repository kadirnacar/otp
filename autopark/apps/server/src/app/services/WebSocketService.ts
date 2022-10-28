import WebSocket from 'ws';
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

      const device = await this.initClient(id, ws);

      ws.on('message', (data: WebSocket.RawData, isBinary: boolean) => {
        // console.log(isBinary, data.toString(), id);
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

    let device = await this.getCamera(id);

    const item = { ws, device };

    this.clients[id] = item;

    return item;
  }
}
