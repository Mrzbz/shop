import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";

// 导入全局样式表

import "./assets/css/global.css";

// 导入font文件
import "./assets/fonts/iconfont.css";

axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
// 请求拦截器
axios.interceptors.request.use((config) => {
  // 为请求头对象添加token验证的Authorization
  config.headers.Authorization = window.sessionStorage.getItem("token");
  // console.log(config);
  return config;
});

Vue.prototype.$http = axios;

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
