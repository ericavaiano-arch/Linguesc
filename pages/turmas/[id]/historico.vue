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
              :class="{
                'border-green-200 bg-green-50':  aluno.presente,
                'border-blue-200 bg-blue-50':    aluno.justificada,
                'border-red-100 bg-red-50':      !aluno.presente && !aluno.justificada,
              }"
            >
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-800">{{ aluno.nome }}</span>
                <span v-if="!aluno.ativo" class="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">Inativo</span>
              </div>
              <span
                class="text-xs font-semibold px-3 py-1 rounded-full"
                :class="{
                  'bg-green-100 text-green-700': aluno.presente,
                  'bg-blue-100 text-blue-700':   aluno.justificada,
                  'bg-red-100 text-red-600':     !aluno.presente && !aluno.justificada,
                }"
              >
                {{ aluno.presente ? 'Presente' : aluno.justificada ? 'Justificada' : 'Falta' }}
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
import { calcularFrequenciaSync } from '~/composables/usePresenca'

definePageMeta({ middleware: 'professor' })

const route = useRoute()
const router = useRouter()
const turmaId = Number(route.params.id)

const turma = ref(null)
const alunos = ref([])
const aulas = ref([])
const presencas = ref([])
const justificativas = ref([]) // NOVO — { aluno_id, aula_id }
const loading = ref(true)
const aulaSelecionada = ref(null)

onMounted(async () => {
  const [
    { data: turmaData },
    { data: vinculosData },
    { data: aulasData },
  ] = await Promise.all([
    supabase.from('turma').select('id, nome').eq('id', turmaId).single(),
    supabase.from('turma_aluno').select('aluno_id, usuarios(id, nome, ativo)').eq('turma_id', turmaId),
    supabase.from('aula').select('id, data, status').eq('turma_id', turmaId).order('data', { ascending: false }),
  ])

  turma.value = turmaData
  alunos.value = (vinculosData || [])
    .map(v => ({ id: v.aluno_id, nome: v.usuarios?.nome || '', ativo: v.usuarios?.ativo ?? true }))
    .sort((a, b) => a.nome.localeCompare(b.nome))

  aulas.value = aulasData || []

  const alunoIds = alunos.value.map(a => a.id)
  const aulasIds = new Set((aulasData || []).map(a => a.id))

  const [{ data: presencasData }, { data: justificativasData }] = await Promise.all([
    supabase.from('presenca').select('aula_id, aluno_id').in('aluno_id', alunoIds),
    supabase.from('justificativa_falta').select('aluno_id, aula_id').eq('status', 'ACEITA').in('aluno_id', alunoIds), // NOVO
  ])

  presencas.value = (presencasData || []).filter(p => aulasIds.has(p.aula_id))
  justificativas.value = (justificativasData || []).filter(j => aulasIds.has(j.aula_id)) // NOVO
  loading.value = false
})

// ─── Computeds ────────────────────────────────────────────────────
const aulasRealizadas = computed(() =>
  aulas.value.filter(a => a.status === 'REALIZADA')
)

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

// ATUALIZADO — mostra presente, justificada ou falta
const alunosComPresenca = computed(() => {
  if (!aulaSelecionada.value) return []
  const aulaId = aulaSelecionada.value.id

  const presentesIds = new Set(
    presencas.value.filter(p => p.aula_id === aulaId).map(p => p.aluno_id)
  )
  const justificadasIds = new Set(
    justificativas.value.filter(j => j.aula_id === aulaId).map(j => j.aluno_id)
  )

  return alunos.value.map(a => ({
    ...a,
    presente: presentesIds.has(a.id),
    justificada: !presentesIds.has(a.id) && justificadasIds.has(a.id),
  }))
})

// ATUALIZADO — usa calcularFrequenciaSync
const frequenciaPorAluno = computed(() => {
  const realizadas = aulasRealizadas.value
  if (realizadas.length === 0) return []

  const aulasIds = realizadas.map(a => a.id)

  return alunos.value.map(aluno => {
    const freq = calcularFrequenciaSync(aluno.id, aulasIds, presencas.value, justificativas.value)
    return { ...aluno, presencas: freq.totalValidas, frequencia: freq.frequencia }
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