import { Result } from '../reducers/Result';
import Axios, { AxiosRequestConfig } from 'axios';
import jsonToUrl from 'json-to-url';

export function isNode(): boolean {
  return (
    typeof process === 'object' && process.versions && !!process.versions.node
  );
}

export interface IRequestOptions {
  url: string;
  data?: any;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

export interface ISendFormDataOptions {
  url: string;
  data: FormData;
  method: 'POST' | 'PUT' | 'PATCH';
}

/**
 * Represents base class of the isomorphic service.
 */
export abstract class ServiceBase {
  /**
   * Make request with JSON data.
   * @param opts
   */
  public static async requestJson<T>(
    opts: IRequestOptions,
    setAuthHeader = false
  ): Promise<Result<T>> {
    let axiosResult: any = null;
    let result: any;

    // opts.url = transformUrl(opts.url); // Allow requests also for Node.

    const processQuery = (url: string, data: any): string => {
      if (data) {
        return `${url}?${jsonToUrl(data)}`;
      }
      return url;
    };

    let axiosRequestConfig: AxiosRequestConfig | any = {};

    if (isNode()) {
      // Used for SSR requests from the web server to NodeServices.
      axiosRequestConfig = {
        // headers: {
        //     Cookie: Globals.getData().private.cookie
        // }
      };
    }
    if (setAuthHeader)
      axiosRequestConfig = {
        headers: {
          auth: localStorage.getItem('user'),
        },
      };
    try {
      switch (opts.method) {
        case 'GET':
          axiosResult = await Axios.get(
            processQuery(opts.url, opts.data),
            axiosRequestConfig
          );
          break;
        case 'POST':
          axiosResult = await Axios.post(
            opts.url,
            opts.data,
            axiosRequestConfig
          );
          break;
        case 'PUT':
          axiosResult = await Axios.put(
            opts.url,
            opts.data,
            axiosRequestConfig
          );
          break;
        case 'PATCH':
          axiosResult = await Axios.patch(
            opts.url,
            opts.data,
            axiosRequestConfig
          );
          break;
        case 'DELETE':
          axiosResult = await Axios.delete(
            processQuery(opts.url, opts.data),
            axiosRequestConfig
          );
          break;
      }
      result = axiosResult ? new Result(axiosResult.data || {}, '') : null;
    } catch (error: any) {
      result = new Result<any>(
        null,
        error.response && error.response.data
          ? error.response.data
          : error.message
      );
    }

    // if (result.hasErrors()) {
    //   console.error(result.errors);
    // }
    return result;
  }

  /**
   * Allows you to send files to the server.
   * @param opts
   */
  public static async sendFormData<T>(
    opts: ISendFormDataOptions
  ): Promise<Result<T>> {
    let axiosResult: any = null;
    let result: any = null;

    // opts.url = transformUrl(opts.url); // Allow requests also for Node.

    const axiosOpts = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    try {
      switch (opts.method) {
        case 'POST':
          axiosResult = await Axios.post(opts.url, opts.data, axiosOpts);
          break;
        case 'PUT':
          axiosResult = await Axios.put(opts.url, opts.data, axiosOpts);
          break;
        case 'PATCH':
          axiosResult = await Axios.patch(opts.url, opts.data, axiosOpts);
          break;
      }
      result =
        axiosResult && axiosResult.data
          ? new Result(axiosResult.data.value, axiosResult.data.errors)
          : null;
    } catch (error: any) {
      result = new Result(null, error.message);
    }

    if (result.hasErrors()) {
      console.error(result.errors);
    }

    return result;
  }
}
