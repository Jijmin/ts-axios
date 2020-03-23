import {
  AxiosRequestConfig,
  AxiosPromise,
  Method,
  AxiosResponse,
  ResolvedFn,
  RejectedFn
} from '../types'
import dispatchRequest from './dispatchRequest'
import InterceptorManager from './InterceptorManager'
import mergeConfig from './mergeConfig'

/**
 * 一个请求拦截器管理类实例，一个是响应拦截器管理类实例
 */
interface Interceptors {
  request: InterceptorManager<AxiosRequestConfig>
  response: InterceptorManager<AxiosResponse>
}

/**
 * Promise链式结构
 */
interface PromiseChain {
  resolved: ResolvedFn | ((config: AxiosRequestConfig) => AxiosPromise)
  rejected?: RejectedFn
}

/**
 * Axios 类实现
 */
export default class Axios {
  defaults: AxiosRequestConfig
  interceptors: Interceptors

  constructor(initConfig: AxiosRequestConfig) {
    this.defaults = initConfig
    // 在实例化 Axios 类的时候，在它的构造器去初始化这个 interceptors 实例属性
    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosResponse>()
    }
  }

  /**
   * axios的请求方式，格式化后的所有axios都会走到这个中
   * @param url url路径 | 参数对象
   * @param config 参数对象 | null
   */
  request(url: any, config?: any): AxiosPromise {
    if (typeof url === 'string') {
      // 第一个参数如果是字符串，表示传入的是 url 路径，需要添加到 config 中去
      if (!config) {
        config = {}
      }
      config.url = url
    } else {
      config = url // 直接传入配置文件对象的形式，重新赋值下 config
    }
    // 将默认配置和传入进来的 config 进行合并
    config = mergeConfig(this.defaults, config)

    // 实现链式：默认取值是我们 dispatchRequest 请求
    const chain: PromiseChain[] = [
      {
        resolved: dispatchRequest,
        rejected: undefined
      }
    ]

    // request 是按照先进后出的形式进行依次执行的，需要冲队头插入
    this.interceptors.request.forEach(interceptor => {
      chain.unshift(interceptor)
    })

    // response 从队尾插入，先进先出
    this.interceptors.response.forEach(interceptor => {
      chain.push(interceptor)
    })

    // 按照拦截器链的顺序依次执行拦截器
    let promise = Promise.resolve(config)
    while (chain.length) {
      const { resolved, rejected } = chain.shift()!
      promise = promise.then(resolved, rejected)
    }

    return promise
  }

  // axios 扩展的一些请求方式
  get(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('get', url, config)
  }
  delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('delete', url, config)
  }
  head(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('head', url, config)
  }
  options(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('options', url, config)
  }
  post(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('post', url, data, config)
  }
  put(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('put', url, data, config)
  }
  patch(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('patch', url, data, config)
  }

  _requestMethodWithoutData(
    method: Method,
    url: string,
    config?: AxiosRequestConfig
  ): AxiosPromise {
    return this.request(Object.assign(config || {}, { method, url }))
  }
  _requestMethodWithData(
    method: Method,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): AxiosPromise {
    return this.request(Object.assign(config || {}, { method, url, data }))
  }
}
