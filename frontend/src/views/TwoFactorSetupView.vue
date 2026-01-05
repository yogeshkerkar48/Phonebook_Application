<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 px-4">
    <div class="max-w-md w-full space-y-8 card">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
          Setup Two-Factor Authentication
        </h2>
        <p class="mt-2 text-center text-sm text-gray-400">
          Secure your account with 2FA
        </p>
      </div>

      <div class="mt-8 space-y-6">
        <div v-if="loading" class="text-center py-4">
          <div class="loading">Generating...</div>
        </div>

        <div v-else-if="!qrCodeUrl" class="text-center">
          <button @click="startSetup" class="btn btn-primary w-full justify-center">
            Start Setup
          </button>
          <button @click="goBack" class="btn btn-secondary w-full justify-center mt-4">
            Cancel
          </button>
        </div>

        <div v-else class="space-y-6">
          <div class="bg-white p-4 rounded-lg flex justify-center">
            <img :src="qrCodeUrl" alt="2FA QR Code" class="w-48 h-48" />
          </div>
          
          <div class="text-center">
            <p class="text-sm text-gray-400 mb-2">Or enter this secret manually:</p>
            <code class="bg-gray-800 px-2 py-1 rounded text-indigo-400 select-all">{{ secret }}</code>
          </div>

          <div>
            <label for="otp" class="sr-only">Verification Code</label>
            <input
              id="otp"
              v-model="otp"
              type="text"
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-800 text-center tracking-widest text-xl"
              placeholder="000000"
              maxlength="6"
            />
          </div>

          <div class="flex flex-col gap-3">
            <button @click="verifySetup" :disabled="!otp || otp.length !== 6" class="btn btn-primary w-full justify-center">
              Verify & Enable
            </button>
            <button @click="goBack" class="btn btn-secondary w-full justify-center">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import QRCode from 'qrcode'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const loading = ref(false)
const qrCodeUrl = ref(null)
const secret = ref('')
const otp = ref('')

const startSetup = async () => {
  loading.value = true
  try {
    const response = await axios.post('/api/2fa/setup')
    secret.value = response.data.secret
    qrCodeUrl.value = await QRCode.toDataURL(response.data.uri)
  } catch (error) {
    console.error('2FA Setup Error:', error)
    const msg = error.response?.data?.detail || 'Failed to start 2FA setup'
    toast.error(msg)
  } finally {
    loading.value = false
  }
}

const verifySetup = async () => {
  try {
    await axios.post('/api/2fa/verify-setup', { code: otp.value, secret: secret.value })
    toast.success('2FA Enabled Successfully! Please login again.')
    authStore.logout()
    router.push('/login')
  } catch (error) {
    toast.error('Invalid code. Please try again.')
  }
}

const goBack = () => {
  router.push('/')
}
</script>
