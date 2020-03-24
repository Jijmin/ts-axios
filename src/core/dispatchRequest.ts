import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { buildURL } from '../helpers/url'
import { flattenHeaders } from '../helpers/headers'
import xhr from './xhr'
import transform from './transform'

/**
 * 发送请求
 * @param config axios配置
 */
export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  processConfig(config)
  return xhr(config).then(res => transformResponseData(res))
}

/**
 * 对 config 中的数据做处理
 * @param config axios配置
 */
function processConfig(config: AxiosRequestConfig): void {
  config.url = transformUrl(config)
  config.data = transform(config.data, config.headers, config.transformRequest)
  config.headers = flattenHeaders(config.headers, config.method!)
}

/**
 * 转换 url
 * @param config axios配置
 */
function transformUrl(config: AxiosRequestConfig): string {
  const { url, params } = config
  return buildURL(url!, params)
}

/**
 * 转换响应数据
 * @param res 响应对象
 */
function transformResponseData(res: AxiosResponse): AxiosResponse {
  res.data = transform(res.data, res.headers, res.config.transformResponse)
  return res
}
