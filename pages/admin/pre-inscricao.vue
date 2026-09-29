<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <!-- Header -->
    <div class="mb-8 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold text-green-700">Pré-inscrições</h1>
        <p class="text-gray-500 mt-2">Estudantes aguardando vinculação a uma turma.</p>
        <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total</p>
        <p class="text-3xl font-bold text-gray-800">{{ todos.length }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Pendentes</p>
        <p class="text-3xl font-bold text-amber-600">{{ todos.filter(r => !r.ativo).length }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Ativados</p>
        <p class="text-3xl font-bold text-green-600">{{ todos.filter(r => r.ativo).length }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Com turma</p>
        <p class="text-3xl font-bold text-blue-600">{{ todos.filter(r => r.turma_nome).length }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex gap-3 mb-6 flex-wrap items-center">
      <input
        v-model="busca"
        type="text"
        placeholder="Buscar por nome, e-mail ou CPF..."
        class="flex-1 min-w-56 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
      />
      <select
        v-model="filtroTurma"
        class="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition bg-white"
      >
        <option value="">Todas as turmas</option>
        <option value="__sem_turma__">Sem turma escolhida</option>
        <option v-for="t in turmasDisponiveis" :key="t.id" :value="String(t.id)">{{ t.nome }}</option>
      </select>
      <select
        v-model="filtroStatus"
        class="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition bg-white"
      >
        <option value="">Todos os status</option>
        <option value="pendente">Pendentes</option>
        <option value="ativado">Ativados</option>
      </select>
      <select
        v-model="filtroNivel"
        class="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition bg-white"
      >
        <option value="">Todos os níveis</option>
        <option value="INICIANTE">Iniciante</option>
        <option value="BASICO">Básico</option>
        <option value="INTERMEDIARIO">Intermediário</option>
        <option value="CONVERSACAO">Conversação</option>
      </select>
      <button
        v-if="temFiltro"
        @click="limparFiltros"
        class="text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition"
      >
        Limpar filtros
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando...</span>
    </div>

    <!-- Tabela -->
    <div v-else class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100">
            <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">Nome</th>
            <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">E-mail</th>
            <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">CPF</th>
            <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Nível</th>
            <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">Turma escolhida</th>
            <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">Motivo</th>
            <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Status</th>
            <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="filtrados.length === 0">
            <td colspan="8" class="text-center py-10 text-sm text-gray-400">Nenhuma pré-inscrição encontrada.</td>
          </tr>
          <tr v-for="r in filtrados" :key="r.id" class="hover:bg-gray-50 transition">
            <td class="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{{ r.nome }}</td>
            <td class="px-4 py-3 text-gray-500 text-xs">{{ r.email }}</td>
            <td class="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{{ formatCpf(r.cpf) }}</td>
            <td class="px-4 py-3 text-center">
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {{ NIVEL_MAP[r.nivel_preferido] ?? r.nivel_preferido }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-600 text-xs">{{ r.turma_nome ?? '—' }}</td>
            <td class="px-4 py-3 text-gray-400 text-xs max-w-xs">
              <span v-if="r.motivo" :title="r.motivo" class="truncate block max-w-[180px]">{{ r.motivo }}</span>
              <span v-else class="text-gray-300">—</span>
            </td>
            <td class="px-4 py-3 text-center">
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :class="r.ativo ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
              >
                {{ r.ativo ? 'Ativado' : 'Pendente' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <button
                @click="abrirVinculacao(r)"
                class="text-xs px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap"
                :class="r.ativo
                  ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'"
              >
                {{ r.ativo ? '🔗 Revisar vínculo' : '🔗 Vincular à turma' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filtrados.length > 0" class="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
        {{ filtrados.length }} registro{{ filtrados.length !== 1 ? 's' : '' }} exibido{{ filtrados.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Modal de vinculação -->
    <div
      v-if="modalVinculo"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="modalVinculo = null"
    >
      <div class="bg-white rounded-2xl shadow-xl p-7 w-full max-w-md space-y-5">
        <h3 class="text-lg font-semibold text-gray-800">Vincular estudante à turma</h3>

        <div class="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
          <p><span class="text-gray-400 text-xs">Estudante:</span> <span class="font-medium text-gray-800">{{ modalVinculo.nome }}</span></p>
          <p><span class="text-gray-400 text-xs">Nível preferido:</span>
            <span class="ml-1 text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{{ NIVEL_MAP[modalVinculo.nivel_preferido] }}</span>
          </p>
          <p v-if="modalVinculo.turma_nome"><span class="text-gray-400 text-xs">Turma escolhida pelo estudante:</span> <span class="text-gray-700">{{ modalVinculo.turma_nome }}</span></p>
          <p v-if="modalVinculo.motivo"><span class="text-gray-400 text-xs">Motivo:</span> <span class="text-gray-600">{{ modalVinculo.motivo }}</span></p>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 mb-2 block">Turma a vincular</label>
          <select
            v-model="turmaSelecionadaModal"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition bg-white"
          >
            <option value="">Selecione uma turma...</option>
            <option v-for="t in turmasDisponiveis" :key="t.id" :value="t.id">{{ t.nome }}</option>
          </select>
        </div>

        <p v-if="erroVinculo" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{{ erroVinculo }}</p>

        <div class="flex gap-3 justify-end pt-1">
          <button
            @click="modalVinculo = null"
            class="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            @click="confirmarVinculo"
            :disabled="!turmaSelecionadaModal || vinculando"
            class="px-5 py-2 rounded-xl text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center gap-2"
          >
            <div v-if="vinculando" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ vinculando ? 'Vinculando...' : 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { supabase } from '~/utils/supabase'

definePageMeta({ middleware: 'admin' })

const { $toast } = useNuxtApp()

const NIVEL_MAP = {
  INICIANTE: 'Iniciante',
  BASICO: 'Básico',
  INTERMEDIARIO: 'Intermediário',
  CONVERSACAO: 'Conversação',
}

const loading = ref(true)
const todos = ref([])
const turmasDisponiveis = ref([])

const busca = ref('')
const filtroTurma = ref('')
const filtroStatus = ref('')
const filtroNivel = ref('')

const modalVinculo = ref(null)
const turmaSelecionadaModal = ref('')
const vinculando = ref(false)
const erroVinculo = ref('')

const temFiltro = computed(() =>
  busca.value || filtroTurma.value || filtroStatus.value || filtroNivel.value
)

const filtrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return todos.value.filter((r) => {
    if (termo) {
      const ok =
        r.nome.toLowerCase().includes(termo) ||
        r.email.toLowerCase().includes(termo) ||
        (r.cpf ?? '').replace(/\D/g, '').includes(termo.replace(/\D/g, ''))
      if (!ok) return false
    }
    if (filtroTurma.value === '__sem_turma__' && r.turma_nome) return false
    if (filtroTurma.value && filtroTurma.value !== '__sem_turma__' && String(r.turma_id) !== filtroTurma.value) return false
    if (filtroStatus.value === 'pendente' && r.ativo) return false
    if (filtroStatus.value === 'ativado' && !r.ativo) return false
    if (filtroNivel.value && r.nivel_preferido !== filtroNivel.value) return false
    return true
  })
})

function limparFiltros() {
  busca.value = ''
  filtroTurma.value = ''
  filtroStatus.value = ''
  filtroNivel.value = ''
}

function formatCpf(cpf) {
  if (!cpf) return '—'
  const n = cpf.replace(/\D/g, '')
  if (n.length !== 11) return cpf
  return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function abrirVinculacao(r) {
  modalVinculo.value = r
  turmaSelecionadaModal.value = r.turma_id ? String(r.turma_id) : ''
  erroVinculo.value = ''
}

async function confirmarVinculo() {
  if (!turmaSelecionadaModal.value) return
  erroVinculo.value = ''
  vinculando.value = true
  try {
    await $fetch('/api/admin/vincular-aluno', {
      method: 'POST',
      body: {
        usuario_id: modalVinculo.value.usuario_id,
        turma_id: turmaSelecionadaModal.value,
      },
    })
    $toast.success(`${modalVinculo.value.nome} vinculado com sucesso!`)
    modalVinculo.value = null
    await carregar()
  } catch (err) {
    erroVinculo.value = err?.data?.message || 'Erro ao vincular.'
  } finally {
    vinculando.value = false
  }
}

async function carregar() {
  loading.value = true
  const [inscricoes, { data: turmas }] = await Promise.all([
    $fetch('/api/admin/pre-inscricoes'),
    supabase.from('turma').select('id, nome').eq('status', 'ATIVA').order('nome'),
  ])
  todos.value = inscricoes ?? []
  turmasDisponiveis.value = turmas ?? []
  loading.value = false
}

onMounted(carregar)
</script>
