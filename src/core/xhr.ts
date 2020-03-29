import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'
import { isURLSameOrigin } from '../helpers/url'
import cookie from '../helpers/cookie'
import { isFormData } from '../helpers/util'

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
      headers = {}, // 在拦截器对请求配置做了修改，导致 headers 为空，会报错
      responseType,
      timeout,
      cancelToken,
      withCredentials,
      xsrfCookieName,
      xsrfHeaderName,
      onDownloadProgress,
      onUploadProgress,
      auth,
      validateStatus
    } = config

    const request = new XMLHttpRequest() // 创建一个 request 实例

    request.open(method.toUpperCase(), url!, true) // 执行 request.open 方法初始化

    configureRequest() // 执行 configureRequest 配置 request 对象

    addEvents() // 执行 addEvents 给 request 添加事件处理函数

    processHeaders() // 执行 processHeaders 处理请求 headers

    processCancel() // 执行 processCancel 处理请求取消逻辑

    request.send(data) // 执行 request.send 方法发送请

    /**
     * 请求配置参数设置
     */
    function configureRequest(): void {
      if (responseType) {
        request.responseType = responseType
      }

      if (timeout) {
        request.timeout = timeout
      }

      if (withCredentials) {
        request.withCredentials = true
      }
    }

    /**
     * 事件函数
     */
    function addEvents(): void {
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

      // 下载进度
      if (onDownloadProgress) {
        request.onprogress = onDownloadProgress
      }

      // 上传进度
      if (onUploadProgress) {
        request.upload.onprogress = onUploadProgress
      }
    }

    /**
     * 处理 headers
     */
    function processHeaders(): void {
      if (auth) {
        headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password)
      }

      // 如果请求的数据是 FormData 类型，我们应该主动删除请求 headers 中的 Content-Type 字段，让浏览器自动根据请求数据设置 Content-Type
      if (isFormData(data)) {
        delete headers['Content-Type']
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
    }

    /**
     * 取消的处理
     */
    function processCancel(): void {
      if (cancelToken) {
        cancelToken.promise.then(reason => {
          request.abort() // xhr 对象提供了 abort 方法，可以把请求取消
          reject(reason) // 将错误 reject 出去
        })
      }
    }

    /**
     * 处理非 200 状态码
     * @param response 响应对象
     */
    function handleResponse(response: AxiosResponse) {
      // 如果没有配置 validateStatus 以及 validateStatus 函数返回的值为 true 的时候，都认为是合法的，正常 resolve(response)，否则都创建一个错误
      if (!validateStatus || validateStatus(response.status)) {
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
