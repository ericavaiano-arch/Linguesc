<template>
  <nuxt-link
    :to="to"
    class="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-green-100 transition"
    active-class="bg-green-50 text-green-700 font-semibold"
  >
    <span class="text-xl">{{ icon }}</span>
    <span v-if="open" class="text-sm font-medium">
      {{ label }}
    </span>
  </nuxt-link>
</template>

<script setup>
defineProps({
  to: String,
  label: String,
  icon: String,
  open: Boolean,
});
</script>
