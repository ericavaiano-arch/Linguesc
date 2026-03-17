<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <!-- Header -->
    <div class="mb-10 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold text-green-700">Minhas Turmas</h1>
        <p class="text-gray-500 mt-2">Gerencie suas turmas e aulas.</p>
        <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
      </div>
      <button
        @click="abrirCriacao"
        class="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl transition active:scale-95 flex items-center gap-2"
      >
        + Nova Turma
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando turmas...</span>
    </div>

    <!-- Nenhuma turma -->
    <div
      v-else-if="turmas.length === 0"
      class="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center"
    >
      <p class="text-4xl mb-4">📚</p>
      <p class="text-gray-500 font-medium">Nenhuma turma criada ainda.</p>
      <button @click="abrirCriacao" class="mt-4 text-green-600 font-semibold hover:underline text-sm">
        Criar minha primeira turma →
      </button>
    </div>

    <!-- Lista de turmas -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="turma in turmas"
        :key="turma.id"
        class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-green-500 transition-all duration-300"
      >
        <div class="flex items-start justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">
            {{ turma.nome }}
          </h2>
          <button @click="abrirEdicao(turma)" class="text-gray-300 hover:text-green-600 transition text-lg" title="Editar turma">
            ✏️
          </button>
        </div>

        <div class="flex gap-2">
          <button
            @click="$router.push(`/turmas/${turma.id}/aulas`)"
            class="flex-1 text-xs font-semibold px-3 py-4 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition"
          >
            📅 Aulas
          </button>
          <button
            @click="$router.push(`/chamada-manual/${turma.id}`)"
            class="flex-1 text-xs font-semibold px-3 py-4 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
          >
            ✅ Chamada
          </button>
        </div>
      </div>
    </div>

    <!-- ── OVERLAY ── -->
    <Transition name="fade">
      <div v-if="painelAberto" class="fixed inset-0 bg-black/40 z-[60]" @click="fecharPainel"></div>
    </Transition>

    <!-- ── DRAWER ── -->
    <Transition name="slide">
      <div
        v-if="painelAberto"
        class="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-lg font-semibold text-gray-800">
            {{ modo === 'criar' ? '➕ Nova Turma' : '✏️ Editar Turma' }}
          </h2>
          <button
            @click="fecharPainel"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition text-xl"
          >
            ×
          </button>
        </div>

        <!-- Conteúdo -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">

          <!-- Nome -->
          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block">Nome da Turma</label>
            <input
              v-model="edicaoNome"
              type="text"
              placeholder="Ex: Inglês A1 — 2026/1"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>

          <!-- Alunos já na turma (edição) -->
          <div v-if="modo === 'editar'">
            <p class="text-sm font-medium text-gray-700 mb-3">
              Alunos na turma
              <span class="text-xs text-gray-400 font-normal ml-1">({{ edicaoAlunos.length }} matriculado(s))</span>
            </p>

            <div v-if="loadingAlunos" class="flex items-center gap-2 text-green-700 text-sm py-2">
              <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              Carregando...
            </div>

            <ul v-else-if="edicaoAlunos.length > 0" class="space-y-2 mb-4">
              <li
                v-for="aluno in edicaoAlunos"
                :key="aluno.id"
                class="flex items-center justify-between px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl"
              >
                <span class="text-sm font-medium text-green-800">{{ aluno.nome }}</span>
                <button @click="removerAluno(aluno.id)" class="text-gray-300 hover:text-red-500 transition font-bold text-lg leading-none">×</button>
              </li>
            </ul>

            <p v-else class="text-sm text-gray-400 text-center py-3 mb-4">
              Nenhum aluno na turma.
            </p>
          </div>

          <!-- Chips de selecionados (criação) -->
          <div v-if="modo === 'criar' && edicaoAlunos.length > 0">
            <p class="text-xs text-gray-500 font-medium mb-2">{{ edicaoAlunos.length }} aluno(s) selecionado(s):</p>
            <ul class="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
              <li
                v-for="aluno in edicaoAlunos"
                :key="aluno.id"
                class="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-xs px-3 py-1.5 rounded-full"
              >
                {{ aluno.nome }}
                <button @click="removerAluno(aluno.id)" class="hover:text-red-500 transition font-bold leading-none">×</button>
              </li>
            </ul>
          </div>

          <!-- Adicionar alunos -->
          <div>
            <p class="text-sm font-medium text-gray-700 mb-2">Adicionar alunos</p>

            <div class="relative mb-3">
              <input
                v-model="filtroEdicao"
                type="text"
                placeholder="Filtrar por nome ou e-mail..."
                class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
              <div v-if="loadingAlunos" class="absolute right-3 top-3.5">
                <div class="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>

            <ul class="border border-gray-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-gray-100">
              <li v-if="todosAlunosFiltrados.length === 0" class="px-4 py-3 text-sm text-gray-400 text-center">
                Nenhum aluno encontrado.
              </li>
              <li
                v-for="aluno in todosAlunosFiltrados"
                :key="aluno.id"
                class="flex items-center justify-between px-4 py-3 transition"
                :class="jaMatriculadoEmOutraTurma(aluno.id) || edicaoAlunos.some(a => a.id === aluno.id)
                  ? 'bg-gray-50'
                  : 'hover:bg-gray-50'"
              >
                <div>
                  <p class="text-sm font-medium" :class="jaMatriculadoEmOutraTurma(aluno.id) ? 'text-gray-400' : 'text-gray-800'">
                    {{ aluno.nome }}
                  </p>
                  <p class="text-xs text-gray-400">{{ aluno.email }}</p>
                  <!-- Badge de turma já matriculada -->
                  <p v-if="jaMatriculadoEmOutraTurma(aluno.id)" class="text-xs text-orange-500 font-medium mt-0.5">
                    ⚠️ Já matriculado em "{{ nomeTurmaDoAluno(aluno.id) }}"
                  </p>
                </div>
                <button
                  @click="adicionarAluno(aluno)"
                  :disabled="jaMatriculadoEmOutraTurma(aluno.id) || edicaoAlunos.some(a => a.id === aluno.id)"
                  class="text-xs px-3 py-1.5 rounded-lg font-semibold transition flex-shrink-0 ml-3"
                  :class="jaMatriculadoEmOutraTurma(aluno.id)
                    ? 'bg-orange-50 text-orange-400 cursor-not-allowed'
                    : edicaoAlunos.some(a => a.id === aluno.id)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'"
                >
                  {{ jaMatriculadoEmOutraTurma(aluno.id) ? 'Bloqueado' : edicaoAlunos.some(a => a.id === aluno.id) ? '✓' : '+ Adicionar' }}
                </button>
              </li>
            </ul>
          </div>

        </div>

        <!-- Footer -->
        <div class="p-6 border-t">
          <button
            @click="salvar"
            :disabled="salvando || !edicaoNome.trim()"
            class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
          >
            <div v-if="salvando" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ salvando ? 'Salvando...' : (modo === 'criar' ? '✅ Criar Turma' : '💾 Salvar Alterações') }}
          </button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/utils/supabase'

const { $toast } = useNuxtApp()

const turmas = ref([])
const loading = ref(true)
const professorId = ref(null)

// Drawer
const painelAberto = ref(false)
const modo = ref('criar')
const salvando = ref(false)
const loadingAlunos = ref(false)
const turmaSelecionada = ref(null)

// Campos
const edicaoNome = ref('')
const edicaoAlunos = ref([])
const alunosOriginais = ref([])
const todosAlunos = ref([])
const filtroEdicao = ref('')

// Mapa: aluno_id → { turma_id, turma_nome } para todos os vínculos existentes
const mapaMatriculas = ref({}) // { [aluno_id]: { turmaId, turmaNome } }

// ─── Filtro local ─────────────────────────────────────────────────
const todosAlunosFiltrados = computed(() => {
  const termo = filtroEdicao.value.trim().toLowerCase()
  const lista = termo
    ? todosAlunos.value.filter(a =>
        a.nome.toLowerCase().includes(termo) ||
        a.email.toLowerCase().includes(termo)
      )
    : todosAlunos.value

  return [...lista].sort((a, b) => {
    const aBlocked = jaMatriculadoEmOutraTurma(a.id)
    const bBlocked = jaMatriculadoEmOutraTurma(b.id)
    if (aBlocked !== bBlocked) return aBlocked ? 1 : -1   // disponíveis primeiro
    return a.nome.localeCompare(b.nome)                    // alfabético dentro de cada grupo
  })
})
// ─── Helpers de matrícula ─────────────────────────────────────────
function jaMatriculadoEmOutraTurma(alunoId) {
  const matricula = mapaMatriculas.value[alunoId]
  if (!matricula) return false
  // No modo edição, ignora se o aluno já está NA turma que está sendo editada
  if (modo.value === 'editar' && turmaSelecionada.value) {
    return matricula.turmaId !== turmaSelecionada.value.id
  }
  return true
}

function nomeTurmaDoAluno(alunoId) {
  return mapaMatriculas.value[alunoId]?.turmaNome || ''
}

// ─── Carregar todas as matrículas existentes ──────────────────────
async function carregarMatriculas() {
  const { data } = await supabase
    .from('turma_aluno')
    .select('aluno_id, turma_id, turma(id, nome)')

  const mapa = {}
  ;(data || []).forEach(v => {
    mapa[v.aluno_id] = {
      turmaId: v.turma_id,
      turmaNome: v.turma?.nome || ''
    }
  })
  mapaMatriculas.value = mapa
}

// ─── Carregar turmas ──────────────────────────────────────────────
async function carregarTurmas() {
  if (!professorId.value) { loading.value = false; return }

  const { data, error } = await supabase
    .from('turma')
    .select('*')
    .eq('professor_id', professorId.value)
    .order('nome', { ascending: true })

  if (error) console.error('Erro ao buscar turmas:', error.message)
  else turmas.value = data
  loading.value = false
}

// ─── Carregar todos os alunos ─────────────────────────────────────
async function carregarTodosAlunos() {
  const { data } = await supabase
    .from('usuarios')
    .select('id, nome, email')
    .eq('tipoUsuario', 'ALUNO')
    .order('nome', { ascending: true })
  todosAlunos.value = data || []
}

// ─── Abrir criação ────────────────────────────────────────────────
async function abrirCriacao() {
  modo.value = 'criar'
  edicaoNome.value = ''
  edicaoAlunos.value = []
  alunosOriginais.value = []
  filtroEdicao.value = ''
  painelAberto.value = true
  loadingAlunos.value = true
  await Promise.all([carregarTodosAlunos(), carregarMatriculas()])
  loadingAlunos.value = false
}

// ─── Abrir edição ─────────────────────────────────────────────────
async function abrirEdicao(turma) {
  modo.value = 'editar'
  turmaSelecionada.value = turma
  edicaoNome.value = turma.nome
  edicaoAlunos.value = []
  filtroEdicao.value = ''
  painelAberto.value = true
  loadingAlunos.value = true

  const [{ data: vinculos }, { data: todos }] = await Promise.all([
    supabase
      .from('turma_aluno')
      .select('aluno_id, usuarios(id, nome, email)')
      .eq('turma_id', turma.id),
    supabase
      .from('usuarios')
      .select('id, nome, email')
      .eq('tipoUsuario', 'ALUNO')
      .order('nome', { ascending: true })
  ])

  await carregarMatriculas()

  edicaoAlunos.value = (vinculos || [])
    .map(v => ({ id: v.aluno_id, nome: v.usuarios?.nome || '', email: v.usuarios?.email || '' }))
    .sort((a, b) => a.nome.localeCompare(b.nome))

  alunosOriginais.value = edicaoAlunos.value.map(a => a.id)
  todosAlunos.value = todos || []
  loadingAlunos.value = false
}

function fecharPainel() {
  painelAberto.value = false
  turmaSelecionada.value = null
}

function adicionarAluno(aluno) {
  if (jaMatriculadoEmOutraTurma(aluno.id)) return
  if (!edicaoAlunos.value.some(a => a.id === aluno.id)) {
    edicaoAlunos.value = [...edicaoAlunos.value, aluno]
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }
}

function removerAluno(id) {
  edicaoAlunos.value = edicaoAlunos.value.filter(a => a.id !== id)
}

// ─── Salvar ───────────────────────────────────────────────────────
async function salvar() {
  if (!edicaoNome.value.trim()) return
  salvando.value = true
  try {
    if (modo.value === 'criar') await salvarCriacao()
    else await salvarEdicao()
  } catch (err) {
    console.error(err)
    $toast.error('Erro ao salvar. Tente novamente.')
  } finally {
    salvando.value = false
  }
}

async function salvarCriacao() {
  const nomeTrimmed = edicaoNome.value.trim()
  const duplicado = turmas.value.some(
    t => t.nome.toLowerCase() === nomeTrimmed.toLowerCase()
  )
  if (duplicado) {
    $toast.error('Já existe uma turma com este nome.')
    return
  }

  const { data: novaTurma, error: errTurma } = await supabase
    .from('turma')
    .insert([{ nome: edicaoNome.value.trim(), professor_id: professorId.value }])
    .select()
    .single()

  if (errTurma) throw errTurma

  if (edicaoAlunos.value.length > 0) {
    const { error: errVinculo } = await supabase
      .from('turma_aluno')
      .insert(edicaoAlunos.value.map(a => ({ turma_id: novaTurma.id, aluno_id: a.id })))
    if (errVinculo) throw errVinculo
  }

  $toast.success('Turma criada com sucesso!')
  fecharPainel()
  await carregarTurmas()
}

async function salvarEdicao() {
  const nomeTrimmed = edicaoNome.value.trim()
  const turmaId = turmaSelecionada.value.id

  // Verifica nome duplicado (ignora a própria turma)
  const duplicado = turmas.value.some(
    t => t.nome.toLowerCase() === nomeTrimmed.toLowerCase() && t.id !== turmaId
  )
  if (duplicado) {
    $toast.error('Já existe uma turma com este nome.')
    return
  }

  const promessas = []

  if (edicaoNome.value.trim() !== turmaSelecionada.value.nome) {
    promessas.push(
      supabase.from('turma').update({ nome: edicaoNome.value.trim() }).eq('id', turmaId)
    )
  }

  const idsAtuais = edicaoAlunos.value.map(a => a.id)
  const aInserir = idsAtuais.filter(id => !alunosOriginais.value.includes(id))
  const aRemover = alunosOriginais.value.filter(id => !idsAtuais.includes(id))

  if (aInserir.length > 0) {
    promessas.push(
      supabase.from('turma_aluno').insert(
        aInserir.map(aluno_id => ({ turma_id: turmaId, aluno_id }))
      )
    )
  }

  if (aRemover.length > 0) {
    promessas.push(
      supabase.from('turma_aluno').delete().eq('turma_id', turmaId).in('aluno_id', aRemover)
    )
  }

  if (promessas.length === 0) {
    $toast.warning('Nenhuma alteração detectada.')
    return
  }

  const resultados = await Promise.all(promessas)
  const erros = resultados.filter(r => r.error)
  if (erros.length > 0) throw erros[0].error

  $toast.success('Turma atualizada com sucesso!')
  fecharPainel()
  await carregarTurmas()
}

onMounted(() => {
  const stored = localStorage.getItem('user')
  professorId.value = stored ? JSON.parse(stored)?.id : null
  carregarTurmas()
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>