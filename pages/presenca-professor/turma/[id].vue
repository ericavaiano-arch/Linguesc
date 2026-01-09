<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-2">
      Presença da Turma {{ turma?.nome }}
    </h1>

    <p class="text-gray-600 mb-6">
      {{ alunos.length }} alunos
    </p>

    <!-- Lista de alunos -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-700 mb-4">
        Alunos
      </h2>

      <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <li
          v-for="aluno in alunos"
          :key="aluno"
          class="px-4 py-2 rounded-md bg-gray-50 text-gray-700"
        >
          {{ aluno }}
        </li>
      </ul>
    </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Presença por aula -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-semibold text-gray-600 mb-4">
          Presença por aula
        </h3>

        <div class="h-64">
          <Bar :data="barData" :options="barOptions" />
        </div>
      </div>

      <!-- Presença geral -->
      <div class="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center">
        <h3 class="text-sm font-semibold text-gray-600 mb-4">
          Presença geral da turma
        </h3>

        <div class="relative h-40 w-40 mb-4">
          <Doughnut :data="donutData" :options="donutOptions" />

          <div class="absolute inset-0 flex items-center justify-center">
            <p class="text-xl font-bold text-gray-800">
              {{ percentualGeral }}%
            </p>
          </div>
        </div>

        <div class="flex gap-6 text-sm">
          <span class="text-green-600">
            {{ totalPresencas }} presenças
          </span>
          <span class="text-red-500">
            {{ totalFaltas }} faltas
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
)

const route = useRoute()
const turmaId = route.params.id

// Mock de dados
const turmas = {
  1: {
    nome: 'Turma A',
    alunos: ['Ana', 'João', 'Maria', 'Pedro'],
    aulas: [
      { aula: 1, presentes: 4 },
      { aula: 2, presentes: 3 },
      { aula: 3, presentes: 4 },
      { aula: 4, presentes: 2 }
    ]
  },
  2: {
    nome: 'Turma B',
    alunos: ['Lucas', 'Paula', 'Bruno'],
    aulas: [
      { aula: 1, presentes: 3 },
      { aula: 2, presentes: 2 },
      { aula: 3, presentes: 3 }
    ]
  }
}

const turma = turmas[turmaId]
const alunos = turma?.alunos || []
const aulas = turma?.aulas || []

/* ====== Gráfico por aula ====== */
const barData = computed(() => ({
  labels: aulas.map(a => `Aula ${a.aula}`),
  datasets: [
    {
      label: 'Alunos presentes',
      data: aulas.map(a => a.presentes),
      backgroundColor: '#3b82f6'
    }
  ]
}))

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: alunos.length,
      ticks: {
        stepSize: 1
      }
    }
  }
}

/* ====== Gráfico geral ====== */
const totalPresencas = computed(() =>
  aulas.reduce((acc, a) => acc + a.presentes, 0)
)

const totalPossivel = computed(() =>
  aulas.length * alunos.length
)

const totalFaltas = computed(() =>
  totalPossivel.value - totalPresencas.value
)

const percentualGeral = computed(() =>
  totalPossivel.value === 0
    ? 0
    : Math.round((totalPresencas.value / totalPossivel.value) * 100)
)

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
    legend: { display: false }
  }
}
</script>
