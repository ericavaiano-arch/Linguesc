<template>
  <div>

    <!-- 🔥 Overlay (somente mobile) -->
    <div
      v-if="open"
      class="fixed inset-0 bg-black/40 z-40 md:hidden"
      @click="$emit('toggle')"
    ></div>

    <!-- 🔥 Sidebar -->
    <aside
      :class="[
        'bg-white shadow-md transition-all duration-300 ease-in-out',
        'fixed md:sticky left-0 z-50',
        'top-16 h-[calc(100vh-4rem)]',

        // MOBILE
        open ? 'translate-x-0 w-64' : '-translate-x-full w-64',

        // DESKTOP (sempre visível)
        'md:translate-x-0 md:w-64'
      ]"
    >
      <!-- Header -->
      <div class="h-14 flex items-center border-b justify-end px-3">

        <!-- Botão só aparece no mobile -->
        <button
          @click="$emit('toggle')"
          class="md:hidden w-9 h-9 flex items-center justify-center rounded-md text-gray-600 text-xl transition hover:text-green-600 hover:bg-green-50 active:scale-95"
        >
          ✕
        </button>

      </div>

      <!-- Menu -->
      <nav class="mt-4 space-y-1 px-2">

        <SidebarItem to="/hub" label="Início" icon="🏠" :open="true" @click="$emit('toggle')" />

        <SidebarItem
          v-if="tipoUsuario === 'ALUNO'"
          to="/presencaAluno"
          label="Presença - Aluno"
          icon="📅"
          :open="true"
          @click="$emit('toggle')"
        />

        <SidebarItem
          v-if="tipoUsuario == 'ALUNO'"
          to="/registroPresenca"
          label="Marcar Presença"
          icon="📷"
          :open="true"
          @click="$emit('toggle')"
        />

        <SidebarItem
          v-if="tipoUsuario == 'PROFESSOR'"
          to="/presencaProfessor"
          label="Minhas Turmas"
          icon="📚"
          :open="true"
          @click="$emit('toggle')"
        />

        <SidebarItem
          v-if="tipoUsuario == 'PROFESSOR'"
          to="/qrCodeTurmas"
          label="Presença Semanal"
          icon="🧾"
          :open="true"
          @click="$emit('toggle')"
        />

      </nav>

    </aside>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'

defineProps({
  open: {
    type: Boolean,
    required: true
  }
})

defineEmits(['toggle'])

const user = ref(null)

onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    user.value = JSON.parse(storedUser)
  }
})

const tipoUsuario = computed(() => user.value?.tipoUsuario || null)
</script>