<template>
  <div class="min-h-screen bg-gray-900">
    <nav class="bg-gray-800 shadow-lg border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-white">📞 Phonebook</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-gray-300 hidden sm:block">Welcome, {{ authStore.user?.email?.split('@')[0] }}! 👋</span>
            
            <button 
              @click="router.push('/add-contact')"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Contact
            </button>

            <button 
              v-if="!authStore.user?.is_2fa_enabled"
              @click="router.push('/2fa-setup')"
              class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Enable 2FA
            </button>

            <button @click="handleLogout" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Search Section -->
      <div class="px-4 py-4 sm:px-0 mb-8">
        <div class="max-w-2xl mx-auto relative">
          <div class="flex gap-2">
            <div class="relative flex-grow">
              <input 
                type="text" 
                v-model="searchQuery" 
                @input="handleSearchInput"
                @keyup.enter="performSearch"
                placeholder="Search contacts..." 
                class="w-full bg-gray-800 text-white rounded-lg pl-4 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700 shadow-sm"
                autocomplete="off"
              >
              <!-- Auto-suggestions Dropdown -->
              <div v-if="suggestions.length > 0" class="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-lg mt-1 shadow-xl max-h-60 overflow-y-auto">
                <ul>
                  <li 
                    v-for="contact in suggestions" 
                    :key="contact.id"
                    @click="selectSuggestion(contact)"
                    class="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white flex justify-between items-center"
                  >
                    <span>{{ contact.name }}</span>
                    <span class="text-xs text-gray-400">{{ contact.phone }}</span>
                  </li>
                </ul>
              </div>
            </div>
            <button 
              @click="performSearch"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <!-- Contact List -->
      <div class="px-4 sm:px-0">
        <ContactList 
          :contacts="displayedContacts"
          :loading="loading"
          :pagination="{ currentPage, totalPages, totalContacts, pageSize }"
          @edit="handleEdit"
          @delete="deleteContact"
          @view="viewContact"
          @page-change="handlePageChange"
        />
      </div>
    </main>

    <!-- Contact Detail Modal -->
    <ContactDetail 
      v-if="viewingContact"
      :contact="viewingContact"
      @close="closeDetail"
      @edit="handleEdit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import axios from 'axios'
import ContactList from '../components/ContactList.vue'
import ContactDetail from '../components/ContactDetail.vue'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const currentPage = ref(1)
const totalPages = ref(1)
const totalContacts = ref(0)
const pageSize = ref(20)

const contacts = ref([])
const loading = ref(false)
const searchQuery = ref('')
const suggestions = ref([])
const isSearching = ref(false)
const searchResults = ref([])
const viewingContact = ref(null)

const displayedContacts = computed(() => {
  return isSearching.value ? searchResults.value : contacts.value
})

const fetchContacts = async (page = 1) => {
  loading.value = true
  console.log('Fetching contacts page:', page)
  
  // Safety timeout
  const timeoutId = setTimeout(() => {
    if (loading.value) {
      console.warn('Fetch timed out')
      loading.value = false
      toast.error('Request timed out - check backend connection')
    }
  }, 5000)

  try {
    const response = await axios.get('/api/contacts/', {
      params: { page, page_size: pageSize.value }
    })
    
    clearTimeout(timeoutId)
    console.log('Contacts loaded:', response.data)
    
    const responseData = response.data
    
    if (Array.isArray(responseData)) {
      // Handle legacy/flat list response
      contacts.value = responseData
      totalContacts.value = responseData.length
      totalPages.value = 1
      currentPage.value = 1
    } else if (responseData && responseData.data) {
      // Handle paginated response
      contacts.value = responseData.data || []
      currentPage.value = responseData.page || 1
      totalPages.value = responseData.total_pages || 1
      totalContacts.value = responseData.total || 0
    } else {
      // Fallback
      contacts.value = []
      console.warn('Unexpected response structure', responseData)
    }
    
    if (contacts.value.length === 0) {
      toast.info('No contacts found')
    }
  } catch (error) {
    clearTimeout(timeoutId)
    console.error('Fetch error:', error)
    // Only show toast if it's not a cancelled request or harmless error
    toast.error(`Failed to load contacts: ${error.message || 'Unknown error'}`)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (newPage) => {
  fetchContacts(newPage)
}

const handleSearchInput = async () => {
  if (!searchQuery.value) {
    suggestions.value = []
    isSearching.value = false
    return
  }
  
  // Simple local filtering for suggestions for better performance
  // Or call API if dataset is large
  const query = searchQuery.value.toLowerCase()
  suggestions.value = contacts.value.filter(c => 
    c.name.toLowerCase().includes(query) || 
    c.phone.includes(query)
  ).slice(0, 5) // Limit to 5 suggestions
}

const selectSuggestion = (contact) => {
  searchQuery.value = contact.name
  suggestions.value = []
  performSearch()
}

const performSearch = async () => {
  suggestions.value = [] // Hide suggestions
  if (!searchQuery.value) {
    isSearching.value = false
    return
  }
  
  isSearching.value = true
  loading.value = true
  try {
    const response = await axios.get(`/api/search?q=${searchQuery.value}`)
    searchResults.value = response.data.results
  } catch (error) {
    console.error('Search failed:', error)
    toast.error('Search failed')
  } finally {
    loading.value = false
  }
}

const handleEdit = (contact) => {
  router.push(`/edit-contact/${contact.id}`)
}

const deleteContact = async (contactId) => {
  if (!confirm('Are you sure you want to delete this contact?')) return
  
  try {
    await axios.delete(`/api/contacts/${contactId}`)
    toast.success('Contact deleted')
    await fetchContacts()
    if (isSearching.value) performSearch()
  } catch (error) {
    toast.error('Failed to delete contact')
  }
}

const viewContact = (contact) => {
  viewingContact.value = contact
}

const closeDetail = () => {
  viewingContact.value = null
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  fetchContacts()
})
</script>
