<template>
  <div class="contact-list-container">
    <h2>My Contacts</h2>
    
    <div v-if="loading" class="loading">
      Loading contacts...
    </div>

    <div v-else-if="contacts.length === 0" class="empty-state">
      <h3>No contacts yet</h3>
      <p class="text-muted">Add your first contact using the form above</p>
    </div>

    <div v-else class="contact-list">
      <div 
        v-for="contact in contacts" 
        :key="contact.id" 
        class="contact-item fade-in"
      >
        <div class="contact-header">
          <div>
            <div class="contact-name">{{ contact.name }}</div>
          </div>
        </div>

        <div class="contact-info">
          <div class="contact-info-item">
            <span>{{ contact.phone }}</span>
          </div>
          <div v-if="contact.email" class="contact-info-item">
            <span>{{ contact.email }}</span>
          </div>
          <div v-if="contact.address" class="contact-info-item">
            <span>{{ contact.address }}</span>
          </div>
        </div>

        <div class="contact-actions">
          <button 
            class="btn btn-secondary btn-small"
            @click="$emit('view', contact)"
          >
            View Details
          </button>
          <button 
            class="btn btn-secondary btn-small"
            @click="$emit('edit', contact)"
          >
            Edit
          </button>
          <button 
            class="btn btn-danger btn-small"
            @click="$emit('delete', contact.id)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactList',
  props: {
    contacts: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['edit', 'delete', 'view']
}
</script>

<style scoped>
.contact-list-container {
  margin-top: 3rem;
}
</style>
