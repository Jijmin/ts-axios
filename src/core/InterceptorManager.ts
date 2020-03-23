import { ResolvedFn, RejectedFn } from '../types'

/**
 * 单个拦截器的类型约束
 */
interface Interceptor<T> {
  resolved: ResolvedFn<T>
  rejected?: RejectedFn
}
/**
 * 拦截器实现
 */
export default class InterceptorManager<T> {
  private interceptors: Array<Interceptor<T> | null> // 存储拦截器

  constructor() {
    this.interceptors = []
  }

  /**
   * 添加拦截器到 interceptors 中，并返回一个 id 用于删除
   * @param resolved use的第一个参数，类似于Promise的resolve功能
   * @param rejected use的第二个参数，类似于Promise的reject功能，处理错误
   */
  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number {
    this.interceptors.push({ resolved, rejected })
    return this.interceptors.length - 1
  }

  /**
   * 遍历 interceptors 用的，它支持传入一个函数，遍历过程中会调用该函数，并把每一个 interceptor 作为该函数的参数传入
   * @param fn 传入的函数
   */
  forEach(fn: (Interceptor: Interceptor<T>) => void): void {
    this.interceptors.forEach(interceptor => {
      if (interceptor !== null) {
        fn(interceptor)
      }
    })
  }

  /**
   * 删除一个拦截器，通过传入拦截器的 id 删除
   * @param id 拦截器ID
   */
  eject(id: number): void {
    if (this.interceptors[id]) {
      this.interceptors[id] = null
    }
  }
}
