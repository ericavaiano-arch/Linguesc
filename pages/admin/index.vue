<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <div class="mb-10 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold text-green-700">Dashboard Admin</h1>
        <p class="text-gray-500 mt-2">Visão geral de todas as turmas e professores.</p>
        <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white border border-gray-200 rounded-2xl p-4 mb-8 flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-3">
        <label class="text-sm font-medium text-gray-600">Professor:</label>
        <select
          v-model="professorFiltro"
          class="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        >
          <option value="">Todos os professores</option>
          <option v-for="prof in professores" :key="prof.id" :value="prof.id">
            {{ prof.nome }}
          </option>
        </select>
      </div>

      <div class="flex items-center gap-3">
        <label class="text-sm font-medium text-gray-600">Semestre:</label>
        <select
          v-model="semestreFiltro"
          class="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        >
          <option value="">Todos</option>
          <option v-for="s in semestresDisponiveis" :key="s" :value="s">
            {{ s }}
          </option>
        </select>
      </div>

      <div class="flex items-center gap-3">
        <label class="text-sm font-medium text-gray-600">Status:</label>
        <select
          v-model="statusFiltro"
          class="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        >
          <option value="ATIVA">Ativas</option>
          <option value="FINALIZADA">Finalizadas</option>
          <option value="">Todas</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando...</span>
    </div>

    <div v-else class="space-y-8">

      <!-- Resumo geral -->
      <div class="border border-gray-200 rounded-2xl bg-white overflow-hidden">
        <span class="block text-xs text-gray-400 uppercase tracking-widest px-6 py-2 bg-gray-50 border-b border-gray-200">
          Resumo geral
        </span>
        <div class="flex flex-col md:flex-row">
          <div class="flex-1 flex flex-col gap-1 px-6 py-5 border-b md:border-b-0 md:border-r border-gray-200">
            <span class="text-xs text-gray-500 uppercase tracking-wide">Turmas</span>
            <span class="text-3xl font-semibold text-gray-900">{{ turmasFiltradas.length }}</span>
            <span class="text-xs text-gray-400">no período selecionado</span>
          </div>
          <div class="flex-1 flex flex-col gap-1 px-6 py-5 border-b md:border-b-0 md:border-r border-gray-200">
            <span class="text-xs text-gray-500 uppercase tracking-wide">Alunos ativos</span>
            <span class="text-3xl font-semibold text-gray-900">{{ totalAlunosAtivos }}</span>
            <span class="text-xs text-gray-400">matriculados nas turmas</span>
          </div>
          <div class="flex-1 flex flex-col gap-1 px-6 py-5 border-b md:border-b-0 md:border-r border-gray-200">
            <span class="text-xs text-gray-500 uppercase tracking-wide">Frequência média</span>
            <span
              class="text-3xl font-semibold"
              :class="frequenciaGeralMedia >= metaFrequencia ? 'text-green-700' : 'text-red-600'"
            >{{ frequenciaGeralMedia }}%</span>
            <span class="text-xs font-medium px-2 py-0.5 rounded-full w-fit"
              :class="frequenciaGeralMedia >= metaFrequencia ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
            >
              {{ frequenciaGeralMedia >= metaFrequencia ? 'acima da meta' : 'abaixo da meta' }}
            </span>
          </div>
          <div class="flex-1 flex flex-col gap-1 px-6 py-5">
            <span class="text-xs text-gray-500 uppercase tracking-wide">Alunos com frequência abaixo da meta</span>
            <span class="text-3xl font-semibold" :class="alunosEmRisco.length > 0 ? 'text-red-600' : 'text-green-700'">
              {{ alunosEmRisco.length }}
            </span>
            <span class="text-xs font-medium px-2 py-0.5 rounded-full w-fit"
              :class="alunosEmRisco.length > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'"
            >
              {{ alunosEmRisco.length > 0 ? 'abaixo da meta' : 'todos na meta' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Frequência por turma + Alunos em risco -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-6">📊 Frequência por turma</h2>

          <div v-if="resumoPorTurma.length === 0" class="text-sm text-gray-400 text-center py-8">
            Nenhuma aula realizada ainda.
          </div>

          <div v-else class="space-y-5">
            <div v-for="turma in resumoPorTurma" :key="turma.id">
              <div class="flex items-center justify-between mb-1.5">
                <div class="min-w-0 flex-1 mr-3">
                  <span class="text-sm font-medium text-gray-700 truncate block">{{ turma.nome }}</span>
                  <span class="text-xs text-gray-400">{{ turma.professorNome }}</span>
                </div>
                <span
                  class="text-sm font-bold flex-shrink-0"
                  :class="turma.frequenciaMedia >= metaFrequencia ? 'text-green-600' : 'text-red-500'"
                >
                  {{ turma.frequenciaMedia }}%
                </span>
              </div>

              <div class="relative w-full bg-gray-100 rounded-full h-3">
                <div
                  class="h-3 rounded-full transition-all duration-500"
                  :class="turma.frequenciaMedia >= metaFrequencia ? 'bg-green-500' : 'bg-red-400'"
                  :style="{ width: turma.frequenciaMedia + '%' }"
                ></div>
                <div
                  class="absolute top-0 h-3 w-0.5 bg-gray-500"
                  :style="{ left: metaFrequencia + '%' }"
                  :title="`Meta: ${metaFrequencia}%`"
                ></div>
              </div>

              <div class="flex justify-between text-xs text-gray-400 mt-1">
                <span>{{ turma.aulasRealizadas }} aula(s) realizada(s)</span>
                <span>meta {{ metaFrequencia }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-6">⚠️ Frequência abaixo da meta</h2>

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
                <p class="text-xs text-gray-400 truncate">{{ aluno.professorNome }}</p>
              </div>
              <div class="flex-shrink-0 ml-3 text-right">
                <p class="text-sm font-bold text-red-600">{{ aluno.frequencia }}%</p>
                <p class="text-xs text-gray-400">{{ aluno.presencas }}/{{ aluno.aulasRealizadas }}</p>
              </div>
            </li>
          </ul>
        </div>

      </div>

      <!-- Gráfico de evolução -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide">📈 Evolução da frequência por aula</h2>

          <select
            v-model="turmaSelecionadaGrafico"
            class="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          >
            <option value="todas">Todas as turmas</option>
            <option v-for="t in turmasFiltradas" :key="t.id" :value="t.id">{{ t.nome }}</option>
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

definePageMeta({ middleware: 'admin' })

const { metaFrequencia, carregarConfig } = useConfigSistema()

const loading = ref(true)
const todasTurmas = ref([])
const todasAulas = ref([])
const todasPresencas = ref([])
const todasJustificativas = ref([])
const todosVinculos = ref([])
const professores = ref([])

const professorFiltro = ref('')
const statusFiltro = ref('ATIVA')
const semestreFiltro = ref(semestreAtual())
const turmaSelecionadaGrafico = ref('todas')

const coresTurmas = [
  { border: '#16a34a', background: 'rgba(22,163,74,0.08)' },
  { border: '#2563eb', background: 'rgba(37,99,235,0.08)' },
  { border: '#d97706', background: 'rgba(217,119,6,0.08)' },
  { border: '#7c3aed', background: 'rgba(124,58,237,0.08)' },
  { border: '#db2777', background: 'rgba(219,39,119,0.08)' },
]

// Retorna semestre atual no formato YYYY/0X
function semestreAtual() {
  const now = new Date()
  const ano = now.getFullYear()
  const sem = now.getMonth() < 6 ? '01' : '02'
  return `${ano}/${sem}`
}

// Extrai semestre do nome da turma: "Básico 1 - 2026/01" → "2026/01"
function extrairSemestre(nome) {
  const match = nome?.match(/(\d{4}\/\d{2})$/)
  return match ? match[1] : null
}

onMounted(async () => {
  await Promise.all([
    carregarConfig(),
    (async () => {
      const [
        { data: turmasData },
        { data: aulasData },
        { data: presencasData },
        { data: vinculosData },
        { data: justificativasData },
        { data: professoresData },
      ] = await Promise.all([
        supabase.from('turma').select('id, nome, professor_id, status').order('nome'),
        supabase.from('aula').select('id, turma_id, data, status').order('data', { ascending: true }),
        supabase.from('presenca').select('aula_id, aluno_id'),
        supabase.from('turma_aluno').select('turma_id, aluno_id, usuarios(id, nome, ativo)'),
        supabase.from('justificativa_falta').select('aluno_id, aula_id').eq('status', 'ACEITA'),
        supabase
          .from('usuario_papel')
          .select('usuarios!inner(id, nome, ativo)')
          .eq('papel', 'PROFESSOR')
          .eq('ativo', true)
          .eq('usuarios.ativo', true),
      ])

      todasTurmas.value = turmasData || []
      todasAulas.value = aulasData || []
      todasPresencas.value = presencasData || []
      todosVinculos.value = vinculosData || []
      todasJustificativas.value = justificativasData || []
      professores.value = professoresData?.map((d) => d.usuarios).filter(Boolean) || []
    })(),
  ])

  loading.value = false
})

// ── Semestres disponíveis extraídos dos nomes das turmas ─────────
const semestresDisponiveis = computed(() => {
  const set = new Set()
  todasTurmas.value.forEach(t => {
    const s = extrairSemestre(t.nome)
    if (s) set.add(s)
  })
  return [...set].sort().reverse()
})

// ── Turmas filtradas pelos 3 filtros ─────────────────────────────
const turmasFiltradas = computed(() => {
  return todasTurmas.value.filter(t => {
    if (professorFiltro.value && t.professor_id !== professorFiltro.value) return false
    if (statusFiltro.value && t.status !== statusFiltro.value) return false
    if (semestreFiltro.value) {
      const sem = extrairSemestre(t.nome)
      if (sem !== semestreFiltro.value) return false
    }
    return true
  })
})

const turmasFiltradasIds = computed(() => new Set(turmasFiltradas.value.map(t => t.id)))

const professoresMap = computed(() =>
  Object.fromEntries(professores.value.map(p => [p.id, p.nome]))
)

// ── Helpers ──────────────────────────────────────────────────────
function aulasRealizadasDaTurma(turmaId) {
  return todasAulas.value.filter(a => a.turma_id === turmaId && a.status === 'REALIZADA')
}

function alunosAtivosDaTurma(turmaId) {
  return todosVinculos.value.filter(v => v.turma_id === turmaId && v.usuarios?.ativo !== false)
}

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

// ── Totais do resumo ─────────────────────────────────────────────
const totalAlunosAtivos = computed(() => {
  const ids = new Set()
  turmasFiltradas.value.forEach(t => {
    alunosAtivosDaTurma(t.id).forEach(v => ids.add(v.aluno_id))
  })
  return ids.size
})

const frequenciaGeralMedia = computed(() => {
  let soma = 0, count = 0
  turmasFiltradas.value.forEach(t => {
    alunosAtivosDaTurma(t.id).forEach(v => {
      const freq = frequenciaAlunoNaTurma(v.aluno_id, t.id)
      if (freq !== null) { soma += freq.frequencia; count++ }
    })
  })
  return count > 0 ? Math.round(soma / count) : 0
})

// ── Frequência por turma ─────────────────────────────────────────
const resumoPorTurma = computed(() =>
  turmasFiltradas.value.map(turma => {
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
      professorNome: professoresMap.value[turma.professor_id] ?? '—',
      aulasRealizadas: aulasRealizadas.length,
      frequenciaMedia: count > 0 ? Math.round(soma / count) : 0,
    }
  }).filter(t => t.aulasRealizadas > 0)
)

// ── Alunos em risco ──────────────────────────────────────────────
const alunosEmRisco = computed(() => {
  const lista = []
  turmasFiltradas.value.forEach(turma => {
    alunosAtivosDaTurma(turma.id).forEach(v => {
      const freq = frequenciaAlunoNaTurma(v.aluno_id, turma.id)
      if (freq !== null && freq.frequencia < metaFrequencia.value) {
        lista.push({
          alunoId: v.aluno_id,
          turmaId: turma.id,
          nome: v.usuarios?.nome || 'Aluno',
          turmaNome: turma.nome,
          professorNome: professoresMap.value[turma.professor_id] ?? '—',
          presencas: freq.totalValidas,
          aulasRealizadas: freq.aulasRealizadas,
          frequencia: freq.frequencia,
        })
      }
    })
  })
  return lista.sort((a, b) => a.frequencia - b.frequencia)
})

// ── Gráfico ──────────────────────────────────────────────────────
const dadosGrafico = computed(() => {
  const turmasParaGrafico = turmaSelecionadaGrafico.value === 'todas'
    ? turmasFiltradas.value
    : turmasFiltradas.value.filter(t => t.id === turmaSelecionadaGrafico.value)

  const aulasRealizadas = todasAulas.value
    .filter(a => a.status === 'REALIZADA' && turmasParaGrafico.some(t => t.id === a.turma_id))
    .sort((a, b) => a.data.localeCompare(b.data))

  if (aulasRealizadas.length === 0) return { labels: [], datasets: [] }

  const datasets = turmasParaGrafico.map((turma, i) => {
    const aulasDaTurma = aulasRealizadas.filter(a => a.turma_id === turma.id)
    const alunos = alunosAtivosDaTurma(turma.id)
    const cor = coresTurmas[i % coresTurmas.length]

    const dados = aulasDaTurma.map((_, idx) => {
      const aulasAte = aulasDaTurma.slice(0, idx + 1).map(a => a.id)
      let soma = 0, count = 0
      alunos.forEach(v => {
        const freq = calcularFrequenciaSync(
          v.aluno_id,
          aulasAte,
          todasPresencas.value.map(p => ({ aluno_id: p.aluno_id, aula_id: p.aula_id })),
          todasJustificativas.value.map(j => ({ aluno_id: j.aluno_id, aula_id: j.aula_id }))
        )
        soma += freq.frequencia; count++
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
    labels = aulasRealizadas
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
      callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%` },
    },
  },
  scales: {
    y: {
      min: 0, max: 100,
      ticks: { callback: v => v + '%', font: { size: 11 } },
      grid: { color: 'rgba(0,0,0,0.05)' },
    },
    x: {
      ticks: { font: { size: 10 } },
      grid: { display: false },
    },
  },
}

function formatarDataCurta(dataStr) {
  const d = new Date(dataStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}
</script>