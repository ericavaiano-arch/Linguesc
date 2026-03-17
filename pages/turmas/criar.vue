<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <!-- Header -->
    <div class="mb-10">
      <button @click="$router.back()" class="text-sm text-gray-400 hover:text-gray-600 transition mb-4 flex items-center gap-1">
        ← Voltar
      </button>
      <h1 class="text-3xl font-bold text-green-700">Nova Turma</h1>
      <p class="text-gray-500 mt-2">Defina o nome e adicione os alunos.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div class="max-w-2xl space-y-8">

      <!-- Nome da turma -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">📝 Nome da Turma</h2>
        <input
          v-model="nomeTurma"
          type="text"
          placeholder="Ex: Inglês A1 — 2026/1"
          class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        />
      </div>

      <!-- Buscar e adicionar alunos -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">👥 Adicionar Alunos</h2>

        <!-- Busca -->
        <div class="relative mb-4">
          <input
            v-model="buscaAluno"
            @input="buscarAlunos"
            type="text"
            placeholder="Buscar aluno por nome ou e-mail..."
            class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition pr-10"
          />
          <div v-if="loadingBusca" class="absolute right-3 top-3.5">
            <div class="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        <!-- Resultados da busca -->
        <ul v-if="resultadosBusca.length > 0" class="border border-gray-200 rounded-xl overflow-hidden mb-4">
          <li
            v-for="aluno in resultadosBusca"
            :key="aluno.id"
            class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition border-b last:border-b-0"
          >
            <div>
              <p class="text-sm font-medium text-gray-800">{{ aluno.nome }}</p>
              <p class="text-xs text-gray-400">{{ aluno.email }}</p>
            </div>
            <button
              @click="adicionarAluno(aluno)"
              :disabled="alunosSelecionados.some(a => a.id === aluno.id)"
              class="text-xs px-3 py-1.5 rounded-lg font-semibold transition"
              :class="alunosSelecionados.some(a => a.id === aluno.id)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-100 text-green-700 hover:bg-green-200'"
            >
              {{ alunosSelecionados.some(a => a.id === aluno.id) ? 'Adicionado' : '+ Adicionar' }}
            </button>
          </li>
        </ul>

        <!-- Alunos selecionados -->
        <div v-if="alunosSelecionados.length > 0">
          <p class="text-xs text-gray-500 font-medium mb-2">
            {{ alunosSelecionados.length }} aluno(s) na turma:
          </p>
          <ul class="flex flex-wrap gap-2">
            <li
              v-for="aluno in alunosSelecionados"
              :key="aluno.id"
              class="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-xs px-3 py-1.5 rounded-full"
            >
              {{ aluno.nome }}
              <button @click="removerAluno(aluno.id)" class="hover:text-red-500 transition font-bold">×</button>
            </li>
          </ul>
        </div>

        <p v-else class="text-sm text-gray-400 text-center py-4">
          Nenhum aluno adicionado ainda.
        </p>
      </div>

      <!-- Botão criar -->
      <div class="flex justify-end">
        <button
          @click="criarTurma"
          :disabled="salvando || !nomeTurma.trim()"
          class="bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition active:scale-95 flex items-center gap-2"
        >
          <div v-if="salvando" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {{ salvando ? 'Criando...' : '✅ Criar Turma' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'

const router = useRouter()
const { $toast } = useNuxtApp()

const nomeTurma = ref('')
const buscaAluno = ref('')
const resultadosBusca = ref([])
const alunosSelecionados = ref([])
const loadingBusca = ref(false)
const salvando = ref(false)

let buscaTimeout = null

async function buscarAlunos() {
  const termo = buscaAluno.value.trim()
  if (termo.length < 2) { resultadosBusca.value = []; return }

  clearTimeout(buscaTimeout)
  buscaTimeout = setTimeout(async () => {
    loadingBusca.value = true

    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nome, email')
      .eq('tipoUsuario', 'ALUNO')
      .or(`nome.ilike.%${termo}%,email.ilike.%${termo}%`)
      .limit(10)

    if (!error) resultadosBusca.value = data
    loadingBusca.value = false
  }, 300)
}

function adicionarAluno(aluno) {
  if (!alunosSelecionados.value.some(a => a.id === aluno.id)) {
    alunosSelecionados.value.push(aluno)
  }
}

function removerAluno(id) {
  alunosSelecionados.value = alunosSelecionados.value.filter(a => a.id !== id)
}

async function criarTurma() {
  if (!nomeTurma.value.trim()) {
    $toast.warning('Informe o nome da turma.')
    return
  }

  salvando.value = true

  try {
    const stored = localStorage.getItem('user')
    const professorId = stored ? JSON.parse(stored)?.id : null

    // 1. Criar turma
    const { data: novaTurma, error: errTurma } = await supabase
      .from('turma')
      .insert([{ nome: nomeTurma.value.trim(), professor_id: professorId }])
      .select()
      .single()

    if (errTurma) throw errTurma

    // 2. Vincular alunos (turma_aluno)
    if (alunosSelecionados.value.length > 0) {
      const vinculos = alunosSelecionados.value.map(a => ({
        turma_id: novaTurma.id,
        aluno_id: a.id
      }))

      const { error: errVinculo } = await supabase
        .from('turma_aluno')
        .insert(vinculos)

      if (errVinculo) throw errVinculo
    }

    $toast.success('Turma criada com sucesso!')
    router.push('/turmas')

  } catch (err) {
    console.error('Erro ao criar turma:', err)
    $toast.error('Erro ao criar turma. Tente novamente.')
  } finally {
    salvando.value = false
  }
}
</script>
