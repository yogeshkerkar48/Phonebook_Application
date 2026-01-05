import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import axios from 'axios'
import './style.css'
import App from './App.vue'
import router from './router'

// Configure Axios
// Configure Axios
// axios.defaults.baseURL = 'http://localhost:8081' // Removed to allow relative paths via Vite proxy
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Toast)

app.mount('#app')
