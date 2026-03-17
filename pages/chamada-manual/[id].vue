<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-green-700">
        Chamada — {{ turma?.nome }}
      </h1>
      <p class="text-gray-500 mt-2">
        Selecione a data e marque os alunos presentes.
      </p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando turma...</span>
    </div>

    <div v-else>

      <!-- Seleção de data -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">📅 Data da Aula</h2>
        <input
          v-model="dataAula"
          type="date"
          class="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        />
      </div>

      <!-- Grid de Alunos -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-800">
            👥 Alunos da Turma
          </h2>
          <div class="flex items-center gap-3">
            <span class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
              {{ presentesCount }} presentes
            </span>
            <span class="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              {{ alunos.length }} total
            </span>
          </div>
        </div>

        <!-- Ações rápidas -->
        <div class="flex gap-3 mb-6">
          <button
            @click="marcarTodos"
            class="text-sm px-4 py-2 rounded-xl border border-green-300 text-green-700 hover:bg-green-50 transition"
          >
            ✅ Marcar todos
          </button>
          <button
            @click="desmarcarTodos"
            class="text-sm px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
          >
            ❌ Desmarcar todos
          </button>
        </div>

        <!-- Lista de alunos -->
        <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <li
            v-for="aluno in alunos"
            :key="aluno.id"
            @click="togglePresenca(aluno.id)"
            class="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-150"
            :class="presentes.has(aluno.id)
              ? 'border-green-400 bg-green-50 text-green-800'
              : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'"
          >
            <!-- Checkbox visual -->
            <div
              class="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
              :class="presentes.has(aluno.id)
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300 bg-white'"
            >
              <svg
                v-if="presentes.has(aluno.id)"
                class="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="3"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <span class="text-sm font-medium truncate">{{ aluno.nome }}</span>
          </li>
        </ul>

        <p v-if="alunos.length === 0" class="text-sm text-gray-400 text-center py-8">
          Nenhum aluno encontrado nesta turma.
        </p>
      </div>

      <!-- Botão salvar -->
      <div class="flex justify-end">
        <button
          @click="salvarChamada"
          :disabled="salvando || !dataAula"
          class="bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition active:scale-95 flex items-center gap-2"
        >
          <div v-if="salvando" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {{ salvando ? 'Salvando...' : '💾 Salvar Chamada' }}
        </button>
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
const { $toast } = useNuxtApp()

const turmaId = route.params.id
const turma = ref(null)
const alunos = ref([])
const loading = ref(true)
const salvando = ref(false)

// Data padrão: hoje
const hoje = new Date().toISOString().split('T')[0]
const dataAula = ref(hoje)

// Set com os IDs dos alunos marcados como presentes
const presentes = ref(new Set())

const presentesCount = computed(() => presentes.value.size)

async function carregarTurma() {
  const { data, error } = await supabase
    .from('turma')
    .select('*')
    .eq('id', turmaId)
    .single()

  if (error) {
    console.error('Erro ao buscar turma:', error.message)
  } else {
    turma.value = data
  }
}

async function carregarAlunos() {
  // Busca alunos via tabela de matrícula turma_aluno
  const { data, error } = await supabase
    .from('turma_aluno')
    .select('aluno_id, usuarios(id, nome)')
    .eq('turma_id', turmaId)

  if (error) {
    console.error('Erro ao buscar alunos:', error.message)
  } else {
    alunos.value = data.map(item => ({
      id: item.aluno_id,
      nome: item.usuarios?.nome || 'Aluno'
    }))
  }
}

function togglePresenca(alunoId) {
  const novoSet = new Set(presentes.value)
  if (novoSet.has(alunoId)) {
    novoSet.delete(alunoId)
  } else {
    novoSet.add(alunoId)
  }
  presentes.value = novoSet
}

function marcarTodos() {
  presentes.value = new Set(alunos.value.map(a => a.id))
}

function desmarcarTodos() {
  presentes.value = new Set()
}

async function salvarChamada() {
  if (!dataAula.value) {
    $toast.warning('Selecione a data da aula antes de salvar.')
    return
  }

  if (presentes.value.size === 0) {
    $toast.warning('Marque ao menos um aluno como presente.')
    return
  }

  salvando.value = true

  try {
    const registros = Array.from(presentes.value).map(alunoId => ({
      aluno_id: alunoId,
      dtPresenca: new Date(dataAula.value + 'T12:00:00').toISOString(),
      status: 'PRESENTE'
    }))

    const { error } = await supabase
      .from('presenca')
      .insert(registros)

    if (error) {
      console.error('Erro ao salvar chamada:', error.message)
      $toast.error('Erro ao salvar chamada. Tente novamente.')
    } else {
      $toast.success(`Chamada salva! ${presentes.value.size} presença(s) registrada(s).`)
      router.push('/chamadaManual')
    }
  } catch (err) {
    console.error('Erro inesperado:', err)
    $toast.error('Erro inesperado ao salvar.')
  } finally {
    salvando.value = false
  }
}

onMounted(async () => {
  await Promise.all([carregarTurma(), carregarAlunos()])
  loading.value = false
})
</script>
