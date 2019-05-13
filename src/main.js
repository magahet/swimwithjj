import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import App from './App'
import router from './routes'
import { store } from './store'

Vue.use(BootstrapVue)
Vue.config.productionTip = false
Vue.config.devtools = process.env.CONTEXT !== 'production'
//Vue.config.devtools = true

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
