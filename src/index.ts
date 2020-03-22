import { AxiosRequestConfig } from './types'
import { buildURL } from './helpers/url'
import { transformRequest } from './helpers/data'
import { processHeaders } from './helpers/headers'
import xhr from './xhr'

/**
 * axios 入口
 * @param config axios配置
 */
function axios(config: AxiosRequestConfig) {
  processConfig(config)
  xhr(config)
}

/**
 * 对 config 中的数据做处理
 * @param config axios配置
 */
function processConfig(config: AxiosRequestConfig): void {
  config.url = transformUrl(config)
  config.headers = transformHeaders(config)
  config.data = transformRequestData(config)
}

/**
 * 转换 url
 * @param config axios配置
 */
function transformUrl(config: AxiosRequestConfig): string {
  const { url, params } = config
  return buildURL(url, params)
}

/**
 * 转换 request 数据
 * @param config axios配置
 */
function transformRequestData(config: AxiosRequestConfig): any {
  return transformRequest(config.data)
}

/**
 * 转换 headers 数据
 * @param config axios配置
 */
function transformHeaders(config: AxiosRequestConfig) {
  const { headers = {}, data } = config
  return processHeaders(headers, data)
}
export default axios