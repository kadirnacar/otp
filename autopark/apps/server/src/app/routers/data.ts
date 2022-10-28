import { Request, Response, Router } from 'express';
import * as Models from '@autopark/models';

export class DataRouter {
  router: Router;
  entityName: string;

  constructor() {
    this.router = Router();
    this.init();
  }

  public async getList(req: Request, res: Response, next) {
    try {
      const entity = req.params.entity;
      const data = await Models[entity].find();
      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }

  public async getById(req: Request, res: Response, next) {
    try {
      const entity = req.params.entity;
      const id = req.params.id;
      const options = req.body;

      const data = await Models[entity].findOne({ where: { id: id }, ...options });
      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }

  public async deleteItem(req: Request, res: Response, next) {
    try {
      const entity = req.params.entity;
      const id = req.params.id;
      const options = req.body;
      // Models.Camera.delete(id);
      const data = await Models[entity].delete(id);
      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }

  public async updateItem(req: Request, res: Response, next) {
    try {
      const entity = req.params.entity;
      const data = req.body;
      const d = await Models[entity].save(data);
      res.status(200).send(d);
    } catch (err) {
      next(err);
    }
  }

  public async createItem(req: Request, res: Response, next) {
    try {
      const body = req.body;
      const entity = req.params.entity;
      const data = Models[entity].create(body);
      await data.save();
      res.status(200).send({});
    } catch (err) {
      next(err);
    }
  }

  async init() {
    this.router.post('/:entity/list', this.getList.bind(this));
    this.router.post('/:entity/item/:id', this.getById.bind(this));
    this.router.delete('/:entity/:id', this.deleteItem.bind(this));
    this.router.patch('/:entity', this.updateItem.bind(this));
    this.router.post('/:entity', this.createItem.bind(this));
  }
}
