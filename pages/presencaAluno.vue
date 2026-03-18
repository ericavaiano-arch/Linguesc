<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-green-700">Minha Presença</h1>
      <p class="text-gray-500 mt-2">Acompanhe sua frequência ao longo do curso.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando presenças...</span>
    </div>

    <div v-else-if="!turma" class="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
      <p class="text-4xl mb-4">📚</p>
      <p class="text-gray-500 font-medium">Você ainda não está matriculado em nenhuma turma.</p>
    </div>

    <div v-else class="space-y-8">
      <p class="text-sm text-gray-500">
        Turma: <span class="font-semibold text-green-700">{{ turma.nome }}</span>
        <span class="ml-2 text-gray-400">· Meta: {{ turma.meta_frequencia }}%</span>
      </p>

      <div class="bg-white border rounded-2xl p-6 shadow-sm" :class="statusMeta.cor === 'green' ? 'border-green-200' : statusMeta.cor === 'yellow' ? 'border-yellow-200' : 'border-red-200'">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">🎯 Meta de Frequência</h2>
            <p class="text-xs text-gray-400 mt-0.5">Baseado nas aulas já realizadas</p>
          </div>
          <span class="text-2xl font-bold" :class="statusMeta.cor === 'green' ? 'text-green-600' : statusMeta.cor === 'yellow' ? 'text-yellow-600' : 'text-red-600'">{{ percentual }}%</span>
        </div>
        <div class="relative w-full bg-gray-100 rounded-full h-3 mb-1">
          <div class="h-3 rounded-full transition-all duration-500" :class="statusMeta.cor === 'green' ? 'bg-green-500' : statusMeta.cor === 'yellow' ? 'bg-yellow-400' : 'bg-red-500'" :style="{ width: Math.min(percentual, 100) + '%' }"></div>
          <div class="absolute top-0 h-3 w-0.5 bg-gray-500 opacity-50" :style="{ left: turma.meta_frequencia + '%' }"></div>
        </div>
        <div class="flex items-center justify-between text-xs text-gray-400 mb-5">
          <span>0%</span>
          <span class="font-medium text-gray-500">▲ Meta: {{ turma.meta_frequencia }}%</span>
          <span>100%</span>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-5">
          <div class="text-center p-3 bg-gray-50 rounded-xl">
            <p class="text-xl font-bold text-gray-800">{{ totalPresencas }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Presenças</p>
          </div>
          <div class="text-center p-3 bg-gray-50 rounded-xl">
            <p class="text-xl font-bold text-gray-800">{{ totalFaltas }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Faltas</p>
          </div>
          <div class="text-center p-3 bg-gray-50 rounded-xl">
            <p class="text-xl font-bold text-gray-800">{{ aulasRealizadas.length }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Aulas</p>
          </div>
        </div>
        <div class="rounded-xl px-4 py-3 text-sm font-medium" :class="statusMeta.cor === 'green' ? 'bg-green-50 text-green-700' : statusMeta.cor === 'yellow' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'">
          {{ statusMeta.mensagem }}
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-800 mb-6">Registro de Aulas</h2>
        <p v-if="aulas.length === 0" class="text-sm text-gray-400 text-center py-8">Nenhuma aula cadastrada nesta turma.</p>
        <ul v-else class="space-y-3">
          <li v-for="aula in aulasComStatus" :key="aula.id" class="flex justify-between items-center px-5 py-4 rounded-xl border transition" :class="rowClass(aula.statusAluno)">
            <span class="font-medium text-gray-700 text-sm">{{ formatarData(aula.data) }}</span>
            <span class="px-3 py-1 rounded-full text-xs font-semibold" :class="badgeClass(aula.statusAluno)">{{ labelStatus(aula.statusAluno) }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

import { supabase } from '@/utils/supabase'

const { user } = useAuth()
const loading = ref(true)
const turma = ref(null)
const aulas = ref([])
const presencasAluno = ref(new Set())

onMounted(async () => {
  const alunoId = user.value?.id
  if (!alunoId) { loading.value = false; return }

  const { data: vinculo } = await supabase
    .from('turma_aluno')
    .select('turma_id, turma(id, nome, meta_frequencia)')
    .eq('aluno_id', alunoId)
    .single()

  if (!vinculo) { loading.value = false; return }
  turma.value = vinculo.turma

  const { data: aulasData } = await supabase.from('aula').select('id, data, status').eq('turma_id', turma.value.id).order('data', { ascending: true })
  aulas.value = aulasData || []

  const { data: presencasData } = await supabase.from('presenca').select('aula_id').eq('aluno_id', alunoId).eq('status', 'PRESENTE')
  presencasAluno.value = new Set((presencasData || []).map(p => p.aula_id))
  loading.value = false
})

const aulasComStatus = computed(() =>
  aulas.value.map(aula => {
    let statusAluno
    if (aula.status === 'CANCELADA') statusAluno = 'CANCELADA'
    else if (aula.status === 'AGENDADA') statusAluno = 'AGENDADA'
    else if (presencasAluno.value.has(aula.id)) statusAluno = 'PRESENTE'
    else statusAluno = 'FALTA'
    return { ...aula, statusAluno }
  })
)
const aulasRealizadas = computed(() => aulasComStatus.value.filter(a => a.statusAluno === 'PRESENTE' || a.statusAluno === 'FALTA'))
const totalPresencas = computed(() => aulasRealizadas.value.filter(a => a.statusAluno === 'PRESENTE').length)
const totalFaltas = computed(() => aulasRealizadas.value.filter(a => a.statusAluno === 'FALTA').length)
const percentual = computed(() => {
  if (aulasRealizadas.value.length === 0) return 0
  return Math.round((totalPresencas.value / aulasRealizadas.value.length) * 100)
})
const statusMeta = computed(() => {
  const meta = turma.value?.meta_frequencia ?? 75
  const total = aulasRealizadas.value.length
  const freq = percentual.value
  if (total === 0) return { cor: 'green', mensagem: 'Nenhuma aula realizada ainda. Sua frequência está em dia! 🎉' }
  if (freq >= meta) {
    const maxFaltas = Math.floor(total * (1 - meta / 100))
    const faltasRestantes = maxFaltas - totalFaltas.value
    if (faltasRestantes <= 0) return { cor: 'yellow', mensagem: `Você atingiu a meta, mas não pode mais faltar para mantê-la. ⚠️` }
    return { cor: 'green', mensagem: `Você está acima da meta de presença! 🎉` }
  }
  const presencasNecessarias = Math.ceil((meta / 100) * total) - totalPresencas.value
  return { cor: 'red', mensagem: `Frequência abaixo da meta de ${meta}%. Você precisaria ter comparecido em mais ${presencasNecessarias} aula(s) das já realizadas. ❌` }
})

function formatarData(dataStr) {
  const d = new Date(dataStr + 'T12:00:00')
  const dia = d.toLocaleDateString('pt-BR', { weekday: 'long' }).replace('-feira', '')
  const data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${dia.charAt(0).toUpperCase() + dia.slice(1)}, ${data}`
}
function rowClass(status) {
  if (status === 'PRESENTE') return 'border-green-200 bg-green-50'
  if (status === 'FALTA') return 'border-red-200 bg-red-50'
  if (status === 'CANCELADA') return 'border-gray-200 bg-gray-100'
  return 'border-gray-200 bg-gray-50'
}
function badgeClass(status) {
  if (status === 'PRESENTE') return 'bg-green-100 text-green-700'
  if (status === 'FALTA') return 'bg-red-100 text-red-600'
  if (status === 'CANCELADA') return 'bg-gray-200 text-gray-500'
  return 'bg-yellow-100 text-yellow-700'
}
function labelStatus(status) {
  if (status === 'PRESENTE') return 'Presente'
  if (status === 'FALTA') return 'Falta'
  if (status === 'CANCELADA') return 'Cancelada'
  return 'Agendada'
}
</script>