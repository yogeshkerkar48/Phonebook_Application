<template>
  <div id="app">
    <header class="app-header">
      <h1>📞 Phonebook</h1>
      <p class="text-secondary">Manage your contacts with ease</p>
    </header>

    <main>
      <ContactForm 
        :editing-contact="editingContact"
        @submit="handleFormSubmit"
        @cancel="cancelEdit"
      />

      <ContactList 
        :contacts="contacts"
        :loading="loading"
        @edit="startEdit"
        @delete="deleteContact"
        @view="viewContact"
      />
    </main>

    <ContactDetail 
      :contact="viewingContact"
      @close="closeDetail"
      @edit="startEdit"
    />
  </div>
</template>

<script>
import axios from 'axios'
import ContactForm from './components/ContactForm.vue'
import ContactList from './components/ContactList.vue'
import ContactDetail from './components/ContactDetail.vue'

const API_URL = 'http://localhost:8000/contacts'

export default {
  name: 'App',
  components: {
    ContactForm,
    ContactList,
    ContactDetail
  },
  data() {
    return {
      contacts: [],
      loading: false,
      editingContact: null,
      viewingContact: null
    }
  },
  mounted() {
    this.fetchContacts()
  },
  methods: {
    async fetchContacts() {
      this.loading = true
      try {
        const response = await axios.get(API_URL)
        this.contacts = response.data
      } catch (error) {
        console.error('Error fetching contacts:', error)
        alert('Failed to load contacts. Please ensure the backend server is running.')
      } finally {
        this.loading = false
      }
    },
    
    async handleFormSubmit(contactData) {
      try {
        if (this.editingContact) {
          // Update existing contact
          await axios.put(`${API_URL}/${this.editingContact.id}`, contactData)
          this.editingContact = null
        } else {
          // Create new contact
          await axios.post(API_URL, contactData)
        }
        await this.fetchContacts()
      } catch (error) {
        console.error('Error saving contact:', error)
        alert('Failed to save contact. Please try again.')
      }
    },
    
    startEdit(contact) {
      this.editingContact = contact
      this.viewingContact = null
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    
    cancelEdit() {
      this.editingContact = null
    },
    
    async deleteContact(contactId) {
      if (!confirm('Are you sure you want to delete this contact?')) {
        return
      }
      
      try {
        await axios.delete(`${API_URL}/${contactId}`)
        await this.fetchContacts()
      } catch (error) {
        console.error('Error deleting contact:', error)
        alert('Failed to delete contact. Please try again.')
      }
    },
    
    viewContact(contact) {
      this.viewingContact = contact
    },
    
    closeDetail() {
      this.viewingContact = null
    }
  }
}
</script>

<style>
.app-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
}

.app-header p {
  font-size: 1.125rem;
  margin-top: 0.5rem;
}
</style>
