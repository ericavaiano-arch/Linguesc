<template>
  <div class="flex flex-col h-screen">
    <!-- Navbar -->
    <Navbar />

    <div class="flex flex-1">
      <!-- Sidebar -->
      <Sidebar :open="sidebarOpen" @toggle="toggleSidebar" />

      <!-- Conteúdo -->
      <main class="flex-1 p-6 transition-all duration-300">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '~/components/Sidebar.vue'
import Navbar from '~/components/Navbar.vue'

const sidebarOpen = ref(true)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}
</script>
