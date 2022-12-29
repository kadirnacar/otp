import { Result } from '../reducers/Result';
import { ServiceBase } from './ServiceBase';

export declare type FindConditions<T> = {
  [P in keyof T]?: T[P] extends never ? FindConditions<T[P]> : FindConditions<T[P]>;
};

export interface ObjectLiteral {
  [key: string]: any;
}

export interface JoinOptions {
  /**
   * Alias of the main entity.
   */
  alias: string;
  /**
   * Array of columns to LEFT JOIN.
   */
  leftJoinAndSelect?: {
    [key: string]: string;
  };
  /**
   * Array of columns to INNER JOIN.
   */
  innerJoinAndSelect?: {
    [key: string]: string;
  };
  /**
   * Array of columns to LEFT JOIN.
   */
  leftJoin?: {
    [key: string]: string;
  };
  /**
   * Array of columns to INNER JOIN.
   */
  innerJoin?: {
    [key: string]: string;
  };
}

export interface DataOptions<T> {
  /**
   * Specifies what columns should be retrieved.
   */
  select?: (keyof T)[];
  /**
   * Simple condition that should be applied to match entities.
   */
  where?: FindConditions<T>[] | FindConditions<T> | ObjectLiteral | string;
  /**
   * Indicates what relations of entity should be loaded (simplified left join form).
   */
  relations?: string[];
  /**
   * Specifies what relations should be loaded.
   */
  join?: JoinOptions;
  /**
   * Order, in which entities should be ordered.
   */
  order?: {
    [P in keyof T]?: 'ASC' | 'DESC' | 1 | -1;
  };
  /**
   * Enables or disables query result caching.
   */
  cache?:
    | boolean
    | number
    | {
        id: any;
        milliseconds: number;
      };
  /**
   * Enables or disables query result caching.
   */
  lock?:
    | {
        mode: 'optimistic';
        version: number | Date;
      }
    | {
        mode: 'pessimistic_read' | 'pessimistic_write' | 'dirty_read';
      };
  /**
   * Indicates if soft-deleted rows should be included in entity result.
   */
  withDeleted?: boolean;
  /**
   * If sets to true then loads all relation ids of the entity and maps them into relation values (not relation objects).
   * If array of strings is given then loads only relation ids of the given properties.
   */
  loadRelationIds?:
    | boolean
    | {
        relations?: string[];
        disableMixedMap?: boolean;
      };
  /**
   * Indicates if eager relations should be loaded or not.
   * By default they are loaded when find methods are used.
   */
  loadEagerRelations?: boolean;
  /**
   * Offset (paginated) where from entities should be taken.
   */
  skip?: number;
  /**
   * Limit (paginated) - max number of entities should be taken.
   */
  take?: number;
}

export class DataService extends ServiceBase {
  public static async getJsonData(): Promise<Result<any[]>> {
    const result = await this.requestJson<any[]>(
      {
        url: `/a.json`,
        method: 'GET',
      },
      true
    );
    return result;
  }
  public static async getItem<T>(entity: string, options?: DataOptions<T>): Promise<Result<T>> {
    const result = await this.requestJson<T>(
      {
        url: `/api/${entity}/item`,
        method: 'POST',
        data: { ...options },
      },
      true
    );
    return result;
  }
  public static async getByIdTreeParent<T>(
    entity: string,
    id: string,
    options?: DataOptions<T>
  ): Promise<Result<T>> {
    const result = await this.requestJson<T>(
      {
        url: `/api/${entity}/tree/parents`,
        method: 'POST',
        data: { id, options },
      },
      true
    );
    return result;
  }

  public static async getTree<T>(entity: string, options?: DataOptions<T>): Promise<Result<T>> {
    const result = await this.requestJson<T>(
      {
        url: `/api/${entity}/tree/tree`,
        method: 'POST',
        data: { options },
      },
      true
    );
    return result;
  }

  public static async getById<T>(
    entity: string,
    id: string,
    options?: DataOptions<T>
  ): Promise<Result<T>> {
    const result = await this.requestJson<T>(
      {
        url: `/api/${entity}/item/${id}`,
        method: 'POST',
        data: { ...options },
      },
      true
    );
    return result;
  }
  public static async getList<T>(
    entity: string,
    parentId?: string,
    options?: DataOptions<T>
  ): Promise<Result<T[]>> {
    const result = await this.requestJson<T[]>(
      {
        url: `/api/${entity}/list${parentId ? `/${parentId}` : ''}`,
        method: 'POST',
        data: { ...options },
      },
      true
    );
    return result;
  }
  public static async create<T>(entity: string, item: T): Promise<Result<T>> {
    const result = await this.requestJson<T>(
      {
        url: `/api/${entity}`,
        method: 'POST',
        data: { ...item },
      },
      true
    );
    return result;
  }
  public static async update<T>(entity: string, item: any): Promise<Result<T>> {
    const result = await this.requestJson<T>(
      {
        url: `/api/${entity}`,
        method: 'PATCH',
        data: item,
      },
      true
    );
    return result;
  }
  public static async upload(files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    const result = await this.requestJson<any>(
      {
        url: `/api/upload`,
        method: 'POST',
        data: formData,
      },
      true
    );
    return result;
  }
  public static async delete<T>(entity: string, id: string): Promise<Result<T>> {
    const result = await this.requestJson<T>(
      {
        url: `/api/${entity}/${id}`,
        method: 'DELETE',
        data: {},
      },
      true
    );
    return result;
  }
}
