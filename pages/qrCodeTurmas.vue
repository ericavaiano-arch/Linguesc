<template>
  <div class="min-h-screen bg-gray-50 p-8">
    
    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-green-700">
        QR Code - Professor
      </h1>
      <p class="text-gray-500 mt-2">
        Selecione uma turma para gerar o QR Code de presença.
      </p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando turmas...</span>
    </div>

    <!-- Nenhuma turma -->
    <div
      v-else-if="turmas.length === 0"
      class="bg-red-50 border border-red-200 text-red-600 p-6 rounded-lg"
    >
      Nenhuma turma encontrada para este professor.
    </div>

    <!-- Lista de turmas -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      <div
        v-for="turma in turmas"
        :key="turma.id"
        class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-green-500 transition-all duration-300 cursor-pointer"
        @click="irParaQRCode(turma.id)"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">
            {{ turma.nome }}
          </h2>

          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>

        <p class="text-sm text-gray-400">
          Código da turma
        </p>

        <p class="text-sm font-medium text-gray-600 mt-1">
          #{{ turma.id }}
        </p>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'

const router = useRouter()

const turmas = ref([])
const loading = ref(true)

const storedUser = localStorage.getItem('user')
const user = storedUser ? JSON.parse(storedUser) : null
const professorId = user?.id

async function carregarTurmas() {
  if (!professorId) {
    loading.value = false
    return
  }

  const { data, error } = await supabase
    .from('turma')
    .select('*')
    .eq('professor_id', professorId)
    .order('dtInclusao', { ascending: false })

  if (error) {
    console.error('Erro ao buscar turmas:', error.message)
  } else {
    turmas.value = data
  }

  loading.value = false
}

function irParaQRCode(id) {
  router.push(`/presenca-professor/turma/qrcode/${id}`)
}

onMounted(() => {
  carregarTurmas()
})
</script>