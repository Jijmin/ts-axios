import { isPlainObject } from './util'

/**
 * request 转换
 * @param data 数据
 */
export function transformRequest(data: any): any {
  if (isPlainObject(data)) {
    return JSON.stringify(data)
  }
  return data
}
