<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <!-- Header -->
    <div class="mb-10">
      <button @click="$router.back()" class="text-sm text-gray-400 hover:text-gray-600 transition mb-4 flex items-center gap-1">
        ← Voltar
      </button>
      <h1 class="text-3xl font-bold text-green-700">Histórico — {{ turma?.nome }}</h1>
      <p class="text-gray-500 mt-2">Registro de todas as chamadas realizadas.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando...</span>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- ── COLUNA ESQUERDA: lista de aulas ── -->
      <div class="space-y-3">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Aulas realizadas</h2>

        <p v-if="aulasRealizadas.length === 0" class="text-sm text-gray-400 text-center py-8">
          Nenhuma aula realizada ainda.
        </p>

        <button
          v-for="aula in aulasRealizadas"
          :key="aula.id"
          @click="selecionarAula(aula)"
          class="w-full text-left px-4 py-3 rounded-xl border transition-all"
          :class="aulaSelecionada?.id === aula.id
            ? 'border-green-500 bg-green-50 shadow-sm'
            : 'border-gray-200 bg-white hover:border-green-300'"
        >
          <p class="text-sm font-semibold text-gray-800">{{ formatarData(aula.data) }}</p>
          <p class="text-xs text-gray-400 mt-0.5">
            {{ presencasPorAula[aula.id] ?? 0 }}/{{ alunos.length }} presentes
          </p>
          <!-- Mini barra -->
          <div class="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div
              class="h-1.5 rounded-full"
              :class="taxaPresenca(aula.id) >= 75 ? 'bg-green-500' : taxaPresenca(aula.id) >= 50 ? 'bg-yellow-400' : 'bg-red-500'"
              :style="{ width: taxaPresenca(aula.id) + '%' }"
            ></div>
          </div>
        </button>
      </div>

      <!-- ── COLUNA DIREITA: detalhes da aula selecionada ── -->
      <div class="lg:col-span-2">

        <!-- Nenhuma aula selecionada -->
        <div
          v-if="!aulaSelecionada"
          class="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center"
        >
          <p class="text-4xl mb-3">👈</p>
          <p class="text-gray-400 text-sm">Selecione uma aula para ver os detalhes.</p>
        </div>

        <!-- Detalhes da aula -->
        <div v-else class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

          <!-- Header da aula -->
          <div class="flex items-start justify-between mb-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-800">{{ formatarData(aulaSelecionada.data) }}</h3>
              <p class="text-sm text-gray-400 mt-1">
                {{ presencasPorAula[aulaSelecionada.id] ?? 0 }} presentes de {{ alunos.length }} alunos
                <span class="ml-2 font-semibold" :class="taxaPresenca(aulaSelecionada.id) >= 75 ? 'text-green-600' : 'text-red-500'">
                  ({{ taxaPresenca(aulaSelecionada.id) }}%)
                </span>
              </p>
            </div>
            <button
              @click="$router.push(`/chamada-manual/${turmaId}`)"
              class="text-xs px-3 py-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition font-semibold"
            >
              ✏️ Editar chamada
            </button>
          </div>

          <!-- Lista de alunos -->
          <ul class="space-y-2">
            <li
              v-for="aluno in alunosComPresenca"
              :key="aluno.id"
              class="flex items-center justify-between px-4 py-3 rounded-xl border transition"
              :class="aluno.presente
                ? 'border-green-200 bg-green-50'
                : 'border-red-100 bg-red-50'"
            >
              <span class="text-sm font-medium text-gray-800">{{ aluno.nome }}</span>
              <span
                class="text-xs font-semibold px-3 py-1 rounded-full"
                :class="aluno.presente ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
              >
                {{ aluno.presente ? 'Presente' : 'Falta' }}
              </span>
            </li>
          </ul>

        </div>

        <!-- ── RESUMO DE FREQUÊNCIA POR ALUNO ── -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-6">
          <h3 class="text-base font-semibold text-gray-800 mb-5">📊 Frequência por Aluno</h3>

          <p v-if="aulasRealizadas.length === 0" class="text-sm text-gray-400 text-center py-4">
            Nenhuma aula realizada ainda.
          </p>

          <ul v-else class="space-y-3">
            <li
              v-for="aluno in frequenciaPorAluno"
              :key="aluno.id"
              class="flex items-center gap-4"
            >
              <span class="text-sm text-gray-700 w-36 truncate flex-shrink-0">{{ aluno.nome }}</span>
              <div class="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all"
                  :class="aluno.frequencia >= 75 ? 'bg-green-500' : aluno.frequencia >= 50 ? 'bg-yellow-400' : 'bg-red-500'"
                  :style="{ width: aluno.frequencia + '%' }"
                ></div>
              </div>
              <span
                class="text-xs font-bold w-10 text-right flex-shrink-0"
                :class="aluno.frequencia >= 75 ? 'text-green-600' : aluno.frequencia >= 50 ? 'text-yellow-600' : 'text-red-600'"
              >
                {{ aluno.frequencia }}%
              </span>
              <span v-if="aluno.frequencia < 75" class="text-xs text-red-400">⚠️</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'

const route = useRoute()
const router = useRouter()
const turmaId = Number(route.params.id)

const turma = ref(null)
const alunos = ref([])       // { id, nome }
const aulas = ref([])        // todas as aulas da turma
const presencas = ref([])    // { aula_id, aluno_id }
const loading = ref(true)
const aulaSelecionada = ref(null)

// ─── Carregar ─────────────────────────────────────────────────────
onMounted(async () => {
  const [
  { data: turmaData },
  { data: vinculosData },
  { data: aulasData },
] = await Promise.all([
  supabase.from('turma').select('id, nome').eq('id', turmaId).single(),
  supabase.from('turma_aluno').select('aluno_id, usuarios(id, nome)').eq('turma_id', turmaId),
  supabase.from('aula').select('id, data, status').eq('turma_id', turmaId).order('data', { ascending: false }),
])

turma.value = turmaData
alunos.value = (vinculosData || [])
  .map(v => ({ id: v.aluno_id, nome: v.usuarios?.nome || '' }))
  .sort((a, b) => a.nome.localeCompare(b.nome))
aulas.value = aulasData || []

// Filtra presenças pelos alunos da turma E pelas aulas da turma
const alunoIds = alunos.value.map(a => a.id)
const aulasIds = new Set((aulasData || []).map(a => a.id))

const { data: presencasData } = await supabase
  .from('presenca')
  .select('aula_id, aluno_id')
  .eq('status', 'PRESENTE')
  .in('aluno_id', alunoIds)

presencas.value = (presencasData || []).filter(p => aulasIds.has(p.aula_id))

  loading.value = false
})

// ─── Computeds ────────────────────────────────────────────────────
const aulasRealizadas = computed(() =>
  aulas.value.filter(a => a.status === 'REALIZADA')
)

// Mapa aula_id → count de presentes
const presencasPorAula = computed(() => {
  const mapa = {}
  presencas.value.forEach(p => {
    mapa[p.aula_id] = (mapa[p.aula_id] || 0) + 1
  })
  return mapa
})

function taxaPresenca(aulaId) {
  if (alunos.value.length === 0) return 0
  return Math.round(((presencasPorAula.value[aulaId] ?? 0) / alunos.value.length) * 100)
}

// Alunos com status de presença na aula selecionada
const alunosComPresenca = computed(() => {
  if (!aulaSelecionada.value) return []
  const presentesIds = new Set(
    presencas.value.filter(p => p.aula_id === aulaSelecionada.value.id).map(p => p.aluno_id)
  )
  return alunos.value.map(a => ({ ...a, presente: presentesIds.has(a.id) }))
})

// Frequência acumulada por aluno
const frequenciaPorAluno = computed(() => {
  const realizadas = aulasRealizadas.value
  if (realizadas.length === 0) return []
  const ids = realizadas.map(a => a.id)

  return alunos.value.map(aluno => {
    const count = presencas.value.filter(
      p => p.aluno_id === aluno.id && ids.includes(p.aula_id)
    ).length
    return {
      ...aluno,
      presencas: count,
      frequencia: Math.round((count / realizadas.length) * 100)
    }
  }).sort((a, b) => a.frequencia - b.frequencia)
})

function selecionarAula(aula) {
  aulaSelecionada.value = aula
}

function formatarData(dataStr) {
  const d = new Date(dataStr + 'T12:00:00')
  const dia = d.toLocaleDateString('pt-BR', { weekday: 'long' }).replace('-feira', '')
  const data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${dia.charAt(0).toUpperCase() + dia.slice(1)}, ${data}`
}
</script>