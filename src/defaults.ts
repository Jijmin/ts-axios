import { AxiosRequestConfig } from './types'
import { processHeaders } from './helpers/headers'
import { transformRequest, transformResponse } from './helpers/data'

/**
 * 默认的一些配置
 */
const defaults: AxiosRequestConfig = {
  method: 'get',
  timeout: 0,
  headers: {
    common: {
      Accept: 'application/json, text/plain, */*'
    }
  },
  // 把之前对请求数据和响应数据的处理逻辑，放到了默认配置中，也就是默认处理逻辑
  transformRequest: [
    function(data: any, headers: any): any {
      processHeaders(headers, data)
      return transformRequest(data)
    }
  ],
  transformResponse: [
    function(data: any): any {
      return transformResponse(data)
    }
  ],
  xsrfCookieName: 'XSRF-TOKEN', // xsrfCookieName 表示存储 token 的 cookie 名称
  xsrfHeaderName: 'X-XSRF-TOKEN' // xsrfHeaderName 表示请求 headers 中 token 对应的 header 名称
}
// 不需要 data 数据的请求方式，header 默认一个空对象
const methodsNoData = ['delete', 'get', 'head', 'options']
methodsNoData.forEach(method => {
  defaults.headers[method] = {}
})

const methodsWithData = ['post', 'put', 'patch']
methodsWithData.forEach(method => {
  defaults.headers[method] = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

export default defaults
