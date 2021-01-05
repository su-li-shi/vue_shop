import Vue from 'vue'
import Router from 'vue-router'
import Login from "@/components/Login";
import Home from "@/components/Home";
import Welcome from "@/components/Welcome";
import Users from "@/components/user/Users";

Vue.use(Router)

const router = new Router({
    routes: [
        {
            path: '/',
            redirect: '/login'
        },
        {
            path: '/login',
            component: Login
        },
        {
            path: '/home',
            component: Home,
            redirect: '/Welcome',
            children: [
                {
                    path: '/Welcome',
                    component: Welcome
                },
                {
                    path: '/users',
                    component: Users
                }
            ]
        }
    ]
})
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    // to 将要访问的路径
    // from 代表从哪个路径跳转而来
    // next 是一个函数，代表放行
    // next（） 放行   next（‘/login’） 强制跳转
    if(to.path === '/login')
        return next();
    // 获取token
    const tokenStr = sessionStorage.getItem('token');
    if(!tokenStr)
        return next('login');
    next();
});
export default router