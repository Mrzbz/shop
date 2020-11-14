import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../components/Login.vue";
import Home from "../components/Home";
Vue.use(VueRouter);

const routes = [
  // 重定向
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/home",
    component: Home,
  },
];

const router = new VueRouter({
  mode: "hash",
  base: process.env.BASE_URL,
  routes,
});

// 挂载路由守卫

router.beforeEach((to, from, next) => {
  if (to.path === "/login") return next();
  let sessionStr = window.sessionStorage.getItem("token");
  if (sessionStr) {
    return next();
  } else {
    return next("/login");
  }
});

export default router;
