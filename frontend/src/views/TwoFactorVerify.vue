<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="max-w-md w-full space-y-8 card">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
          Two-Factor Authentication
        </h2>
        <p class="mt-2 text-center text-sm text-gray-300">
          Please enter the code from your authenticator app.
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleVerify">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="code" class="sr-only">Verification Code</label>
            <input id="code" name="code" type="text" required
              v-model="code"
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-800 text-center tracking-widest text-2xl"
              placeholder="000000"
              maxlength="6"
              pattern="[0-9]*"
            >
          </div>
        </div>

        <div>
          <button type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
            {{ loading ? 'Verifying...' : 'Verify' }}
          </button>
        </div>
        
        <div class="text-center">
          <button @click="handleLogout" type="button" class="font-medium text-indigo-400 hover:text-indigo-300">
            Back to Login
          </button>
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
import axios from 'axios'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const code = ref('')
const loading = ref(false)

const handleVerify = async () => {
  loading.value = true
  try {
    // In a real app with forced 2FA, we would verify the temporary token here.
    // Since we are doing client-side check for this demo:
    // We assume the user is already "logged in" with a token but needs to verify 2FA to proceed.
    // We can call a verify endpoint or just check the code.
    
    // For this implementation, we will verify the code against the current user's secret.
    // We need an endpoint for this.
    await axios.post('/api/2fa/verify-login', { code: code.value })
    
    // If successful, we consider the 2FA session valid.
    // We can store a flag in sessionStorage or similar.
    sessionStorage.setItem('2fa_verified', 'true')
    
    toast.success('Verification successful!')
    router.push('/')
  } catch (error) {
    toast.error('Invalid code. Please try again.')
  } finally {
    loading.value = false
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
