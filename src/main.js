import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
import ElementUI, {Message} from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
//导入全局样式表
import './assets/css/global.css'
import axios from "axios";
//配置请求的根路径
axios.defaults.baseURL = 'http://119.23.53.78:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  // console.log(config)
  // 在最后必须 return config
  // 为每一个请求挂载了token
  config.headers.Authorization = sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
Vue.prototype.$message = Message
Vue.use(ElementUI);



Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
