<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <!-- Header -->
    <div class="mb-10 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold text-green-700">Dashboard</h1>
        <p class="text-gray-500 mt-2">Visão geral das suas turmas.</p>
        <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando...</span>
    </div>

    <div v-else class="space-y-8">

      <!-- ── PRÓXIMAS AULAS ── -->
      <div>
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">📅 Próximas aulas (30 dias)</h2>

        <div v-if="proximasAulas.length === 0" class="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-400 text-sm">
          Nenhuma aula agendada nos próximos 30 dias.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="aula in proximasAulas"
            :key="aula.id"
            class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-1"
          >
            <p class="text-xs font-semibold text-green-600 uppercase tracking-wide">{{ aula.turmaNome }}</p>
            <p class="text-base font-bold text-gray-800">{{ formatarDiaSemana(aula.data) }}</p>
            <p class="text-sm text-gray-500">{{ formatarDataCurta(aula.data) }}</p>
            <p class="text-xs text-gray-400 mt-1">daqui {{ diasAte(aula.data) }}</p>
          </div>
        </div>
      </div>

      <!-- ── FREQUÊNCIA POR TURMA + ALUNOS EM RISCO ── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Frequência por turma -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-6">📊 Frequência por turma</h2>

          <div v-if="resumoPorTurma.length === 0" class="text-sm text-gray-400 text-center py-8">
            Nenhuma aula realizada ainda.
          </div>

          <div v-else class="space-y-5">
            <div v-for="turma in resumoPorTurma" :key="turma.id">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-sm font-medium text-gray-700 truncate max-w-[60%]">{{ turma.nome }}</span>
                <span
                  class="text-sm font-bold"
                  :class="turma.frequenciaMedia >= turma.meta ? 'text-green-600' : 'text-red-500'"
                >
                  {{ turma.frequenciaMedia }}%
                </span>
              </div>

              <!-- Barra com marcador de meta -->
              <div class="relative w-full bg-gray-100 rounded-full h-3">
                <div
                  class="h-3 rounded-full transition-all duration-500"
                  :class="turma.frequenciaMedia >= turma.meta ? 'bg-green-500' : 'bg-red-400'"
                  :style="{ width: turma.frequenciaMedia + '%' }"
                ></div>
                <!-- marcador da meta -->
                <div
                  class="absolute top-0 h-3 w-0.5 bg-gray-500"
                  :style="{ left: turma.meta + '%' }"
                  :title="`Meta: ${turma.meta}%`"
                ></div>
              </div>

              <div class="flex justify-between text-xs text-gray-400 mt-1">
                <span>{{ turma.aulasRealizadas }} aula(s) realizada(s)</span>
                <span>meta {{ turma.meta }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Alunos em risco -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-6">⚠️ Alunos em risco</h2>

          <div v-if="alunosEmRisco.length === 0" class="text-sm text-gray-400 text-center py-8">
            🎉 Nenhum aluno abaixo da meta.
          </div>

          <ul v-else class="space-y-3 max-h-80 overflow-y-auto pr-1">
            <li
              v-for="aluno in alunosEmRisco"
              :key="aluno.alunoId + aluno.turmaId"
              class="flex items-center justify-between px-4 py-3 rounded-xl border border-red-100 bg-red-50"
            >
              <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-800 truncate">{{ aluno.nome }}</p>
                <p class="text-xs text-gray-400 truncate">{{ aluno.turmaNome }}</p>
              </div>
              <div class="flex items-center gap-3 flex-shrink-0 ml-3">
                <div class="text-right">
                  <p class="text-sm font-bold text-red-600">{{ aluno.frequencia }}%</p>
                  <p class="text-xs text-gray-400">{{ aluno.presencas }}/{{ aluno.aulasRealizadas }}</p>
                </div>

                <!-- Já notificado esta semana — só badge, sem botão -->
                <span
                  v-if="notificadosIds.has(aluno.alunoId + aluno.turmaId)"
                  class="text-xs px-3 py-1.5 rounded-lg font-semibold bg-gray-100 text-gray-400"
                  title="Notificação já enviada nesta semana"
                >
                  ✓ Enviado
                </span>

                <!-- Ainda não notificado — botão ativo -->
                <button
                  v-else
                  @click="notificarAluno(aluno)"
                  :disabled="notificandoId === (aluno.alunoId + aluno.turmaId)"
                  class="text-xs px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50"
                  title="Enviar alerta ao aluno"
                >
                  <div
                    v-if="notificandoId === (aluno.alunoId + aluno.turmaId)"
                    class="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"
                  ></div>
                  <span v-else>🔔 Notificar</span>
                </button>
              </div>
            </li>
          </ul>
          
        </div>

      </div>

      <!-- ── EVOLUÇÃO DA FREQUÊNCIA ── -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide">📈 Evolução da frequência por aula</h2>

          <select
            v-model="turmaSelecionadaGrafico"
            class="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          >
            <option value="todas">Todas as turmas</option>
            <option v-for="t in turmas" :key="t.id" :value="t.id">{{ t.nome }}</option>
          </select>
        </div>

        <div v-if="dadosGrafico.labels.length === 0" class="text-sm text-gray-400 text-center py-12">
          Nenhuma aula realizada para exibir evolução.
        </div>

        <div v-else class="h-64">
          <Line :data="dadosGrafico" :options="opcoesGrafico" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { supabase } from '~/utils/supabase'
import { calcularFrequenciaSync } from '~/composables/usePresenca'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler)

definePageMeta({ middleware: 'professor' })

const { user } = useAuth()

const loading = ref(true)
const turmas = ref([])
const todasAulas = ref([])
const todasPresencas = ref([])
const todasJustificativas = ref([]) // NOVO
const todosVinculos = ref([])
const turmaSelecionadaGrafico = ref('todas')

const coresTurmas = [
  { border: '#16a34a', background: 'rgba(22,163,74,0.08)' },
  { border: '#2563eb', background: 'rgba(37,99,235,0.08)' },
  { border: '#d97706', background: 'rgba(217,119,6,0.08)' },
  { border: '#7c3aed', background: 'rgba(124,58,237,0.08)' },
  { border: '#db2777', background: 'rgba(219,39,119,0.08)' },
]

onMounted(async () => {
  const professorId = user.value?.id
  if (!professorId) { loading.value = false; return }

  const [
    { data: turmasData },
    { data: aulasData },
    { data: presencasData },
    { data: vinculosData },
    { data: justificativasData },
    { data: notificacoesData },
  ] = await Promise.all([
    supabase.from('turma').select('id, nome, meta_frequencia').eq('professor_id', professorId).eq('status', 'ATIVA').order('nome'),
    supabase.from('aula').select('id, turma_id, data, status').order('data', { ascending: true }),
    supabase.from('presenca').select('aula_id, aluno_id'),
    supabase.from('turma_aluno').select('turma_id, aluno_id, usuarios(id, nome, ativo)'),
    supabase.from('justificativa_falta').select('aluno_id, aula_id').eq('status', 'ACEITA'), // NOVO
    supabase
      .from('notificacao_risco')
      .select('aluno_id, turma_id')
      .eq('professor_id', professorId)
      .gte('dt_inclusao', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ])

  turmas.value = turmasData || []
  todasAulas.value = aulasData || []
  todasPresencas.value = presencasData || []
  todosVinculos.value = vinculosData || []
  todasJustificativas.value = justificativasData || [] // NOVO

  notificadosIds.value = new Set(
    (notificacoesData || []).map(n => n.aluno_id + n.turma_id)
  )

    // Logo após o Promise.all, antes de loading.value = false
  console.log('notificacoesData:', notificacoesData)
  console.log('notificadosIds montados:', [...notificadosIds.value])

  // E no alunosEmRisco, adiciona:
  console.log('chaves em risco:', alunosEmRisco.value.map(a => a.alunoId + a.turmaId))

  loading.value = false
})

// ── Helpers ──────────────────────────────────────────────────────

function aulasRealizadasDaTurma(turmaId) {
  return todasAulas.value.filter(a => a.turma_id === turmaId && a.status === 'REALIZADA')
}

function alunosAtivosDaTurma(turmaId) {
  return todosVinculos.value.filter(v => v.turma_id === turmaId && v.usuarios?.ativo !== false)
}

// ATUALIZADO — usa calcularFrequenciaSync
function frequenciaAlunoNaTurma(alunoId, turmaId) {
  const aulas = aulasRealizadasDaTurma(turmaId)
  if (aulas.length === 0) return null

  const aulasIds = aulas.map(a => a.id)

  const presencasArr = todasPresencas.value
    .filter(p => p.aluno_id === alunoId)
    .map(p => ({ aluno_id: p.aluno_id, aula_id: p.aula_id }))

  const justAceitas = todasJustificativas.value
    .filter(j => j.aluno_id === alunoId)
    .map(j => ({ aluno_id: j.aluno_id, aula_id: j.aula_id }))

  return calcularFrequenciaSync(alunoId, aulasIds, presencasArr, justAceitas)
}

// ── Próximas aulas ────────────────────────────────────────────────

const proximasAulas = computed(() => {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const limite = new Date(hoje)
  limite.setDate(limite.getDate() + 30)
  const hojeStr = hoje.toISOString().split('T')[0]
  const limiteStr = limite.toISOString().split('T')[0]

  const turmasMap = Object.fromEntries(turmas.value.map(t => [t.id, t.nome]))

  return todasAulas.value
    .filter(a => a.status === 'AGENDADA' && a.data >= hojeStr && a.data <= limiteStr && turmasMap[a.turma_id])
    .map(a => ({ ...a, turmaNome: turmasMap[a.turma_id] }))
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 8)
})

// ── Frequência por turma ─────────────────────────────────────────

const resumoPorTurma = computed(() =>
  turmas.value.map(turma => {
    const alunos = alunosAtivosDaTurma(turma.id)
    const aulasRealizadas = aulasRealizadasDaTurma(turma.id)
    let soma = 0, count = 0

    alunos.forEach(v => {
      const freq = frequenciaAlunoNaTurma(v.aluno_id, turma.id)
      if (freq !== null) { soma += freq.frequencia; count++ }
    })

    return {
      id: turma.id,
      nome: turma.nome,
      meta: turma.meta_frequencia ?? 75,
      aulasRealizadas: aulasRealizadas.length,
      frequenciaMedia: count > 0 ? Math.round(soma / count) : 0,
    }
  }).filter(t => t.aulasRealizadas > 0)
)

// ── Alunos em risco ──────────────────────────────────────────────

const alunosEmRisco = computed(() => {
  const lista = []
  turmas.value.forEach(turma => {
    alunosAtivosDaTurma(turma.id).forEach(v => {
      const freq = frequenciaAlunoNaTurma(v.aluno_id, turma.id)
      if (freq !== null && freq.frequencia < (turma.meta_frequencia ?? 75)) {
        lista.push({
          alunoId: v.aluno_id,
          turmaId: turma.id,
          nome: v.usuarios?.nome || 'Aluno',
          turmaNome: turma.nome,
          presencas: freq.totalValidas, // ATUALIZADO — mostra válidas (presença + justificada)
          aulasRealizadas: freq.aulasRealizadas,
          frequencia: freq.frequencia,
        })
      }
    })
  })
  return lista.sort((a, b) => a.frequencia - b.frequencia)
})

// ── Gráfico de evolução ──────────────────────────────────────────
// ATUALIZADO — considera justificativas aceitas na frequência acumulada

const dadosGrafico = computed(() => {
  const turmasFiltradas = turmaSelecionadaGrafico.value === 'todas'
    ? turmas.value
    : turmas.value.filter(t => t.id === turmaSelecionadaGrafico.value)

  const todasAulasRealizadas = todasAulas.value
    .filter(a => a.status === 'REALIZADA' && turmasFiltradas.some(t => t.id === a.turma_id))
    .sort((a, b) => a.data.localeCompare(b.data))

  if (todasAulasRealizadas.length === 0) return { labels: [], datasets: [] }

  const datasets = turmasFiltradas.map((turma, i) => {
    const aulasDataTurma = todasAulasRealizadas.filter(a => a.turma_id === turma.id)
    const alunos = alunosAtivosDaTurma(turma.id)
    const cor = coresTurmas[i % coresTurmas.length]

    const dados = aulasDataTurma.map((_, idx) => {
      const aulasAte = aulasDataTurma.slice(0, idx + 1).map(a => a.id)
      let soma = 0, count = 0

      alunos.forEach(v => {
        const freq = calcularFrequenciaSync(
          v.aluno_id,
          aulasAte,
          todasPresencas.value.map(p => ({ aluno_id: p.aluno_id, aula_id: p.aula_id })),
          todasJustificativas.value.map(j => ({ aluno_id: j.aluno_id, aula_id: j.aula_id }))
        )
        soma += freq.frequencia
        count++
      })

      return count > 0 ? Math.round(soma / count) : 0
    })

    return {
      label: turma.nome,
      data: dados,
      borderColor: cor.border,
      backgroundColor: cor.background,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.3,
      fill: turmaSelecionadaGrafico.value !== 'todas',
    }
  }).filter(d => d.data.length > 0)

  let labels
  if (turmaSelecionadaGrafico.value !== 'todas') {
    const turmaId = turmaSelecionadaGrafico.value
    labels = todasAulasRealizadas
      .filter(a => a.turma_id === turmaId)
      .map(a => formatarDataCurta(a.data))
  } else {
    const max = Math.max(...datasets.map(d => d.data.length))
    labels = Array.from({ length: max }, (_, i) => `Aula ${i + 1}`)
  }

  return { labels, datasets }
})

const opcoesGrafico = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: { boxWidth: 12, font: { size: 11 } },
    },
    tooltip: {
      callbacks: {
        label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%`,
      },
    },
  },
  scales: {
    y: {
      min: 0,
      max: 100,
      ticks: { callback: v => v + '%', font: { size: 11 } },
      grid: { color: 'rgba(0,0,0,0.05)' },
    },
    x: {
      ticks: { font: { size: 10 } },
      grid: { display: false },
    },
  },
}

const notificandoId = ref(null)
const notificadosIds = ref(new Set())

async function notificarAluno(aluno) {
  const chave = aluno.alunoId + aluno.turmaId
  if (notificadosIds.value.has(chave)) return

  notificandoId.value = chave
  const { $toast } = useNuxtApp()

  const mensagem = `Sua frequência na turma "${aluno.turmaNome}" está em ${aluno.frequencia}%, abaixo da meta. Procure comparecer às próximas aulas para evitar reprovação por falta.`

  const { error } = await supabase.from('notificacao_risco').insert({
    aluno_id: aluno.alunoId,
    professor_id: user.value?.id,
    turma_id: aluno.turmaId,
    mensagem,
  })

  if (error) {
    $toast.error('Erro ao enviar notificação.')
  } else {
    // Atualiza o Set de forma reativa — cria novo Set para Vue detectar a mudança
    notificadosIds.value = new Set([...notificadosIds.value, chave])
    $toast.success(`${aluno.nome} foi notificado.`)
  }

  notificandoId.value = null
}
// ── Formatação ───────────────────────────────────────────────────

function formatarDiaSemana(dataStr) {
  const d = new Date(dataStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'long' })
}

function formatarDataCurta(dataStr) {
  const d = new Date(dataStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function diasAte(dataStr) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const alvo = new Date(dataStr + 'T12:00:00')
  const diff = Math.round((alvo - hoje) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'amanhã'
  return `${diff} dias`
}

</script>