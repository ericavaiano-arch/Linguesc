<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <div class="mb-10">
      <h1 class="text-3xl font-bold text-green-700">Justificativas de Falta</h1>
      <p class="text-gray-500 mt-2">Avalie as solicitações dos seus alunos.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <!-- Filtros -->
    <div class="flex gap-3 mb-6 flex-wrap">
      <button
        v-for="filtro in filtros"
        :key="filtro.valor"
        @click="filtroAtivo = filtro.valor"
        class="px-4 py-2 rounded-xl text-sm font-semibold transition"
        :class="filtroAtivo === filtro.valor
          ? 'bg-green-600 text-white'
          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'"
      >
        {{ filtro.label }}
        <span
          v-if="filtro.valor === 'PENDENTE' && totalPendentes > 0"
          class="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full"
        >
          {{ totalPendentes }}
        </span>
      </button>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando...</span>
    </div>

    <div v-else-if="justificativasFiltradas.length === 0" class="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
      <p class="text-4xl mb-4">{{ filtroAtivo === 'PENDENTE' ? '🎉' : '📭' }}</p>
      <p class="text-gray-500 font-medium">
        {{ filtroAtivo === 'PENDENTE' ? 'Nenhuma justificativa pendente.' : 'Nenhuma justificativa encontrada.' }}
      </p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="j in justificativasFiltradas"
        :key="j.id"
        class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <p class="text-base font-semibold text-gray-800">{{ j.nomeAluno }}</p>
              <span
                class="text-xs font-semibold px-2.5 py-1 rounded-full"
                :class="{
                  'bg-yellow-100 text-yellow-700': j.status === 'PENDENTE',
                  'bg-green-100 text-green-700': j.status === 'ACEITA',
                  'bg-red-100 text-red-600': j.status === 'REJEITADA',
                }"
              >
                {{ j.status }}
              </span>
            </div>
            <p class="text-sm text-gray-400">
              {{ j.nomeTurma }} · Aula de {{ formatarData(j.dataAula) }}
            </p>
            <p class="text-xs text-gray-400 mt-0.5">
              Enviado em {{ formatarDataHora(j.dt_inclusao) }}
            </p>
          </div>

          <!-- Botão reabrir se já avaliado -->
          <button
            v-if="j.status !== 'PENDENTE'"
            @click="reabrirJustificativa(j)"
            class="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition font-semibold flex-shrink-0"
          >
            ↩ Reabrir
          </button>
        </div>

        <!-- Texto do aluno -->
        <div class="bg-gray-50 rounded-xl px-4 py-3 mb-4">
          <p class="text-xs text-gray-400 font-medium mb-1">Justificativa do aluno:</p>
          <p class="text-sm text-gray-700">{{ j.texto }}</p>
        </div>

        <!-- Resposta do professor se já avaliado -->
        <div v-if="j.status !== 'PENDENTE' && j.resposta" class="rounded-xl px-4 py-3 mb-4"
          :class="j.status === 'ACEITA' ? 'bg-green-50' : 'bg-red-50'"
        >
          <p class="text-xs font-medium mb-1" :class="j.status === 'ACEITA' ? 'text-green-600' : 'text-red-600'">
            Sua resposta:
          </p>
          <p class="text-sm" :class="j.status === 'ACEITA' ? 'text-green-700' : 'text-red-700'">{{ j.resposta }}</p>
        </div>

        <!-- Ações (só para pendentes) -->
        <div v-if="j.status === 'PENDENTE'" class="space-y-3">
          <textarea
            v-model="j._resposta"
            rows="2"
            placeholder="Comentário opcional para o aluno..."
            class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
          ></textarea>

          <div class="flex gap-3">
            <button
              @click="avaliar(j, 'ACEITA')"
              :disabled="j._salvando"
              class="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              <div v-if="j._salvando === 'ACEITA'" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ✅ Aceitar
            </button>
            <button
              @click="avaliar(j, 'REJEITADA')"
              :disabled="j._salvando"
              class="flex-1 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition border border-red-200 flex items-center justify-center gap-2"
            >
              <div v-if="j._salvando === 'REJEITADA'" class="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
              ❌ Rejeitar
            </button>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { supabase } from '~/utils/supabase'

definePageMeta({ middleware: 'professor' })

const { user, isAdmin } = useAuth()
const { $toast } = useNuxtApp()

const loading = ref(true)
const justificativas = ref([])
const filtroAtivo = ref('PENDENTE')

const filtros = [
  { valor: 'PENDENTE', label: 'Pendentes' },
  { valor: 'ACEITA', label: 'Aceitas' },
  { valor: 'REJEITADA', label: 'Rejeitadas' },
  { valor: 'TODAS', label: 'Todas' },
]

const totalPendentes = computed(() =>
  justificativas.value.filter(j => j.status === 'PENDENTE').length
)

const justificativasFiltradas = computed(() => {
  if (filtroAtivo.value === 'TODAS') return justificativas.value
  return justificativas.value.filter(j => j.status === filtroAtivo.value)
})

onMounted(async () => {
  await carregarJustificativas()
})

async function carregarJustificativas() {
  loading.value = true

  const query = supabase
    .from('justificativa_falta')
    .select(`
      id,
      aluno_id,
      aula_id,
      texto,
      status,
      resposta,
      dt_inclusao,
      aula (
        id,
        data,
        turma (
          id,
          nome,
          professor_id
        )
      )
    `)
    .order('dt_inclusao', { ascending: false })

  const { data, error } = await query

  if (error) {
    $toast.error('Erro ao carregar justificativas.')
    loading.value = false
    return
  }

  const alunoIds = [...new Set((data || []).map(j => j.aluno_id))]
  const { data: usuariosData } = await supabase
    .from('usuarios')
    .select('id, nome')
    .in('id', alunoIds)

  const nomeMap = Object.fromEntries((usuariosData || []).map(u => [u.id, u.nome]))

  justificativas.value = (data || [])
  .map(j => ({
    ...j,
    nomeAluno: nomeMap[j.aluno_id] ?? 'Aluno',
    nomeTurma: j.aula?.turma?.nome ?? '—',
    dataAula: j.aula?.data ?? '',
    _resposta: '',
    _salvando: null,
  }))

  loading.value = false
}

async function avaliar(justificativa, novoStatus) {
  justificativa._salvando = novoStatus

  const { error } = await supabase
    .from('justificativa_falta')
    .update({
      status: novoStatus,
      resposta: justificativa._resposta?.trim() || null,
      dt_resposta: new Date().toISOString(),
    })
    .eq('id', justificativa.id)

  if (error) {
    $toast.error('Erro ao salvar avaliação.')
  } else {
    justificativa.status = novoStatus
    justificativa.resposta = justificativa._resposta?.trim() || null
    justificativa._resposta = ''
    $toast.success(novoStatus === 'ACEITA' ? 'Justificativa aceita!' : 'Justificativa rejeitada.')
  }

  justificativa._salvando = null
}

async function reabrirJustificativa(justificativa) {
  const { error } = await supabase
    .from('justificativa_falta')
    .update({ status: 'PENDENTE', resposta: null, dt_resposta: null })
    .eq('id', justificativa.id)

  if (error) {
    $toast.error('Erro ao reabrir justificativa.')
  } else {
    justificativa.status = 'PENDENTE'
    justificativa.resposta = null
    $toast.success('Justificativa reaberta.')
  }
}

function formatarData(dataStr) {
  if (!dataStr) return '—'
  const d = new Date(dataStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatarDataHora(dtStr) {
  if (!dtStr) return '—'
  const d = new Date(dtStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>