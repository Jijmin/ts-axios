const tostring = Object.prototype.toString

/**
 * 是否是时间类型
 * @param val 值
 */
export function isDate(val: any): val is Date {
  // val is Date 约束为Date类型，可以使用 toISOString API
  return tostring.call(val) === '[object Date]'
}

/**
 * 是否是一个非 null 的对象
 * @param val 值
 */
export function isObject(val: any): val is Object {
  return val !== null && typeof val === 'object'
}

/**
 * 判断是否是一个纯 object
 * @param val
 */
export function isPlainObject(val: any): val is Object {
  return tostring.call(val) === '[object Object]'
}

/**
 * 混合，将 from 对象上的属性扩展到 to 对象上，包括原型上的属性
 * @param to
 * @param from
 */
export function extend<T, U>(to: T, from: U): T & U {
  for (const key in from) {
    ;(to as T & U)[key] = from[key] as any
  }
  return to as T & U
}
