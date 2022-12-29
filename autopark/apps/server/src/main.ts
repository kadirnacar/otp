import * as bodyParser from 'body-parser';
import express from 'express';
import * as path from 'path';
import * as WebSocket from 'ws';
import 'reflect-metadata';
import 'reflect-metadata';
import * as http from 'http';
import WebSocketService from './app/services/WebSocketService';
import { DataRouter } from './app/routers/data';
import { environment } from './environments/environment';
import './app/services';
import { CameraRouter } from './app/routers/camera';
import Bree from 'bree';
import axios from 'axios';
import { firebaseDb } from './app/services';

const app = express();
const port = environment.port;
const server = http.createServer(app);
const wss = new WebSocket.Server({ path: '/ws', server });
const socketService = new WebSocketService(wss);
const dataRouter = new DataRouter();
const cameraRouter = new CameraRouter();

function corsPrefetch(req: Request, res: express.Response, next: Function) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, *');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
}

app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(__dirname + '/web'));
app.use(corsPrefetch as any);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api', dataRouter.router);
app.use('/api/camera', cameraRouter.router);

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'web', '/index.html'));
});

let fdb;
let ipRef;

async function getIp() {
  const d = await axios.get('http://api.ipify.org/?format=json');
  if (d && d.data && d.status == axios.HttpStatusCode.Ok) {
    if (!fdb) {
      fdb = await firebaseDb.collection('macInfo').doc('ip');
    }
    if (!ipRef) {
      ipRef = await fdb.get();
    }
    const fdb3 = await firebaseDb.collection('macInfo').doc('ip');

    if (ipRef.exists && ipRef.data().ip != d.data.ip) {
      await fdb.set(
        {
          ip: d.data.ip,
        },
        { merge: true }
      );
      ipRef = await fdb.get();
    } else if (!ipRef.exists) {
      await fdb.set(
        {
          ip: d.data.ip,
        },
        { merge: true }
      );
      ipRef = await fdb.get();
    }
  }
}

setInterval(() => {
  try {
    getIp();
  } catch {}
}, 60000);
// top-level await supported in Node v14.8+
server.listen(port, () => {
  console.log(`Server started on port ${port} :)`);
});
