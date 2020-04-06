import axios, { AxiosResponse, AxiosTransformer } from '../src/index'
import { getAjaxRequest } from './helper'
import { request } from 'http'

describe('transform', () => {
  beforeEach(() => {
    jasmine.Ajax.install()
  })

  afterEach(() => {
    jasmine.Ajax.uninstall()
  })

  // 应该将JSON转换为字符串
  test('should transform JSON to string', () => {
    const data = { foo: 'bar' }

    axios.post('/foo', data)

    return getAjaxRequest().then(request => {
      expect(request.params).toBe('{"foo":"bar"}')
    })
  })

  // 应该将字符串转换为JSON
  test('should transform string to JSON', done => {
    let response: AxiosResponse

    axios('/foo').then(res => {
      response = res
    })

    getAjaxRequest().then(request => {
      request.respondWith({ status: 200, responseText: '{"foo": "bar"}' })

      setTimeout(() => {
        expect(typeof response.data).toBe('object')
        expect(response.data.foo).toBe('bar')
        done()
      }, 100)
    })
  })

  // 应该允许数组转换
  test('should allow an Array of transformers', () => {
    const data = { foo: 'bar' }

    axios.post('/foo', data, {
      transformRequest: (axios.defaults.transformRequest as AxiosTransformer[]).concat(data =>
        data.replace('bar', 'baz')
      )
    })

    return getAjaxRequest().then(request => {
      expect(request.params).toBe('{"foo":"baz"}')
    })
  })

  // 应该允许改变标题
  test('should allowing mutating headers', () => {
    const token = Math.floor(Math.random() * Math.pow(2, 64)).toString(36)

    axios('/foo', {
      transformRequest: (data, headers) => {
        headers['X-Authorization'] = token
        return data
      }
    })

    return getAjaxRequest().then(request => {
      expect(request.requestHeaders['X-Authorization']).toEqual(token)
    })
  })
})
