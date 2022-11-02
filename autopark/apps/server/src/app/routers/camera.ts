import * as Models from '@autopark/models';
import { Request, Response, Router } from 'express';
import { CameraService } from '../services/CameraService';

export class CameraRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  public async connect(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      const data = await Models.Camera.findOne({ where: { id: Number(id) } });
      const cam = await CameraService.connect(data);

      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }

  async init() {
    this.router.post('/connect/:id', this.connect.bind(this));
  }
}
