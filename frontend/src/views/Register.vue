<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 px-4">
    <div class="max-w-md w-full space-y-8 card">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
          Create your account
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm -space-y-px">
          <div class="form-group">
            <label for="email-address" class="sr-only">Email address</label>
            <input id="email-address" name="email" type="email" autocomplete="email" required
              v-model="email"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-800"
              placeholder="Email address">
          </div>
          <div class="form-group">
            <label for="password" class="sr-only">Password</label>
            <input id="password" name="password" type="password" autocomplete="new-password" required
              v-model="password"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-800"
              placeholder="Password">
            <p class="mt-1 text-xs text-gray-400">Password must be at least 8 characters</p>
          </div>
        </div>


        <div>
          <button type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <!-- User Add Icon -->
              <svg class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            </span>
            {{ loading ? 'Registering...' : 'Register' }}
          </button>
        </div>

        <div class="text-center">
          <router-link to="/login" class="font-medium text-indigo-400 hover:text-indigo-300">
            Already have an account? Sign in
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleRegister = async () => {
  // Validate password length
  if (password.value.length < 8) {
    toast.error('Password should be of 8 or more characters')
    return
  }
  
  loading.value = true
  try {
    await authStore.register(email.value, password.value)
    toast.success('Registration successful! Please login.')
    router.push('/login')
  } catch (error) {
    // Handle validation errors from backend
    const errorDetail = error.response?.data?.detail
    if (Array.isArray(errorDetail)) {
      // Pydantic validation errors
      const passwordError = errorDetail.find(err => err.loc?.includes('password'))
      if (passwordError) {
        toast.error(passwordError.msg || 'Password should be of 8 or more characters')
      } else {
        toast.error(errorDetail[0].msg || 'Registration failed')
      }
    } else {
      toast.error(errorDetail || 'Registration failed')
    }
  } finally {
    loading.value = false
  }
}
</script>
