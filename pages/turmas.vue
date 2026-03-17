<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <!-- Header -->
    <div class="mb-10 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold text-green-700">Minhas Turmas</h1>
        <p class="text-gray-500 mt-2">Gerencie suas turmas e aulas.</p>
        <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
      </div>
      <button
        @click="$router.push('/turmas/criar')"
        class="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl transition active:scale-95 flex items-center gap-2"
      >
        + Nova Turma
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando turmas...</span>
    </div>

    <!-- Nenhuma turma -->
    <div
      v-else-if="turmas.length === 0"
      class="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center"
    >
      <p class="text-4xl mb-4">📚</p>
      <p class="text-gray-500 font-medium">Nenhuma turma criada ainda.</p>
      <button
        @click="$router.push('/turmas/criar')"
        class="mt-4 text-green-600 font-semibold hover:underline text-sm"
      >
        Criar minha primeira turma →
      </button>
    </div>

    <!-- Lista de turmas -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="turma in turmas"
        :key="turma.id"
        class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-green-500 transition-all duration-300"
      >
        <div class="flex items-start justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">
            {{ turma.nome }}
          </h2>
          <div class="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
        </div>

        <p class="text-xs text-gray-400 mb-1">Código</p>
        <p class="text-sm font-medium text-gray-600 mb-6">#{{ turma.id.slice(0, 8) }}</p>

        <div class="flex gap-2">
          <button
            @click="$router.push(`/turmas/${turma.id}/aulas`)"
            class="flex-1 text-xs font-semibold px-3 py-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition"
          >
            📅 Aulas
          </button>
          <button
            @click="$router.push(`/chamada-manual/${turma.id}`)"
            class="flex-1 text-xs font-semibold px-3 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
          >
            ✅ Chamada
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/utils/supabase'

const turmas = ref([])
const loading = ref(true)
const professorId = ref(null)

async function carregarTurmas() {
  if (!professorId.value) { loading.value = false; return }

  const { data, error } = await supabase
    .from('turma')
    .select('*')
    .eq('professor_id', professorId.value)
    .order('dtInclusao', { ascending: false })

  if (error) console.error('Erro ao buscar turmas:', error.message)
  else turmas.value = data

  loading.value = false
}

onMounted(() => {
  const stored = localStorage.getItem('user')
  professorId.value = stored ? JSON.parse(stored)?.id : null
  carregarTurmas()
})
</script>
