import Vue from "vue"

import { parseTime } from "@utils"

Vue.filter("parseTime", function(value) {
  // 返回处理后的值
  if (!value) return ""
  return parseTime(value)
})
