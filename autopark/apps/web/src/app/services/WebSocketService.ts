import EventEmitter from 'events';
import { environment } from '../../environments/environment';

export class WebSocketService extends EventEmitter {
  constructor() {
    super();
    this.reference = '2B7E151628AED2A6ABF7158809CF4F3C';
    // this.socket = new WebSocket(`ws://${location.hostname}:${location.port}/ws`);
    if (environment.production == false) {
      this.socket = new WebSocket(`ws://${location.host}/ws?admin`);
    } else {
      this.socket = new WebSocket(`ws://${location.host}/ws?admin`);
    }
    this.socket.onerror = (ev) => {
      this.listeners('error').forEach(async (x) => await x());
    };
    this.socket.addEventListener('open', (event) => {
      this.listeners('open').forEach(async (x) => await x());
    });
    this.socket.addEventListener('message', (event) => {
      // var bytes = CryptoJS.AES.decrypt(messageString, this.reference);
      // var message = bytes.toString(CryptoJS.enc.Utf8);
      try {
        if (event.data.constructor.name === 'Blob') {
          this.listeners('stream').forEach(async (x) => await x(event.data));
        } else {
          this.listeners('message').forEach(async (x) => await x(event.data));
        }
      } catch {}
    });

    this.socket.addEventListener('close', (event) => {
      this.listeners('close').forEach(async (x) => await x());
    });
  }

  reference: string;

  socket: WebSocket;

  public send(data) {
    const message = JSON.stringify(data);
    // const ciphertext = CryptoJS.AES.encrypt(message, this.reference).toString(CryptoJS.enc.base64);
    // this.socket.send(ciphertext);
    this.socket.send(message);
  }
}
