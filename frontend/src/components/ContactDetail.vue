<template>
  <div v-if="contact" class="contact-detail-modal" @click.self="$emit('close')">
    <div class="contact-detail-card card">
      <div class="detail-header">
        <h2>Contact Details</h2>
        <button class="btn-close" @click="$emit('close')" aria-label="Close">
          ✕
        </button>
      </div>

      <div class="detail-content">
        <div class="detail-section">
          <div class="detail-label">Name</div>
          <div class="detail-value">{{ contact.name }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Phone</div>
          <div class="detail-value">
            <a :href="`tel:${contact.phone}`" class="phone-link">
              {{ contact.phone }}
            </a>
          </div>
        </div>

        <div v-if="contact.email" class="detail-section">
          <div class="detail-label">Email</div>
          <div class="detail-value">
            <a :href="`mailto:${contact.email}`" class="email-link">
              {{ contact.email }}
            </a>
          </div>
        </div>

        <div v-if="contact.address" class="detail-section">
          <div class="detail-label">Address</div>
          <div class="detail-value">{{ contact.address }}</div>
        </div>
      </div>

      <div class="detail-actions">
        <button class="btn btn-primary" @click="handleEdit">
          Edit Contact
        </button>
        <button class="btn btn-secondary" @click="$emit('close')">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactDetail',
  props: {
    contact: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'edit'],
  methods: {
    handleEdit() {
      this.$emit('edit', this.contact)
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.contact-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

.contact-detail-card {
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.detail-header h2 {
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: var(--transition);
}

.btn-close:hover {
  background: hsla(0, 0%, 100%, 0.1);
  color: var(--text-primary);
}

.detail-content {
  margin-bottom: 2rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.detail-value {
  font-size: 1.125rem;
  color: var(--text-primary);
  word-break: break-word;
}

.phone-link,
.email-link {
  color: var(--primary);
  text-decoration: none;
  transition: var(--transition);
}

.phone-link:hover,
.email-link:hover {
  color: var(--primary-light);
  text-decoration: underline;
}

.detail-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

@media (max-width: 768px) {
  .detail-actions {
    flex-direction: column;
  }
}
</style>
