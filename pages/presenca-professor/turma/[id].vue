<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-green-700">
        Presença da Turma {{ turma?.nome }}
      </h1>
      <p class="text-gray-500 mt-2">
        {{ alunos.length }} alunos matriculados
      </p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <!-- Card Alunos -->
    <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 mb-8">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-gray-800">
          Alunos da Turma
        </h2>

        <span class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
          {{ alunos.length }} ativos
        </span>
      </div>

      <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <li
          v-for="aluno in alunos"
          :key="aluno"
          class="px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-700 hover:border-green-400 hover:bg-green-50 transition"
        >
          {{ aluno }}
        </li>
      </ul>
    </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

      <!-- Presença por aula -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <h3 class="text-lg font-semibold text-gray-800 mb-6">
          Presença por aula
        </h3>

        <div class="h-72">
          <Bar :data="barData" :options="barOptions" />
        </div>
      </div>

      <!-- Presença geral -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center">

        <h3 class="text-lg font-semibold text-gray-800 mb-6">
          Presença geral da turma
        </h3>

        <div class="relative h-44 w-44 mb-6">
          <Doughnut :data="donutData" :options="donutOptions" />

          <div class="absolute inset-0 flex items-center justify-center">
            <p class="text-2xl font-bold text-gray-800">
              {{ percentualGeral }}%
            </p>
          </div>
        </div>

        <div class="flex gap-10 text-sm">
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

definePageMeta({ middleware: 'professor' })

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
