import axios from '../../src/index'

// 参数值为数组 -> /base/get?foo[]=bar&foo[]=baz'
axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: ['bar', 'baz']
  }
})

// 参数值为对象 -> /base/get?foo=%7B%22bar%22:%22baz%22%7D
axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: {
      bar: 'baz'
    }
  }
})

const date = new Date()
// 参数值为 Date 类型 -> /base/get?date=2019-04-01T05:55:39.030Z
axios({
  method: 'get',
  url: '/base/get',
  params: {
    date
  }
})

// 特殊字符支持 -> /base/get?foo=@:$+
axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: '@:$, '
  }
})

// 空值忽略 -> /base/get?foo=bar
axios({
  method: 'get',
  url: '/base/get',
  params: {
    foo: 'bar',
    baz: null
  }
})

// 丢弃 url 中的哈希标记 -> /base/get?foo=bar
axios({
  method: 'get',
  url: '/base/get#hash',
  params: {
    foo: 'bar'
  }
})

// 保留 url 中已存在的参数 -> /base/get?foo=bar&bar=baz
axios({
  method: 'get',
  url: '/base/get?foo=bar',
  params: {
    bar: 'baz'
  }
})
