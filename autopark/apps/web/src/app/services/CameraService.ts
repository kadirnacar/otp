import { Result } from '../reducers/Result';
import { ServiceBase } from './ServiceBase';

export class CameraService extends ServiceBase {
  public static async getInfo(id: number): Promise<Result<any>> {
    const result = await this.requestJson(
      {
        url: `/api/camera/info/${id}`,
        method: 'GET',
      },
      true
    );
    return result;
  }

  public static async connect(id: number): Promise<Result<any>> {
    const result = await this.requestJson(
      {
        url: `/api/camera/connect/${id}`,
        method: 'POST',
      },
      true
    );
    return result;
  }

  public static async disconnect(id: number): Promise<Result<any>> {
    const result = await this.requestJson(
      {
        url: `/api/camera/disconnect/${id}`,
        method: 'POST',
      },
      true
    );
    return result;
  }
}
