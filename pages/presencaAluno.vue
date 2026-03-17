<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-green-700">Presença - Aluno</h1>
      <p class="text-gray-500 mt-2">Acompanhe sua frequência ao longo do curso.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando presenças...</span>
    </div>

    <!-- Sem turma -->
    <div
      v-else-if="!turma"
      class="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center"
    >
      <p class="text-4xl mb-4">📚</p>
      <p class="text-gray-500 font-medium">Você ainda não está matriculado em nenhuma turma.</p>
    </div>

    <div v-else>

      <!-- Nome da turma -->
      <div class="mb-6">
        <span class="text-sm text-gray-500">Turma: </span>
        <span class="text-sm font-semibold text-green-700">{{ turma.nome }}</span>
      </div>

      <!-- Grid principal -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Lista de aulas -->
        <div class="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <h2 class="text-lg font-semibold text-gray-800 mb-6">Registro de Aulas</h2>

          <p v-if="aulas.length === 0" class="text-sm text-gray-400 text-center py-8">
            Nenhuma aula cadastrada nesta turma.
          </p>

          <ul v-else class="space-y-3">
            <li
              v-for="aula in aulasComStatus"
              :key="aula.id"
              class="flex justify-between items-center px-5 py-4 rounded-xl border transition"
              :class="rowClass(aula.statusAluno)"
            >
              <span class="font-medium text-gray-700 text-sm">
                {{ formatarData(aula.data) }}
              </span>

              <span
                class="px-3 py-1 rounded-full text-xs font-semibold"
                :class="badgeClass(aula.statusAluno)"
              >
                {{ labelStatus(aula.statusAluno) }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Frequência geral -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center">
          <h2 class="text-lg font-semibold text-gray-800 mb-6">Frequência Geral</h2>

          <!-- Sem aulas realizadas -->
          <div v-if="aulasRealizadas.length === 0" class="flex flex-col items-center justify-center flex-1 text-center">
            <p class="text-4xl mb-3">📅</p>
            <p class="text-sm text-gray-400">Nenhuma aula realizada ainda.</p>
          </div>

          <template v-else>
            <!-- Gráfico -->
            <div class="relative h-40 w-40 mb-6">
              <Doughnut :data="donutData" :options="donutOptions" />
              <div class="absolute inset-0 flex items-center justify-center">
                <p class="text-2xl font-bold text-gray-800">{{ percentual }}%</p>
              </div>
            </div>

            <!-- Resumo -->
            <div class="flex gap-8 text-sm mb-4">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-green-500"></span>
                <span class="text-gray-700">{{ totalPresencas }} presença(s)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-red-500"></span>
                <span class="text-gray-700">{{ totalFaltas }} falta(s)</span>
              </div>
            </div>

            <p class="text-xs text-gray-400 text-center">
              Aulas agendadas não entram no cálculo
            </p>
          </template>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { supabase } from '@/utils/supabase'

ChartJS.register(ArcElement, Tooltip, Legend)

const loading = ref(true)
const turma = ref(null)
const aulas = ref([])
const presencasAluno = ref([]) // Set de aula_ids em que o aluno estava presente

// ─── Carregar dados ───────────────────────────────────────────────
onMounted(async () => {
  const stored = localStorage.getItem('user')
  const alunoId = stored ? JSON.parse(stored)?.id : null

  if (!alunoId) { loading.value = false; return }

  // 1. Buscar turma do aluno
  const { data: vinculo } = await supabase
    .from('turma_aluno')
    .select('turma_id, turma(id, nome)')
    .eq('aluno_id', alunoId)
    .single()

  if (!vinculo) { loading.value = false; return }

  turma.value = vinculo.turma

  // 2. Buscar todas as aulas da turma
  const { data: aulasData } = await supabase
    .from('aula')
    .select('id, data, status')
    .eq('turma_id', turma.value.id)
    .order('data', { ascending: true })

  aulas.value = aulasData || []

  // 3. Buscar presenças do aluno
  const { data: presencasData } = await supabase
    .from('presenca')
    .select('aula_id')
    .eq('aluno_id', alunoId)
    .eq('status', 'PRESENTE')

  presencasAluno.value = new Set((presencasData || []).map(p => p.aula_id))

  loading.value = false
})

// ─── Cruzar aulas com presenças ───────────────────────────────────
// statusAluno: 'PRESENTE' | 'FALTA' | 'AGENDADA' | 'CANCELADA'
const aulasComStatus = computed(() =>
  aulas.value.map(aula => {
    let statusAluno
    if (aula.status === 'CANCELADA') {
      statusAluno = 'CANCELADA'
    } else if (aula.status === 'AGENDADA') {
      statusAluno = 'AGENDADA'
    } else if (presencasAluno.value.has(aula.id)) {
      statusAluno = 'PRESENTE'
    } else {
      statusAluno = 'FALTA'
    }
    return { ...aula, statusAluno }
  })
)

// Apenas aulas realizadas entram no cálculo
const aulasRealizadas = computed(() =>
  aulasComStatus.value.filter(a => a.statusAluno === 'PRESENTE' || a.statusAluno === 'FALTA')
)

const totalPresencas = computed(() =>
  aulasRealizadas.value.filter(a => a.statusAluno === 'PRESENTE').length
)

const totalFaltas = computed(() =>
  aulasRealizadas.value.filter(a => a.statusAluno === 'FALTA').length
)

const percentual = computed(() => {
  if (aulasRealizadas.value.length === 0) return 0
  return Math.round((totalPresencas.value / aulasRealizadas.value.length) * 100)
})

// ─── Gráfico ──────────────────────────────────────────────────────
const donutData = computed(() => ({
  labels: ['Presenças', 'Faltas'],
  datasets: [{
    data: [totalPresencas.value, totalFaltas.value],
    backgroundColor: ['#16a34a', '#ef4444'],
    borderWidth: 0
  }]
}))

const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: { legend: { display: false } }
}

// ─── Helpers visuais ──────────────────────────────────────────────
function formatarData(dataStr) {
  const d = new Date(dataStr + 'T12:00:00')
  const dia = d.toLocaleDateString('pt-BR', { weekday: 'long' })
    .replace('-feira', '')
  const data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${dia.charAt(0).toUpperCase() + dia.slice(1)}, ${data}`
}

function rowClass(status) {
  if (status === 'PRESENTE') return 'border-green-200 bg-green-50'
  if (status === 'FALTA') return 'border-red-200 bg-red-50'
  if (status === 'CANCELADA') return 'border-gray-200 bg-gray-100'
  return 'border-gray-200 bg-gray-50' // AGENDADA
}

function badgeClass(status) {
  if (status === 'PRESENTE') return 'bg-green-100 text-green-700'
  if (status === 'FALTA') return 'bg-red-100 text-red-600'
  if (status === 'CANCELADA') return 'bg-gray-200 text-gray-500'
  return 'bg-yellow-100 text-yellow-700' // AGENDADA
}

function labelStatus(status) {
  if (status === 'PRESENTE') return 'Presente'
  if (status === 'FALTA') return 'Falta'
  if (status === 'CANCELADA') return 'Cancelada'
  return 'Agendada'
}
</script>