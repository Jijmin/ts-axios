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
 * 判断是否是一个普通对象
 * @param val
 */
export function isPlainObject(val: any): val is Object {
  return tostring.call(val) === '[object Object]'
}

/**
 * 判断是否是表单提交数据
 * @param val 值
 */
export function isFormData(val: any): boolean {
  return typeof val !== 'undefined' && val instanceof FormData
}

/**
 * 判断是否是一个 URLSearchParams 类型
 * @param val 值
 */
export function isURLSearchParams(val: any): val is URLSearchParams {
  return typeof val !== 'undefined' && val instanceof URLSearchParams
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

/**
 * 深拷贝
 * @param objs 对象数组
 */
export function deepMerge(...objs: any[]): any {
  const result = Object.create(null)

  objs.forEach(obj => {
    if (obj) {
      Object.keys(obj).forEach(key => {
        const val = obj[key]
        if (isPlainObject(val)) {
          result[key] = isPlainObject(result[key])
            ? deepMerge(result[key], val)
            : deepMerge({}, val)
        } else {
          result[key] = val
        }
      })
    }
  })

  return result
}
