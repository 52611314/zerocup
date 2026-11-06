<script setup lang="ts">
defineProps<{
  categories: string[]
  category: string
  allLabel: string
  categoryLabel: string
  searchLabel: string
  searchId: string
  placeholder: string
}>()

const query = defineModel<string>({ required: true })
defineEmits<{ select: [category: string]; search: [] }>()
</script>

<template>
  <div class="browse-filters">
    <div class="browse-tabs" role="group" :aria-label="categoryLabel">
      <button type="button" :aria-pressed="category === ''" @click="$emit('select', '')">
        {{ allLabel }}
      </button>
      <button
        v-for="option in categories"
        :key="option"
        type="button"
        :aria-pressed="category === option"
        @click="$emit('select', option)"
      >
        {{ option }}
      </button>
    </div>
    <form class="browse-search" role="search" :aria-label="searchLabel" @submit.prevent="$emit('search')">
      <label :for="searchId" class="sr-only">{{ searchLabel }}</label>
      <input :id="searchId" v-model="query" type="search" maxlength="80" :placeholder="placeholder" />
      <button type="submit">
        搜索 <span aria-hidden="true">↗</span>
      </button>
    </form>
  </div>
</template>

<style scoped>
.browse-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px 28px;
  padding-block: 12px;
  border-block: 1px solid #cbbda6;
}

.browse-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.browse-tabs button {
  padding-inline: 12px;
  border-color: transparent;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
}

.browse-tabs button:hover {
  border-color: #cbbda6;
  background: #fff8e9;
}

.browse-tabs button[aria-pressed="true"] {
  background: #ad2920;
  color: #fff8e9;
  border-color: #ad2920;
}

.browse-search {
  display: flex;
  max-width: 100%;
  border: 1px solid #cbbda6;
  background: #fff9ec;
}

.browse-search input {
  flex: 1;
  min-width: 0;
  width: 185px;
  padding-inline: 13px;
  border: 0;
  background: transparent;
  font-size: 14px;
}

.browse-search button {
  border: 0;
  border-inline-start: 1px solid #cbbda6;
  font-size: 14px;
  white-space: nowrap;
}

.browse-search button:hover {
  background: #eadbc6;
}

@media (max-width: 640px) {
  .browse-tabs button {
    padding-inline: 10px;
  }

  .browse-search {
    width: 100%;
  }
}
</style>
