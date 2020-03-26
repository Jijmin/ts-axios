import { isPlainObject, deepMerge } from './util'
import { Method } from '../types'

/**
 * 对 header 中小写进行处理
 * @param headers header对象
 * @param normalizedName 对比的名字
 */
function normalizeHeaderName(headers: any, normalizedName: string): void {
  if (!headers) {
    return
  }
  Object.keys(headers).forEach(name => {
    // content-type 也是合理的
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = headers[name]
      delete headers[name]
    }
  })
}

/**
 * 处理 Headers 对象
 * @param headers 头部对象
 * @param data 数据
 */
export function processHeaders(headers: any, data: any): any {
  normalizeHeaderName(headers, 'Content-Type')

  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
  }

  return headers
}

/**
 * 处理 res 的 header，转为对象
 * @param headers 头部字符串
 */
export function parseHeaders(headers: string): any {
  let parsed = Object.create(null)
  if (!headers) {
    return parsed
  }

  headers.split('\r\n').forEach(line => {
    // 只考虑了第一个 ":" 号，没考虑后半部分的字符串内部也可能有 ":"，按我们现有的逻辑就会把字符串中 ":" 后面部分都截断了
    // let [key, val] = line.split(':')
    let [key, ...vals] = line.split(':')
    key = key.trim().toLowerCase()
    if (!key) {
      return
    }
    // if (val) {
    //   val = val.trim()
    // }
    let val = vals.join(':').trim()
    parsed[key] = val
  })
  return parsed
}

/**
 * 将 headers 打平，对于 common 中定义的 header 字段，我们都要提取，而对于 post、get 这类提取，需要和该次请求的方法对应
 * @param headers
 * @param method
 */
export function flattenHeaders(headers: any, method: Method): any {
  if (!headers) {
    return headers
  }
  headers = deepMerge(headers.common || {}, headers[method] || {}, headers)

  const methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common']
  methodsToDelete.forEach(method => {
    delete headers[method]
  })

  return headers
}
