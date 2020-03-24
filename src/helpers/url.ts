import { isDate, isPlainObject } from './util'

/**
 * 编码特殊处理
 * @param val 值
 */
function encode(val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

/**
 * 格式化 url 以及各种类型的 params
 * @param url 请求地址
 * @param params 参数
 */
export function buildURL(url: string, params: any) {
  if (!params) {
    return url
  }

  const parts: string[] = []

  Object.keys(params).forEach(key => {
    let val = params[key]
    if (val === null || typeof val === 'undefined') {
      return
    }

    let values: string[]
    if (Array.isArray(val)) {
      values = val
      key += '[]'
    } else {
      values = [val]
    }
    values.forEach(val => {
      if (isDate(val)) {
        val = val.toISOString()
      } else if (isPlainObject(val)) {
        val = JSON.stringify(val)
      }
      parts.push(`${encode(key)}=${encode(val)}`)
    })
  })

  let serializedParams = parts.join('&')

  if (serializedParams) {
    const markIndex = url.indexOf('#')
    if (markIndex !== -1) {
      url = url.slice(0, markIndex)
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  }

  return url
}

interface URLOrigin {
  protocol: string
  host: string
}

/**
 * 判断同源
 * @param requestURL 请求url
 */
export function isURLSameOrigin(requestURL: string): boolean {
  const parsedOrigin = resolveURL(requestURL)
  return (
    parsedOrigin.protocol === currentOrigin.protocol && parsedOrigin.host === currentOrigin.host
  )
}

// 同域名的判断主要利用了一个技巧，创建一个 a 标签的 DOM，然后设置 href 属性为我们传入的 url，然后可以获取该 DOM 的 protocol、host
const urlParsingNode = document.createElement('a')
const currentOrigin = resolveURL(window.location.href)
/**
 * 解析 url 的 protocol 和 host
 * @param url
 */
function resolveURL(url: string): URLOrigin {
  urlParsingNode.setAttribute('href', url)
  const { protocol, host } = urlParsingNode
  return { protocol, host }
}
