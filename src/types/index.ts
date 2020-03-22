/**
 * method 只能传入下面合法的字符串
 */
export type Method =
  | 'get'
  | 'GET'
  | 'delete'
  | 'Delete'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'

/**
 * url 为请求的地址，必选属性
 * method 是请求的 HTTP 方法，可选属性
 * data 是 post、patch 等类型请求的数据，放到 request body 中的，可选属性
 * params 是 get、head 等类型请求的数据，拼接到 url 的 query string 中的，可选属性
 */
export interface AxiosRequestConfig {
  url: string
  method?: Method
  data?: any
  params?: any
  headers?: any
}
