import axios, { AxiosResponse, AxiosError } from '../src/index'
import { getAjaxRequest } from './helper'

/**
 * 异步测试
 * 1. 第一种是利用 done 参数，每个测试用例函数有一个 done 参数，一旦我们使用了该参数，只有当 done 函数执行的时候表示这个测试用例结束
 * 2. 第二种是我们的测试函数返回一个 Promise 对象，一旦这个 Promise 对象 resolve 了，表示这个测试结束
 */

describe('requests', () => {
  // 每个测试用例运行前的钩子函数
  beforeEach(() => {
    jasmine.Ajax.install() // 安装 jasmine.Ajax
  })

  // 每个测试用例运行后的钩子函数
  afterEach(() => {
    jasmine.Ajax.uninstall() // 卸载 jasmine.Ajax
  })

  // 应该将单个字符串 arg 视为 url
  test('should treat single string arg as url', () => {
    axios('/foo')

    return getAjaxRequest().then(request => {
      expect(request.url).toBe('/foo')
      expect(request.method).toBe('GET')
    })
  })

  // 是否应该将方法值视为小写字符串
  test('should treat method value as lowercase string', done => {
    axios({
      url: '/foo',
      method: 'POST'
    }).then(response => {
      expect(response.config.method).toBe('post')
      done()
    })

    // 执行一个模拟的 200 请求，然后再执行 axios.then 里面的 expect 判断
    return getAjaxRequest().then(request => {
      request.respondWith({ status: 200 })
    })
  })

  // 应 reject 网络错误
  test('should reject on network errors', done => {
    const resolveSpy = jest.fn((res: AxiosResponse) => res)
    const rejectSpy = jest.fn((e: AxiosError) => e)

    // 会导致网络中断，出现 Error: Error: connect ECONNREFUSED 127.0.0.1:80 错误
    jasmine.Ajax.uninstall()

    axios('/foo')
      .then(resolveSpy)
      .catch(rejectSpy)
      .then(next)

    function next(reason: AxiosResponse | AxiosError) {
      expect(resolveSpy).not.toHaveBeenCalled()
      expect(rejectSpy).toHaveBeenCalled()
      expect(reason instanceof Error).toBeTruthy()
      expect((reason as AxiosError).message).toBe('Network Error')
      expect(reason.request).toEqual(expect.any(XMLHttpRequest)) // expect.any(XMLHttpRequest) -> 它表示匹配任意由 XMLHttpRequest 创建的对象实例

      jasmine.Ajax.install()

      done()
    }
  })

  // 当请求超时，需要 reject
  test('should reject when request timeout', done => {
    let err: AxiosError

    axios('/foo', { timeout: 2000, method: 'post' }).catch(error => {
      err = error
    })

    getAjaxRequest().then(request => {
      // 由于 request.responseTimeout 方法内部依赖了 jasmine.clock 方法会导致运行失败
      // 这里我直接用了 request.eventBus.trigger('timeout') 方法触发了 timeout 事件
      // 因为这个方法不在接口定义中，所以需要加 // @ts-ignore

      // @ts-ignore
      request.eventBus.trigger('timeout') // 触发超时

      setTimeout(() => {
        expect(err instanceof Error).toBeTruthy()
        expect(err.message).toBe('Timeout of 2000 ms exceeded')
        done()
      }, 100)
    })
  })

  // 当 validateStatus 返回 false 时应该 reject
  test('should reject when validateStatus returns false', done => {
    const resolveSpy = jest.fn((res: AxiosResponse) => res)
    const rejectSpy = jest.fn((e: AxiosError) => e)

    axios('/foo', {
      validateStatus(status) {
        return status !== 500
      }
    })
      .then(resolveSpy)
      .catch(rejectSpy)
      .then(next)

    return getAjaxRequest().then(request => {
      request.respondWith({ status: 500 })
    })

    function next(reason: AxiosResponse | AxiosError) {
      expect(resolveSpy).not.toHaveBeenCalled()
      expect(rejectSpy).toHaveBeenCalled()
      expect(reason instanceof Error).toBeTruthy()
      expect((reason as AxiosError).message).toBe('Request failed with status code 500')
      expect((reason as AxiosError).response!.status).toBe(500)

      done()
    }
  })

  // 当 validateStatus 返回true 时应该 resolve
  test('should resolve when validateStatus returns true', done => {
    const resolveSpy = jest.fn((res: AxiosResponse) => res)
    const rejectSpy = jest.fn((e: AxiosError) => e)

    axios('/foo', {
      validateStatus(status) {
        return status === 500
      }
    })
      .then(resolveSpy)
      .catch(rejectSpy)
      .then(next)

    return getAjaxRequest().then(request => {
      request.respondWith({ status: 500 })
    })

    function next(res: AxiosResponse | AxiosError) {
      expect(resolveSpy).toHaveBeenCalled()
      expect(rejectSpy).not.toHaveBeenCalled()
      expect(res.config.url).toBe('/foo')

      done()
    }
  })

  // resolved 后应该返回 JSON
  test('should return JSON when resolved', done => {
    let response: AxiosResponse

    axios('/api/account/signup', {
      auth: { username: '', password: '' },
      method: 'post',
      headers: { Accept: 'application/json' }
    }).then(res => {
      response = res
    })

    getAjaxRequest().then(request => {
      request.respondWith({ status: 200, statusText: 'OK', responseText: '{"a": 1}' })

      setTimeout(() => {
        expect(response.data).toEqual({ a: 1 })
        done()
      }, 100)
    })
  })

  // rejecting 应该返回 JSON
  test('should return JSON when rejecting', done => {
    let response: AxiosResponse

    axios('/api/account/signup', {
      auth: { username: '', password: '' },
      method: 'post',
      headers: { Accept: 'application/json' }
    }).catch(error => {
      response = error.response
    })

    getAjaxRequest().then(request => {
      request.respondWith({
        status: 400,
        statusText: 'Bad Request',
        responseText: '{"error": "BAD USERNAME", "code": 1}'
      })

      setTimeout(() => {
        expect(typeof response.data).toBe('object')
        expect(response.data.error).toBe('BAD USERNAME')
        expect(response.data.code).toBe(1)
        done()
      }, 100)
    })
  })

  // 应该提供正确的响应
  test('should supply correct response', done => {
    let response: AxiosResponse

    axios.post('/foo').then(res => {
      response = res
    })

    getAjaxRequest().then(request => {
      request.respondWith({
        status: 200,
        statusText: 'OK',
        responseText: '{"foo": "bar"}',
        responseHeaders: { 'Content-Type': 'application/json' }
      })
    })

    setTimeout(() => {
      expect(response.data.foo).toBe('bar')
      expect(response.status).toBe(200)
      expect(response.statusText).toBe('OK')
      expect(response.headers['content-type']).toBe('application/json')
      done()
    }, 100)
  })

  // 是否应该允许重写内容类型的标题不区分大小写
  test('should allow overriding Content-Type header case-insensitive', () => {
    let response: AxiosResponse

    axios
      .post('/foo', { prop: 'value' }, { headers: { 'content-type': 'application/json' } })
      .then(res => {
        response = res
      })

    return getAjaxRequest().then(request => {
      expect(request.requestHeaders['Content-Type']).toBe('application/json')
    })
  })
})
