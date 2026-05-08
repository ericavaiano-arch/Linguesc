<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-green-700">Minhas Turmas</h1>
      <p class="text-gray-500 mt-2">Selecione uma turma para continuar.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando...</span>
    </div>

    <div
      v-else-if="turmas.length === 0"
      class="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center"
    >
      <p class="text-4xl mb-4">📚</p>
      <p class="text-gray-500 font-medium">Você ainda não está matriculado em nenhuma turma.</p>
    </div>

    <div v-else class="grid gap-4 max-w-2xl">
      <button
        v-for="turma in turmas"
        :key="turma.id"
        @click="navegar(turma.id)"
        class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-left hover:border-green-400 hover:shadow-md transition-all group"
      >
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-base font-semibold text-gray-800 group-hover:text-green-700 transition">
              {{ turma.nome }}
            </h2>
            <p class="text-sm text-gray-500 mt-1">{{ turma.nomeProfessor }}</p>
            <p v-if="turma.sala" class="text-sm text-gray-400 mt-0.5">Sala {{ turma.sala }}</p>
          </div>
          <span
            class="text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5"
            :class="turma.status === 'ATIVA' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="turma.status === 'ATIVA' ? 'bg-green-600' : 'bg-gray-400'"></span>
            {{ turma.status === 'ATIVA' ? 'Ativa' : 'Finalizada' }}
          </span>
        </div>

        <div class="h-px bg-gray-100 my-4"></div>

        <div class="flex items-center justify-between">
          <p class="text-xs text-gray-400">Meta de frequência: <span class="font-semibold text-gray-600">{{ turma.meta_frequencia }}%</span></p>
          <span class="text-xs text-green-600 font-semibold group-hover:underline">Ver {{ destino === 'minha-turma' ? 'turma' : 'presença' }} →</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { supabase } from '~/utils/supabase'

definePageMeta({ middleware: 'auth' })

const { user } = useAuth()
const route = useRoute()
const router = useRouter()

const destino = computed(() => route.query.destino ?? 'minha-turma')

const loading = ref(true)
const turmas = ref([])

onMounted(async () => {
  const alunoId = user.value?.id
  if (!alunoId) { loading.value = false; return }

  const { data: vinculos } = await supabase
    .from('turma_aluno')
    .select('turma_id, turma(id, nome, status, meta_frequencia, sala, professor_id)')
    .eq('aluno_id', alunoId)

  if (!vinculos || vinculos.length === 0) {
    loading.value = false
    return
  }

  if (vinculos.length === 1) {
    router.replace(`/aluno/${destino.value}?turma_id=${vinculos[0].turma_id}`)
    return
  }

  const professorIds = [...new Set(vinculos.map(v => v.turma.professor_id).filter(Boolean))]
  const { data: professores } = await supabase
    .from('usuarios')
    .select('id, nome')
    .in('id', professorIds)

  const mapProfessores = Object.fromEntries((professores || []).map(p => [p.id, p.nome]))

  turmas.value = vinculos.map(v => ({
    ...v.turma,
    nomeProfessor: mapProfessores[v.turma.professor_id] ?? '—',
  }))

  loading.value = false
})

function navegar(turmaId) {
  router.push(`/aluno/${destino.value}?turma_id=${turmaId}`)
}
</script>