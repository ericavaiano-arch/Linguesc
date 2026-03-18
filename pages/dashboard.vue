<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mb-10 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold text-green-700">Dashboard</h1>
        <p class="text-gray-500 mt-2">Visão geral das suas turmas e alunos.</p>
        <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
      </div>
      <button v-if="!loading" @click="imprimirPDF" class="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition no-print">
        🖨️ Exportar PDF
      </button>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando...</span>
    </div>

    <div v-else class="space-y-10">

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p class="text-xs text-gray-400 font-medium mb-1">Turmas ativas</p>
          <p class="text-3xl font-bold text-green-700">{{ turmas.length }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p class="text-xs text-gray-400 font-medium mb-1">Total de alunos</p>
          <p class="text-3xl font-bold text-green-700">{{ totalAlunos }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p class="text-xs text-gray-400 font-medium mb-1">Aulas realizadas</p>
          <p class="text-3xl font-bold text-green-700">{{ totalAulasRealizadas }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p class="text-xs text-gray-400 font-medium mb-1">Frequência média geral</p>
          <p class="text-3xl font-bold" :class="frequenciaMediaGeral >= 75 ? 'text-green-700' : 'text-red-600'">{{ frequenciaMediaGeral }}%</p>
        </div>
      </div>

      <div v-if="alunosEmRisco.length > 0">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">⚠️ Alunos em Risco de Frequência</h2>
        <div class="bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
          <p class="text-xs text-gray-400 mb-4">Alunos com frequência abaixo da meta definida por turma.</p>
          <ul class="space-y-3">
            <li v-for="aluno in alunosEmRisco" :key="aluno.alunoId + '-' + aluno.turmaId" class="flex items-center justify-between px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <div>
                <p class="text-sm font-semibold text-gray-800">{{ aluno.nome }}</p>
                <p class="text-xs text-gray-500">{{ aluno.turmaNome }}</p>
              </div>
              <div class="text-right">
                <span class="text-sm font-bold text-red-600">{{ aluno.frequencia }}%</span>
                <p class="text-xs text-gray-400">{{ aluno.presencas }}/{{ aluno.aulasRealizadas }} aulas</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-gray-800 mb-4">📚 Resumo por Turma</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div v-for="turma in resumoPorTurma" :key="turma.id" class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div class="flex items-start justify-between mb-5">
              <div>
                <h3 class="text-base font-semibold text-gray-800">{{ turma.nome }}</h3>
                <p class="text-xs text-gray-400 mt-0.5">{{ turma.totalAlunos }} aluno(s) · {{ turma.aulasRealizadas }} aula(s) realizada(s)</p>
              </div>
              <span class="text-sm font-bold px-3 py-1 rounded-full" :class="turma.frequenciaMedia >= 75 ? 'bg-green-100 text-green-700' : turma.frequenciaMedia >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'">
                {{ turma.frequenciaMedia }}%
              </span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2 mb-5">
              <div class="h-2 rounded-full transition-all" :class="turma.frequenciaMedia >= 75 ? 'bg-green-500' : turma.frequenciaMedia >= 50 ? 'bg-yellow-400' : 'bg-red-500'" :style="{ width: turma.frequenciaMedia + '%' }"></div>
            </div>
            <div v-if="turma.proximaAula" class="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <span>📅 Próxima aula:</span>
              <span class="font-medium text-gray-700">{{ formatarData(turma.proximaAula) }}</span>
            </div>
            <div v-if="turma.alunosEmRisco > 0" class="flex items-center gap-2 text-xs text-red-600 mb-4">
              <span>⚠️ {{ turma.alunosEmRisco }} aluno(s) abaixo de {{ turma.meta_frequencia ?? 75 }}%</span>
            </div>
            <div class="flex gap-2 mt-2 no-print">
              <button @click="$router.push(`/chamada-manual/${turma.id}`)" class="flex-1 text-xs font-semibold px-3 py-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition">✅ Chamada</button>
              <button @click="$router.push(`/turmas/${turma.id}/historico`)" class="flex-1 text-xs font-semibold px-3 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition">📋 Histórico</button>
              <button @click="$router.push(`/turmas/${turma.id}/aulas`)" class="flex-1 text-xs font-semibold px-3 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition">📅 Aulas</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'professor' })

import { supabase } from '@/utils/supabase'

const { user } = useAuth()
const loading = ref(true)
const turmas = ref([])
const todasAulas = ref([])
const todasPresencas = ref([])
const todosVinculos = ref([])

onMounted(async () => {
  const professorId = user.value?.id
  if (!professorId) { loading.value = false; return }

  const [
    { data: turmasData },
    { data: aulasData },
    { data: presencasData },
    { data: vinculosData }
  ] = await Promise.all([
    supabase.from('turma').select('id, nome, meta_frequencia').eq('professor_id', professorId).order('nome'),
    supabase.from('aula').select('id, turma_id, data, status'),
    supabase.from('presenca').select('aula_id, aluno_id').eq('status', 'PRESENTE'),
    supabase.from('turma_aluno').select('turma_id, aluno_id, usuarios(id, nome, ativo)')
  ])

  turmas.value = turmasData || []
  todasAulas.value = aulasData || []
  todasPresencas.value = presencasData || []
  todosVinculos.value = vinculosData || []
  loading.value = false
})

function aulasRealizadasDaTurma(turmaId) {
  return todasAulas.value.filter(a => a.turma_id === turmaId && a.status === 'REALIZADA')
}
function alunosDaTurma(turmaId) {
  return todosVinculos.value.filter(v => v.turma_id === turmaId && v.usuarios?.ativo !== false)
}
function presencasDoAluno(alunoId, aulasIds) {
  return todasPresencas.value.filter(p => p.aluno_id === alunoId && aulasIds.includes(p.aula_id)).length
}
function frequenciaAluno(alunoId, turmaId) {
  const aulas = aulasRealizadasDaTurma(turmaId)
  if (aulas.length === 0) return null
  const ids = aulas.map(a => a.id)
  const presencas = presencasDoAluno(alunoId, ids)
  return { presencas, aulasRealizadas: aulas.length, frequencia: Math.round((presencas / aulas.length) * 100) }
}
function imprimirPDF() { window.print() }

const resumoPorTurma = computed(() =>
  turmas.value.map(turma => {
    const alunos = alunosDaTurma(turma.id)
    const aulasRealizadas = aulasRealizadasDaTurma(turma.id)
    const hoje = new Date().toISOString().split('T')[0]
    let somaFrequencia = 0, countAlunos = 0, alunosEmRisco = 0
    alunos.forEach(v => {
      const freq = frequenciaAluno(v.aluno_id, turma.id)
      if (freq !== null) {
        somaFrequencia += freq.frequencia
        countAlunos++
        if (freq.frequencia < (turma.meta_frequencia ?? 75)) alunosEmRisco++
      }
    })
    const frequenciaMedia = countAlunos > 0 ? Math.round(somaFrequencia / countAlunos) : 0
    const proximaAula = todasAulas.value.filter(a => a.turma_id === turma.id && a.status === 'AGENDADA' && a.data >= hoje).sort((a, b) => a.data.localeCompare(b.data))[0]?.data || null
    return { ...turma, totalAlunos: alunos.length, aulasRealizadas: aulasRealizadas.length, frequenciaMedia, alunosEmRisco, proximaAula }
  })
)

const totalAlunos = computed(() => {
  const ids = new Set(todosVinculos.value.filter(v => v.usuarios?.ativo !== false).map(v => v.aluno_id))
  return ids.size
})
const totalAulasRealizadas = computed(() => todasAulas.value.filter(a => a.status === 'REALIZADA').length)
const frequenciaMediaGeral = computed(() => {
  const valores = resumoPorTurma.value.map(t => t.frequenciaMedia).filter(v => v > 0)
  if (valores.length === 0) return 0
  return Math.round(valores.reduce((a, b) => a + b, 0) / valores.length)
})
const alunosEmRisco = computed(() => {
  const lista = []
  turmas.value.forEach(turma => {
    alunosDaTurma(turma.id).forEach(v => {
      const freq = frequenciaAluno(v.aluno_id, turma.id)
      if (freq !== null && freq.frequencia < (turma.meta_frequencia ?? 75)) {
        lista.push({ alunoId: v.aluno_id, turmaId: turma.id, nome: v.usuarios?.nome || 'Aluno', turmaNome: turma.nome, ...freq })
      }
    })
  })
  return lista.sort((a, b) => a.frequencia - b.frequencia)
})

function formatarData(dataStr) {
  const d = new Date(dataStr + 'T12:00:00')
  const dia = d.toLocaleDateString('pt-BR', { weekday: 'long' }).replace('-feira', '')
  const data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${dia.charAt(0).toUpperCase() + dia.slice(1)}, ${data}`
}
</script>

<style>
@media print {
  .no-print { display: none !important; }
  body { background: white !important; }
}
</style>