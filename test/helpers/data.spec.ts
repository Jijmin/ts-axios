import { transformRequest, transformResponse } from '../../src/helpers/data'

describe('helpers:data', () => {
  describe('transformRequest', () => {
    // 如果数据是普通对象，则应将请求数据转换为字符串
    test('should transform request data to string if data is a PlainObject', () => {
      const a = { a: 1 }
      expect(transformRequest(a)).toBe('{"a":1}')
    })

    // 如果不是一个普通对象，就什么都不用做
    test('should do nothing if data is not a PlainObject', () => {
      const a = new URLSearchParams('a=b')
      expect(transformRequest(a)).toBe(a)
    })
  })

  describe('transformResponse', () => {
    // JSON string 转换成 Object 形式
    test('should transform response data to Object if data is a JSON string', () => {
      const a = '{"a": 2}'
      expect(transformResponse(a)).toEqual({ a: 2 })
    })

    // 如果不是一个 JSON string，普通字符串，不做处理，保留原样
    test('should do nothing if data is a string but not a JSON string', () => {
      const a = '{a: 2}'
      expect(transformResponse(a)).toBe('{a: 2}')
    })

    // 如果不为 JSON string，就已经是对象，不做处理
    test('should do nothing if data is not a string', () => {
      const a = { a: 2 }
      expect(transformResponse(a)).toBe(a)
    })
  })
})
