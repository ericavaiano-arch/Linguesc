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
        <SidebarItem v-if="isAluno" to="/presencaAluno" label="Minha Presença" icon="📅" :open="true" @click="$emit('toggle')" />
        <SidebarItem v-if="isAluno" to="/minhaTurma" label="Minha Turma" icon="👥" :open="true" @click="$emit('toggle')"
/>
        <!-- <SidebarItem v-if="isAluno" to="/registroPresenca" label="Marcar Presença" icon="📷" :open="true" @click="$emit('toggle')" /> -->

        <!-- PROFESSOR -->
        <SidebarItem v-if="isProfessor" to="/dashboard" label="Dashboard" icon="📊" :open="true" @click="$emit('toggle')" />
        <SidebarItem v-if="isProfessor" to="/turmas" label="Minhas Turmas" icon="📚" :open="true" @click="$emit('toggle')" />
        <!-- <SidebarItem v-if="isProfessor" to="/qrCodeTurmas" label="Chamada por QR Code" icon="🧾" :open="true" @click="$emit('toggle')" /> -->
        <SidebarItem v-if="isProfessor" to="/chamada-manual" label="Chamada" icon="✅" :open="true" @click="$emit('toggle')" />
        <SidebarItem v-if="isProfessor" to="/justificativas" label="Justificativas" icon="📝" :open="true" @click="$emit('toggle')" />

        <!-- ADMIN -->
        <template v-if="isAdmin">
          <div class="px-3 pt-4 pb-1">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Admin</p>
          </div>
          <SidebarItem to="/admin" label="Dashboard Global" icon="📊" :open="true" @click="$emit('toggle')" />
          <SidebarItem to="/admin/usuarios" label="Usuários" icon="👥" :open="true" @click="$emit('toggle')" />
          <SidebarItem to="/admin/configuracoes" label="Configurações" icon="⚙️" :open="true" @click="$emit('toggle')" />
          <SidebarItem to="/justificativas" label="Justificativas" icon="📝" :open="true" @click="$emit('toggle')" />

        </template>
      </nav>
    </aside>
  </div>
</template>

<script setup>
defineProps({ open: { type: Boolean, required: true } })
defineEmits(['toggle'])

const { user, isAluno, isProfessor, isAdmin } = useAuth()
const { count: pendentes, carregar: carregarPendentes } = useJustificativasPendentes()

onMounted(() => {
  if (isProfessor && user.value?.id) {
    carregarPendentes(user.value.id)
  }
})
</script>