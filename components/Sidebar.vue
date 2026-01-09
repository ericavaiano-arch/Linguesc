<template>
  <aside
    :class="[
      'bg-white shadow-md transition-all duration-300 sticky top-16',
      open ? 'w-64' : 'w-16'
    ]"
  >
    <!-- Header / Toggle -->
    <div
      class="h-14 flex items-center border-b"
      :class="open ? 'justify-end px-3' : 'justify-center'"
    >
      <!-- Botão fechar -->
      <button
        v-if="open"
        @click="$emit('toggle')"
        class="
          w-9 h-9
          flex items-center justify-center
          rounded-md
          text-gray-500 text-xl
          transition-all duration-200
          hover:text-green-600
          hover:bg-green-50
          active:scale-95
        "
        aria-label="Fechar menu"
      >
        ✕
      </button>

      <!-- Botão abrir -->
      <button
        v-else
        @click="$emit('toggle')"
        class="
          w-9 h-9
          flex items-center justify-center
          rounded-md
          text-gray-600 text-xl
          transition-all duration-200
          hover:text-green-600
          hover:bg-green-50
          active:scale-95
        "
        aria-label="Abrir menu"
      >
        ☰
      </button>
    </div>

    <!-- Menu -->
    <nav class="mt-4 space-y-1 px-2">
      <SidebarItem to="/hub" label="Início" icon="🏠" :open="open" />
      <SidebarItem to="/presencaAluno" label="Presença - Aluno" icon="📅" :open="open" />
      <SidebarItem to="/presencaProfessor" label="Presença - Professor" icon="🧑‍🏫" :open="open" />
    </nav>
  </aside>
</template>

<script setup>
defineProps({
  open: {
    type: Boolean,
    required: true
  }
})
</script>
