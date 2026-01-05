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
      <!-- Top Pagination -->
      <!-- Top Pagination -->
      <div v-if="pagination" class="pagination-header">
        <div class="pagination-summary">
          {{ paginationStatus }}
        </div>
        <PaginationControls
          v-if="pagination.totalPages > 1"
          :current-page="pagination.currentPage"
          :total-pages="pagination.totalPages"
          @change-page="(page) => $emit('page-change', page)"
        />
      </div>

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
    
    <!-- Bottom Pagination -->
    <div v-if="pagination && pagination.totalPages > 1" class="pagination-footer">
      <PaginationControls
        :current-page="pagination.currentPage"
        :total-pages="pagination.totalPages"
        @change-page="(page) => $emit('page-change', page)"
      />
    </div>
  </div>
</template>

<script>
import PaginationControls from './PaginationControls.vue'

export default {
  name: 'ContactList',
  components: {
    PaginationControls
  },
  props: {
    contacts: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    pagination: {
      type: Object,
      default: null
    }
  },
  emits: ['edit', 'delete', 'view', 'page-change'],
  computed: {
    paginationStatus() {
      if (!this.pagination) return ''
      const { currentPage, pageSize, totalContacts, totalPages } = this.pagination
      
      if (totalPages <= 1) {
        return `Showing ${totalContacts} contacts`
      }

      const start = (currentPage - 1) * pageSize + 1
      const end = Math.min(currentPage * pageSize, totalContacts)
      return `Showing ${start}–${end} of ${totalContacts}`
    }
  }
}
</script>

<style scoped>
.contact-list-container {
  margin-top: 3rem;
  padding-bottom: 2rem;
}

.pagination-controls {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #374151;
  padding-top: 1rem;
}

.pagination-status {
  color: #9ca3af;
  font-size: 0.875rem;
}

.pagination-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.page-number {
  color: #d1d5db;
  font-size: 0.875rem;
}

.pagination-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #374151;
}

.pagination-summary {
  color: #9ca3af;
  font-size: 0.875rem;
}

.pagination-footer {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end; /* Align to right as per typical design, or center? Plan doesn't specify alignment, but usually controls are aligned. Let's start with right or same as top. Top has space-between. Bottom says "controls only". Let's center or right align. Existing was space-between. Let's keep it simple. */
  border-top: 1px solid #374151;
  padding-top: 1rem;
}
</style>
