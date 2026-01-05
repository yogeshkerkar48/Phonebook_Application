<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="$emit('close')"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-white" id="modal-title">
                Setup Two-Factor Authentication
              </h3>
              <div class="mt-2">
                <div v-if="!qrCodeUrl" class="text-center py-4">
                  <button @click="startSetup" :disabled="loading" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                    {{ loading ? 'Generating...' : 'Start Setup' }}
                  </button>
                </div>
                
                <div v-else class="space-y-4">
                  <p class="text-sm text-gray-300">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                  <div class="flex justify-center bg-white p-4 rounded">
                     <!-- QR Code Image Placeholder - In real app, render QR code here -->
                     <img :src="qrCodeUrl" alt="2FA QR Code" class="w-48 h-48" />
                  </div>
                  
                  <div>
                    <label for="otp" class="block text-sm font-medium text-gray-300">Enter Verification Code</label>
                    <input type="text" v-model="otp" id="otp" class="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="000000">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button v-if="qrCodeUrl" @click="verifySetup" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
            Verify & Enable
          </button>
          <button @click="$emit('close')" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import QRCode from 'qrcode'

const emit = defineEmits(['close'])
const toast = useToast()

const loading = ref(false)
const qrCodeUrl = ref(null)
const otp = ref('')
const secret = ref('')

const startSetup = async () => {
  loading.value = true
  try {
    const response = await axios.post('/api/2fa/setup')
    secret.value = response.data.secret
    // Generate QR code from URI
    qrCodeUrl.value = await QRCode.toDataURL(response.data.uri)
  } catch (error) {
    toast.error('Failed to start 2FA setup')
  } finally {
    loading.value = false
  }
}

const verifySetup = async () => {
  try {
    await axios.post('/api/2fa/verify-setup', { code: otp.value, secret: secret.value })
    toast.success('2FA Enabled Successfully!')
    emit('close')
  } catch (error) {
    toast.error('Invalid code. Please try again.')
  }
}
</script>
