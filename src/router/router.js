import Vue from 'vue'
import Router from 'vue-router'
import Login from "@/components/Login";
import Home from "@/components/Home";
import Welcome from "@/components/Welcome";
import Users from "@/components/user/Users";
import Rights from "@/components/power/Rights";
import Roles from "@/components/power/Roles";
import Cate from "@/components/goods/Cate";
import Params from "@/components/goods/Params";
import GoodsList from "@/components/goods/List";
import Add from "@/components/goods/Add";
import Order from "@/components/order/Order";
import Report from "@/components/report/report";
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
            redirect: '/welcome',
            children: [
                {
                    path: '/welcome',
                    component: Welcome
                },
                {
                    path: '/users',
                    component: Users
                },
                {
                    path: '/rights',
                    component: Rights
                },
                {
                    path: '/roles',
                    component: Roles
                },
                {
                    path: '/categories',
                    component: Cate
                },
                {
                    path: '/params',
                    component: Params
                },
                {
                    path: '/goods',
                    component: GoodsList
                },
                {
                    path: '/goods/add',
                    component: Add
                },
                {
                    path: '/orders',
                    component: Order
                },
                {
                    path: '/reports',
                    component: Report
                }
            ]
        }
    ]
})
// ????????????????????????
router.beforeEach((to, from, next) => {
    // to ?????????????????????
    // from ?????????????????????????????????
    // next ??????????????????????????????
    // next?????? ??????   next??????/login?????? ????????????
    if(to.path === '/login')
        return next();
    // ??????token
    const tokenStr = sessionStorage.getItem('token');
    if(!tokenStr)
        return next('login');
    next();
});
export default router