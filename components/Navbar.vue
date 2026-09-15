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
          <!-- Badge de estrelas (só para alunos) -->
          <span
            v-if="(isAluno || isProfessor) && estrelas !== null"
            class="flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full"
          >
            ⭐ {{ estrelas }}
          </span>

          <!-- Avatar emoji -->
          <span
            v-if="user?.avatarUrl && !user.avatarUrl.includes('/')"
            class="h-9 w-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-xl leading-none"
          >{{ user.avatarUrl }}</span>
          <!-- Avatar foto -->
          <img
            v-else-if="user?.avatarUrl"
            :src="user.avatarUrl"
            alt="Foto de perfil"
            class="h-9 w-9 rounded-full object-cover"
          />
          <!-- Fallback inicial do nome -->
          <div v-else class="h-9 w-9 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
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
import { supabase } from "~/utils/supabase";

defineEmits(['toggleSidebar'])
const { user, logout, isAluno, isProfessor } = useAuth()
const open = ref(false)
const estrelas = ref(null)

const inicial = computed(() =>
  user.value?.nome ? user.value.nome.charAt(0).toUpperCase() : '?'
)

function handleLogout() {
  open.value = false
  logout()
}

watchEffect(async () => {
  if ((!isAluno.value && !isProfessor.value) || !user.value?.id) return
  const { data } = await supabase
    .from('usuarios')
    .select('estrelas')
    .eq('id', user.value.id)
    .single()
  if (data) estrelas.value = data.estrelas ?? 0
})
</script>