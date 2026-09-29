<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <!-- Header -->
    <div class="mb-8 flex items-start justify-between gap-4 flex-wrap">
      <div>
        <button
          @click="$router.back()"
          class="text-sm text-gray-400 hover:text-gray-600 transition mb-4 flex items-center gap-1"
        >
          ← Voltar
        </button>
        <h1 class="text-3xl font-bold text-green-700">Calendário de Aulas — {{ turma?.nome }}</h1>
        <p class="text-gray-500 mt-2">Clique em uma aula para personalizar as informações da jornada.</p>
        <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
      </div>
      <div class="mt-8">
        <button
          v-if="isProfessor || isAdmin"
          @click="painelAberto = true"
          class="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl transition active:scale-95 flex items-center gap-2 flex-shrink-0"
        >
          📅 Cadastrar Aulas
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center gap-2 text-green-700 text-sm py-8 justify-center">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      Carregando...
    </div>

    <!-- Empty state -->
    <div v-else-if="aulasDaJornada.length === 0" class="text-center py-16">
      <p class="text-4xl mb-3">📅</p>
      <p class="text-gray-500 font-medium">Nenhuma aula cadastrada.</p>
      <button v-if="isProfessor || isAdmin" @click="painelAberto = true" class="mt-3 text-green-600 font-semibold hover:underline text-sm">
        Cadastrar aulas →
      </button>
    </div>

    <!-- Jornada card -->
    <div v-else class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <!-- Card header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-lg flex-shrink-0">🚀</div>
          <div>
            <h2 class="text-base font-semibold text-gray-800 leading-tight">Jornada da turma</h2>
            <p class="text-xs text-gray-400 mt-0.5">Clique em qualquer aula para ver ou personalizar o conteúdo.</p>
          </div>
        </div>
        <div class="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 flex-shrink-0">
          <span class="text-base">⭐</span>
          <div>
            <p class="text-[10px] text-amber-600 font-semibold uppercase tracking-wide leading-none">Progresso</p>
            <p class="text-xs font-semibold text-amber-800 mt-0.5">{{ aulasRealizadas }}/{{ aulasDaJornada.length }} aulas</p>
          </div>
        </div>
      </div>

      <!-- Barra de progresso -->
      <div class="px-6 pt-4 pb-1">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs text-gray-500 font-medium">Jornada: {{ aulasRealizadas }}/{{ aulasDaJornada.length }} 🚀</span>
          <span class="text-xs text-gray-400">
            {{ aulasRealizadas === aulasDaJornada.length && aulasDaJornada.length > 0
                ? '🎉 Missão cumprida!'
                : `${aulasDaJornada.length - aulasRealizadas} aula(s) restante(s)` }}
          </span>
        </div>
        <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-green-500 rounded-full transition-all duration-700"
            :style="{ width: aulasDaJornada.length > 0 ? `${(aulasRealizadas / aulasDaJornada.length) * 100}%` : '0%' }"
          ></div>
        </div>
      </div>

      <!-- Mapa da jornada -->
      <div class="jornada-scroll-area px-6 py-6">
        <div ref="jornadaMapaRef" class="jornada-mapa">
          <svg
            v-if="aulasDaJornada.length > 1 && trilhaSvgWidth > 0"
            class="jornada-trilha-svg"
            :viewBox="`0 0 ${trilhaSvgWidth} ${trilhaSvgHeight}`"
            :width="trilhaSvgWidth"
            :height="trilhaSvgHeight"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            pointer-events="none"
          >
            <path :d="trilhaPath" fill="none" stroke="#E5E7EB" stroke-width="2.5" stroke-dasharray="6 5" stroke-linecap="round" />
            <path v-if="aulasRealizadas > 0" :d="trilhaPathConcluida" fill="none" stroke="#22C55E" stroke-width="2.5" stroke-linecap="round" />
          </svg>

          <div class="jornada-etapas">
            <div
              v-for="(etapa, idx) in aulasDaJornada"
              :key="etapa.id"
              class="jornada-etapa"
              :class="[`jornada-etapa--${etapa.statusEtapa}`, idx % 2 !== 0 ? 'jornada-etapa--baixo' : '', etapa.personalizado ? 'jornada-etapa--custom' : '']"
              role="button"
              tabindex="0"
              @click="abrirEdicao(etapa, idx)"
              @keydown.enter="abrirEdicao(etapa, idx)"
            >
              <div class="etapa-data">
                <span class="etapa-dia-num">{{ dia(etapa.data) }}/{{ mesNum(etapa.data) }}</span>
                <span class="etapa-dia-semana">{{ diaSemana(etapa.data).toUpperCase() }}</span>
              </div>

              <div class="etapa-planeta-wrap">
                <div v-if="etapa.statusEtapa === 'atual'" class="etapa-glow"></div>
                <div class="etapa-planeta">
                  <span class="etapa-planeta-emoji">{{ etapa.emoji }}</span>
                  <span class="etapa-numero" :class="`etapa-numero--${etapa.statusEtapa}`">{{ idx + 1 }}</span>
                </div>
                <!-- Badge de personalização -->
                <span v-if="etapa.personalizado" class="etapa-custom-badge" title="Personalizado por você">✦</span>
              </div>

              <div class="etapa-info">
                <span class="etapa-aula-label">Aula {{ idx + 1 }}</span>
                <strong class="etapa-nome-etapa">{{ etapa.nomeEtapa }}</strong>
                <span class="etapa-conteudo">{{ etapa.conteudo }}</span>
              </div>

              <div class="etapa-status-wrap">
                <span class="etapa-status-badge" :class="`etapa-status-badge--${etapa.statusEtapa}`">
                  <span v-if="etapa.statusEtapa === 'concluida'">Concluída ✓</span>
                  <span v-else-if="etapa.statusEtapa === 'atual'">Próxima 🚀</span>
                  <span v-else>Agendada</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Legenda -->
      <div class="px-6 pb-4 flex items-center gap-4 flex-wrap border-t border-gray-50 pt-3">
        <span class="text-xs text-gray-400 font-semibold">Legenda:</span>
        <div class="flex items-center gap-1.5">
          <span class="text-indigo-500 font-bold text-sm">✦</span>
          <span class="text-xs text-gray-500">Personalizado por você</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">○</span>
          <span class="text-xs text-gray-500">Conteúdo padrão</span>
        </div>
      </div>
    </div>

    <!-- Modal de confirmação de remoção -->
    <div
      v-if="aulaParaDeletar"
      class="fixed inset-0 z-[80] flex items-center justify-center bg-black/50"
      @click.self="aulaParaDeletar = null"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 space-y-4">
        <h3 class="text-lg font-semibold text-gray-800">Remover aula</h3>
        <p class="text-sm text-gray-600">
          Tem certeza que deseja remover a aula do dia
          <span class="font-medium">{{ formatarData(aulaParaDeletar.data) }}</span>?
          Esta ação não pode ser desfeita.
        </p>
        <div class="flex gap-3 justify-end">
          <button @click="aulaParaDeletar = null" class="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition">Cancelar</button>
          <button @click="confirmarDelecao" class="px-4 py-2 rounded-xl text-sm bg-red-600 text-white hover:bg-red-700 transition">Remover</button>
        </div>
      </div>
    </div>

    <!-- Drawer: Cadastrar Aulas -->
    <Transition name="fade">
      <div v-if="painelAberto" class="fixed inset-0 bg-black/40 z-[60]" @click="painelAberto = false"></div>
    </Transition>
    <Transition name="slide">
      <div v-if="painelAberto" class="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col">
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-lg font-semibold text-gray-800">➕ Cadastrar Aulas</h2>
          <button @click="painelAberto = false" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition text-xl">×</button>
        </div>
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- Tabs -->
          <div class="flex gap-2">
            <button v-if="isAdmin" @click="modoAdicao = 'recorrencia'" class="flex-1 py-2 rounded-xl text-sm font-semibold transition" :class="modoAdicao === 'recorrencia' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">🔁 Recorrência</button>
            <button @click="modoAdicao = 'manual'" class="flex-1 py-2 rounded-xl text-sm font-semibold transition" :class="modoAdicao === 'manual' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">📅 Datas avulsas</button>
          </div>
          <!-- Manual -->
          <div v-if="modoAdicao === 'manual'" class="space-y-4">
            <label class="text-sm text-gray-600 font-medium block">Selecione uma data:</label>
            <div class="flex gap-3">
              <input v-model="dataManual" type="date" class="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
              <button @click="adicionarDataManual" :disabled="!dataManual" class="bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-xl transition">Adicionar</button>
            </div>
            <ul v-if="datasManual.length > 0" class="space-y-2">
              <li v-for="(data, i) in datasManual" :key="i" class="flex items-center justify-between px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
                <span>{{ formatarDataCompleta(data) }}</span>
                <button @click="datasManual.splice(i, 1)" class="text-red-400 hover:text-red-600 font-bold">×</button>
              </li>
            </ul>
          </div>
          <!-- Recorrência (admin) -->
          <div v-if="modoAdicao === 'recorrencia'" class="space-y-4">
            <div>
              <label class="text-sm text-gray-600 font-medium mb-2 block">Dia da semana:</label>
              <div class="flex flex-wrap gap-2">
                <button v-for="dia in diasSemanaOpcoes" :key="dia.valor" @click="diaRecorrencia = dia.valor" class="px-3 py-2 rounded-xl text-sm font-semibold transition" :class="diaRecorrencia === dia.valor ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">{{ dia.label }}</button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-sm text-gray-600 font-medium mb-2 block">Data inicial:</label>
                <input v-model="recorrenciaInicio" type="date" class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
              </div>
              <div>
                <label class="text-sm text-gray-600 font-medium mb-2 block">Número de aulas:</label>
                <input v-model.number="quantidadeAulasForm" type="number" min="1" max="52" placeholder="Ex: 4" class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
              </div>
            </div>
            <button @click="gerarRecorrencia" :disabled="diaRecorrencia === null || !recorrenciaInicio || !quantidadeAulasForm" class="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-semibold py-2 rounded-xl transition text-sm">🔍 Pré-visualizar datas</button>
            <ul v-if="datasRecorrencia.length > 0" class="space-y-2 max-h-64 overflow-y-auto">
              <li v-for="(data, i) in datasRecorrencia" :key="i" class="flex items-center justify-between px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
                <span>{{ formatarDataCompleta(data) }}</span>
                <button @click="datasRecorrencia.splice(i, 1)" class="text-red-400 hover:text-red-600 font-bold">×</button>
              </li>
            </ul>
          </div>
        </div>
        <div class="p-6 border-t space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block">Horário das aulas</label>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs text-gray-500 mb-1 block">Início</label>
                <input v-model="horaInicio" type="time" class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
              </div>
              <div>
                <label class="text-xs text-gray-500 mb-1 block">Fim</label>
                <input v-model="horaFim" type="time" class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
              </div>
            </div>
          </div>
          <button @click="salvarAulas" :disabled="datasParaSalvar.length === 0" class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-2">
            💾 Salvar {{ datasParaSalvar.length }} aula(s)
          </button>
        </div>
      </div>
    </Transition>

    <!-- Modal de edição -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="modalEdicao" class="modal-overlay" @click.self="fecharModal">
          <div class="modal-card" role="dialog" aria-modal="true">
            <!-- Header -->
            <div class="modal-header">
              <div class="modal-planeta">{{ modalEdicao.emoji }}</div>
              <div class="modal-header-info">
                <p class="modal-aula-label">Aula {{ (modalEdicao.idx ?? 0) + 1 }} · {{ formatarData(modalEdicao.data) }}</p>
                <h3 class="modal-titulo">{{ modalEdicao.nomeEtapa }}</h3>
              </div>
              <button class="modal-fechar" @click="fecharModal" aria-label="Fechar">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <!-- O que os alunos veem -->
              <div class="padrao-section">
                <p class="padrao-label">👁 O que os alunos veem hoje</p>
                <template v-if="modalEdicao.personalizado">
                  <div v-if="modalEdicao.conteudo" class="padrao-linha">
                    <span class="padrao-campo">Tópico</span>
                    <span class="padrao-valor">{{ modalEdicao.conteudo }}</span>
                  </div>
                  <div v-if="modalEdicao.objetivos?.length" class="padrao-linha">
                    <span class="padrao-campo">Objetivos</span>
                    <span class="padrao-valor">{{ modalEdicao.objetivos.join(' · ') }}</span>
                  </div>
                  <div v-if="modalEdicao.atividades?.length" class="padrao-linha">
                    <span class="padrao-campo">Atividades</span>
                    <span class="padrao-valor">{{ modalEdicao.atividades.join(' · ') }}</span>
                  </div>
                  <div v-if="modalEdicao.dica" class="padrao-linha">
                    <span class="padrao-campo">Dica</span>
                    <span class="padrao-valor">{{ modalEdicao.dica }}</span>
                  </div>
                </template>
                <div v-else class="padrao-vazio">
                  Nenhum conteúdo cadastrado — use os campos abaixo para adicionar.
                </div>
              </div>

              <!-- Personalizar -->
              <div class="custom-section">
                <p class="custom-label">✏️ Personalizar para esta aula</p>
                <p class="custom-desc">Os campos preenchidos abaixo substituem o conteúdo padrão para os alunos desta turma.</p>

                <div class="form-field">
                  <label class="form-label">Tópico da aula</label>
                  <input v-model="formEdicao.conteudo" type="text" class="form-input" placeholder="Ex: Present Simple" />
                </div>
                <div class="form-field">
                  <label class="form-label">Objetivos <span class="text-gray-400 font-normal">(um por linha)</span></label>
                  <textarea v-model="formEdicao.objetivosTexto" class="form-textarea" rows="3" placeholder="Objetivo 1&#10;Objetivo 2"></textarea>
                </div>
                <div class="form-field">
                  <label class="form-label">Atividades <span class="text-gray-400 font-normal">(uma por linha)</span></label>
                  <textarea v-model="formEdicao.atividadesTexto" class="form-textarea" rows="2" placeholder="Atividade 1&#10;Atividade 2"></textarea>
                </div>
                <div class="form-field">
                  <label class="form-label">Vocabulário <span class="text-gray-400 font-normal">(um por linha)</span></label>
                  <textarea v-model="formEdicao.vocabularioTexto" class="form-textarea" rows="2" placeholder="Hello&#10;My name is"></textarea>
                </div>
                <div class="form-field">
                  <label class="form-label">Dica motivacional</label>
                  <textarea v-model="formEdicao.dica" class="form-textarea" rows="2" placeholder="Dica para os alunos"></textarea>
                </div>
              </div>

              <!-- Ações -->
              <div class="flex gap-3 pt-1 flex-wrap">
                <button
                  @click="salvarEdicao"
                  :disabled="salvando"
                  class="flex-1 bg-green-600 text-white text-sm font-semibold rounded-xl py-2.5 hover:bg-green-700 disabled:opacity-60 transition"
                >
                  {{ salvando ? 'Salvando…' : 'Salvar' }}
                </button>
                <button
                  v-if="modalEdicao.personalizado"
                  @click="limparPersonalizacao"
                  :disabled="salvando"
                  class="text-sm text-red-500 hover:text-red-700 px-3 py-2.5 rounded-xl hover:bg-red-50 transition"
                >
                  Restaurar padrão
                </button>
                <button @click="fecharModal" class="px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition">
                  Cancelar
                </button>
              </div>
              <div v-if="(isProfessor || isAdmin) && modalEdicao.status === 'AGENDADA'" class="pt-1 border-t border-gray-100">
                <button
                  @click="solicitarDelecao(modalEdicao.id)"
                  class="w-full text-sm text-red-400 hover:text-red-600 py-2 rounded-xl hover:bg-red-50 transition"
                >
                  🗑 Remover esta aula
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { supabase } from '~/utils/supabase'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { $toast } = useNuxtApp()
const { isAdmin, isProfessor } = useAuth()
const turmaId = Number(route.params.id)

const loading = ref(true)
const turma = ref(null)
const aulas = ref([])

// Emojis fixos por posição — não editáveis
const EMOJIS_JORNADA = ['🚀', '🌕', '☄️', '🔴', '🪐', '🌌', '⭐', '🏆']


const aulasDaJornada = computed(() => {
  const hoje = new Date().toISOString().split('T')[0]
  const ordenadas = [...aulas.value].sort((a, b) => a.data.localeCompare(b.data))
  const idxAtual = ordenadas.findIndex((a) => a.status === 'AGENDADA' && a.data >= hoje)

  return ordenadas.map((aula, idx) => {
    const config = aula.conteudo_json ?? {}
    const personalizado = Object.keys(config).length > 0
    const nomeEtapa = config.nomeEtapa ?? `Aula ${idx + 1}`
    const emoji = EMOJIS_JORNADA[idx] ?? '🌍'
    const conteudo = config.conteudo ?? ''
    let statusEtapa
    if (aula.status === 'REALIZADA') statusEtapa = 'concluida'
    else if (idx === idxAtual) statusEtapa = 'atual'
    else statusEtapa = 'proxima'
    return { ...aula, ...config, nomeEtapa, emoji, conteudo, statusEtapa, personalizado, idx }
  })
})

const aulasRealizadas = computed(() => aulasDaJornada.value.filter((e) => e.statusEtapa === 'concluida').length)

// ── SVG trilha ─────────────────────────────────────────────────────────────
const jornadaMapaRef = ref(null)
const mapaWidth = ref(0)
const TRILHA_Y_TOP = 36
const TRILHA_Y_BOT = 76
const trilhaSvgHeight = 112
const trilhaSvgWidth = computed(() => mapaWidth.value || 0)

function etapaX(idx, total, w) { return total === 1 ? w / 2 : (idx / (total - 1)) * w }
function etapaY(idx) { return idx % 2 === 0 ? TRILHA_Y_TOP : TRILHA_Y_BOT }

function buildPath(etapas, w) {
  if (etapas.length < 2 || w === 0) return ''
  const total = aulasDaJornada.value.length
  return etapas.map((e, i) => `${i === 0 ? 'M' : 'L'} ${etapaX(e._idx, total, w)} ${etapaY(e._idx)}`).join(' ')
}

const trilhaPath = computed(() => buildPath(aulasDaJornada.value.map((e, i) => ({ ...e, _idx: i })), trilhaSvgWidth.value))
const trilhaPathConcluida = computed(() => {
  const realizadas = aulasDaJornada.value.map((e, i) => ({ ...e, _idx: i })).filter((e) => e.statusEtapa === 'concluida')
  return realizadas.length < 2 ? '' : buildPath(realizadas, trilhaSvgWidth.value)
})

let resizeObs = null
onMounted(async () => {
  modoAdicao.value = isAdmin.value ? 'recorrencia' : 'manual'
  await carregarDados()
  await nextTick()
  if (jornadaMapaRef.value) {
    mapaWidth.value = jornadaMapaRef.value.offsetWidth
    resizeObs = new ResizeObserver(() => { mapaWidth.value = jornadaMapaRef.value?.offsetWidth ?? 0 })
    resizeObs.observe(jornadaMapaRef.value)
  }
})
onUnmounted(() => resizeObs?.disconnect())

async function carregarDados() {
  const [{ data: turmaData }, { data: aulasData }] = await Promise.all([
    supabase.from('turma').select('id, nome, nivel, status').eq('id', turmaId).single(),
    supabase.from('aula').select('id, data, status, conteudo_json').eq('turma_id', turmaId).order('data', { ascending: true }),
  ])
  turma.value = turmaData
  aulas.value = aulasData ?? []
  loading.value = false
}

function dia(d) { return new Date(d + 'T12:00:00').getDate() }
function mesNum(d) { return String(new Date(d + 'T12:00:00').getMonth() + 1).padStart(2, '0') }
function diaSemana(d) { return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '') }
function formatarData(d) { return d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—' }

// ── Drawer: Cadastrar Aulas ───────────────────────────────────────────────
const painelAberto = ref(false)
const modoAdicao = ref('manual') // será sobrescrito no onMounted
const dataManual = ref('')
const datasManual = ref([])
const diaRecorrencia = ref(null)
const recorrenciaInicio = ref('')
const quantidadeAulasForm = ref(null)
const datasRecorrencia = ref([])
const horaInicio = ref('')
const horaFim = ref('')
const aulaParaDeletar = ref(null)

const diasSemanaOpcoes = [
  { valor: 0, label: 'Dom' }, { valor: 1, label: 'Seg' }, { valor: 2, label: 'Ter' },
  { valor: 3, label: 'Qua' }, { valor: 4, label: 'Qui' }, { valor: 5, label: 'Sex' },
  { valor: 6, label: 'Sáb' },
]
const datasParaSalvar = computed(() => modoAdicao.value === 'manual' ? datasManual.value : datasRecorrencia.value)

function formatarDataCompleta(dataStr) {
  const d = new Date(dataStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
}

function adicionarDataManual() {
  if (!dataManual.value) return
  if (datasManual.value.includes(dataManual.value)) { $toast.warning('Esta data já foi adicionada.'); return }
  datasManual.value.push(dataManual.value)
  datasManual.value.sort()
  dataManual.value = ''
}

function gerarRecorrencia() {
  if (diaRecorrencia.value === null || !recorrenciaInicio.value || !quantidadeAulasForm.value) return
  const quantidade = parseInt(quantidadeAulasForm.value)
  if (quantidade < 1) { $toast.warning('Informe ao menos 1 aula.'); return }
  const atual = new Date(recorrenciaInicio.value + 'T12:00:00')
  while (atual.getDay() !== diaRecorrencia.value) { atual.setDate(atual.getDate() + 1) }
  const datas = []
  for (let i = 0; i < quantidade; i++) {
    datas.push(atual.toISOString().split('T')[0])
    atual.setDate(atual.getDate() + 7)
  }
  datasRecorrencia.value = datas
}

async function salvarAulas() {
  const datas = datasParaSalvar.value
  if (datas.length === 0) return
  const datasExistentes = aulas.value.map((a) => a.data)
  const novasDatas = datas.filter((d) => !datasExistentes.includes(d))
  if (novasDatas.length === 0) { $toast.warning('Todas as datas selecionadas já estão cadastradas.'); return }
  const registros = novasDatas.map((data) => ({
    turma_id: turmaId,
    data,
    status: 'AGENDADA',
    hora_inicio: horaInicio.value || null,
    hora_fim: horaFim.value || null,
  }))
  const { error } = await supabase.from('aula').insert(registros)
  if (error) { $toast.error('Erro ao salvar aulas.'); return }
  $toast.success(`${novasDatas.length} aula(s) cadastrada(s)!`)
  datasManual.value = []
  datasRecorrencia.value = []
  horaInicio.value = ''
  horaFim.value = ''
  painelAberto.value = false
  await carregarDados()
}

function solicitarDelecao(aulaId) {
  const aula = aulas.value.find((a) => a.id === aulaId)
  if (!aula || aula.status !== 'AGENDADA') { $toast.warning('Apenas aulas agendadas podem ser removidas.'); return }
  aulaParaDeletar.value = aula
  fecharModal()
}

async function confirmarDelecao() {
  const aula = aulaParaDeletar.value
  if (!aula) return
  const { error } = await supabase.from('aula').delete().eq('id', aula.id)
  if (error) { $toast.error('Erro ao remover aula.'); return }
  aulas.value = aulas.value.filter((a) => a.id !== aula.id)
  $toast.success('Aula removida.')
  aulaParaDeletar.value = null
}

// ── Modal de edição ───────────────────────────────────────────────────────
const modalEdicao = ref(null)
const salvando = ref(false)
const formEdicao = ref({ conteudo: '', objetivosTexto: '', atividadesTexto: '', vocabularioTexto: '', dica: '' })

function abrirEdicao(etapa, idx) {
  modalEdicao.value = { ...etapa, idx }
  const custom = etapa.conteudo_json ?? {}
  formEdicao.value = {
    conteudo: custom.conteudo ?? '',
    objetivosTexto: (custom.objetivos ?? []).join('\n'),
    atividadesTexto: (custom.atividades ?? []).join('\n'),
    vocabularioTexto: (custom.vocabulario ?? []).join('\n'),
    dica: custom.dica ?? '',
  }
}

function fecharModal() { modalEdicao.value = null }

function textoParaArray(txt) { return txt.split('\n').map((s) => s.trim()).filter(Boolean) }

async function salvarEdicao() {
  if (!modalEdicao.value) return
  salvando.value = true
  try {
    const f = formEdicao.value
    const payload = {}
    if (f.conteudo.trim()) payload.conteudo = f.conteudo.trim()
    const obj = textoParaArray(f.objetivosTexto)
    if (obj.length) payload.objetivos = obj
    const atv = textoParaArray(f.atividadesTexto)
    if (atv.length) payload.atividades = atv
    const voc = textoParaArray(f.vocabularioTexto)
    if (voc.length) payload.vocabulario = voc
    if (f.dica.trim()) payload.dica = f.dica.trim()

    const json = Object.keys(payload).length > 0 ? payload : null
    await supabase.from('aula').update({ conteudo_json: json }).eq('id', modalEdicao.value.id)

    const idx = aulas.value.findIndex((a) => a.id === modalEdicao.value.id)
    if (idx >= 0) aulas.value[idx] = { ...aulas.value[idx], conteudo_json: json }
    fecharModal()
  } finally {
    salvando.value = false
  }
}

async function limparPersonalizacao() {
  if (!modalEdicao.value) return
  salvando.value = true
  try {
    await supabase.from('aula').update({ conteudo_json: null }).eq('id', modalEdicao.value.id)
    const idx = aulas.value.findIndex((a) => a.id === modalEdicao.value.id)
    if (idx >= 0) aulas.value[idx] = { ...aulas.value[idx], conteudo_json: null }
    fecharModal()
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }

.jornada-scroll-area { width: 100%; box-sizing: border-box; }
.jornada-mapa { position: relative; width: 100%; min-height: 220px; }
.jornada-trilha-svg { position: absolute; top: 40px; left: 0; width: 100%; pointer-events: none; overflow: visible; z-index: 0; }
.jornada-etapas { display: flex; align-items: flex-start; position: relative; z-index: 2; width: 100%; }
.jornada-etapa { display: flex; flex-direction: column; align-items: center; flex: 1 1 0; min-width: 0; gap: 6px; padding: 0 4px; cursor: pointer; transition: opacity 0.15s; }
.jornada-etapa:hover { opacity: 0.85; }
.jornada-etapa--baixo { margin-top: 40px; }

.etapa-data { display: flex; flex-direction: column; align-items: center; min-height: 34px; }
.etapa-dia-num { font-size: 13px; font-weight: 700; color: #374151; line-height: 1; }
.etapa-dia-semana { font-size: 10px; font-weight: 500; color: #9ca3af; letter-spacing: 0.05em; margin-top: 2px; }
.jornada-etapa--atual .etapa-dia-num { color: #4f46e5; }
.jornada-etapa--atual .etapa-dia-semana { color: #6366f1; }

.etapa-planeta-wrap { position: relative; width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; }
.etapa-glow { position: absolute; inset: -6px; border-radius: 50%; background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%); animation: pulso 2.2s ease-in-out infinite; }
@keyframes pulso { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.15); opacity: 1; } }
.etapa-planeta { position: relative; width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 34px; line-height: 1; transition: transform 0.2s; }
.jornada-etapa:hover .etapa-planeta { transform: scale(1.08); }
.jornada-etapa--concluida .etapa-planeta { background: #f0fdf4; box-shadow: 0 0 0 2px #bbf7d0; }
.jornada-etapa--atual .etapa-planeta { background: #eef2ff; box-shadow: 0 0 0 3px #a5b4fc, 0 4px 20px rgba(99,102,241,0.2); transform: scale(1.12); }
.jornada-etapa--proxima .etapa-planeta { background: #fafafa; box-shadow: 0 0 0 2px #e5e7eb; opacity: 0.85; }

.etapa-planeta-emoji { line-height: 1; }
.etapa-numero { position: absolute; top: -4px; left: -4px; width: 20px; height: 20px; border-radius: 50%; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; }
.etapa-numero--concluida { background: #22c55e; color: #fff; }
.etapa-numero--atual { background: #6366f1; color: #fff; }
.etapa-numero--proxima { background: #d1d5db; color: #6b7280; }

/* Badge de personalização */
.etapa-custom-badge { position: absolute; bottom: 0; right: 0; font-size: 11px; color: #6366f1; line-height: 1; }

.etapa-info { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 2px; }
.etapa-aula-label { font-size: 10px; color: #9ca3af; font-weight: 500; }
.etapa-nome-etapa { font-size: 12px; font-weight: 600; color: #374151; line-height: 1.2; }
.jornada-etapa--atual .etapa-nome-etapa { color: #4338ca; }
.etapa-conteudo { font-size: 11px; color: #6b7280; line-height: 1.3; }

.etapa-status-wrap { margin-top: 2px; }
.etapa-status-badge { display: inline-flex; align-items: center; font-size: 10px; font-weight: 600; padding: 3px 9px; border-radius: 20px; white-space: nowrap; }
.etapa-status-badge--concluida { background: #dcfce7; color: #15803d; }
.etapa-status-badge--atual { background: #e0e7ff; color: #4338ca; }
.etapa-status-badge--proxima { background: #f3f4f6; color: #6b7280; }

@media (max-width: 600px) {
  .jornada-scroll-area { padding-left: 0.5rem; padding-right: 0.5rem; }
  .jornada-mapa { min-height: unset; }
  .jornada-trilha-svg { display: none; }
  .jornada-etapas { flex-direction: column; gap: 0; border-left: 2px dashed #e5e7eb; margin-left: 20px; padding-left: 20px; }
  .jornada-etapa { flex-direction: row; align-items: center; justify-content: flex-start; flex: none; width: 100%; min-width: unset; gap: 12px; padding: 10px 0; margin-top: 0 !important; border-bottom: 1px solid #f3f4f6; }
  .jornada-etapa:last-child { border-bottom: none; }
  .etapa-planeta-wrap { width: 52px; height: 52px; flex-shrink: 0; }
  .etapa-planeta { width: 48px; height: 48px; font-size: 26px; }
  .etapa-info { align-items: flex-start; text-align: left; flex: 1; }
  .etapa-data { display: none; }
}
</style>

<style>
/* Modal — fora de scoped para funcionar com Teleport */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal-card { background: #fff; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.18); width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; align-items: flex-start; gap: 14px; padding: 20px 20px 16px; border-bottom: 1px solid #f3f4f6; }
.modal-planeta { font-size: 44px; line-height: 1; flex-shrink: 0; }
.modal-header-info { flex: 1; min-width: 0; }
.modal-aula-label { font-size: 11px; color: #9ca3af; font-weight: 500; margin-bottom: 2px; }
.modal-titulo { font-size: 17px; font-weight: 700; color: #111827; line-height: 1.2; }
.modal-fechar { flex-shrink: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: #9ca3af; cursor: pointer; transition: background 0.15s, color 0.15s; }
.modal-fechar:hover { background: #f3f4f6; color: #374151; }
.modal-body { padding: 16px 20px 20px; display: flex; flex-direction: column; gap: 14px; }

/* Seção "O que os alunos veem" */
.padrao-section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; }
.padrao-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
.padrao-linha { display: flex; gap: 8px; font-size: 12px; }
.padrao-campo { color: #94a3b8; font-weight: 600; flex-shrink: 0; min-width: 64px; }
.padrao-valor { color: #475569; line-height: 1.4; }
.padrao-vazio { font-size: 12px; color: #94a3b8; font-style: italic; }

/* Seção "Personalizar" */
.custom-section { display: flex; flex-direction: column; gap: 10px; }
.custom-label { font-size: 12px; font-weight: 700; color: #374151; }
.custom-desc { font-size: 11px; color: #9ca3af; margin-top: -6px; }
.form-field { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #6b7280; }
.form-input { border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px 12px; font-size: 14px; color: #111827; outline: none; transition: border-color 0.15s; }
.form-input:focus { border-color: #22c55e; }
.form-textarea { border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px 12px; font-size: 13px; color: #374151; outline: none; resize: vertical; transition: border-color 0.15s; font-family: inherit; }
.form-textarea:focus { border-color: #22c55e; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
