<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-green-700">Minhas Atividades</h1>
      <p class="text-gray-500 mt-2">Veja suas atividades, notas e feedbacks.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div
        class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"
      ></div>
      <span class="text-sm">Carregando...</span>
    </div>

    <div v-else>
      <!-- Sem nada disponível -->
      <div
        v-if="grupos.length === 0 && missoes.length === 0"
        class="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center"
      >
        <p class="text-4xl mb-4">📚</p>
        <p class="text-gray-500 font-medium">Nenhuma atividade disponível.</p>
      </div>

      <div v-else class="space-y-8 max-w-5xl">
        <!-- ── MISSÃO DA SEMANA ── -->
        <div v-if="missoes.length > 0">
          <div class="flex items-center gap-2 mb-4">
            <span class="text-2xl">⭐</span>
            <h2 class="text-xl font-bold text-amber-600">Missão da Semana</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div
              v-for="m in missoes"
              :key="m.id"
              class="bg-white border-2 rounded-2xl p-5 shadow-sm flex flex-col"
              :class="corBordaMissao(m)"
            >
              <div class="flex items-start justify-between gap-2 mb-2">
                <div class="min-w-0">
                  <p class="text-xs text-amber-600 font-semibold uppercase tracking-wide truncate">
                    {{ m.turmaNome }}
                  </p>
                  <h3 class="text-base font-bold text-gray-800 mt-0.5">
                    {{ m.titulo }}
                  </h3>
                </div>
                <span
                  class="text-xs px-2 py-1 rounded-full font-bold bg-amber-100 text-amber-700 shrink-0"
                >
                  ⭐ +5
                </span>
              </div>

              <p
                v-if="m.conteudo_json?.pergunta"
                class="text-sm text-gray-600 mb-2 line-clamp-2"
              >
                {{ m.conteudo_json.pergunta }}
              </p>

              <!-- Data final -->
              <div v-if="m.data_final" class="mb-3">
                <span
                  v-if="m.status === 'PUBLICADA' && new Date(m.data_final) < new Date()"
                  class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700"
                >
                  ⏳ Expirando...
                </span>
                <span v-else class="text-xs text-gray-400">
                  Encerra {{ formatarDataFinal(m.data_final) }}
                </span>
              </div>

              <!-- Estado: aberta, ainda não respondida -->
              <template v-if="m.status === 'PUBLICADA' && !m.registro?.respondido_em">
                <button
                  @click="abrirResponder(m)"
                  class="mt-auto w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-xl transition active:scale-95"
                >
                  Participar
                </button>
              </template>

              <!-- Estado: já respondida -->
              <template v-else-if="m.registro?.respondido_em">
                <div class="bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 mb-2">
                  <p class="text-xs font-semibold text-green-700 mb-1">
                    ✅ Você respondeu · ⭐ +5 estrelas!
                  </p>
                  <p v-if="m.registro.resposta_opcao" class="text-sm text-gray-700">
                    {{ m.registro.resposta_opcao }}
                  </p>
                  <p
                    v-else-if="m.registro.resposta_texto"
                    class="text-sm text-gray-700 whitespace-pre-line line-clamp-3"
                  >
                    {{ m.registro.resposta_texto }}
                  </p>
                </div>
                <button
                  @click="abrirResultado(m)"
                  class="mt-auto w-full text-xs font-medium text-amber-600 hover:text-amber-700 py-1.5"
                >
                  📊 Ver o que a turma respondeu
                </button>
              </template>

              <!-- Estado: encerrada e não participou -->
              <template v-else-if="m.status === 'ENCERRADA'">
                <div class="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 mb-2 text-center">
                  <p class="text-xs text-gray-500 font-medium">
                    🔒 Missão encerrada — você não participou
                  </p>
                </div>
                <button
                  @click="abrirResultado(m)"
                  class="mt-auto w-full text-xs font-medium text-amber-600 hover:text-amber-700 py-1.5"
                >
                  📊 Ver resultado da turma
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- ── BOLETIM POR TURMA ── -->
        <div
          v-for="grupo in grupos"
          :key="grupo.turmaId"
          class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
        >
          <div class="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0"
            >
              {{ grupo.turmaNome.charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <h2 class="text-base font-semibold text-gray-800 truncate">
                {{ grupo.turmaNome }}
              </h2>
              <p class="text-xs text-gray-400">{{ grupo.atividades.length }} atividade(s)</p>
            </div>
          </div>

          <!-- Provas Finais -->
          <div v-if="notasDoGrupo(grupo).length > 0">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left border-b border-gray-100">
                    <th class="font-medium text-xs text-gray-400 px-5 sm:px-6 py-2">Atividade</th>
                    <th class="font-medium text-xs text-gray-400 px-4 py-2 text-right">Nota</th>
                    <th class="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr
                    v-for="item in notasDoGrupo(grupo)"
                    :key="item.atividade_id"
                    @click="abrirDetalhe(item)"
                    class="cursor-pointer hover:bg-gray-50 transition"
                  >
                    <td class="px-5 sm:px-6 py-3">
                      <p class="font-medium text-gray-800 truncate max-w-[14rem] sm:max-w-xs">
                        {{ item.titulo }}
                      </p>
                    </td>

                    <td class="px-4 py-3 text-right whitespace-nowrap">
                      <span class="font-bold text-gray-700">
                        {{ item.nota !== null ? formatarNota(item.nota) : '—' }}
                      </span>
                    </td>

                    <td class="px-4 py-3 text-right whitespace-nowrap">
                      <span v-if="item.feedback" class="text-xs font-medium text-blue-500">💬 Feedback do(a) professor(a)</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Modal: detalhe (nota/participação) -->
    <Transition name="fade">
      <div
        v-if="modalDetalhe"
        class="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-4"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
          <div class="px-6 pt-6 pb-4 border-b border-gray-100">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="text-base font-semibold text-gray-800">
                  {{ atividadeDetalhe?.titulo }}
                </h3>
                <p class="text-xs text-gray-400 mt-0.5">
                  {{ atividadeDetalhe?.turmaNome }}
                </p>
              </div>
              <button
                @click="modalDetalhe = false"
                class="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
          </div>

          <div class="px-6 py-4 space-y-4">
            <div class="bg-gray-50 rounded-xl p-4 text-center">
              <p class="text-xs text-gray-400 mb-1">Sua nota</p>
              <p class="text-4xl font-bold text-gray-700">
                {{
                  atividadeDetalhe?.nota !== null
                    ? formatarNota(atividadeDetalhe?.nota)
                    : '—'
                }}
              </p>
              <p class="text-xs text-gray-400 mt-1">
                {{
                  atividadeDetalhe?.nota !== null
                    ? 'de 10,00'
                    : 'Ainda não avaliado'
                }}
              </p>
            </div>

            <div v-if="atividadeDetalhe?.feedback">
              <p class="text-xs font-medium text-gray-500 mb-1">
                💬 Feedback do(a) professor(a)
              </p>
              <p
                class="text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 whitespace-pre-line"
              >
                {{ atividadeDetalhe?.feedback }}
              </p>
            </div>

            <div v-if="atividadeDetalhe?.descricao">
              <p class="text-xs font-medium text-gray-500 mb-1">
                📋 Informações adicionais
              </p>
              <p
                class="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 whitespace-pre-line"
              >
                {{ atividadeDetalhe?.descricao }}
              </p>
            </div>
          </div>

          <div class="px-6 pb-6">
            <button
              @click="modalDetalhe = false"
              class="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal: responder missão -->
    <Transition name="fade">
      <div
        v-if="modalResponder"
        class="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-4"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div class="px-6 pt-6 pb-4 border-b border-gray-100 bg-amber-50">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                  🎯 Missão da Semana
                </p>
                <h3 class="text-base font-semibold text-gray-800 mt-0.5 truncate">
                  {{ missaoAtual?.titulo }}
                </h3>
              </div>
              <button
                @click="fecharResponder"
                class="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
          </div>

          <div class="px-6 py-5 space-y-4">
            <p class="text-sm text-gray-700 whitespace-pre-line">
              {{ missaoAtual?.conteudo_json?.pergunta }}
            </p>

            <!-- Múltipla escolha -->
            <div
              v-if="missaoAtual?.conteudo_json?.formato === 'multipla_escolha'"
              class="space-y-2"
            >
              <button
                v-for="(opcao, i) in missaoAtual?.conteudo_json?.opcoes"
                :key="i"
                type="button"
                @click="opcaoSelecionada = opcao"
                class="w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition flex items-center gap-2"
                :class="
                  opcaoSelecionada === opcao
                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                "
              >
                <span class="text-xs font-bold w-5 shrink-0">{{ ['A', 'B', 'C', 'D'][i] }}</span>
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
              <div
                v-if="enviando"
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></div>
              {{ enviando ? 'Enviando...' : '✅ Enviar resposta' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal: resultado da turma -->
    <Transition name="fade">
      <div
        v-if="modalResultado"
        class="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-4"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[85vh] flex flex-col">
          <div class="px-6 pt-6 pb-4 border-b border-gray-100">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                  📊 O que a turma respondeu
                </p>
                <h3 class="text-base font-semibold text-gray-800 mt-0.5 truncate">
                  {{ missaoResultado?.titulo }}
                </h3>
              </div>
              <button
                @click="modalResultado = false"
                class="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
          </div>

          <div class="px-6 py-4 overflow-y-auto space-y-3">
            <div
              v-if="carregandoResultado"
              class="flex items-center justify-center gap-2 text-amber-600 text-sm py-6"
            >
              <div class="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              Carregando...
            </div>

            <template v-else>
              <!-- Múltipla escolha: gráfico de barras -->
              <div
                v-if="missaoResultado?.conteudo_json?.formato === 'multipla_escolha'"
                class="space-y-3"
              >
                <div v-if="totalRespostas === 0" class="text-center text-sm text-gray-400 py-4">
                  Nenhuma resposta ainda.
                </div>
                <template v-else>
                  <div v-for="op in opcoesComPercentual" :key="op.texto">
                    <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span class="font-medium">{{ op.texto }}</span>
                      <span>{{ op.quantidade }} voto(s) · {{ op.percentual }}%</span>
                    </div>
                    <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-amber-400 rounded-full transition-all"
                        :style="{ width: op.percentual + '%' }"
                      ></div>
                    </div>
                  </div>
                  <p class="text-xs text-gray-400 text-center pt-1">
                    {{ totalRespostas }} resposta(s) no total
                  </p>
                </template>
              </div>

              <!-- Texto livre: lista de respostas -->
              <div v-else class="space-y-2">
                <div v-if="respostasTexto.length === 0" class="text-center text-sm text-gray-400 py-4">
                  Nenhuma resposta ainda.
                </div>
                <div
                  v-for="r in respostasTexto"
                  :key="r.aluno_id"
                  class="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5"
                >
                  <p class="text-xs font-semibold text-gray-500 mb-1">{{ r.nome }}</p>
                  <p class="text-sm text-gray-700 whitespace-pre-line">{{ r.resposta_texto }}</p>
                </div>
              </div>
            </template>
          </div>

          <div class="px-6 py-4 border-t border-gray-100">
            <button
              @click="modalResultado = false"
              class="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Fechar
            </button>
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

const ESTRELAS_MISSAO = 5

const loading = ref(true)
const grupos = ref([])
const modalDetalhe = ref(false)
const atividadeDetalhe = ref(null)

// ── Missão da Semana ─────────────────────────────────────────────────────
const missoes = ref([])

const modalResponder = ref(false)
const missaoAtual = ref(null)
const opcaoSelecionada = ref(null)
const respostaTexto = ref('')
const enviando = ref(false)

const modalResultado = ref(false)
const missaoResultado = ref(null)
const carregandoResultado = ref(false)
const registrosResultado = ref([])

function formatarDataFinal(dataFinal) {
  if (!dataFinal) return ''
  const d = new Date(dataFinal)
  const hoje = new Date()
  const diff = d - hoje
  const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (dias === 0) return 'hoje'
  if (dias === 1) return 'amanhã'
  if (dias > 1 && dias <= 7) return `em ${dias} dias`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function formatarNota(nota) {
  if (nota === null || nota === undefined) return '—'
  return Number(nota).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Provas finais de uma turma (todas as atividades normais agora são do tipo NOTA)
function notasDoGrupo(grupo) {
  return grupo.atividades
}

function abrirDetalhe(item) {
  atividadeDetalhe.value = item
  modalDetalhe.value = true
}

// ── Missão: helpers visuais ──────────────────────────────────────────────
function corBordaMissao(m) {
  if (m.registro?.respondido_em) return 'border-green-200'
  if (m.status === 'ENCERRADA') return 'border-gray-200'
  return 'border-amber-200'
}

const podeEnviar = computed(() => {
  if (!missaoAtual.value) return false
  if (missaoAtual.value.conteudo_json?.formato === 'multipla_escolha') {
    return !!opcaoSelecionada.value
  }
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

    const { error } = await supabase
      .from('atividade_aluno')
      .upsert(payload, { onConflict: 'atividade_id,aluno_id' })

    if (error) throw error

    // Credita estrelas (leitura + atualização do saldo)
    const { data: usuarioRow, error: erroUsuario } = await supabase
      .from('usuarios')
      .select('estrelas')
      .eq('id', alunoId)
      .single()

    if (erroUsuario) throw erroUsuario

    const novoSaldo = (usuarioRow?.estrelas ?? 0) + ESTRELAS_MISSAO
    const { error: erroSaldo } = await supabase
      .from('usuarios')
      .update({ estrelas: novoSaldo })
      .eq('id', alunoId)

    if (erroSaldo) throw erroSaldo

    // Reflete o novo saldo na Navbar (e em qualquer componente que leia user.estrelas)
    atualizarEstrelasLocal(novoSaldo)

    // Atualiza o card localmente sem precisar recarregar tudo
    m.registro = {
      ...(m.registro || {}),
      respondido_em: payload.respondido_em,
      resposta_opcao: payload.resposta_opcao,
      resposta_texto: payload.resposta_texto,
      feito: true,
    }

    modalResponder.value = false
    $toast.success('⭐ +5 estrelas!')
  } catch (err) {
    console.error(err)
    $toast.error('Erro ao enviar sua resposta.')
  } finally {
    enviando.value = false
  }
}

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

  if (error) {
    console.error(error)
    $toast.error('Erro ao carregar resultado da turma.')
  }

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

const respostasTexto = computed(() =>
  registrosResultado.value.filter((r) => r.resposta_texto),
)

// ── Carregamento principal ───────────────────────────────────────────────
async function carregarAtividades() {
  const alunoId = user.value?.id
  if (!alunoId) return

  // Buscar turmas do aluno
  const { data: turmasAluno } = await supabase
    .from('turma_aluno')
    .select('turma_id, turma!inner(id, nome)')
    .eq('aluno_id', alunoId)

  if (!turmasAluno || turmasAluno.length === 0) {
    loading.value = false
    return
  }

  const turmaIds = turmasAluno.map((t) => t.turma_id)
  const mapaTurmas = Object.fromEntries(
    turmasAluno.map((t) => [t.turma_id, t.turma?.nome ?? '']),
  )

  // Buscar atividades publicadas/encerradas dessas turmas
  const { data: atividades } = await supabase
    .from('atividade')
    .select('*')
    .in('turma_id', turmaIds)
    .in('status', ['PUBLICADA', 'ENCERRADA'])
    .order('criado_em', { ascending: false })

  if (!atividades || atividades.length === 0) {
    loading.value = false
    return
  }

  const atividadeIds = atividades.map((a) => a.id)

  // Buscar registros do aluno
  const { data: registros } = await supabase
    .from('atividade_aluno')
    .select('*')
    .eq('aluno_id', alunoId)
    .in('atividade_id', atividadeIds)

  const mapaRegistros = Object.fromEntries(
    (registros || []).map((r) => [r.atividade_id, r]),
  )

  // Separa provas finais das missões da semana
  const normais = atividades.filter((a) => a.tipo_missao !== 'MISSAO')
  const missoesRaw = atividades.filter((a) => a.tipo_missao === 'MISSAO')

  // Montar lista enriquecida — provas finais
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
    }
  })

  // Agrupar por turma
  const mapaGrupos = {}
  for (const item of lista) {
    if (!mapaGrupos[item.turmaId]) {
      mapaGrupos[item.turmaId] = {
        turmaId: item.turmaId,
        turmaNome: item.turmaNome,
        atividades: [],
      }
    }
    mapaGrupos[item.turmaId].atividades.push(item)
  }

  grupos.value = Object.values(mapaGrupos).sort((a, b) =>
    a.turmaNome.localeCompare(b.turmaNome),
  )

  // Montar lista de missões
  missoes.value = missoesRaw.map((a) => {
    const reg = mapaRegistros[a.id]
    return {
      id: a.id,
      titulo: a.titulo,
      status: a.status,
      data_final: a.data_final ?? null,
      turmaId: a.turma_id,
      turmaNome: mapaTurmas[a.turma_id] ?? '',
      conteudo_json: a.conteudo_json ?? {},
      registro: reg
        ? {
            _id: reg.id,
            resposta_texto: reg.resposta_texto,
            resposta_opcao: reg.resposta_opcao,
            respondido_em: reg.respondido_em,
          }
        : null,
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