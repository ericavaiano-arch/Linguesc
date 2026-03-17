<template>
  <div>
    <div v-if="open" class="fixed inset-0 bg-black/40 z-40 md:hidden" @click="$emit('toggle')"></div>

    <aside :class="['bg-white shadow-md transition-all duration-300 ease-in-out', 'fixed md:sticky left-0 z-50', 'top-16 h-[calc(100vh-4rem)]', open ? 'translate-x-0 w-64' : '-translate-x-full w-64', 'md:translate-x-0 md:w-64']">
      <div class="h-14 flex items-center border-b justify-end px-3">
        <button @click="$emit('toggle')" class="md:hidden w-9 h-9 flex items-center justify-center rounded-md text-gray-600 text-xl transition hover:text-green-600 hover:bg-green-50 active:scale-95">✕</button>
      </div>

      <nav class="mt-4 space-y-1 px-2">
        <SidebarItem to="/hub" label="Início" icon="🏠" :open="true" @click="$emit('toggle')" />

        <!-- ALUNO -->
        <SidebarItem v-if="tipoUsuario === 'ALUNO'" to="/presencaAluno" label="Presença - Aluno" icon="📅" :open="true" @click="$emit('toggle')" />
        <!-- <SidebarItem v-if="tipoUsuario === 'ALUNO'" to="/registroPresenca" label="Marcar Presença" icon="📷" :open="true" @click="$emit('toggle')" /> -->

        <!-- PROFESSOR -->
        <SidebarItem v-if="tipoUsuario === 'PROFESSOR'" to="/turmas" label="Minhas Turmas" icon="📚" :open="true" @click="$emit('toggle')" />
        <!-- <SidebarItem v-if="tipoUsuario === 'PROFESSOR'" to="/qrCodeTurmas" label="Chamada por QR Code" icon="🧾" :open="true" @click="$emit('toggle')" /> -->
        <SidebarItem v-if="tipoUsuario === 'PROFESSOR'" to="/chamada-manual" label="Chamada" icon="✅" :open="true" @click="$emit('toggle')" />
      </nav>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

defineProps({ open: { type: Boolean, required: true } })
defineEmits(['toggle'])

const user = ref(null)
onMounted(() => {
  const stored = localStorage.getItem('user')
  if (stored) user.value = JSON.parse(stored)
})
const tipoUsuario = computed(() => user.value?.tipoUsuario || null)
</script>
