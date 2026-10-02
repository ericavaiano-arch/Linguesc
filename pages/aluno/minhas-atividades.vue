<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-green-700">Minhas Atividades</h1>
      <p class="text-gray-500 mt-2">Missões da semana, provas e seu desempenho.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-sm">Carregando...</span>
    </div>

    <div v-else-if="todasAtividades.length === 0" class="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center max-w-lg">
      <p class="text-4xl mb-4">📚</p>
      <p class="text-gray-500 font-medium">Nenhuma atividade disponível.</p>
      <p class="text-xs text-gray-400 mt-2">Quando o professor publicar atividades, elas aparecerão aqui.</p>
    </div>

    <div v-else class="flex flex-col sm:grid gap-4" style="grid-template-columns: 280px 1fr; align-items: start">

      <!-- ── PAINEL ESQUERDO: lista ── -->
      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        <!-- Filtro tabs -->
        <div class="flex border-b border-gray-100">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="tabAtiva = tab.value"
            class="flex-1 text-xs font-semibold py-2.5 transition"
            :class="tabAtiva === tab.value
              ? 'text-green-700 border-b-2 border-green-600 bg-green-50/50'
              : 'text-gray-400 hover:text-gray-600'"
          >{{ tab.label }} <span v-if="tab.count > 0" class="ml-1 px-1.5 py-0.5 rounded-full text-[10px]" :class="tabAtiva === tab.value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">{{ tab.count }}</span></button>
        </div>

        <div v-if="atividadesDaTab.length === 0" class="px-4 py-8 text-center">
          <p class="text-xs text-gray-400">Nenhuma atividade nesta aba.</p>
        </div>

        <!-- Missões da semana -->
        <template v-if="missoesDaTab.length > 0">
          <div class="px-3.5 py-2 bg-amber-50 border-b border-gray-100">
            <p class="text-[10px] font-semibold text-amber-600 uppercase tracking-widest">⭐ Missões da Semana</p>
          </div>
          <button
            v-for="m in missoesDaTab"
            :key="m.id"
            @click="selecionarItem(m)"
            class="w-full flex items-center gap-2.5 px-3.5 py-2.5 border-b border-gray-100 last:border-0 text-left transition"
            :class="itemSelecionado?.id === m.id ? 'bg-amber-50' : 'hover:bg-gray-50'"
          >
            <span class="text-sm flex-shrink-0">{{ statusIconMissao(m) }}</span>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-medium text-gray-800 truncate">{{ m.titulo }}</p>
              <p class="text-[10px] text-gray-400 mt-0.5">
                {{ m.registro?.respondido_em ? 'Respondida ✓' : m.status === 'ENCERRADA' ? 'Encerrada' : m.data_final ? `até ${formatarDataCurta(m.data_final)}` : 'Aberta' }}
              </p>
            </div>
          </button>
        </template>

        <!-- Provas finais -->
        <template v-if="provasDaTab.length > 0">
          <div class="px-3.5 py-2 bg-gray-50 border-b border-gray-100" :class="missoesDaTab.length > 0 ? 'border-t border-gray-100' : ''">
            <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">📝 Provas Finais</p>
          </div>
          <button
            v-for="item in provasDaTab"
            :key="item.atividade_id"
            @click="selecionarItem(item)"
            class="w-full flex items-center gap-2.5 px-3.5 py-2.5 border-b border-gray-100 last:border-0 text-left transition"
            :class="itemSelecionado?.atividade_id === item.atividade_id ? 'bg-green-50' : 'hover:bg-gray-50'"
          >
            <span class="text-sm flex-shrink-0">{{ item.nota !== null ? '✅' : item.status === 'ENCERRADA' ? '🔒' : '📝' }}</span>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-medium text-gray-800 truncate">{{ item.titulo }}</p>
              <p class="text-[10px] mt-0.5" :class="item.nota !== null ? 'text-green-600 font-semibold' : 'text-gray-400'">
                {{ item.nota !== null ? `Nota: ${formatarNota(item.nota)}` : 'Sem nota ainda' }}
              </p>
            </div>
          </button>
        </template>
      </div>

      <!-- ── PAINEL DIREITO: detalhe ── -->
      <div v-if="itemSelecionado" class="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        <!-- Missão selecionada -->
        <template v-if="itemSelecionado._tipo === 'missao'">
          <div class="px-5 py-4 border-b border-gray-100 bg-amber-50 flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-[10px] font-bold text-amber-700 uppercase tracking-wider">⭐ Missão da Semana · {{ itemSelecionado.turmaNome }}</p>
              <h2 class="text-base font-bold text-gray-800 mt-1">{{ itemSelecionado.titulo }}</h2>
            </div>
            <span class="text-xs px-2 py-1 rounded-full font-bold flex-shrink-0 mt-0.5"
              :class="itemSelecionado.registro?.respondido_em ? 'bg-green-100 text-green-700' : itemSelecionado.status === 'ENCERRADA' ? 'bg-gray-100 text-gray-500' : 'bg-amber-100 text-amber-700'"
            >
              {{ itemSelecionado.registro?.respondido_em ? '✓ Respondida' : itemSelecionado.status === 'ENCERRADA' ? 'Encerrada' : 'Aberta' }}
            </span>
          </div>

          <div class="p-5 space-y-4">
            <!-- Aviso modo anônimo -->
            <div v-if="itemSelecionado.conteudo_json?.anonimo" class="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2.5">
              <span class="text-blue-400 text-base mt-0.5">🔒</span>
              <div>
                <p class="text-xs font-bold text-blue-700 mb-0.5">Esta missão é anônima</p>
                <p class="text-xs text-blue-600 leading-relaxed">O professor <strong>não terá acesso</strong> a quem respondeu. Fique à vontade para ser sincero(a) — sua identidade não será revelada.</p>
              </div>
            </div>

            <!-- Pergunta -->
            <div v-if="itemSelecionado.conteudo_json?.pergunta" class="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p class="text-xs font-semibold text-amber-700 mb-1">🎯 Pergunta</p>
              <p class="text-sm text-gray-800 leading-relaxed">{{ itemSelecionado.conteudo_json.pergunta }}</p>
            </div>

            <!-- Descrição / informações adicionais -->
            <div v-if="itemSelecionado.descricao" class="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
              <p class="text-xs font-semibold text-gray-500 mb-1">📋 Informações adicionais</p>
              <p class="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{{ itemSelecionado.descricao }}</p>
            </div>

            <!-- Prazo -->
            <div v-if="itemSelecionado.data_final" class="flex items-center gap-2 text-xs text-gray-500">
              <span>⏰</span>
              <span>Encerra {{ formatarDataFinal(itemSelecionado.data_final) }}</span>
              <span v-if="itemSelecionado.status === 'PUBLICADA' && new Date(itemSelecionado.data_final) < new Date()"
                class="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-semibold">Expirando...</span>
            </div>

            <!-- Estado: já respondida -->
            <div v-if="itemSelecionado.registro?.respondido_em">
              <div class="bg-green-50 border border-green-200 rounded-xl px-4 py-4">
                <p class="text-xs font-bold text-green-700 mb-2">✅ Você respondeu esta missão · <span class="font-normal text-green-600">+10 ⭐</span></p>
                <div v-if="itemSelecionado.registro.resposta_opcao" class="bg-white border border-green-100 rounded-lg px-3 py-2 text-sm text-gray-700">
                  <span class="text-xs font-semibold text-green-600 mr-1">Sua resposta:</span>{{ itemSelecionado.registro.resposta_opcao }}
                </div>
                <div v-else-if="itemSelecionado.registro.resposta_texto" class="bg-white border border-green-100 rounded-lg px-3 py-2.5 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  <span class="text-xs font-semibold text-green-600 block mb-1">Sua resposta:</span>{{ itemSelecionado.registro.resposta_texto }}
                </div>
              </div>
              <button @click="abrirResultado(itemSelecionado)" class="mt-2 w-full text-xs font-medium text-amber-600 hover:text-amber-700 py-1.5 transition-colors">
                📊 Ver o que a turma respondeu →
              </button>
            </div>

            <!-- Estado: aberta, não respondida -->
            <template v-else-if="itemSelecionado.status === 'PUBLICADA'">
              <button
                @click="abrirResponder(itemSelecionado)"
                class="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition active:scale-95"
              >
                ✏️ Participar e ganhar +10 ⭐
              </button>
            </template>

            <!-- Estado: encerrada e não participou -->
            <div v-else class="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-center">
              <p class="text-xs text-gray-500 font-medium">🔒 Missão encerrada — você não participou</p>
              <button @click="abrirResultado(itemSelecionado)" class="mt-2 text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors">
                📊 Ver resultado da turma →
              </button>
            </div>
          </div>
        </template>

        <!-- Prova selecionada -->
        <template v-else>
          <div class="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">📝 Prova Final · {{ itemSelecionado.turmaNome }}</p>
              <h2 class="text-base font-bold text-gray-800 mt-1">{{ itemSelecionado.titulo }}</h2>
            </div>
            <span class="text-xs px-2 py-1 rounded-full font-bold flex-shrink-0 mt-0.5"
              :class="itemSelecionado.status === 'ENCERRADA' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-700'"
            >
              {{ itemSelecionado.status === 'ENCERRADA' ? 'Encerrada' : 'Publicada' }}
            </span>
          </div>

          <div class="p-5 space-y-4">
            <!-- Nota em destaque -->
            <div class="rounded-2xl border-2 p-6 text-center"
              :class="itemSelecionado.nota !== null
                ? (Number(itemSelecionado.nota) >= 7 ? 'border-green-200 bg-green-50' : Number(itemSelecionado.nota) >= 5 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50')
                : 'border-gray-100 bg-gray-50'"
            >
              <p class="text-[10px] font-semibold uppercase tracking-wide mb-1"
                :class="itemSelecionado.nota !== null ? 'text-gray-500' : 'text-gray-400'">Sua nota</p>
              <p class="text-5xl font-extrabold"
                :class="itemSelecionado.nota !== null
                  ? (Number(itemSelecionado.nota) >= 7 ? 'text-green-700' : Number(itemSelecionado.nota) >= 5 ? 'text-yellow-700' : 'text-red-600')
                  : 'text-gray-300'"
              >{{ itemSelecionado.nota !== null ? formatarNota(itemSelecionado.nota) : '—' }}</p>
              <p class="text-xs mt-1" :class="itemSelecionado.nota !== null ? 'text-gray-400' : 'text-gray-300'">
                {{ itemSelecionado.nota !== null ? 'de 10,00' : 'Ainda não avaliado pelo professor' }}
              </p>
            </div>

            <!-- Feedback -->
            <div v-if="itemSelecionado.feedback">
              <p class="text-xs font-semibold text-gray-500 mb-2">💬 Feedback do(a) professor(a)</p>
              <div class="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {{ itemSelecionado.feedback }}
              </div>
            </div>

            <!-- Descrição -->
            <div v-if="itemSelecionado.descricao">
              <p class="text-xs font-semibold text-gray-500 mb-2">📋 Informações adicionais</p>
              <div class="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                {{ itemSelecionado.descricao }}
              </div>
            </div>

            <div v-if="!itemSelecionado.feedback && itemSelecionado.nota === null" class="text-center text-xs text-gray-400 py-2">
              Aguardando avaliação do professor.
            </div>
          </div>
        </template>
      </div>

      <!-- Vazio: nada selecionado -->
      <div v-else class="bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center py-16 text-center px-6 space-y-3">
        <p class="text-3xl">📚</p>
        <p class="text-sm font-medium text-gray-600">Selecione uma atividade</p>
        <p class="text-xs text-gray-400 max-w-xs leading-relaxed">
          Clique em uma atividade à esquerda para ver os detalhes, sua nota ou responder missões.
        </p>
      </div>
    </div>

    <!-- Modal: responder missão -->
    <Transition name="fade">
      <div v-if="modalResponder" class="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div class="px-6 pt-6 pb-4 border-b border-gray-100 bg-amber-50">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="text-xs font-semibold text-amber-600 uppercase tracking-wide">🎯 Missão da Semana</p>
                <h3 class="text-base font-semibold text-gray-800 mt-0.5 truncate">{{ missaoAtual?.titulo }}</h3>
              </div>
              <button @click="fecharResponder" class="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
          </div>
          <div class="px-6 py-5 space-y-4">
            <!-- Aviso anônimo no modal -->
            <div v-if="missaoAtual?.conteudo_json?.anonimo" class="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
              <span class="text-blue-400 text-sm">🔒</span>
              <p class="text-xs text-blue-600"><strong>Missão anônima</strong> — sua identidade não será revelada ao professor.</p>
            </div>
            <p class="text-sm text-gray-700 whitespace-pre-line">{{ missaoAtual?.conteudo_json?.pergunta }}</p>
            <!-- Múltipla escolha -->
            <div v-if="missaoAtual?.conteudo_json?.formato === 'multipla_escolha'" class="space-y-2">
              <button
                v-for="(opcao, i) in missaoAtual?.conteudo_json?.opcoes"
                :key="i"
                type="button"
                @click="opcaoSelecionada = opcao"
                class="w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition flex items-center gap-2"
                :class="opcaoSelecionada === opcao ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'"
              >
                <span class="text-xs font-bold w-5 shrink-0">{{ ['A','B','C','D'][i] }}</span>
                {{ opcao }}
              </button>
            </div>
            <!-- Texto livre -->
            <div v-else>
              <textarea
                v-model="respostaTexto"
                rows="4"
                placeholder="Escreva sua resposta..."
                class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition resize-none"
              ></textarea>
            </div>
          </div>
          <div class="px-6 pb-6">
            <button
              @click="enviarResposta"
              :disabled="!podeEnviar || enviando"
              class="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
            >
              <div v-if="enviando" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {{ enviando ? 'Enviando...' : '✅ Enviar resposta' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal: resultado da turma -->
    <Transition name="fade">
      <div v-if="modalResultado" class="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[85vh] flex flex-col">
          <div class="px-6 pt-6 pb-4 border-b border-gray-100">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="text-xs font-semibold text-amber-600 uppercase tracking-wide">📊 O que a turma respondeu</p>
                <h3 class="text-base font-semibold text-gray-800 mt-0.5 truncate">{{ missaoResultado?.titulo }}</h3>
              </div>
              <button @click="modalResultado = false" class="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
          </div>
          <div class="px-6 py-4 overflow-y-auto space-y-3">
            <div v-if="carregandoResultado" class="flex items-center justify-center gap-2 text-amber-600 text-sm py-6">
              <div class="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              Carregando...
            </div>
            <template v-else>
              <div v-if="missaoResultado?.conteudo_json?.formato === 'multipla_escolha'" class="space-y-3">
                <div v-if="totalRespostas === 0" class="text-center text-sm text-gray-400 py-4">Nenhuma resposta ainda.</div>
                <template v-else>
                  <div v-for="op in opcoesComPercentual" :key="op.texto">
                    <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span class="font-medium">{{ op.texto }}</span>
                      <span>{{ op.quantidade }} · {{ op.percentual }}%</span>
                    </div>
                    <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full bg-amber-400 rounded-full transition-all" :style="{ width: op.percentual + '%' }"></div>
                    </div>
                  </div>
                  <p class="text-xs text-gray-400 text-center pt-1">{{ totalRespostas }} resposta(s) no total</p>
                </template>
              </div>
              <div v-else class="space-y-2">
                <div v-if="respostasTexto.length === 0" class="text-center text-sm text-gray-400 py-4">Nenhuma resposta ainda.</div>
                <div v-for="(r, idx) in respostasTexto" :key="r.aluno_id" class="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
                  <p class="text-xs font-semibold text-gray-500 mb-1">
                    {{ missaoResultado?.conteudo_json?.anonimo ? `Participante ${idx + 1}` : r.nome }}
                  </p>
                  <p class="text-sm text-gray-700 whitespace-pre-line">{{ r.resposta_texto }}</p>
                </div>
              </div>
            </template>
          </div>
          <div class="px-6 py-4 border-t border-gray-100">
            <button @click="modalResultado = false" class="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Fechar</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { supabase } from '~/utils/supabase'

definePageMeta({ middleware: 'auth' })

const { $toast } = useNuxtApp()
const { user, atualizarEstrelasLocal } = useAuth()

const ESTRELAS_MISSAO = 10

const loading = ref(true)
const grupos = ref([])
const missoes = ref([])

const itemSelecionado = ref(null)

// ── Tabs ──────────────────────────────────────────────────────────────────
const tabAtiva = ref('ativas')

const tabs = computed(() => [
  { value: 'ativas', label: 'Ativas', count: todasAtividades.value.filter(isAtiva).length },
  { value: 'encerradas', label: 'Encerradas', count: todasAtividades.value.filter(isEncerrada).length },
  { value: 'todas', label: 'Todas', count: todasAtividades.value.length },
])

function isAtiva(item) {
  const s = item.status ?? (item.registro?.respondido_em ? null : null)
  return s === 'PUBLICADA'
}
function isEncerrada(item) {
  return (item.status ?? '') === 'ENCERRADA'
}

const todasAtividades = computed(() => {
  const result = []
  for (const m of missoes.value) result.push({ ...m, _tipo: 'missao' })
  for (const g of grupos.value) for (const a of g.atividades) result.push({ ...a, _tipo: 'prova' })
  return result
})

const atividadesDaTab = computed(() => {
  if (tabAtiva.value === 'ativas') return todasAtividades.value.filter(isAtiva)
  if (tabAtiva.value === 'encerradas') return todasAtividades.value.filter(isEncerrada)
  return todasAtividades.value
})

const missoesDaTab = computed(() => atividadesDaTab.value.filter((a) => a._tipo === 'missao'))
const provasDaTab = computed(() => atividadesDaTab.value.filter((a) => a._tipo === 'prova'))

function statusIconMissao(m) {
  if (m.registro?.respondido_em) return '✅'
  if (m.status === 'ENCERRADA') return '🔒'
  return '⭐'
}

function selecionarItem(item) {
  itemSelecionado.value = item
}

// ── Modal: responder missão ───────────────────────────────────────────────
const modalResponder = ref(false)
const missaoAtual = ref(null)
const opcaoSelecionada = ref(null)
const respostaTexto = ref('')
const enviando = ref(false)

const podeEnviar = computed(() => {
  if (!missaoAtual.value) return false
  if (missaoAtual.value.conteudo_json?.formato === 'multipla_escolha') return !!opcaoSelecionada.value
  return respostaTexto.value.trim().length > 0
})

function abrirResponder(m) {
  missaoAtual.value = m
  opcaoSelecionada.value = null
  respostaTexto.value = ''
  modalResponder.value = true
}

function fecharResponder() {
  modalResponder.value = false
}

async function enviarResposta() {
  if (!podeEnviar.value || !missaoAtual.value) return
  const alunoId = user.value?.id
  if (!alunoId) return
  enviando.value = true
  try {
    const m = missaoAtual.value
    const formato = m.conteudo_json?.formato
    const payload = {
      atividade_id: m.id,
      aluno_id: alunoId,
      feito: true,
      respondido_em: new Date().toISOString(),
      resposta_opcao: formato === 'multipla_escolha' ? opcaoSelecionada.value : null,
      resposta_texto: formato === 'texto_livre' ? respostaTexto.value.trim() : null,
    }
    if (m.registro?._id) payload.id = m.registro._id

    const { error } = await supabase.from('atividade_aluno').upsert(payload, { onConflict: 'atividade_id,aluno_id' })
    if (error) throw error

    const { data: usuarioRow, error: erroUsuario } = await supabase.from('usuarios').select('estrelas').eq('id', alunoId).single()
    if (erroUsuario) throw erroUsuario

    const novoSaldo = (usuarioRow?.estrelas ?? 0) + ESTRELAS_MISSAO
    const { error: erroSaldo } = await supabase.from('usuarios').update({ estrelas: novoSaldo }).eq('id', alunoId)
    if (erroSaldo) throw erroSaldo

    atualizarEstrelasLocal(novoSaldo)
    supabase.from('estrelas_historico').insert({
      usuario_id: alunoId,
      quantidade: ESTRELAS_MISSAO,
      motivo: 'MISSAO_RESPONDIDA',
      descricao: `Respondeu missão da semana: ${m.titulo ?? 'Missão'}`,
      turma_id: m.turmaId ?? null,
    }).then(() => {})

    const registroAtualizado = {
      ...(m.registro || {}),
      respondido_em: payload.respondido_em,
      resposta_opcao: payload.resposta_opcao,
      resposta_texto: payload.resposta_texto,
      feito: true,
    }

    // Atualizar localmente
    const idx = missoes.value.findIndex((x) => x.id === m.id)
    if (idx >= 0) missoes.value[idx] = { ...missoes.value[idx], registro: registroAtualizado }
    if (itemSelecionado.value?.id === m.id) {
      itemSelecionado.value = { ...itemSelecionado.value, registro: registroAtualizado }
    }

    modalResponder.value = false
    $toast.success('Missão da semana respondida! +10 ⭐')
  } catch (err) {
    console.error(err)
    $toast.error('Erro ao enviar sua resposta.')
  } finally {
    enviando.value = false
  }
}

// ── Modal: resultado da turma ─────────────────────────────────────────────
const modalResultado = ref(false)
const missaoResultado = ref(null)
const carregandoResultado = ref(false)
const registrosResultado = ref([])

async function abrirResultado(m) {
  missaoResultado.value = m
  modalResultado.value = true
  carregandoResultado.value = true
  registrosResultado.value = []

  const { data, error } = await supabase
    .from('atividade_aluno')
    .select('aluno_id, resposta_texto, resposta_opcao, respondido_em, usuarios!inner(nome)')
    .eq('atividade_id', m.id)
    .not('respondido_em', 'is', null)

  if (error) { console.error(error); $toast.error('Erro ao carregar resultado.') }
  registrosResultado.value = (data || []).map((r) => ({
    aluno_id: r.aluno_id,
    resposta_texto: r.resposta_texto,
    resposta_opcao: r.resposta_opcao,
    respondido_em: r.respondido_em,
    nome: r.usuarios?.nome ?? '',
  }))
  carregandoResultado.value = false
}

const totalRespostas = computed(() => registrosResultado.value.length)

const opcoesComPercentual = computed(() => {
  const opcoes = missaoResultado.value?.conteudo_json?.opcoes ?? []
  const total = registrosResultado.value.length
  return opcoes.map((texto) => {
    const quantidade = registrosResultado.value.filter((r) => r.resposta_opcao === texto).length
    const percentual = total > 0 ? Math.round((quantidade / total) * 100) : 0
    return { texto, quantidade, percentual }
  })
})

const respostasTexto = computed(() => registrosResultado.value.filter((r) => r.resposta_texto))

// ── Helpers ───────────────────────────────────────────────────────────────
function formatarDataCurta(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function formatarDataFinal(dataFinal) {
  if (!dataFinal) return ''
  const d = new Date(dataFinal)
  const hoje = new Date()
  const diff = d - hoje
  const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (dias <= 0) return 'hoje'
  if (dias === 1) return 'amanhã'
  if (dias <= 7) return `em ${dias} dias`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function formatarNota(nota) {
  if (nota === null || nota === undefined) return '—'
  return Number(nota).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── Carregamento ──────────────────────────────────────────────────────────
async function carregarAtividades() {
  const alunoId = user.value?.id
  if (!alunoId) return

  const { data: turmasAluno } = await supabase
    .from('turma_aluno')
    .select('turma_id, turma!inner(id, nome, status)')
    .eq('aluno_id', alunoId)
    .eq('turma.status', 'ATIVA')

  if (!turmasAluno || turmasAluno.length === 0) { loading.value = false; return }

  const turmaIds = turmasAluno.map((t) => t.turma_id)
  const mapaTurmas = Object.fromEntries(turmasAluno.map((t) => [t.turma_id, t.turma?.nome ?? '']))

  const { data: atividades } = await supabase
    .from('atividade')
    .select('*')
    .in('turma_id', turmaIds)
    .in('status', ['PUBLICADA', 'ENCERRADA'])
    .order('criado_em', { ascending: false })

  if (!atividades || atividades.length === 0) { loading.value = false; return }

  const atividadeIds = atividades.map((a) => a.id)

  const { data: registros } = await supabase
    .from('atividade_aluno')
    .select('*')
    .eq('aluno_id', alunoId)
    .in('atividade_id', atividadeIds)

  const mapaRegistros = Object.fromEntries((registros || []).map((r) => [r.atividade_id, r]))

  const normais = atividades.filter((a) => a.tipo_missao !== 'MISSAO')
  const missoesRaw = atividades.filter((a) => a.tipo_missao === 'MISSAO')

  // Montar grupos de provas por turma
  const lista = normais.map((a) => {
    const reg = mapaRegistros[a.id]
    return {
      atividade_id: a.id,
      titulo: a.titulo,
      tipo: a.tipo,
      status: a.status,
      descricao: a.descricao,
      turmaId: a.turma_id,
      turmaNome: mapaTurmas[a.turma_id] ?? '',
      nota: reg?.nota ?? null,
      feedback: reg?.feedback ?? '',
      _tipo: 'prova',
    }
  })

  const mapaGrupos = {}
  for (const item of lista) {
    if (!mapaGrupos[item.turmaId]) {
      mapaGrupos[item.turmaId] = { turmaId: item.turmaId, turmaNome: item.turmaNome, atividades: [] }
    }
    mapaGrupos[item.turmaId].atividades.push(item)
  }
  grupos.value = Object.values(mapaGrupos).sort((a, b) => a.turmaNome.localeCompare(b.turmaNome))

  // Montar missões
  missoes.value = missoesRaw.map((a) => {
    const reg = mapaRegistros[a.id]
    return {
      id: a.id,
      titulo: a.titulo,
      status: a.status,
      descricao: a.descricao ?? null,
      data_final: a.data_final ?? null,
      turmaId: a.turma_id,
      turmaNome: mapaTurmas[a.turma_id] ?? '',
      conteudo_json: a.conteudo_json ?? {},
      registro: reg ? { _id: reg.id, resposta_texto: reg.resposta_texto, resposta_opcao: reg.resposta_opcao, respondido_em: reg.respondido_em } : null,
      _tipo: 'missao',
    }
  })

  loading.value = false
}

onMounted(carregarAtividades)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
