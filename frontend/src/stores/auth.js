import { defineStore } from 'pinia'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: null,
        initialized: false
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
    },

    actions: {
        async initialize() {
            if (this.token) {
                try {
                    // Check if token is expired
                    const decoded = jwtDecode(this.token)
                    if (decoded.exp * 1000 < Date.now()) {
                        this.logout()
                    } else {
                        // Fetch user details to get 2FA status
                        await this.fetchUser()
                    }
                } catch (e) {
                    this.logout()
                }
            }
            this.initialized = true
        },

        async fetchUser() {
            try {
                const response = await axios.get('/api/users/me')
                this.user = response.data
            } catch (error) {
                console.error('Failed to fetch user', error)
            }
        },

        async login(email, password) {
            try {
                const formData = new FormData()
                formData.append('username', email)
                formData.append('password', password)

                const response = await axios.post('/api/login', formData)

                this.token = response.data.access_token
                localStorage.setItem('token', this.token)

                await this.fetchUser()

                return true
            } catch (error) {
                throw error
            }
        },

        async register(email, password) {
            try {
                await axios.post('/api/register', { email, password })
                return true
            } catch (error) {
                throw error
            }
        },

        logout() {
            this.token = null
            this.user = null
            localStorage.removeItem('token')
            sessionStorage.removeItem('2fa_verified')
        }
    }
})
