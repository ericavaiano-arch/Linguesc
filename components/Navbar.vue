<template>
  <nav class="bg-white shadow-md">
    <div class="px-6 py-3 flex items-center justify-between">

      <div class="flex items-center space-x-4">
        <button class="md:hidden text-2xl text-gray-700" @click="$emit('toggleSidebar')">☰</button>
        <NuxtLink to="/hub" class="flex items-center space-x-3">
          <img src="~/assets/images/logo_linguesc.png" alt="Linguesc" class="h-10 w-auto" />
          <span class="text-2xl font-bold text-gray-800 hidden sm:block">Linguesc</span>
        </NuxtLink>
      </div>

      <div class="relative">
        <button @click="open = !open" class="flex items-center space-x-2 focus:outline-none">
          <div class="h-9 w-9 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
            {{ inicial }}
          </div>
          <span class="text-gray-600 hidden sm:block">▾</span>
        </button>

        <div v-if="open" class="absolute right-0 mt-2 w-40 bg-white rounded shadow-md py-2 text-sm z-50">
          <NuxtLink :to="`/profile/${user?.id}`" class="block px-4 py-2 hover:bg-gray-100" @click="open = false">
            Perfil
          </NuxtLink>
          <button @click="handleLogout" class="w-full text-left px-4 py-2 hover:bg-gray-100">
            Sair
          </button>
        </div>
      </div>

    </div>
  </nav>
</template>

<script setup>
defineEmits(['toggleSidebar'])

const { user, logout } = useAuth()
const open = ref(false)

const inicial = computed(() =>
  user.value?.nome ? user.value.nome.charAt(0).toUpperCase() : '?'
)

function handleLogout() {
  open.value = false
  logout()
}
</script>