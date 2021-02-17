import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
import ElementUI, {Message} from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
//导入全局样式表
import './assets/css/global.css'
import axios from "axios";
import treeTable from 'vue-table-with-tree-grid'
//配置请求的根路径
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
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

Vue.component('tree-table',treeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
