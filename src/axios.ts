import { AxiosInstance, AxiosRequestConfig } from './types'
import Axios from './core/Axios'
import { extend } from './helpers/util'
import defaults from './defaults'

/**
 * 工厂函数创建 axios 实例
 */
function createInstance(config: AxiosRequestConfig): AxiosInstance {
  const context = new Axios(config)
  const instance = Axios.prototype.request.bind(context)

  // 通过 extend 方法把 context 中的原型方法和实例方法全部拷贝到 instance 上，这样就实现了一个混合对象
  // instance 本身是一个函数，又拥有了 Axios 类的所有原型和实例属性
  extend(instance, context)

  return instance as AxiosInstance
}

const axios = createInstance(defaults)
export default axios
