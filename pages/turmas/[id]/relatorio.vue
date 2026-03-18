<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <!-- Header (não imprime) -->
    <div class="mb-8 no-print">
      <button @click="$router.back()" class="text-sm text-gray-400 hover:text-gray-600 transition mb-4 flex items-center gap-1">
        ← Voltar
      </button>
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-3xl font-bold text-green-700">Relatório — {{ turma?.nome }}</h1>
          <p class="text-gray-500 mt-2">Lista completa de presença por aluno.</p>
          <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
        </div>
        <div class="flex gap-3" v-if="!loading">
          <button @click="exportarCSV" class="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
            📥 Exportar CSV
          </button>
          <button @click="imprimirPDF" class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition">
            🖨️ Imprimir / PDF
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700 no-print">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando...</span>
    </div>

    <!-- ── RELATÓRIO (imprimível) ── -->
    <div v-else class="print-area">

      <!-- Cabeçalho do relatório impresso -->
      <div class="print-header hidden-screen mb-8">
        <h1 class="text-2xl font-bold text-gray-800">{{ turma?.nome }}</h1>
        <p class="text-sm text-gray-500 mt-1">Relatório de Presença · Gerado em {{ dataGeracao }}</p>
        <div class="w-full border-b border-gray-300 mt-4"></div>
      </div>

      <!-- Resumo -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm print-card">
          <p class="text-xs text-gray-400 mb-1">Total de alunos</p>
          <p class="text-2xl font-bold text-green-700">{{ alunos.length }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm print-card">
          <p class="text-xs text-gray-400 mb-1">Aulas realizadas</p>
          <p class="text-2xl font-bold text-green-700">{{ aulasRealizadas.length }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm print-card">
          <p class="text-xs text-gray-400 mb-1">Frequência média</p>
          <p class="text-2xl font-bold" :class="frequenciaMedia >= 75 ? 'text-green-700' : 'text-red-600'">{{ frequenciaMedia }}%</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm print-card">
          <p class="text-xs text-gray-400 mb-1">Alunos em risco</p>
          <p class="text-2xl font-bold" :class="alunosEmRisco > 0 ? 'text-red-600' : 'text-green-700'">{{ alunosEmRisco }}</p>
        </div>
      </div>

      <!-- Tabela principal -->
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-800">Frequência por Aluno</h2>
          <span class="text-xs text-gray-400">{{ aulasRealizadas.length }} aula(s) considerada(s)</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100">
                <th class="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Aluno</th>
                <th
                  v-for="aula in aulasRealizadas"
                  :key="aula.id"
                  class="text-center px-3 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap"
                >
                  {{ formatarDataCurta(aula.data) }}
                </th>
                <th class="text-center px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Presenças</th>
                <th class="text-center px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">%</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="aluno in tabelaAlunos"
                :key="aluno.id"
                class="hover:bg-gray-50 transition"
              >
                <td class="px-6 py-3 font-medium text-gray-800 whitespace-nowrap">{{ aluno.nome }}</td>
                <td
                  v-for="aula in aulasRealizadas"
                  :key="aula.id"
                  class="text-center px-3 py-3"
                >
                  <span
                    class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                    :class="aluno.presencasPorAula[aula.id] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
                  >
                    {{ aluno.presencasPorAula[aula.id] ? '✓' : '✗' }}
                  </span>
                </td>
                <td class="text-center px-6 py-3 font-semibold text-gray-700">
                  {{ aluno.totalPresencas }}/{{ aulasRealizadas.length }}
                </td>
                <td class="text-center px-6 py-3">
                  <span
                    class="font-bold text-sm"
                    :class="aluno.frequencia >= 75 ? 'text-green-600' : aluno.frequencia >= 50 ? 'text-yellow-600' : 'text-red-600'"
                  >
                    {{ aluno.frequencia }}%
                  </span>
                  <span v-if="aluno.frequencia < 75" class="ml-1 text-xs">⚠️</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Rodapé impresso -->
      <div class="hidden-screen mt-8 text-xs text-gray-400 text-center">
        Linguesc · Relatório gerado em {{ dataGeracao }}
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/utils/supabase'

const route = useRoute()
const turmaId = Number(route.params.id)

const turma = ref(null)
const alunos = ref([])
const aulas = ref([])
const presencas = ref([])
const loading = ref(true)

const dataGeracao = new Date().toLocaleDateString('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
})

onMounted(async () => {
  const [
    { data: turmaData },
    { data: vinculosData },
    { data: aulasData },
  ] = await Promise.all([
    supabase.from('turma').select('id, nome, status').eq('id', turmaId).single(),
    supabase.from('turma_aluno').select('aluno_id, usuarios(id, nome)').eq('turma_id', turmaId),
    supabase.from('aula').select('id, data, status').eq('turma_id', turmaId).order('data', { ascending: true }),
  ])

  turma.value = turmaData
  alunos.value = (vinculosData || [])
    .map(v => ({ id: v.aluno_id, nome: v.usuarios?.nome || '' }))
    .sort((a, b) => a.nome.localeCompare(b.nome))
  aulas.value = aulasData || []

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

const tabelaAlunos = computed(() =>
  alunos.value.map(aluno => {
    const presencasPorAula = {}
    aulasRealizadas.value.forEach(aula => {
      presencasPorAula[aula.id] = presencas.value.some(
        p => p.aluno_id === aluno.id && p.aula_id === aula.id
      )
    })
    const totalPresencas = Object.values(presencasPorAula).filter(Boolean).length
    const frequencia = aulasRealizadas.value.length > 0
      ? Math.round((totalPresencas / aulasRealizadas.value.length) * 100)
      : 0
    return { ...aluno, presencasPorAula, totalPresencas, frequencia }
  })
)

const frequenciaMedia = computed(() => {
  if (tabelaAlunos.value.length === 0) return 0
  const soma = tabelaAlunos.value.reduce((acc, a) => acc + a.frequencia, 0)
  return Math.round(soma / tabelaAlunos.value.length)
})

const alunosEmRisco = computed(() =>
  tabelaAlunos.value.filter(a => a.frequencia < 75).length
)

// ─── Helpers ──────────────────────────────────────────────────────
function formatarDataCurta(dataStr) {
  const d = new Date(dataStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// ─── Exportar CSV ─────────────────────────────────────────────────
function exportarCSV() {
  const cabecalho = [
    'Aluno',
    ...aulasRealizadas.value.map(a => formatarDataCurta(a.data)),
    'Presenças',
    'Faltas',
    'Frequência (%)'
  ]

  const linhas = tabelaAlunos.value.map(aluno => [
    aluno.nome,
    ...aulasRealizadas.value.map(aula => aluno.presencasPorAula[aula.id] ? 'P' : 'F'),
    aluno.totalPresencas,
    aulasRealizadas.value.length - aluno.totalPresencas,
    aluno.frequencia + '%'
  ])

  const csv = [cabecalho, ...linhas]
    .map(row => row.map(cell => `"${cell}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `presenca_${turma.value?.nome?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ─── Imprimir PDF ─────────────────────────────────────────────────
function imprimirPDF() {
  window.print()
}
</script>

<style>
/* Estilos de impressão */
@media print {
  .no-print { display: none !important; }
  .hidden-screen { display: block !important; }
  body { background: white !important; }
  .print-area { padding: 0 !important; }
  .print-card { border: 1px solid #e5e7eb !important; box-shadow: none !important; }
  table { font-size: 11px !important; }
  th, td { padding: 6px 10px !important; }
}

@media screen {
  .hidden-screen { display: none; }
}
</style>