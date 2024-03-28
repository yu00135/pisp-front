import {createRouter, createWebHistory} from 'vue-router'
import {ElMessage} from "element-plus";

const router = createRouter({
    history: createWebHistory(), // hash模式：createWebHashHistory，history模式：createWebHistory
    base: "/dist/",
    routes: [
        {
            path: '/',
            redirect: '/login',
        },
        {
            path: '/:catchAll(.*)',
            name: '/404',
            component: () => import('../views/404')
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/Login.vue')
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('../views/Register.vue')
        },
        {
            path: '/password',
            name: 'password',
            component: () => import('../views/Password.vue')
        },
        {
            path: '/index',
            name: 'index',
            meta: {
                title: "首页",
                requireAuth: true
            },
            component: () => import('../views/Index.vue')
        },
        {
            path: '/info',
            name: 'info',
            meta: {
                title: "个人信息",
                requireAuth: true
            },
            component: () => import('../views/Info')
        },
        {
            path: '/site',
            name: 'site',
            meta: {
                title: "网站",
                requireAuth: true
            },
            component: () => import('../views/Site')
        },
        {
            path: '/contact',
            name: 'contact',
            meta: {
                title: "联系人",
                requireAuth: true
            },
            component: () => import('../views/Contact')
        },
        {
            path: '/card',
            name: 'card',
            meta: {
                title: "卡包",
                requireAuth: true
            },
            component: () => import('../views/Card')
        },
        {
            path: '/note',
            name: 'note',
            meta: {
                title: "笔记",
                requireAuth: true
            },
            component: () => import('../views/Note'),
        },
        {
            path: '/note/info/:id',
            name: 'noteInfo',
            component: () => import('../views/NoteInfo')
        },
        {
            path: '/diary',
            name: 'diary',
            meta: {
                title: "笔记",
                requireAuth: true
            },
            component: () => import('../views/Diary')
        },
        {
            path: '/write',
            name: 'write',
            meta: {
                title: "写笔记",
                requireAuth: true
            },
            component: () => import('../views/Write')
        },
        {
            path: '/file/:id',
            name: 'file',
            meta: {
                title: "文件",
                requireAuth: true
            },
            component: () => import('../views/File')
        },
    ]
})
router.beforeEach((to, from, next) => {
    const user = sessionStorage.getItem("user");
    if (to.meta.requireAuth) { // 判断该路由是否需要登录权限
        if (user) { // 判断本地是否存在token
            next()
        } else {
            ElMessage({
                message: "请先登录!",
                type: "error",
                showClose: true,
            });
            // 未登录,跳转到登陆页面
            next({
                path: '/login'
            })
        }
    } else {
        next();
    }
})
export default router
