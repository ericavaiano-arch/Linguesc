<template>
  <nav class="bg-white shadow-md">
    <div class="px-6 py-3 flex items-center justify-between">

      <!-- 🔥 Esquerda -->
      <div class="flex items-center space-x-4">

        <!-- Botão Mobile -->
        <button
          class="md:hidden text-2xl text-gray-700"
          @click="$emit('toggleSidebar')"
        >
          ☰
        </button>

        <!-- Logo -->
        <NuxtLink to="/hub" class="flex items-center space-x-3">
          <img
            src="~/assets/images/logo_linguesc.png"
            alt="Linguesc"
            class="h-10 w-auto"
          />
          <span class="text-2xl font-bold text-gray-800 hidden sm:block">
            Linguesc
          </span>
        </NuxtLink>

        <!-- 🔥 Links Desktop -->
        <div class="hidden md:flex space-x-6 text-sm ml-6">

          <NuxtLink
            to="/hub"
            class="text-gray-700 hover:text-green-600 font-medium transition"
          >
            Início
          </NuxtLink>

          <!-- ALUNO -->
          <NuxtLink
            v-if="tipoUsuario === 'ALUNO'"
            to="/presencaAluno"
            class="text-gray-700 hover:text-green-600 font-medium transition"
          >
            Presença - Aluno
          </NuxtLink>

          <NuxtLink
            v-if="tipoUsuario === 'ALUNO'"
            to="/registroPresenca"
            class="text-gray-700 hover:text-green-600 font-medium transition"
          >
            Marcar Presença
          </NuxtLink>

          <!-- PROFESSOR -->
          <NuxtLink
            v-if="tipoUsuario === 'PROFESSOR'"
            to="/presencaProfessor"
            class="text-gray-700 hover:text-green-600 font-medium transition"
          >
            Minhas Turmas
          </NuxtLink>

          <NuxtLink
            v-if="tipoUsuario === 'PROFESSOR'"
            to="/qrCodeTurmas"
            class="text-gray-700 hover:text-green-600 font-medium transition"
          >
            Presença Semanal
          </NuxtLink>

        </div>
      </div>

      <!-- 🔥 Perfil -->
      <div class="relative">
        <button
          @click="open = !open"
          class="flex items-center space-x-2 focus:outline-none"
        >
          <div
            class="h-9 w-9 rounded-full bg-green-500 text-white flex items-center justify-center font-bold"
          >
            {{ initial }}
          </div>
          <span class="text-gray-600 hidden sm:block">▾</span>
        </button>

        <!-- Dropdown -->
        <div
          v-if="open"
          class="absolute right-0 mt-2 w-40 bg-white rounded shadow-md py-2 text-sm z-50"
        >
          <NuxtLink
            :to="`/profile/${userId}`"
            class="block px-4 py-2 hover:bg-gray-100"
            @click="open = false"
          >
            Perfil
          </NuxtLink>

          <button
            @click="logout"
            class="w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Sair
          </button>
        </div>
      </div>

    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

defineEmits(['toggleSidebar'])

const open = ref(false)
const user = ref(null)

onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    user.value = JSON.parse(storedUser)
  }
})

const userName = computed(() => user.value?.nome || '')
const userId = computed(() => user.value?.id || null)
const tipoUsuario = computed(() => user.value?.tipoUsuario || null)

const initial = computed(() => {
  return userName.value
    ? userName.value.charAt(0).toUpperCase()
    : '?'
})

function logout() {
  open.value = false
  localStorage.removeItem('user')
  user.value = null
  navigateTo('/', { replace: true })
}
</script>