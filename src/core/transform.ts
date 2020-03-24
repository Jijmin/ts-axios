import { AxiosTransformer } from '../types'

/**
 * data 和 headers 的转换
 * @param data 数据
 * @param headers 头部对象
 * @param fns 一个或者多个转换函数
 */
export default function transform(
  data: any,
  headers: any,
  fns?: AxiosTransformer | AxiosTransformer[]
): any {
  if (!fns) {
    return data
  }
  if (!Array.isArray(fns)) {
    fns = [fns]
  }
  // 遍历 fns，执行这些转换函数，并且把 data 和 headers 作为参数传入，每个转换函数返回的 data 会作为下一个转换函数的参数 data 传入
  fns.forEach(fn => {
    data = fn(data, headers)
  })
  return data
}
