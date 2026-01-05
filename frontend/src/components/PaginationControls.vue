<template>
  <div class="pagination-buttons" v-if="totalPages > 1">
    <button 
      @click="$emit('change-page', currentPage - 1)" 
      class="btn btn-secondary btn-small"
      v-if="showPreviousButton"
    >
      Previous
    </button>
    
    <button
      v-for="page in visiblePages"
      :key="page"
      @click="$emit('change-page', page)"
      class="btn btn-small"
      :class="{ 'btn-primary': currentPage === page, 'btn-secondary': currentPage !== page }"
    >
      {{ page }}
    </button>

    <button 
      @click="onNextClick" 
      class="btn btn-secondary btn-small"
      v-if="showNextButton"
    >
      Next
    </button>
  </div>
</template>

<script>
export default {
  name: 'PaginationControls',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    },
    maxVisiblePages: {
      type: Number,
      default: 10
    },
    hasNavigatedForward: {
    }
  },
  emits: ['change-page'],
  computed: {
    visiblePages() {
      // Plan 4 Logic:
      // If current page <= 10: Fixed window [1-10] (or [1-total])
      // If current page > 10: Shifted [current-9 ... current]
      
      const total = this.totalPages;
      const max = this.maxVisiblePages; // 10
      const current = this.currentPage;

      // Case 1: Total pages <= 10
      // Show all pages [1...total]
      if (total <= max) {
        const pages = [];
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
        return pages;
      }

      // Case 2: Total > 10
      let start, end;
      
      if (current <= max) {
        // Fixed window at start
        start = 1;
        end = max;
      } else {
        // Shifted window ending at current
        end = current;
        start = current - max + 1;
        // Verify start bounds (should be >= 1 by definition if current > 10 and max=10)
        if (start < 1) start = 1;
        // Verify end bounds
        if (end > total) end = total;
      }

      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
    showPreviousButton() {
      // Plan 4 Logic:
      // Show ONLY if:
      // 1. Total pages > 10
      // 2. First visible page > 1 (window has shifted)
      if (this.totalPages <= 10) return false;
      if (this.visiblePages.length === 0) return false;
      
      const firstVisible = this.visiblePages[0];
      return firstVisible > 1;
    },
    showNextButton() {
      // Plan 4 Logic:
      // Show ONLY if:
      // 1. Total pages > 10
      // 2. Last visible page < total pages (more pages exist)
      if (this.totalPages <= 10) return false;
      if (this.visiblePages.length === 0) return false;
      
      const lastVisible = this.visiblePages[this.visiblePages.length - 1];
      return lastVisible < this.totalPages;
    }
  },
  methods: {
    onPreviousClick() {
      // Standard Logic: Go to previous page
      this.$emit('change-page', this.currentPage - 1);
    },
    onNextClick() {
      // Standard Logic: Go to next page
      this.$emit('change-page', this.currentPage + 1);
    }
  }
}
</script>

<style scoped>
.pagination-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-small {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-secondary {
  background-color: #1f2937;
  color: #d1d5db;
  border: 1px solid #374151;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #374151;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
