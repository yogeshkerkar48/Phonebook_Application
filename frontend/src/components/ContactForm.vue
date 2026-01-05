<template>
  <div class="contact-form-container">
    <div class="card">
      <h2>{{ isEditing ? 'Edit Contact' : 'Add New Contact' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Name *</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            placeholder="Enter contact name"
            required
          />
        </div>

        <div class="form-group">
          <label for="phone">Phone *</label>
          <input
            id="phone"
            v-model="formData.phone"
            type="tel"
            placeholder="Enter phone number"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="Enter email address"
          />
        </div>

        <div class="form-group">
          <label for="address">Address</label>
          <textarea
            id="address"
            v-model="formData.address"
            placeholder="Enter address"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            {{ isEditing ? 'Update Contact' : 'Add Contact' }}
          </button>
          <button 
            v-if="isEditing" 
            type="button" 
            class="btn btn-secondary"
            @click="handleCancel"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactForm',
  props: {
    editingContact: {
      type: Object,
      default: null
    }
  },
  emits: ['submit', 'cancel'],
  data() {
    return {
      formData: {
        name: '',
        phone: '',
        email: '',
        address: ''
      }
    }
  },
  computed: {
    isEditing() {
      return this.editingContact !== null
    }
  },
  watch: {
    editingContact: {
      immediate: true,
      handler(contact) {
        if (contact) {
          this.formData = { ...contact }
        } else {
          this.resetForm()
        }
      }
    }
  },
  methods: {
    handleSubmit() {
      this.$emit('submit', { ...this.formData })
      // Don't reset form here - let parent component handle success/error
      // Form will only reset on successful submission (when navigating away)
    },
    handleCancel() {
      this.$emit('cancel')
      this.resetForm()
    },
    resetForm() {
      this.formData = {
        name: '',
        phone: '',
        email: '',
        address: ''
      }
    }
  }
}
</script>

<style scoped>
.contact-form-container {
  margin-bottom: 2rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }
}
</style>
