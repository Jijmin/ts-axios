import axios from '../src/index'
import mergeConfig from '../src/core/mergeConfig'

describe('mergeConfig', () => {
  const defaults = axios.defaults

  // 第二个参数接受的是 undefined
  test('should accept undefined for second argument', () => {
    expect(mergeConfig(defaults, undefined)).toEqual(defaults)
  })

  // 接受一个对象作为第二个参数
  test('should accept an object for second argument', () => {
    expect(mergeConfig(defaults, {})).toEqual(defaults)
  })

  // 合并后的对象和原有对象进行对比
  test('should not leave references', () => {
    const merged = mergeConfig(defaults, {})
    expect(merged).not.toBe(defaults)
    expect(merged.headers).not.toBe(defaults.headers)
  })

  // 允许设置请求选项
  test('should allow setting request options', () => {
    const config = {
      url: '__sample url__',
      params: '__sample params__',
      data: { foo: true }
    }
    const merged = mergeConfig(defaults, config)
    expect(merged.url).toBe(config.url)
    expect(merged.params).toBe(config.params)
    expect(merged.data).toEqual(config.data)
  })

  // 不应该继承请求选项
  test('should not inherit request options', () => {
    const localDefaults = {
      url: '__sample url__',
      params: '__sample params__',
      data: { foo: true }
    }
    const merged = mergeConfig(localDefaults, {})
    expect(merged.url).toBeUndefined()
    expect(merged.params).toBeUndefined()
    expect(merged.data).toBeUndefined()
  })

  // 如果以未定义的方式传递 config2，应该返回默认的报头
  test('should return default headers if pass config2 with undefined', () => {
    expect(mergeConfig({ headers: 'x-mock-header' }, undefined)).toEqual({
      headers: 'x-mock-header'
    })
  })

  // auth,headers 和 default 合并
  test('should merge auth, headers with defaults', () => {
    expect(
      mergeConfig({ auth: undefined }, { auth: { username: 'foo', password: 'test' } })
    ).toEqual({ auth: { username: 'foo', password: 'test' } })
    expect(
      mergeConfig(
        { auth: { username: 'foo', password: 'test' } },
        { auth: { username: 'baz', password: 'foobar' } }
      )
    ).toEqual({ auth: { username: 'baz', password: 'foobar' } })
  })

  // 用一个非对象值覆盖auth、header
  test('should overwrite auth, headers with a non-object value', () => {
    expect(
      mergeConfig(
        { headers: { common: { Accept: 'application/json, text/plain, */*' } } },
        { headers: null }
      )
    ).toEqual({ headers: null })
  })

  // 允许设置其他选项
  test('should allow setting other options', () => {
    const merged = mergeConfig(defaults, { timeout: 123 })
    expect(merged.timeout).toBe(123)
  })
})
