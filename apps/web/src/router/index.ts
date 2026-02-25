import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'landing',
        component: () => import('@/views/LandingPage.vue'),
    },
    {
        path: '/admin/login',
        name: 'admin-login',
        component: () => import('@/views/AdminLogin.vue'),
        // Redirect authenticated users away from login page
        beforeEnter: (_to, _from, next) => {
            const auth = useAuthStore()
            if (auth.isAuthenticated) {
                next({ name: 'admin-dashboard' })
            } else {
                next()
            }
        },
    },
    {
        path: '/admin',
        name: 'admin-dashboard',
        component: () => import('@/views/AdminDashboard.vue'),
        meta: { requiresAuth: true },
    },
    {
        // Catch-all → redirect to landing
        path: '/:pathMatch(.*)*',
        redirect: '/',
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Global navigation guard: protect routes that require authentication
router.beforeEach((to, _from, next) => {
    const auth = useAuthStore()
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        next({ name: 'admin-login', query: { redirect: to.fullPath } })
    } else {
        next()
    }
})

export default router
