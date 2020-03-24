import { CancelExecutor, CancelTokenSource, Canceler } from '../types'
import Cancel from './Cancel'

interface ResolvePromise {
  (reason?: Cancel): void
}

export default class CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel

  constructor(executor: CancelExecutor) {
    let resolvePromise: ResolvePromise
    this.promise = new Promise<Cancel>(resolve => {
      // 缓存一个 promise 的 pending 状态，resolvePromise 变量指向 resolve 函数
      resolvePromise = resolve
    })

    // 构造实例对象的时候执行，类似于一个自执行函数，executor 里面是一个 cancel 函数，只是执行了 executor
    // 但是里面的函数是还没执行的，当在外部调用 cancel 的时候才会执行里面的函数
    executor(message => {
      // 避免多次调用，初始化的时候赋值给reason，后面就不要再重新赋值了
      if (this.reason) {
        return
      }
      this.reason = new Cancel(message)
      // 当执行里面这个函数的时候，才会触发之前缓存的 Promise，使它从 pending 状态变成 resolved 状态
      resolvePromise(this.reason)
    })
  }

  // 定义一个 cancel 变量实例化一个 CancelToken 类型的对象，然后在 executor 函数中，把 cancel 指向参数 c 这个取消函数
  static source(): CancelTokenSource {
    let cancel!: Canceler
    const token = new CancelToken(c => {
      cancel = c
    })

    return { cancel, token }
  }

  // 当一个请求携带的 cancelToken 已经被使用过，那么我们甚至都可以不发送这个请求，只需要抛一个异常即可，并且抛异常的信息就是我们取消的原因
  throwIfRequested(): void {
    if (this.reason) {
      throw this.reason
    }
  }
}
