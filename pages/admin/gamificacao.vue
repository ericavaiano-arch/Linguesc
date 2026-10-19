<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-green-700">Gamificação</h1>
      <p class="text-gray-500 mt-2">Visão centralizada de estrelas, perfis e recompensas.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Usuários</p>
        <p class="text-3xl font-bold text-gray-800">{{ stats.total }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total de estrelas</p>
        <p class="text-3xl font-bold text-amber-600">{{ stats.totalEstrelas.toLocaleString('pt-BR') }} ⭐</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Recompensas requisitadas</p>
        <p class="text-3xl font-bold text-green-700">{{ stats.recompensas }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Logins totais</p>
        <p class="text-3xl font-bold text-blue-600">{{ stats.logins.toLocaleString('pt-BR') }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-600">Turma:</label>
        <select
          v-model="filtroTurma"
          class="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        >
          <option value="">Todas as turmas</option>
          <option v-for="t in turmasDisponiveis" :key="t.id" :value="t.id">{{ t.nome }}</option>
        </select>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-600">Perfil:</label>
        <select
          v-model="filtroPerfil"
          class="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        >
          <option value="">Todos</option>
          <option value="ALUNO">Estudantes</option>
          <option value="PROFESSOR">Professores</option>
        </select>
      </div>

      <div class="flex-1 min-w-[200px]">
        <input
          v-model="filtroNome"
          type="text"
          placeholder="Buscar por nome..."
          class="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        />
      </div>

      <button
        v-if="filtroTurma || filtroNome || filtroPerfil"
        @click="limparFiltros"
        class="text-sm text-gray-400 hover:text-gray-600 transition"
      >
        Limpar filtros
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center gap-3 text-green-700 py-12">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando dados de gamificação...</span>
    </div>

    <!-- Tabela -->
    <div v-else class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          {{ linhasFiltradas.length }} usuário{{ linhasFiltradas.length !== 1 ? 's' : '' }}
        </span>
        <div class="flex items-center gap-2">
          <label class="text-xs text-gray-400">Ordenar por:</label>
          <select
            v-model="ordenacao"
            class="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="nome">Nome</option>
            <option value="estrelas">Estrelas ↓</option>
            <option value="logins">Logins ↓</option>
            <option value="recompensas">Recompensas ↓</option>
          </select>
        </div>
      </div>

      <div v-if="linhasFiltradas.length === 0" class="text-center py-16 text-gray-400 text-sm">
        Nenhum usuário encontrado com os filtros selecionados.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
              <th class="text-left px-6 py-3 font-semibold">Nome</th>
              <th class="text-left px-4 py-3 font-semibold">Turma(s)</th>
              <th class="text-center px-4 py-3 font-semibold">Estrelas</th>
              <th class="text-center px-4 py-3 font-semibold">Nível Perfil</th>
              <th class="text-center px-4 py-3 font-semibold">Logins</th>
              <th class="text-center px-4 py-3 font-semibold">Recompensas</th>
              <th class="text-center px-4 py-3 font-semibold">Detalhes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="linha in linhasFiltradas"
              :key="linha.id"
              class="hover:bg-gray-50 transition"
            >
              <!-- Nome + papel -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm"
                    :class="linha.papel === 'PROFESSOR' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'"
                  >
                    {{ linha.nome?.[0]?.toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-gray-800 truncate">{{ linha.nome }}</p>
                    <span
                      class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      :class="linha.papel === 'PROFESSOR' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'"
                    >{{ linha.papel === 'ALUNO' ? 'ESTUDANTE' : linha.papel }}</span>
                  </div>
                </div>
              </td>

              <!-- Turmas -->
              <td class="px-4 py-4 max-w-[200px]">
                <div v-if="linha.turmas.length === 0" class="text-gray-300 text-xs">—</div>
                <div v-else class="flex flex-wrap gap-1">
                  <span
                    v-for="turma in linha.turmas"
                    :key="turma.id"
                    class="text-[10px] bg-gray-100 text-gray-600 rounded-lg px-2 py-0.5 font-medium whitespace-nowrap"
                  >{{ turma.nome }}</span>
                </div>
              </td>

              <!-- Estrelas -->
              <td class="px-4 py-4 text-center">
                <span class="font-bold text-amber-700">{{ linha.estrelas ?? 0 }}</span>
                <span class="text-gray-400 ml-0.5">⭐</span>
              </td>

              <!-- Nível Perfil -->
              <td class="px-4 py-4 text-center">
                <span
                  class="inline-block text-xs font-bold px-2.5 py-1 rounded-full"
                  :class="nivelClass(linha.nivel_perfil)"
                >
                  {{ nivelLabel(linha.nivel_perfil) }}
                </span>
              </td>

              <!-- Logins -->
              <td class="px-4 py-4 text-center">
                <span class="font-semibold text-blue-700">{{ linha.qtd_logins }}</span>
              </td>

              <!-- Recompensas -->
              <td class="px-4 py-4 text-center">
                <span
                  class="font-semibold"
                  :class="linha.qtd_recompensas > 0 ? 'text-green-700' : 'text-gray-300'"
                >{{ linha.qtd_recompensas }}</span>
              </td>

              <!-- Botão detalhes -->
              <td class="px-4 py-4 text-center">
                <button
                  @click="abrirDetalhes(linha)"
                  class="text-xs bg-green-50 hover:bg-green-100 text-green-700 font-semibold px-3 py-1.5 rounded-lg transition active:scale-95"
                >
                  Ver histórico
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de histórico de estrelas -->
    <Transition name="fade">
      <div
        v-if="modalAberto"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
        @click.self="fecharModal"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
          <!-- Modal header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 class="text-base font-bold text-gray-800">Histórico de Estrelas</h2>
              <p class="text-xs text-gray-400 mt-0.5">{{ modalUsuario?.nome }}</p>
            </div>
            <button
              @click="fecharModal"
              class="text-gray-400 hover:text-gray-600 text-xl leading-none transition"
            >×</button>
          </div>

          <!-- Resumo rápido -->
          <div class="flex gap-4 px-6 py-4 border-b border-gray-50 flex-wrap">
            <div class="flex flex-col items-center bg-amber-50 border border-amber-100 rounded-xl px-4 py-2 min-w-[80px]">
              <span class="text-xl font-extrabold text-amber-800">{{ modalUsuario?.estrelas ?? 0 }}</span>
              <span class="text-[10px] text-amber-600 font-semibold uppercase tracking-wide">estrelas</span>
            </div>
            <div class="flex flex-col items-center bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 min-w-[80px]">
              <span class="text-xl font-extrabold text-blue-800">{{ modalUsuario?.qtd_logins }}</span>
              <span class="text-[10px] text-blue-600 font-semibold uppercase tracking-wide">logins</span>
            </div>
            <div class="flex flex-col items-center bg-green-50 border border-green-100 rounded-xl px-4 py-2 min-w-[80px]">
              <span class="text-xl font-extrabold text-green-800">{{ modalUsuario?.qtd_recompensas }}</span>
              <span class="text-[10px] text-green-600 font-semibold uppercase tracking-wide">recompensas</span>
            </div>
          </div>

          <!-- Histórico -->
          <div class="overflow-y-auto flex-1 px-6 py-4">
            <div v-if="loadingHistorico" class="flex items-center gap-2 text-green-700 py-4">
              <div class="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <span class="text-sm">Carregando...</span>
            </div>

            <div v-else-if="historicoEstrelas.length === 0" class="text-center py-8 text-gray-400 text-sm">
              Nenhuma estrela registrada ainda.
            </div>

            <ul v-else class="space-y-2">
              <li
                v-for="item in historicoEstrelas"
                :key="item.id"
                class="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3"
              >
                <div
                  class="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                  :class="item.quantidade > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'"
                >
                  {{ item.quantidade > 0 ? '+' : '' }}{{ item.quantidade }}
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-700 leading-snug">{{ item.descricao || item.motivo }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ formatarData(item.created_at) }}</p>
                </div>
              </li>
            </ul>
          </div>

          <div class="px-6 py-4 border-t border-gray-100">
            <button
              @click="fecharModal"
              class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition text-sm"
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

definePageMeta({ middleware: 'admin' })

const loading = ref(true)
const loadingHistorico = ref(false)
const filtroTurma = ref('')
const filtroNome = ref('')
const filtroPerfil = ref('')
const ordenacao = ref('nome')
const modalAberto = ref(false)
const modalUsuario = ref(null)
const historicoEstrelas = ref([])

const todasLinhas = ref([])
const turmasDisponiveis = ref([])
const mapaLogins = ref({})
const mapaRecompensas = ref({})
const mapaTurmasAluno = ref({})  // userId -> [{ id, nome }]
const mapaTurmasProfessor = ref({})

onMounted(async () => {
  const [
    { data: usuarios },
    { data: papeis },
    { data: turmas },
    { data: vinculos },
    { data: loginContagem },
    { data: recompensaContagem },
  ] = await Promise.all([
    supabase.from('usuarios').select('id, nome, estrelas, nivel_perfil, ativo').eq('ativo', true),
    supabase.from('usuario_papel').select('usuario_id, papel').eq('ativo', true),
    supabase.from('turma').select('id, nome, professor_id').in('status', ['ATIVA']).eq('is_teste', false),
    supabase.from('turma_aluno').select('turma_id, aluno_id'),
    supabase.from('login_historico').select('usuario_id'),
    supabase.from('recompensa_requisicao').select('usuario_id'),
  ])

  // Logins por usuário
  const loginsMap = {}
  ;(loginContagem || []).forEach(l => {
    loginsMap[l.usuario_id] = (loginsMap[l.usuario_id] || 0) + 1
  })
  mapaLogins.value = loginsMap

  // Recompensas por usuário
  const recompMap = {}
  ;(recompensaContagem || []).forEach(r => {
    recompMap[r.usuario_id] = (recompMap[r.usuario_id] || 0) + 1
  })
  mapaRecompensas.value = recompMap

  // Turmas por aluno
  const turmasAluno = {}
  const turmaMap = Object.fromEntries((turmas || []).map(t => [t.id, t]))
  ;(vinculos || []).forEach(v => {
    const turma = turmaMap[v.turma_id]
    if (!turma) return
    if (!turmasAluno[v.aluno_id]) turmasAluno[v.aluno_id] = []
    turmasAluno[v.aluno_id].push({ id: turma.id, nome: turma.nome })
  })
  mapaTurmasAluno.value = turmasAluno

  // Turmas por professor
  const turmasProfessor = {}
  ;(turmas || []).forEach(t => {
    if (!turmasProfessor[t.professor_id]) turmasProfessor[t.professor_id] = []
    turmasProfessor[t.professor_id].push({ id: t.id, nome: t.nome })
  })
  mapaTurmasProfessor.value = turmasProfessor

  // Papel por usuário (usa o primeiro papel ativo)
  const papelMap = {}
  ;(papeis || []).forEach(p => {
    if (!papelMap[p.usuario_id]) papelMap[p.usuario_id] = p.papel
  })

  // Montar linhas — exclui admins e usuários sem nenhuma turma real
  todasLinhas.value = (usuarios || [])
    .filter(u => {
      const papel = papelMap[u.id]
      if (!papel || papel === 'ADMIN') return false
      if (papel === 'PROFESSOR') return (turmasProfessor[u.id] || []).length > 0
      // ALUNO: mantém só se tiver vínculo com pelo menos uma turma real (não-teste)
      return (turmasAluno[u.id] || []).length > 0
    })
    .map(u => ({
      ...u,
      papel: papelMap[u.id],
      turmas: papelMap[u.id] === 'PROFESSOR'
        ? (turmasProfessor[u.id] || [])
        : (turmasAluno[u.id] || []),
      qtd_logins: loginsMap[u.id] || 0,
      qtd_recompensas: recompMap[u.id] || 0,
    }))

  turmasDisponiveis.value = (turmas || []).sort((a, b) => a.nome.localeCompare(b.nome))

  loading.value = false
})

const stats = computed(() => ({
  total: todasLinhas.value.length,
  totalEstrelas: todasLinhas.value.reduce((s, l) => s + (l.estrelas || 0), 0),
  recompensas: todasLinhas.value.reduce((s, l) => s + l.qtd_recompensas, 0),
  logins: todasLinhas.value.reduce((s, l) => s + l.qtd_logins, 0),
}))

const linhasFiltradas = computed(() => {
  let lista = todasLinhas.value

  if (filtroTurma.value) {
    const tid = filtroTurma.value
    lista = lista.filter(l => l.turmas.some(t => t.id === tid))
  }

  if (filtroPerfil.value) {
    lista = lista.filter(l => l.papel === filtroPerfil.value)
  }

  if (filtroNome.value.trim()) {
    const q = filtroNome.value.trim().toLowerCase()
    lista = lista.filter(l => l.nome?.toLowerCase().includes(q))
  }

  return [...lista].sort((a, b) => {
    if (ordenacao.value === 'estrelas') return (b.estrelas || 0) - (a.estrelas || 0)
    if (ordenacao.value === 'logins') return b.qtd_logins - a.qtd_logins
    if (ordenacao.value === 'recompensas') return b.qtd_recompensas - a.qtd_recompensas
    return (a.nome || '').localeCompare(b.nome || '')
  })
})

function nivelLabel(nivel) {
  const labels = { 0: 'Nível 0', 1: 'Nível 1', 2: 'Nível 2', 3: 'Nível 3', 4: 'Completo' }
  return labels[nivel] ?? `Nível ${nivel ?? 0}`
}

function nivelClass(nivel) {
  if (!nivel || nivel === 0) return 'bg-gray-100 text-gray-400'
  if (nivel === 1) return 'bg-blue-100 text-blue-600'
  if (nivel === 2) return 'bg-amber-100 text-amber-700'
  if (nivel >= 3) return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-400'
}

function limparFiltros() {
  filtroTurma.value = ''
  filtroNome.value = ''
  filtroPerfil.value = ''
}

async function abrirDetalhes(linha) {
  modalUsuario.value = linha
  modalAberto.value = true
  historicoEstrelas.value = []
  loadingHistorico.value = true

  const { data } = await supabase
    .from('estrelas_historico')
    .select('id, quantidade, motivo, descricao, created_at')
    .eq('usuario_id', linha.id)
    .order('created_at', { ascending: false })
    .limit(50)

  historicoEstrelas.value = data || []
  loadingHistorico.value = false
}

function fecharModal() {
  modalAberto.value = false
  modalUsuario.value = null
  historicoEstrelas.value = []
}

function formatarData(isoStr) {
  if (!isoStr) return ''
  return new Date(isoStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
