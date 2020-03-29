import { buildURL, isAbsoluteURL, combineURL, isURLSameOrigin } from '../../src/helpers/url'

describe('helpers:url', () => {
  describe('buildURL', () => {
    // 没有参数的情况
    test('should support null params', () => {
      expect(buildURL('/foo')).toBe('/foo')
    })

    // 普通参数传入
    test('should support params', () => {
      expect(buildURL('/foo', { foo: 'bar' })).toBe('/foo?foo=bar')
    })

    // 参数对象中有些参数值是 null 时，不会传入这个参数
    test('should ignore if some param value is null', () => {
      expect(buildURL('/foo', { foo: 'bar', baz: null })).toBe('/foo?foo=bar')
    })

    // 如果参数对象中只有一个数据，且该值是 null，就不传入也不添加问号
    test('should ignore if the only param value is null', () => {
      expect(buildURL('/foo', { baz: null })).toBe('/foo')
    })

    // 属性还是对象的形式
    test('should support object params', () => {
      expect(buildURL('/foo', { foo: { bar: 'baz' } })).toBe(
        '/foo?foo=' + encodeURI('{"bar":"baz"}')
      )
    })

    // 如果是时间类型，需要转换为一个 ISOString 类型
    test('should support date params', () => {
      const date = new Date()
      expect(buildURL('/foo', { date })).toBe('/foo?date=' + date.toISOString())
    })

    // 属性是 array 时的支持
    test('should support array params', () => {
      expect(buildURL('/foo', { foo: ['bar', 'baz'] })).toBe('/foo?foo[]=bar&foo[]=baz')
    })

    // 特殊字符的支持
    test('should support special char params', () => {
      expect(buildURL('/foo', { foo: '@:$, ' })).toBe('/foo?foo=@:$,+')
    })

    // 如果url本来就有参数，不能进行覆盖，而是拼接在参数后面
    test('should support existing params', () => {
      expect(buildURL('/foo?foo=bar', { bar: 'baz' })).toBe('/foo?foo=bar&bar=baz')
    })

    // 连接中有hash的情况需要去除掉
    test('should correct discard url hash mark', () => {
      expect(buildURL('/foo?foo=bar#hash', { query: 'baz' })).toBe('/foo?foo=bar&query=baz')
    })

    // 支持自定义的序列化形式
    test('should use serializer if provided', () => {
      const serializer = jest.fn(() => 'foo=bar') // 使用了 jest.fn 去模拟了一个函数
      const params = { foo: 'bar' }
      expect(buildURL('/foo', params, serializer)).toBe('/foo?foo=bar')
      expect(serializer).toHaveBeenCalled()
      expect(serializer).toHaveBeenCalledWith(params)
    })

    // 支持 URLSearchParams 的参数形式
    test('should support URLSearchParams', () => {
      expect(buildURL('/foo', new URLSearchParams('bar=baz'))).toBe('/foo?bar=baz')
    })
  })

  describe('isAbsoluteURL', () => {
    // 合法字符串的判断
    test('should return true if URL begins with valid scheme name', () => {
      expect(isAbsoluteURL('https://api.github.com/users')).toBeTruthy()
      expect(isAbsoluteURL('custom-scheme-v1.0://example.com/')).toBeTruthy()
      expect(isAbsoluteURL('HTTP://example.com/')).toBeTruthy()
    })

    // 数字开头或者是特殊字符开头的，不是合法字段
    test('should return false if URL begins with invalid scheme name', () => {
      expect(isAbsoluteURL('123://example.com/')).toBeFalsy()
      expect(isAbsoluteURL('!valid://example.com/')).toBeFalsy()
    })

    // 如果是以 // 形式开头的，认为也是合法的
    test('should return true if URL is protocol-relative', () => {
      expect(isAbsoluteURL('//example.com/')).toBeTruthy()
    })

    // 相对路径的判断，并不是绝对路径
    test('should return false if URL is relative', () => {
      expect(isAbsoluteURL('/foo')).toBeFalsy()
      expect(isAbsoluteURL('foo')).toBeFalsy()
    })
  })

  describe('combineURL', () => {
    // 普通的 baseURL 和 relativeURL 进行拼接
    test('should combine URL', () => {
      expect(combineURL('https://api.github.com', '/users')).toBe('https://api.github.com/users')
    })

    // baseURL 后面有斜杠，relativeURL 前面有斜杠的情况，只保留一个斜杠
    test('should remove duplicate slashes', () => {
      expect(combineURL('https://api.github.com/', '/users')).toBe('https://api.github.com/users')
    })

    // baseURL 后面和 relativeURL 前面都没有斜杠，需要增加一个斜线连接
    test('should insert missing slash', () => {
      expect(combineURL('https://api.github.com', 'users')).toBe('https://api.github.com/users')
    })

    // 如果 relativeURL 是空字符串的形式，前面的 baseURL 结尾没有斜杠，那最后也是不带斜杠
    test('should not insert slash when relative url missing/empty', () => {
      expect(combineURL('https://api.github.com/users', '')).toBe('https://api.github.com/users')
    })

    // 如果 relativeURL 就单单是一个斜杠，前面的 baseURL 结尾没有斜杠，那最后也是带斜杠
    test('should allow a single slash for relative url', () => {
      expect(combineURL('https://api.github.com/users', '/')).toBe('https://api.github.com/users/')
    })
  })

  describe('isURLSameOrigin', () => {
    // 和我们当前 origin 做判断
    test('should detect same origin', () => {
      expect(isURLSameOrigin(window.location.href)).toBeTruthy()
    })

    // 传入的不是和我们当前的 origin 一个域的值
    test('should detect different origin', () => {
      expect(isURLSameOrigin('https://github.com/axios/axios')).toBeFalsy()
    })
  })
})
