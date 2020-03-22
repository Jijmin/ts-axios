import { AxiosRequestConfig } from './types'

/**
 * 实际发送请求
 * @param config 配置
 */
export default function xhr(config: AxiosRequestConfig) {
  const { data = null, url, method = 'get' } = config

  const request = new XMLHttpRequest()

  request.open(method.toUpperCase(), url, true)

  request.send(data)
}
