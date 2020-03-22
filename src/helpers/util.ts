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
