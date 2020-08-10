import axios from "axios"
import Qs from "qs"

import { Message } from "element-ui"
import store from "@/store"

// 请求超时时间
// axios.defaults.timeout = 5 * 60 * 1000

// create an axios instance
const service = axios.create({
  baseURL:
    process.env.NODE_ENV === "production" ? process.env.BASE_API : "/api", // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      // config.headers["X-Token"] = token
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 200) {
      Message({
        message: res.msg || "Error",
        type: "error",
        duration: 2 * 1000
      })
      return Promise.reject(new Error(res.msg || "Error"))
    } else {
      return res
    }
  },
  error => {
    console.log("err" + error) // for debug
    Message({
      message: error,
      type: "error",
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

/**
 * get方法，对应get请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function get(url, params) {
  return new Promise((resolve, reject) => {
    service
      .get(url, {
        params: Object.assign({}, params, { _: +new Date() })
      })
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
      })
  })
}

/**
 * post方法，对应post请求
 * @param {String} url [请求的url地址]。
 * @param {Object} params [请求时携带的参数]
 */
export function post(url, params) {
  return new Promise((resolve, reject) => {
    service
      .post(url, Object.assign({}, params), {
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
      })
  })
}
/**
 * post方法，对应post www-form请求
 * @param {String} url [请求的url地址]。
 * @param {Object} params [请求时携带的参数]
 */
export function postFormData(url, params) {
  return new Promise((resolve, reject) => {
    service
      .post(url, Qs.stringify(Object.assign({}, params, { _: +new Date() })), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err)
      })
  })
}
/**
 * delete方法，对应delete请求
 * @param {String} url [请求的url地址]。
 * @param {Object} params [请求时携带的参数]
 */
export function del(url, params) {
  return new Promise((resolve, reject) => {
    axios
      .delete(
        url,
        {
          params: Object.assign({}, params, { _: +new Date() })
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
      .then(res => {
        resolve(res.data)
      })
      .catch(err => {
        reject(err)
      })
  })
}
/**
 * put方法，对应put请求
 * @param {String} url [请求的url地址]。
 * @param {Object} params [请求时携带的参数]
 */
export function put(url, params) {
  return new Promise((resolve, reject) => {
    axios
      .put(url, Object.assign({}, params, { _: +new Date() }), {
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(res => {
        resolve(res.data)
      })
      .catch(err => {
        reject(err)
      })
  })
}

/**
 * downloadFile 下载文件
 * @param {String} url [文件地址]
 * @param {String} fileName [文件名称]
 * @param {Object} requestConfig [定制配置]
 */
export function downloadFile(url, fileName = "", requestConfig = {}) {
  function downloadURL(url, name) {
    const link = document.createElement("a")
    link.download = name
    link.href = url
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  return axios
    .get(url, requestConfig)
    .then(resp => {
      if (resp.status !== 200) {
        throw new Error("Download fail.")
      } else if (resp.blob) {
        return resp.blob()
      } else {
        return new Blob([resp])
      }
    })
    .then(blob => URL.createObjectURL(blob))
    .then(url => {
      downloadURL(url, fileName)
      URL.revokeObjectURL(url)
    })
}
