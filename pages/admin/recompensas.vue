<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-green-700">Recompensas Requisitadas</h1>
      <p class="text-gray-500 mt-2">Gerencie as entregas de recompensas solicitadas pelos usuários.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap gap-3 mb-6 items-center">
      <!-- Status -->
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="f in filtros"
          :key="f.value"
          @click="filtroAtivo = f.value"
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition border-2"
          :class="filtroAtivo === f.value
            ? 'border-green-600 bg-green-50 text-green-700'
            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'"
        >
          {{ f.label }}
          <span
            v-if="f.count > 0"
            class="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            :class="filtroAtivo === f.value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
          >{{ f.count }}</span>
        </button>
      </div>

      <!-- Turma -->
      <select
        v-model="turmaFiltro"
        class="border-2 border-gray-200 bg-white text-sm text-gray-600 font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-green-500 transition"
      >
        <option :value="null">Todas as turmas</option>
        <option v-for="t in turmasDisponiveis" :key="t.id" :value="t.id">{{ t.nome }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-sm">Carregando...</span>
    </div>

    <!-- Lista -->
    <div v-else>
      <div v-if="requisicoesFiltradas.length === 0" class="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
        <p class="text-3xl mb-3">🎁</p>
        <p class="text-gray-500 font-medium">Nenhuma requisição {{ filtroAtivo === 'PENDENTE' ? 'pendente' : filtroAtivo === 'ENTREGUE' ? 'entregue' : '' }}.</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="req in requisicoesFiltradas"
          :key="req.id"
          class="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <span
                class="text-xs font-bold px-2.5 py-1 rounded-full"
                :class="req.status === 'ENTREGUE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
              >{{ req.status === 'ENTREGUE' ? '✓ Entregue' : '⏳ Pendente' }}</span>
              <span class="text-xs text-gray-400">{{ formatarData(req.created_at) }}</span>
            </div>
            <p class="text-sm font-bold text-gray-800">{{ req.usuarios?.nome ?? '—' }}</p>
            <p class="text-sm font-semibold text-gray-700 mt-0.5">
              {{ recompensaInfo(req.nivel).emoji }} {{ recompensaInfo(req.nivel).recompensa }}
            </p>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ req.nivel }} · {{ recompensaInfo(req.nivel).limiar }} · Turma: {{ req.turma?.nome ?? '—' }}
            </p>
            <p v-if="req.status === 'ENTREGUE' && req.dt_entrega" class="text-xs text-green-600 mt-1">
              Entregue em {{ formatarData(req.dt_entrega) }}
            </p>
          </div>

          <!-- Ações -->
          <div class="flex gap-2 shrink-0">
            <button
              v-if="req.status === 'PENDENTE'"
              @click="marcarEntregue(req)"
              :disabled="req._salvando"
              class="bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-xl transition active:scale-95 flex items-center gap-1.5"
            >
              <span v-if="req._salvando" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ req._salvando ? 'Salvando...' : '✓ Marcar como Entregue' }}
            </button>
            <button
              v-else
              @click="reabrirRequisicao(req)"
              :disabled="req._salvando"
              class="border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 text-sm font-medium px-4 py-2 rounded-xl transition"
            >
              {{ req._salvando ? '...' : 'Reabrir' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { supabase } from '~/utils/supabase'

definePageMeta({ middleware: 'admin' })

const { $toast } = useNuxtApp()

const loading = ref(true)
const requisicoes = ref([])
const filtroAtivo = ref('PENDENTE')
const turmaFiltro = ref(null)
const turmasDisponiveis = ref([])

const RECOMPENSAS_MAP = {
  'Nível 1': { recompensa: 'Doce / bombom',                     emoji: '🍬', limiar: '60⭐'  },
  'Nível 2': { recompensa: 'Sticker personalizado',             emoji: '🎨', limiar: '90⭐'  },
  'Nível 3': { recompensa: 'Marca-página',                      emoji: '🔖', limiar: '150⭐' },
  'Nível 4': { recompensa: 'Bottom do Linguesc',                emoji: '📌', limiar: '210⭐' },
  'Nível 5': { recompensa: 'Pontos bônus na prova +0,5',        emoji: '📝', limiar: '270⭐' },
  'Nível 6': { recompensa: 'Troféu impresso em 3D',             emoji: '🏆', limiar: '330⭐' },
  'Nível 7': { recompensa: 'Troféu impresso em 3D (professor)', emoji: '👑', limiar: '380⭐' },
}

function recompensaInfo(nivel) {
  return RECOMPENSAS_MAP[nivel] ?? { recompensa: '—', emoji: '🎁', limiar: '' }
}

function formatarData(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const filtros = computed(() => [
  { value: 'PENDENTE', label: 'Pendentes', count: requisicoes.value.filter((r) => r.status === 'PENDENTE').length },
  { value: 'ENTREGUE', label: 'Entregues', count: requisicoes.value.filter((r) => r.status === 'ENTREGUE').length },
  { value: 'TODAS', label: 'Todas', count: requisicoes.value.length },
])

const requisicoesFiltradas = computed(() => {
  let lista = filtroAtivo.value === 'TODAS' ? requisicoes.value : requisicoes.value.filter((r) => r.status === filtroAtivo.value)
  if (turmaFiltro.value) lista = lista.filter((r) => r.turma_id === turmaFiltro.value)
  return lista
})

async function carregarTurmas() {
  const { data } = await supabase
    .from('turma')
    .select('id, nome')
    .eq('is_teste', false)
    .eq('status', 'ATIVA')
    .order('nome')
  turmasDisponiveis.value = data ?? []
}

async function carregar() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('recompensa_requisicao')
      .select('*, usuarios:usuario_id(nome), turma:turma_id!inner(nome, is_teste)')
      .eq('turma.is_teste', false)
      .order('created_at', { ascending: false })

    if (error) throw error
    requisicoes.value = (data ?? []).map((r) => ({
      ...r,
      status: r.status ?? 'PENDENTE',
      _salvando: false,
    }))
  } catch (err) {
    console.error(err)
    $toast.error('Erro ao carregar requisições.')
  } finally {
    loading.value = false
  }
}

async function marcarEntregue(req) {
  req._salvando = true
  try {
    const { error } = await supabase
      .from('recompensa_requisicao')
      .update({ status: 'ENTREGUE', dt_entrega: new Date().toISOString() })
      .eq('id', req.id)
    if (error) throw error
    req.status = 'ENTREGUE'
    req.dt_entrega = new Date().toISOString()
    $toast.success('Recompensa marcada como entregue!')
  } catch (err) {
    console.error(err)
    $toast.error('Erro ao atualizar. Verifique se as colunas status/dt_entrega existem na tabela.')
  } finally {
    req._salvando = false
  }
}

async function reabrirRequisicao(req) {
  req._salvando = true
  try {
    const { error } = await supabase
      .from('recompensa_requisicao')
      .update({ status: 'PENDENTE', dt_entrega: null })
      .eq('id', req.id)
    if (error) throw error
    req.status = 'PENDENTE'
    req.dt_entrega = null
    $toast.success('Requisição reaberta.')
  } catch (err) {
    console.error(err)
    $toast.error('Erro ao reabrir requisição.')
  } finally {
    req._salvando = false
  }
}

onMounted(() => { carregar(); carregarTurmas() })
</script>
