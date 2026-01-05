<template>
  <div class="min-h-screen bg-gray-900">
    <nav class="bg-gray-800 shadow-lg border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-white cursor-pointer" @click="router.push('/')">📞 Phonebook</h1>
          </div>
          <div class="flex items-center">
            <button @click="router.push('/')" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-4 sm:px-0">
        <div class="bg-gray-800 shadow rounded-lg p-6">
          <h2 class="text-2xl font-bold text-white mb-6">Edit Contact</h2>
          <div v-if="loading" class="text-center py-4 text-white">Loading...</div>
          <ContactForm 
            v-else
            :editing-contact="contact"
            @submit="handleFormSubmit"
            @cancel="router.push('/')"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import axios from 'axios'
import ContactForm from '../components/ContactForm.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const contact = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await axios.get(`/api/contacts/${route.params.id}`)
    contact.value = response.data
  } catch (error) {
    toast.error('Failed to load contact')
    router.push('/')
  } finally {
    loading.value = false
  }
})

const handleFormSubmit = async (contactData) => {
  try {
    await axios.put(`/api/contacts/${route.params.id}`, contactData)
    toast.success('Contact updated successfully')
    router.push('/')
  } catch (error) {
    console.error('Contact update error:', error.response?.data)
    const errorDetail = error.response?.data?.detail
    
    if (Array.isArray(errorDetail)) {
      // Pydantic validation errors - show the first error message
      const firstError = errorDetail[0]
      const errorMsg = firstError.msg || 'Validation failed'
      toast.error(errorMsg)
    } else if (typeof errorDetail === 'string') {
      // String error message (e.g., duplicate phone)
      toast.error(errorDetail)
    } else {
      // Generic error
      toast.error('Failed to update contact')
    }
  }
}
</script>
