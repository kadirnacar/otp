import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import * as WebSocket from 'ws';
import 'reflect-metadata';
import 'reflect-metadata';
import * as http from 'http';
import WebSocketService from './app/services/WebSocketService';
import { DataRouter } from './app/routers/data';
import { environment } from './environments/environment';

const app = express();
const port = environment.port;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });
const socketService = new WebSocketService(wss);
const dataRouter = new DataRouter();

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

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'web', '/index.html'));
});

server.listen(port, () => {
  console.log(`Server started on port ${port} :)`);
});
