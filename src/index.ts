import { AxiosRequestConfig } from './types'
import { buildURL } from './helpers/url'
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
}

/**
 * 转换 url
 * @param config axios配置
 */
function transformUrl(config: AxiosRequestConfig): string {
  const { url, params } = config
  return buildURL(url, params)
}
export default axios
