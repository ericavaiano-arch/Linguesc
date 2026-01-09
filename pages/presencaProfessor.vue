<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-800 mb-2">
      Presença – Professor
    </h1>

    <p class="text-gray-600 mb-6">
      Selecione uma turma para acompanhar a presença dos alunos.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="turma in turmas"
        :key="turma.id"
        class="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition"
        @click="irParaTurma(turma.id)"
      >
        <h2 class="text-lg font-semibold text-gray-800 mb-1">
          {{ turma.nome }}
        </h2>

        <p class="text-sm text-gray-500">
          {{ turma.alunos.length }} alunos
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// Dados mockados
const turmas = [
  {
    id: 1,
    nome: 'Turma 3A',
    alunos: Array(25)
  },
  {
    id: 2,
    nome: 'Turma 2B',
    alunos: Array(18)
  },
  {
    id: 3,
    nome: 'Turma 1C',
    alunos: Array(30)
  }
]

function irParaTurma(id) {
  router.push(`/presenca-professor/turma/${id}`)
}
</script>
