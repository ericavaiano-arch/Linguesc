<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <!-- Header -->
    <div class="mb-8 flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-3xl font-bold text-green-700">Calendário de Aulas</h1>
        <p class="text-gray-500 mt-2">Visão mensal de todas as aulas agendadas.</p>
        <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
      </div>
      <div class="flex items-center gap-3 mt-6 sm:mt-0">
        <button
          @click="mesAnterior"
          class="w-9 h-9 rounded-xl border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
        >
          ‹
        </button>
        <span class="text-base font-semibold text-gray-700 min-w-[160px] text-center">
          {{ nomeMes }} {{ anoAtual }}
        </span>
        <button
          @click="proximoMes"
          class="w-9 h-9 rounded-xl border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
        >
          ›
        </button>
        <button
          @click="irParaHoje"
          class="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
        >
          Hoje
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center gap-3 text-green-700 py-12 justify-center">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando...</span>
    </div>

    <div v-else>
      <!-- Grade do calendário -->
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <!-- Cabeçalho dias da semana -->
        <div class="grid grid-cols-7 border-b border-gray-100">
          <div
            v-for="dia in diasSemana"
            :key="dia"
            class="py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide"
          >
            {{ dia }}
          </div>
        </div>

        <!-- Semanas -->
        <div>
          <div
            v-for="(semana, si) in semanas"
            :key="si"
            class="grid grid-cols-7"
            :class="si < semanas.length - 1 ? 'border-b border-gray-100' : ''"
          >
            <div
              v-for="(celula, ci) in semana"
              :key="ci"
              class="min-h-[110px] p-2 border-r border-gray-100 last:border-r-0 relative"
              :class="[
                !celula.doMesAtual ? 'bg-gray-50/70' : '',
                celula.ehHoje ? 'bg-green-50' : ''
              ]"
            >
              <!-- Número do dia -->
              <span
                class="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold mb-1"
                :class="[
                  celula.ehHoje
                    ? 'bg-green-600 text-white'
                    : celula.doMesAtual
                      ? 'text-gray-700'
                      : 'text-gray-300'
                ]"
              >
                {{ celula.dia }}
              </span>

              <!-- Aulas do dia -->
              <div class="space-y-1">
                <button
                  v-for="aula in celula.aulas"
                  :key="aula.id"
                  @click="selecionarAula(aula)"
                  class="w-full text-left rounded-lg px-2 py-1 text-xs font-medium truncate transition hover:opacity-80"
                  :class="corAula(aula)"
                  :title="aula.turmaNome"
                >
                  <span class="block truncate">{{ aula.turmaNome }}</span>
                  <span v-if="aula.horario" class="block text-[10px] opacity-80">{{ aula.horario }}</span>
                </button>

                <!-- Indicador de mais aulas -->
                <button
                  v-if="celula.maisAulas > 0"
                  @click="selecionarDia(celula)"
                  class="text-[10px] text-gray-400 hover:text-green-600 font-medium transition"
                >
                  +{{ celula.maisAulas }} mais
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Legenda de turmas -->
      <div class="mt-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Turmas</h3>
        <div class="flex flex-wrap gap-3">
          <div
            v-for="turma in turmasFiltradas"
            :key="turma.id"
            class="flex items-center gap-2"
          >
            <div class="w-3 h-3 rounded-sm flex-shrink-0" :class="corTurmaLegenda(turma.id)"></div>
            <span class="text-xs text-gray-600">{{ turma.nome }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── MODAL DETALHE DA AULA ── -->
    <Transition name="fade">
      <div
        v-if="aulaDetalhada"
        class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
        @click.self="aulaDetalhada = null"
      >
        <div class="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">
          <div class="flex items-start justify-between mb-4 gap-3">
            <div>
              <h3 class="text-lg font-bold text-gray-800">{{ aulaDetalhada.turmaNome }}</h3>
              <p class="text-sm text-gray-400 mt-0.5">{{ formatarDataCompleta(aulaDetalhada.data) }}</p>
            </div>
            <button
              @click="aulaDetalhada = null"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition text-xl flex-shrink-0"
            >
              ×
            </button>
          </div>

          <div class="space-y-3">
            <div v-if="aulaDetalhada.professorNome" class="flex items-center gap-2 text-sm text-gray-600">
              <span class="text-base">👨‍🏫</span>
              <span>{{ aulaDetalhada.professorNome }}</span>
            </div>
            <div v-if="aulaDetalhada.horario" class="flex items-center gap-2 text-sm text-gray-600">
              <span class="text-base">🕐</span>
              <span>{{ aulaDetalhada.horario }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <span class="text-base">👥</span>
              <span>{{ aulaDetalhada.numAlunos }} aluno(s)</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-base">📌</span>
              <span
                class="px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="aulaDetalhada.status === 'REALIZADA' ? 'bg-green-100 text-green-700' : aulaDetalhada.status === 'CANCELADA' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'"
              >
                {{ aulaDetalhada.status === 'REALIZADA' ? 'Realizada' : aulaDetalhada.status === 'CANCELADA' ? 'Cancelada' : 'Agendada' }}
              </span>
            </div>
          </div>

          <button
            @click="aulaDetalhada = null"
            class="w-full mt-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-600 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { supabase } from '~/utils/supabase'

definePageMeta({ middleware: 'admin' })

const loading = ref(true)
const hoje = new Date()
const mesAtual = ref(hoje.getMonth())
const anoAtual = ref(hoje.getFullYear())
const aulaDetalhada = ref(null)

const turmas = ref([])
const aulas = ref([])
const mapaAlunos = ref({})

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const CORES = [
  { bg: 'bg-blue-100 text-blue-700', legenda: 'bg-blue-400' },
  { bg: 'bg-purple-100 text-purple-700', legenda: 'bg-purple-400' },
  { bg: 'bg-amber-100 text-amber-700', legenda: 'bg-amber-400' },
  { bg: 'bg-rose-100 text-rose-700', legenda: 'bg-rose-400' },
  { bg: 'bg-teal-100 text-teal-700', legenda: 'bg-teal-400' },
  { bg: 'bg-indigo-100 text-indigo-700', legenda: 'bg-indigo-400' },
  { bg: 'bg-orange-100 text-orange-700', legenda: 'bg-orange-400' },
  { bg: 'bg-pink-100 text-pink-700', legenda: 'bg-pink-400' },
]

onMounted(async () => {
  await carregarDados()
  loading.value = false
})

async function carregarDados() {
  const [{ data: turmasData }, { data: aulasData }, { data: vinculosData }] = await Promise.all([
    supabase
      .from('turma')
      .select('id, nome, professor_id, usuarios!professor_id(nome)')
      .eq('status', 'ATIVA')
      .order('nome'),
    supabase
      .from('aula')
      .select('id, turma_id, data, status, hora_inicio, hora_fim')
      .order('data'),
    supabase
      .from('turma_aluno')
      .select('turma_id, aluno_id')
  ])

  turmas.value = (turmasData || []).map(t => ({
    ...t,
    professorNome: t.usuarios?.nome || ''
  }))

  const contagemAlunos = {}
  ;(vinculosData || []).forEach(v => {
    contagemAlunos[v.turma_id] = (contagemAlunos[v.turma_id] || 0) + 1
  })
  mapaAlunos.value = contagemAlunos

  const mapaT = Object.fromEntries(turmas.value.map(t => [t.id, t]))
  aulas.value = (aulasData || []).map(a => ({
    ...a,
    turmaNome: mapaT[a.turma_id]?.nome || '',
    professorNome: mapaT[a.turma_id]?.professorNome || '',
    numAlunos: contagemAlunos[a.turma_id] || 0,
    horario: a.hora_inicio ? a.hora_inicio.slice(0, 5) + (a.hora_fim ? ' – ' + a.hora_fim.slice(0, 5) : '') : null
  })).filter(a => a.turmaNome)
}

const nomeMes = computed(() => {
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  return meses[mesAtual.value]
})

const turmasFiltradas = computed(() => turmas.value)

function corAula(aula) {
  const idx = turmas.value.findIndex(t => t.id === aula.turma_id)
  return CORES[idx % CORES.length]?.bg || 'bg-gray-100 text-gray-600'
}

function corTurmaLegenda(turmaId) {
  const idx = turmas.value.findIndex(t => t.id === turmaId)
  return CORES[idx % CORES.length]?.legenda || 'bg-gray-300'
}

const semanas = computed(() => {
  const primeiroDia = new Date(anoAtual.value, mesAtual.value, 1)
  const ultimoDia = new Date(anoAtual.value, mesAtual.value + 1, 0)
  const inicioDaSemana = primeiroDia.getDay()

  const celulas = []

  // Dias do mês anterior
  for (let i = inicioDaSemana - 1; i >= 0; i--) {
    const d = new Date(primeiroDia)
    d.setDate(d.getDate() - i - 1)
    celulas.push({ data: d, doMesAtual: false })
  }

  // Dias do mês atual
  for (let d = 1; d <= ultimoDia.getDate(); d++) {
    celulas.push({ data: new Date(anoAtual.value, mesAtual.value, d), doMesAtual: true })
  }

  // Dias do próximo mês para completar a grade
  const restante = 7 - (celulas.length % 7)
  if (restante < 7) {
    for (let i = 1; i <= restante; i++) {
      const d = new Date(ultimoDia)
      d.setDate(d.getDate() + i)
      celulas.push({ data: d, doMesAtual: false })
    }
  }

  const todayStr = hoje.toISOString().split('T')[0]

  return chunk(celulas, 7).map(semana =>
    semana.map(cel => {
      const dataStr = cel.data.toISOString().split('T')[0]
      const aulasNoDia = aulas.value.filter(a => a.data === dataStr)
      const MAX_VISIBLE = 3
      return {
        dia: cel.data.getDate(),
        dataStr,
        doMesAtual: cel.doMesAtual,
        ehHoje: dataStr === todayStr,
        aulas: aulasNoDia.slice(0, MAX_VISIBLE),
        maisAulas: Math.max(0, aulasNoDia.length - MAX_VISIBLE),
        todasAulas: aulasNoDia
      }
    })
  )
})

function chunk(arr, size) {
  const result = []
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
  return result
}

function mesAnterior() {
  if (mesAtual.value === 0) {
    mesAtual.value = 11
    anoAtual.value--
  } else {
    mesAtual.value--
  }
}

function proximoMes() {
  if (mesAtual.value === 11) {
    mesAtual.value = 0
    anoAtual.value++
  } else {
    mesAtual.value++
  }
}

function irParaHoje() {
  mesAtual.value = hoje.getMonth()
  anoAtual.value = hoje.getFullYear()
}

function selecionarAula(aula) {
  aulaDetalhada.value = aula
}

function selecionarDia(celula) {
  // Mostra a primeira aula extra que não estava visível
  if (celula.todasAulas.length > 0) {
    aulaDetalhada.value = celula.todasAulas[0]
  }
}

function formatarDataCompleta(dataStr) {
  const d = new Date(dataStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
