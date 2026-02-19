<template>
  <nav class="bg-white shadow-md">
    <div class="px-6 py-3 flex items-center justify-between">

      <!-- Esquerda: Logo + Links -->
      <div class="flex items-center space-x-8">
        <!-- Logo -->
        <NuxtLink to="/hub" class="flex items-center space-x-3">
          <img
            src="~/assets/images/logo_linguesc.png"
            alt="Linguesc"
            class="h-10 w-auto"
          />
          <span class="text-2xl font-bold text-gray-800">
            Linguesc
          </span>
        </NuxtLink>

        <!-- Links -->
        <div class="flex space-x-6 text-sm">
          <NuxtLink
            to="/hub"
            class="text-gray-700 hover:text-green-600 font-medium"
          >
            Início
          </NuxtLink>

          <NuxtLink
            v-if="tipoFormatado === 'Aluno'"
            to="/presencaAluno"
            class="text-gray-700 hover:text-green-600 font-medium"
          >
            Presença - Aluno
          </NuxtLink>


          <NuxtLink
            v-if="tipoFormatado === 'Professor'"
            to="/presencaProfessor"
            class="text-gray-700 hover:text-green-600 font-medium"
          >
            Presença - Professor
          </NuxtLink>
        </div>
      </div>

           <!-- Perfil -->
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
          <span class="text-gray-600">▾</span>
        </button>

        <!-- Dropdown -->
        <div
          v-if="open"
          class="absolute right-0 mt-2 w-40 bg-white rounded shadow-md py-2 text-sm"
        >
          <NuxtLink
            :to="`/profile/${userId}`"
            class="block px-4 py-2 hover:bg-gray-100"
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

const tipoFormatado = computed(() => {
  if (!user.value?.tipoUsuario) return ''

  if (user.value.tipoUsuario === 'ALUNO') return 'Aluno'
  if (user.value.tipoUsuario === 'PROFESSOR') return 'Professor'

  return user.value.tipoUsuario
})

const initial = computed(() => {
  return userName.value
    ? userName.value.charAt(0).toUpperCase()
    : '?'
})

function logout() {
  open.value = false

  // Remove usuário do storage
  localStorage.removeItem('user')

  // Limpa estado local
  user.value = null

  // Redireciona substituindo histórico
  navigateTo('/', { replace: true })
}

</script>

