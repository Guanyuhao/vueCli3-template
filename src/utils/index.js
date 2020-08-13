/**
 * @param {string} path
 * @returns {Boolean}
 */

export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * 数组扁平化
 * @param {Array} path
 * @returns {Array}
 */

export function flatten(arr) {
  return arr.reduce((result, item) => {
    return result.concat(Array.isArray(item) ? flatten(item) : item)
  }, [])
}

/**
 * @param {}
 * @returns {String}
 */
export function guid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return (
    S4() +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  )
}

export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || "{y}-{m}-{d} {h}:{i}:{s}"
  let date
  if (typeof time === "object") {
    date = time
  } else {
    if (typeof time === "string" && /^[0-9]+$/.test(time)) {
      time = parseInt(time)
    }
    if (typeof time === "number" && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === "a") {
      return ["日", "一", "二", "三", "四", "五", "六"][value]
    }
    return value.toString().padStart(2, "0")
  })
  return time_str
}

export function throttle(fn, duration) {
  let timer, last
  return function() {
    let args = arguments
    let context = this
    let now = +new Date()
    let remaining = last ? last + duration - now : 0
    if (remaining > 0) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        last = +new Date()
        fn.apply(context, args)
        timer = null
      }, remaining)
    } else {
      last = +new Date()
      fn.apply(context, args)
    }
  }
}
export function debounce(fn, duration) {
  let timer
  return function() {
    let args = arguments
    let context = this
    clearTimeout(timer)
    timer = null
    timer = setTimeout(function() {
      fn.apply(context, args)
    }, duration)
  }
}
