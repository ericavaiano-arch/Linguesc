<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <!-- Header -->
    <div class="mb-10">
      <button @click="$router.back()" class="text-sm text-gray-400 hover:text-gray-600 transition mb-4 flex items-center gap-1">
        ← Voltar
      </button>
      <h1 class="text-3xl font-bold text-green-700">Aulas — {{ turma?.nome }}</h1>
      <p class="text-gray-500 mt-2">Gerencie as datas de aula desta turma.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

      <!-- ── PAINEL ESQUERDO: adicionar aulas ── -->
      <div class="space-y-6">

        <!-- Modo de criação -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">➕ Adicionar Aulas</h2>

          <!-- Tabs -->
          <div class="flex gap-2 mb-6">
            <button
              @click="modo = 'manual'"
              class="flex-1 py-2 rounded-xl text-sm font-semibold transition"
              :class="modo === 'manual'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              📅 Datas avulsas
            </button>
            <button
              @click="modo = 'recorrencia'"
              class="flex-1 py-2 rounded-xl text-sm font-semibold transition"
              :class="modo === 'recorrencia'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              🔁 Recorrência semanal
            </button>
          </div>

          <!-- MODO MANUAL -->
          <div v-if="modo === 'manual'">
            <label class="text-sm text-gray-600 font-medium mb-2 block">Selecione uma data:</label>
            <div class="flex gap-3">
              <input
                v-model="dataManual"
                type="date"
                class="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
              <button
                @click="adicionarDataManual"
                :disabled="!dataManual"
                class="bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-xl transition"
              >
                Adicionar
              </button>
            </div>

            <!-- Preview das datas manuais -->
            <ul v-if="datasManual.length > 0" class="mt-4 space-y-2">
              <li
                v-for="(data, i) in datasManual"
                :key="i"
                class="flex items-center justify-between px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800"
              >
                <span>{{ formatarData(data) }}</span>
                <button @click="datasManual.splice(i, 1)" class="text-red-400 hover:text-red-600 font-bold">×</button>
              </li>
            </ul>
          </div>

          <!-- MODO RECORRÊNCIA -->
          <div v-if="modo === 'recorrencia'" class="space-y-4">
            <div>
              <label class="text-sm text-gray-600 font-medium mb-2 block">Dia da semana:</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="dia in diasSemana"
                  :key="dia.valor"
                  @click="diaSemana = dia.valor"
                  class="px-3 py-2 rounded-xl text-sm font-semibold transition"
                  :class="diaSemana === dia.valor
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                >
                  {{ dia.label }}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-600 font-medium mb-2 block">Data de início:</label>
                <input
                  v-model="recorrenciaInicio"
                  type="date"
                  class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              </div>
              <div>
                <label class="text-sm text-gray-600 font-medium mb-2 block">Data de fim:</label>
                <input
                  v-model="recorrenciaFim"
                  type="date"
                  class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              </div>
            </div>

            <button
              @click="gerarRecorrencia"
              :disabled="diaSemana === null || !recorrenciaInicio || !recorrenciaFim"
              class="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-semibold py-2 rounded-xl transition text-sm"
            >
              🔍 Pré-visualizar datas
            </button>

            <!-- Preview recorrência -->
            <ul v-if="datasRecorrencia.length > 0" class="space-y-2 max-h-48 overflow-y-auto">
              <li
                v-for="(data, i) in datasRecorrencia"
                :key="i"
                class="flex items-center justify-between px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800"
              >
                <span>{{ formatarData(data) }}</span>
                <button @click="datasRecorrencia.splice(i, 1)" class="text-red-400 hover:text-red-600 font-bold">×</button>
              </li>
            </ul>
          </div>

          <!-- Botão salvar -->
          <button
            @click="salvarAulas"
            :disabled="salvando || datasParaSalvar.length === 0"
            class="mt-6 w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
          >
            <div v-if="salvando" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ salvando ? 'Salvando...' : `💾 Salvar ${datasParaSalvar.length} aula(s)` }}
          </button>
        </div>

      </div>

      <!-- ── PAINEL DIREITO: aulas cadastradas ── -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-800">📋 Aulas Cadastradas</h2>
          <span class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
            {{ aulas.length }} aula(s)
          </span>
        </div>

        <div v-if="loadingAulas" class="flex items-center gap-2 text-green-700 text-sm">
          <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          Carregando...
        </div>

        <p v-else-if="aulas.length === 0" class="text-sm text-gray-400 text-center py-8">
          Nenhuma aula cadastrada ainda.
        </p>

        <ul v-else class="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          <li
            v-for="aula in aulasOrdenadas"
            :key="aula.id"
            class="flex items-center justify-between px-4 py-3 rounded-xl border transition"
            :class="{
              'border-green-200 bg-green-50': aula.status === 'REALIZADA',
              'border-red-200 bg-red-50': aula.status === 'CANCELADA',
              'border-gray-200 bg-gray-50': aula.status === 'AGENDADA',
            }"
          >
            <div>
              <p class="text-sm font-medium text-gray-800">{{ formatarData(aula.data) }}</p>
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                :class="{
                  'bg-green-200 text-green-800': aula.status === 'REALIZADA',
                  'bg-red-200 text-red-800': aula.status === 'CANCELADA',
                  'bg-yellow-100 text-yellow-800': aula.status === 'AGENDADA',
                }"
              >
                {{ aula.status }}
              </span>
            </div>
            <button
              @click="deletarAula(aula.id)"
              class="text-gray-300 hover:text-red-500 transition text-lg font-bold"
              title="Remover aula"
            >
              ×
            </button>
          </li>
        </ul>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/utils/supabase'

const route = useRoute()
const { $toast } = useNuxtApp()
const turmaId = route.params.id

const turma = ref(null)
const aulas = ref([])
const loadingAulas = ref(true)
const salvando = ref(false)

// Modo de criação
const modo = ref('manual')

// Manual
const dataManual = ref('')
const datasManual = ref([])

// Recorrência
const diaSemana = ref(null)
const recorrenciaInicio = ref('')
const recorrenciaFim = ref('')
const datasRecorrencia = ref([])

const diasSemana = [
  { valor: 0, label: 'Dom' },
  { valor: 1, label: 'Seg' },
  { valor: 2, label: 'Ter' },
  { valor: 3, label: 'Qua' },
  { valor: 4, label: 'Qui' },
  { valor: 5, label: 'Sex' },
  { valor: 6, label: 'Sáb' },
]

const datasParaSalvar = computed(() =>
  modo.value === 'manual' ? datasManual.value : datasRecorrencia.value
)

const aulasOrdenadas = computed(() =>
  [...aulas.value].sort((a, b) => new Date(a.data) - new Date(b.data))
)

function formatarData(dataStr) {
  const d = new Date(dataStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
}

function adicionarDataManual() {
  if (!dataManual.value) return
  if (datasManual.value.includes(dataManual.value)) {
    $toast.warning('Esta data já foi adicionada.')
    return
  }
  datasManual.value.push(dataManual.value)
  // Ordenar
  datasManual.value.sort()
  dataManual.value = ''
}

function gerarRecorrencia() {
  if (diaSemana.value === null || !recorrenciaInicio.value || !recorrenciaFim.value) return

  const inicio = new Date(recorrenciaInicio.value + 'T12:00:00')
  const fim = new Date(recorrenciaFim.value + 'T12:00:00')

  if (inicio > fim) {
    $toast.warning('A data de início deve ser anterior à data de fim.')
    return
  }

  const datas = []
  const atual = new Date(inicio)

  // Avança até o primeiro dia da semana correto
  while (atual.getDay() !== diaSemana.value) {
    atual.setDate(atual.getDate() + 1)
  }

  while (atual <= fim) {
    datas.push(atual.toISOString().split('T')[0])
    atual.setDate(atual.getDate() + 7)
  }

  if (datas.length === 0) {
    $toast.warning('Nenhuma data encontrada no período selecionado.')
    return
  }

  datasRecorrencia.value = datas
  $toast.success(`${datas.length} datas geradas.`)
}

async function carregarTurma() {
  const { data } = await supabase.from('turma').select('*').eq('id', turmaId).single()
  turma.value = data
}

async function carregarAulas() {
  loadingAulas.value = true
  const { data, error } = await supabase
    .from('aula')
    .select('*')
    .eq('turma_id', turmaId)

  if (!error) aulas.value = data
  loadingAulas.value = false
}

async function salvarAulas() {
  const datas = datasParaSalvar.value
  if (datas.length === 0) return

  salvando.value = true

  try {
    // Evitar duplicatas com datas já cadastradas
    const datasExistentes = aulas.value.map(a => a.data)
    const novasDatas = datas.filter(d => !datasExistentes.includes(d))

    if (novasDatas.length === 0) {
      $toast.warning('Todas as datas selecionadas já estão cadastradas.')
      salvando.value = false
      return
    }

    const registros = novasDatas.map(data => ({
      turma_id: turmaId,
      data,
      status: 'AGENDADA'
    }))

    const { error } = await supabase.from('aula').insert(registros)

    if (error) throw error

    $toast.success(`${novasDatas.length} aula(s) cadastrada(s)!`)
    datasManual.value = []
    datasRecorrencia.value = []
    await carregarAulas()

  } catch (err) {
    console.error(err)
    $toast.error('Erro ao salvar aulas.')
  } finally {
    salvando.value = false
  }
}

async function deletarAula(aulaId) {
  const { error } = await supabase.from('aula').delete().eq('id', aulaId)
  if (error) {
    $toast.error('Erro ao remover aula.')
  } else {
    aulas.value = aulas.value.filter(a => a.id !== aulaId)
    $toast.success('Aula removida.')
  }
}

onMounted(async () => {
  await Promise.all([carregarTurma(), carregarAulas()])
})
</script>
