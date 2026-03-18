<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-green-700">Chamada Manual</h1>
      <p class="text-gray-500 mt-2">Selecione uma turma para realizar a chamada manualmente.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando turmas...</span>
    </div>

    <div v-else-if="turmas.length === 0" class="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
      <p class="text-4xl mb-4">📚</p>
      <p class="text-gray-500 font-medium">Nenhuma turma encontrada.</p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="turma in turmas" :key="turma.id" class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-green-500 transition-all duration-300 cursor-pointer" @click="irParaChamada(turma.id)">
        <div class="flex items-start justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">{{ turma.nome }}</h2>
          <div class="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
        </div>
        <p class="text-xs text-gray-400 mb-1">Alunos</p>
        <p class="text-sm font-medium text-gray-600 mb-6">{{ turma.turma_aluno[0]?.count ?? 0 }}</p>
        <div class="mt-2 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">Fazer chamada →</div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'professor' })

import { supabase } from '@/utils/supabase'

const router = useRouter()
const { user } = useAuth()
const turmas = ref([])
const loading = ref(true)

async function carregarTurmas() {
  const professorId = user.value?.id
  if (!professorId) { loading.value = false; return }

  const { data, error } = await supabase
    .from('turma')
    .select('*, turma_aluno(count)')
    .eq('professor_id', professorId)
    .eq('status', 'ATIVA')
    .order('nome', { ascending: true })

  if (error) console.error('Erro ao buscar turmas:', error.message)
  else turmas.value = data
  loading.value = false
}

function irParaChamada(id) { router.push(`/chamada-manual/${id}`) }

onMounted(carregarTurmas)
</script>