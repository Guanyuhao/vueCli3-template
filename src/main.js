import Vue from "vue"
import App from "./App.vue"
import router from "./router"
import store from "./store"
import "@/icons" // icon
import "@/utils/filter.js" // icon

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app")
