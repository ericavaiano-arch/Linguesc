<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-2">
      Presença - Aluno
    </h1>

    <p class="text-gray-600 mb-6">
      Acompanhe sua frequência semanal ao longo do curso.
    </p>

    <!-- Grid principal -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

      <!-- Registro semanal (66%) -->
      <div class="md:col-span-2 bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">
          Registro semanal
        </h2>

        <ul class="space-y-2">
          <li
            v-for="item in presencas"
            :key="item.semana"
            class="flex justify-between items-center px-4 py-3 rounded-md"
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

      <!-- Frequência (33%) -->
      <div class="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
        <p class="text-sm text-gray-500 mb-3">
          Frequência
        </p>

        <!-- Gráfico -->
        <div class="relative h-32 w-32 mb-4">
          <Doughnut :data="donutData" :options="donutOptions" />

          <!-- Percentual central -->
          <div class="absolute inset-0 flex items-center justify-center">
            <p class="text-xl font-bold text-gray-800">
              {{ percentual }}%
            </p>
          </div>
        </div>

        <!-- Resumo -->
        <div class="flex gap-6 text-sm">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            <span class="text-gray-700">
              {{ totalPresencas }} presenças
            </span>
          </div>

          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span class="text-gray-700">
              {{ totalFaltas }} faltas
            </span>
          </div>
        </div>

        <p class="text-xs text-gray-400 mt-3 text-center">
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
