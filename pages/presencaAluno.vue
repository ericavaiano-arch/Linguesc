<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-green-700">
        Presença - Aluno
      </h1>
      <p class="text-gray-500 mt-2">
        Acompanhe sua frequência semanal ao longo do curso.
      </p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <!-- Grid principal -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- Registro semanal -->
      <div class="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <h2 class="text-lg font-semibold text-gray-800 mb-6">
          Registro semanal
        </h2>

        <ul class="space-y-3">
          <li
            v-for="item in presencas"
            :key="item.semana"
            class="flex justify-between items-center px-5 py-4 rounded-xl border transition"
            :class="rowClass(item.status)"
          >
            <span class="font-medium text-gray-700">
              Semana {{ item.semana }}
            </span>

            <span
              class="px-3 py-1 rounded-full text-sm font-semibold"
              :class="badgeClass(item.status)"
            >
              {{ labelStatus(item.status) }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Frequência -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center">

        <h2 class="text-lg font-semibold text-gray-800 mb-6">
          Frequência Geral
        </h2>

        <!-- Gráfico -->
        <div class="relative h-40 w-40 mb-6">
          <Doughnut :data="donutData" :options="donutOptions" />

          <!-- Percentual central -->
          <div class="absolute inset-0 flex items-center justify-center">
            <p class="text-2xl font-bold text-gray-800">
              {{ percentual }}%
            </p>
          </div>
        </div>

        <!-- Resumo -->
        <div class="flex gap-8 text-sm mb-4">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-green-500"></span>
            <span class="text-gray-700">
              {{ totalPresencas }} presenças
            </span>
          </div>

          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-red-500"></span>
            <span class="text-gray-700">
              {{ totalFaltas }} faltas
            </span>
          </div>
        </div>

        <p class="text-xs text-gray-400 text-center">
          Aulas ainda não realizadas não entram no cálculo
        </p>

      </div>

    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

// Dados fictícios
const presencas = [
  { semana: 1, status: 'Presente' },
  { semana: 2, status: 'Presente' },
  { semana: 3, status: 'Falta' },
  { semana: 4, status: 'Presente' },
  { semana: 5, status: 'Presente' },
  { semana: 6, status: 'Falta' },
  { semana: 7, status: 'NaoRealizada' },
  { semana: 8, status: 'NaoRealizada' }
]

// Apenas aulas realizadas
const aulasRealizadas = computed(() =>
  presencas.filter(p => p.status !== 'NaoRealizada')
)

// Cálculos
const totalPresencas = computed(
  () => aulasRealizadas.value.filter(p => p.status === 'Presente').length
)

const totalFaltas = computed(
  () => aulasRealizadas.value.filter(p => p.status === 'Falta').length
)

const percentual = computed(() => {
  if (aulasRealizadas.value.length === 0) return 0
  return Math.round(
    (totalPresencas.value / aulasRealizadas.value.length) * 100
  )
})

// Gráfico
const donutData = computed(() => ({
  labels: ['Presenças', 'Faltas'],
  datasets: [
    {
      data: [totalPresencas.value, totalFaltas.value],
      backgroundColor: ['#16a34a', '#ef4444'],
      borderWidth: 0
    }
  ]
}))

const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: {
      display: false
    }
  }
}

// Estilos por status
function rowClass(status) {
  if (status === 'Presente') return 'bg-green-50'
  if (status === 'Falta') return 'bg-red-50'
  return 'bg-gray-100'
}

function badgeClass(status) {
  if (status === 'Presente') return 'bg-green-100 text-green-700'
  if (status === 'Falta') return 'bg-red-100 text-red-600'
  return 'bg-gray-200 text-gray-500'
}

function labelStatus(status) {
  if (status === 'NaoRealizada') return 'Não realizada'
  return status
}
</script>
