<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <!-- Header (não imprime) -->
    <div class="mb-8">
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
          <p class="text-2xl font-bold" :class="frequenciaMedia >= metaFrequencia ? 'text-green-700' : 'text-red-600'">{{ frequenciaMedia }}%</p>
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
              <th
                class="text-left px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide cursor-pointer hover:text-gray-800 transition select-none"
                @click="alternarOrdem('nome')"
              >
                Aluno
                <span class="ml-1 text-gray-300">
                  {{ ordemColuna === 'nome' ? (ordemDirecao === 'asc' ? '↑' : '↓') : '↕' }}
                </span>
              </th>
              <th
                v-for="aula in aulasRealizadas"
                :key="aula.id"
                class="text-center px-3 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap"
              >
                {{ formatarDataCurta(aula.data) }}
              </th>
              <th class="text-center px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                Presenças
              </th>
              <th
                class="text-center px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide cursor-pointer hover:text-gray-800 transition select-none"
                @click="alternarOrdem('frequencia')"
              >
                %
                <span class="ml-1 text-gray-300">
                  {{ ordemColuna === 'frequencia' ? (ordemDirecao === 'asc' ? '↑' : '↓') : '↕' }}
                </span>
              </th>
            </tr>
          </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="aluno in tabelaAlunos"
                :key="aluno.id"
                class="hover:bg-gray-50 transition"
              >
                <td class="px-6 py-3 font-medium text-gray-800 whitespace-nowrap">
                  {{ aluno.nome }}
                  <span v-if="!aluno.ativo" class="ml-1 text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">Inativo</span>
                </td>
                <!-- Substitui o <span> dentro do v-for de aulasRealizadas no tbody -->
                <td
                  v-for="aula in aulasRealizadas"
                  :key="aula.id"
                  class="text-center px-3 py-3"
                >
                  <span
                    class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                    :class="{
                      'bg-green-100 text-green-700':  aluno.presencasPorAula[aula.id] === 'P',
                      'bg-blue-100 text-blue-700':    aluno.presencasPorAula[aula.id] === 'J',
                      'bg-yellow-100 text-yellow-700': aluno.presencasPorAula[aula.id] === 'PENDENTE',
                      'bg-red-100 text-red-600':      aluno.presencasPorAula[aula.id] === 'F',
                    }"
                  >
                    {{
                      aluno.presencasPorAula[aula.id] === 'P' ? '✓' :
                      aluno.presencasPorAula[aula.id] === 'J' ? 'J' :
                      aluno.presencasPorAula[aula.id] === 'PENDENTE' ? '⏳' : '✗'
                    }}
                  </span>
                </td>
                <td class="text-center px-6 py-3 font-semibold text-gray-700">
                  {{ aluno.totalPresencas }}/{{ aulasRealizadas.length }}
                </td>
                <td class="text-center px-6 py-3">
                  <span
                    class="font-bold text-sm"
                    :class="aluno.frequencia >= metaFrequencia ? 'text-green-600' : aluno.frequencia >= 50 ? 'text-yellow-600' : 'text-red-600'"
                  >
                    {{ aluno.frequencia }}%
                  </span>
                  <span v-if="aluno.frequencia < metaFrequencia" class="ml-1 text-xs">⚠️</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="px-6 py-3 border-t border-gray-50 flex items-center flex-wrap gap-4 text-xs text-gray-400">
            <span class="flex items-center gap-1.5">
              <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 font-bold text-xs">✓</span>
              Presente
            </span>
            <span class="flex items-center gap-1.5">
              <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">J</span>
              Justificada
            </span>
            <span class="flex items-center gap-1.5">
              <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 font-bold text-xs">⏳</span>
              Aguardando
            </span>
            <span class="flex items-center gap-1.5">
              <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 font-bold text-xs">✗</span>
              Falta
            </span>
          </div>

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
import { calcularFrequenciaSync } from '~/composables/usePresenca'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

definePageMeta({ middleware: 'professor' })

const route = useRoute()
const turmaId = Number(route.params.id)

const turma = ref(null)
const alunos = ref([])
const aulas = ref([])
const presencas = ref([])
const justificativas = ref([]) // NOVO — { aluno_id, aula_id }
const loading = ref(true)
const ordemColuna = ref('nome')
const ordemDirecao = ref('asc')
const nomeProfessor = ref('')
const { metaFrequencia, carregarConfig } = useConfigSistema()

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
    supabase.from('turma').select('id, nome, status, meta_frequencia, professor_id, sala').eq('id', turmaId).single(),
    supabase.from('turma_aluno').select('aluno_id, usuarios(id, nome, ativo)').eq('turma_id', turmaId),
    supabase.from('aula').select('id, data, status').eq('turma_id', turmaId).order('data', { ascending: true }),
  ])

  turma.value = turmaData

  if (turmaData?.professor_id) {
    const { data: profData } = await supabase
      .from('usuarios')
      .select('nome')
      .eq('id', turmaData.professor_id)
      .single()
    nomeProfessor.value = profData?.nome ?? ''
  }

  alunos.value = (vinculosData || [])
    .map(v => ({ id: v.aluno_id, nome: v.usuarios?.nome || '', ativo: v.usuarios?.ativo ?? true }))
    .sort((a, b) => a.nome.localeCompare(b.nome))

  aulas.value = aulasData || []

  const alunoIds = alunos.value.map(a => a.id)
  const aulasIds = new Set((aulasData || []).map(a => a.id))

  const [{ data: presencasData }, { data: justificativasData }] = await Promise.all([
    supabase.from('presenca').select('aula_id, aluno_id').in('aluno_id', alunoIds),
    supabase
      .from('justificativa_falta')
      .select('aluno_id, aula_id, status') // ADICIONADO status
      .in('aluno_id', alunoIds),           // removido o .eq('status', 'ACEITA')
  ])

  presencas.value = (presencasData || []).filter(p => aulasIds.has(p.aula_id))
  justificativas.value = (justificativasData || []).filter(j => aulasIds.has(j.aula_id))
  loading.value = false
})

// ─── Computeds ────────────────────────────────────────────────────
const aulasRealizadas = computed(() =>
  aulas.value.filter(a => a.status === 'REALIZADA')
)

const tabelaAlunos = computed(() => {
  const lista = alunos.value.map(aluno => {
    const presencasPorAula = {}

    aulasRealizadas.value.forEach(aula => {
      const presente = presencas.value.some(p => p.aluno_id === aluno.id && p.aula_id === aula.id)
      if (presente) {
        presencasPorAula[aula.id] = 'P'
        return
      }
      const just = justificativas.value.find(j => j.aluno_id === aluno.id && j.aula_id === aula.id)
      if (just?.status === 'ACEITA')    presencasPorAula[aula.id] = 'J'
      else if (just?.status === 'PENDENTE') presencasPorAula[aula.id] = 'PENDENTE'
      else                              presencasPorAula[aula.id] = 'F'
    })

    // Cálculo usa só aceitas — pendente não conta como presença
    const aulasIds = aulasRealizadas.value.map(a => a.id)
    const justAceitas = justificativas.value.filter(j => j.status === 'ACEITA')
    const freq = calcularFrequenciaSync(aluno.id, aulasIds, presencas.value, justAceitas)

    return {
      ...aluno,
      presencasPorAula,
      totalPresencas: freq.totalValidas,
      frequencia: freq.frequencia,
    }
  })

  return lista.sort((a, b) => {
    const dir = ordemDirecao.value === 'asc' ? 1 : -1
    if (ordemColuna.value === 'nome') return a.nome.localeCompare(b.nome) * dir
    return (a.frequencia - b.frequencia) * dir
  })
})

const frequenciaMedia = computed(() => {
  if (tabelaAlunos.value.length === 0) return 0
  const soma = tabelaAlunos.value.reduce((acc, a) => acc + a.frequencia, 0)
  return Math.round(soma / tabelaAlunos.value.length)
})

const alunosEmRisco = computed(() =>
  tabelaAlunos.value.filter(a => a.frequencia < metaFrequencia.value).length
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
    'Válidas', // presença + justificadas
    'Faltas',
    'Frequência (%)'
  ]

  const linhas = tabelaAlunos.value.map(aluno => [
    aluno.nome,
    // Substitui o map de aulas dentro de linhas no imprimirPDF
    ...aulasRealizadas.value.map(aula => {
      const v = aluno.presencasPorAula[aula.id]
      if (v === 'P') return 'P'
      if (v === 'J') return 'J'
      if (v === 'PENDENTE') return '?'
      return 'F'
    }),
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
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const turmaName = turma.value?.nome ?? 'Turma'
  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  doc.setFontSize(18)
  doc.setTextColor(22, 163, 74)
  doc.setFont('helvetica', 'bold')
  doc.text('Linguesc', 14, 18)

  doc.setFontSize(13)
  doc.setTextColor(31, 41, 55)
  doc.text(`Relatório de Presença — ${turmaName}`, 14, 26)

  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'normal')
  doc.text(`Professor(a): ${nomeProfessor.value}`, 14, 32)
  doc.text(`Gerado em: ${dataAtual}`, 14, 37)

  doc.setDrawColor(229, 231, 235)
  doc.setLineWidth(0.3)
  doc.line(14, 40, 283, 40)

  const cards = [
    { label: 'Total de alunos', valor: String(alunos.value.length) },
    { label: 'Aulas realizadas', valor: String(aulasRealizadas.value.length) },
    { label: 'Frequência média', valor: `${frequenciaMedia.value}%` },
    { label: 'Alunos em risco', valor: String(alunosEmRisco.value) },
  ]

  const cardW = 60, cardH = 16, cardY = 40, cardGap = 5

  cards.forEach((card, i) => {
    const x = 14 + i * (cardW + cardGap)
    doc.setFillColor(249, 250, 251)
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.2)
    doc.roundedRect(x, cardY, cardW, cardH, 2, 2, 'FD')

    doc.setFontSize(7)
    doc.setTextColor(156, 163, 175)
    doc.setFont('helvetica', 'normal')
    doc.text(card.label, x + 4, cardY + 5.5)

    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')

    if (card.label === 'Alunos em risco' && alunosEmRisco.value > 0) {
      doc.setTextColor(220, 38, 38)
    } else if (card.label === 'Frequência média' && frequenciaMedia.value < metaFrequencia.value) {
      doc.setTextColor(220, 38, 38)
    } else {
      doc.setTextColor(22, 163, 74)
    }

    doc.text(card.valor, x + 4, cardY + 13)
  })

  const cabecalho = [
    'Aluno',
    ...aulasRealizadas.value.map(a => formatarDataCurta(a.data)),
    'Válidas',
    '%',
  ]

  const linhas = tabelaAlunos.value.map(aluno => [
    aluno.nome + (aluno.ativo ? '' : ' (inativo)'),
    ...aulasRealizadas.value.map(aula => {
      const v = aluno.presencasPorAula[aula.id]
      if (v === 'P') return 'P'
      if (v === 'J') return 'J'
      if (v === 'PENDENTE') return '?'
      return 'F'
    }),
    `${aluno.totalPresencas}/${aulasRealizadas.value.length}`,
    `${aluno.frequencia}%`,
  ])

  autoTable(doc, {
    head: [cabecalho],
    body: linhas,
    startY: cardY + cardH + 8,
    margin: { left: 14, right: 14 },
    tableWidth: 'auto',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      font: 'helvetica',
      textColor: [31, 41, 55],
    },
    headStyles: {
      fillColor: [249, 250, 251],
      textColor: [107, 114, 128],
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'center',
      lineColor: [229, 231, 235],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 45 },
      [cabecalho.length - 1]: { halign: 'center', fontStyle: 'bold' },
    },
    didParseCell(data) {
      const isAulaCol = data.column.index > 0 && data.column.index < cabecalho.length - 2

      if (isAulaCol && data.section === 'body') {
        data.cell.styles.halign = 'center'
        data.cell.styles.fontStyle = 'bold'
        if (data.cell.raw === 'P') {
          data.cell.styles.textColor = [22, 163, 74]
        } else if (data.cell.raw === 'J') {
          data.cell.styles.textColor = [37, 99, 235]
        } else if (data.cell.raw === '?') {
          data.cell.styles.textColor = [161, 98, 7]
        } else if (data.cell.raw === 'F') {
          data.cell.styles.textColor = [220, 38, 38]
        }
      }

      if (data.column.index === cabecalho.length - 1 && data.section === 'body') {
        const freq = parseInt(data.cell.raw)
        data.cell.styles.textColor = freq < metaFrequencia.value ? [220, 38, 38] : [22, 163, 74]
        data.cell.styles.fontStyle = 'bold'
      }
    },
    didDrawPage(data) {
      const pageCount = doc.getNumberOfPages()
      doc.setFontSize(7)
      doc.setTextColor(156, 163, 175)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Linguesc · ${turmaName} · Página ${data.pageNumber} de ${pageCount}`,
        14,
        doc.internal.pageSize.height - 8
      )
      doc.text(
        dataAtual,
        doc.internal.pageSize.width - 14,
        doc.internal.pageSize.height - 8,
        { align: 'right' }
      )
    },
  })

  // Após o autoTable, antes do doc.save
  const legendaY = doc.lastAutoTable.finalY + 6
  doc.setFontSize(7)
  doc.setTextColor(156, 163, 175)
  doc.setFont('helvetica', 'normal')
  doc.text('Legenda: P = Presente; J = Justificada; ? = Aguardando avaliação; F = Falta', 14, legendaY)

  doc.save(`presenca_${turmaName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
}

function alternarOrdem(coluna) {
  if (ordemColuna.value === coluna) {
    ordemDirecao.value = ordemDirecao.value === 'asc' ? 'desc' : 'asc'
  } else {
    ordemColuna.value = coluna
    ordemDirecao.value = coluna === 'frequencia' ? 'desc' : 'asc'
  }
}
</script>
<style>
@media screen {
  .hidden-screen { display: none; }
}
</style>