import cookie from '../../src/helpers/cookie'

describe('helpers:cookie', () => {
  // cookie 可读
  test('should read cookies', () => {
    document.cookie = 'foo=baz'
    expect(cookie.read('foo')).toBe('baz')
  })

  // 不存在的cookie name是一个null
  test('should return null if cookie name is not exist', () => {
    document.cookie = 'foo=baz'
    expect(cookie.read('bar')).toBeNull()
  })
})
