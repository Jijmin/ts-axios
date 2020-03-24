import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'
import { isURLSameOrigin } from '../helpers/url'
import cookie from '../helpers/cookie'

/**
 * 实际发送请求
 * @param config 配置
 */
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      data = null,
      url,
      method = 'get',
      headers,
      responseType,
      timeout,
      cancelToken,
      withCredentials,
      xsrfCookieName,
      xsrfHeaderName
    } = config

    const request = new XMLHttpRequest()

    if (responseType) {
      request.responseType = responseType
    }

    if (timeout) {
      request.timeout = timeout
    }

    if (withCredentials) {
      request.withCredentials = true
    }

    request.open(method.toUpperCase(), url!, true)

    request.onreadystatechange = function handleLoad() {
      if (request.readyState !== 4) {
        return
      }

      // 当出现网络错误或者超时错误的时候，该值都为 0
      if (request.status === 0) {
        return
      }

      const responseHeaders = parseHeaders(request.getAllResponseHeaders())
      const responseData =
        responseType && responseType !== 'text' ? request.response : request.responseText
      const response: AxiosResponse = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      }
      handleResponse(response)
    }

    // 处理网络异常错误
    request.onerror = function handleError() {
      reject(createError('Network Error', config, null, request))
    }

    // 处理超时错误
    request.ontimeout = function handleTimeout() {
      reject(createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', request))
    }

    // 首先判断如果是配置 withCredentials 为 true 或者是同域请求，我们才会请求 headers 添加 xsrf 相关的字段
    if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
      // 如果判断成功，尝试从 cookie 中读取 xsrf 的 token 值
      const xsrfValue = cookie.read(xsrfCookieName)
      if (xsrfValue && xsrfHeaderName) {
        // 如果能读到，则把它添加到请求 headers 的 xsrf 相关字段中
        headers[xsrfHeaderName] = xsrfValue
      }
    }

    Object.keys(headers).forEach(name => {
      if (data === null && name.toLowerCase() === 'content-type') {
        delete headers[name]
      } else {
        request.setRequestHeader(name, headers[name])
      }
    })

    if (cancelToken) {
      cancelToken.promise.then(reason => {
        request.abort() // xhr 对象提供了 abort 方法，可以把请求取消
        reject(reason) // 将错误 reject 出去
      })
    }

    request.send(data)

    // 处理非 200 状态码
    function handleResponse(response: AxiosResponse) {
      if (response.status >= 200 && response.status < 300) {
        resolve(response)
      } else {
        reject(
          createError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        )
      }
    }
  })
}
