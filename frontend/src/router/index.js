import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import TwoFactorVerify from '../views/TwoFactorVerify.vue'
import TwoFactorSetupView from '../views/TwoFactorSetupView.vue'
import AddContactView from '../views/AddContactView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: Login,
            meta: { guest: true }
        },
        {
            path: '/register',
            name: 'register',
            component: Register,
            meta: { guest: true }
        },
        {
            path: '/2fa-verify',
            name: '2fa-verify',
            component: TwoFactorVerify,
            meta: { requiresAuth: true }
        },
        {
            path: '/2fa-setup',
            name: '2fa-setup',
            component: TwoFactorSetupView,
            meta: { requiresAuth: true }
        },
        {
            path: '/add-contact',
            name: 'add-contact',
            component: AddContactView,
            meta: { requiresAuth: true, requires2FA: true }
        },
        {
            path: '/edit-contact/:id',
            name: 'edit-contact',
            component: () => import('../views/EditContactView.vue'),
            meta: { requiresAuth: true, requires2FA: true }
        },
        {
            path: '/',
            name: 'dashboard',
            component: Dashboard,
            meta: { requiresAuth: true, requires2FA: true }
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/'
        }
    ]
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // Initialize auth state from local storage if needed
    if (!authStore.initialized) {
        await authStore.initialize()
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next({ name: 'login' })
    } else if (to.meta.guest && authStore.isAuthenticated) {
        next({ name: 'dashboard' })
    } else if (to.meta.requires2FA) {
        // Check if user has 2FA enabled
        if (authStore.user?.is_2fa_enabled) {
            // Check if 2FA is verified for this session
            if (!sessionStorage.getItem('2fa_verified')) {
                next({ name: '2fa-verify' })
                return
            }
        }
        next()
    } else {
        next()
    }
})

export default router
