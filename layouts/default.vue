<template>
  <div class="flex flex-col h-screen">
    <!-- Navbar -->
    <Navbar @toggleSidebar="sidebarOpen = !sidebarOpen" />

    <div class="flex flex-1">
      <!-- Sidebar -->
      <Sidebar :open="sidebarOpen" @toggle="toggleSidebar" />

      <!-- Conteúdo -->
      <main class="flex-1 transition-all duration-300">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '~/components/Sidebar.vue'
import Navbar from '~/components/Navbar.vue'

const sidebarOpen = ref(false)

function toggleSidebar(value) {
  if (value != null){
    sidebarOpen.value = value
  }
  sidebarOpen.value = !sidebarOpen.value
}
</script>
