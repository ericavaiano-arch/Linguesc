<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-green-700">Troca de Turma</h1>
      <p class="text-gray-500 mt-2">Transfira um estudante de uma turma para outra, preservando as presenças.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <!-- Passo 1: Buscar estudante -->
    <div class="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">1. Encontrar o estudante</p>
      <div class="relative max-w-lg">
        <input
          v-model="termoBusca"
          @input="onBuscaInput"
          type="text"
          placeholder="Buscar por nome, e-mail ou CPF..."
          class="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          autocomplete="off"
        />
        <div v-if="buscando" class="absolute right-3 top-1/2 -translate-y-1/2">
          <div class="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>

      <!-- Resultados da busca -->
      <div v-if="resultados.length > 0 && !alunoSelecionado" class="mt-3 max-w-lg border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <button
          v-for="aluno in resultados"
          :key="aluno.id"
          @click="selecionarAluno(aluno)"
          class="w-full flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-green-50 transition text-left"
        >
          <div class="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
            {{ aluno.nome?.[0]?.toUpperCase() }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-gray-800">{{ aluno.nome }}</p>
            <p class="text-xs text-gray-400 truncate">{{ aluno.email || aluno.documento_federal || '—' }}</p>
            <div class="flex flex-wrap gap-1 mt-1">
              <span
                v-for="t in aluno.turmas"
                :key="t.id"
                class="text-[10px] bg-green-50 text-green-700 border border-green-100 rounded-full px-2 py-0.5"
              >{{ t.nome }}</span>
            </div>
          </div>
        </button>
      </div>

      <p v-if="buscaFeita && resultados.length === 0 && !buscando && !alunoSelecionado" class="text-sm text-gray-400 mt-3">
        Nenhum estudante encontrado com turma ativa.
      </p>
    </div>

    <!-- Passo 2: Confirmar estudante + selecionar turmas -->
    <Transition name="fade">
      <div v-if="alunoSelecionado" class="space-y-4">

        <!-- Card do estudante selecionado -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <div class="flex items-center justify-between mb-4">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">2. Estudante selecionado</p>
            <button @click="limparSelecao" class="text-xs text-gray-400 hover:text-gray-600 transition">Trocar</button>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
              {{ alunoSelecionado.nome?.[0]?.toUpperCase() }}
            </div>
            <div>
              <p class="font-semibold text-gray-800">{{ alunoSelecionado.nome }}</p>
              <p class="text-sm text-gray-500">{{ alunoSelecionado.email || '—' }}</p>
              <p v-if="alunoSelecionado.documento_federal" class="text-xs text-gray-400">CPF: {{ alunoSelecionado.documento_federal }}</p>
            </div>
          </div>
        </div>

        <!-- Selecionar turma origem (se tiver mais de uma) -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">3. Turma atual (origem)</p>

          <div v-if="alunoSelecionado.turmas.length === 1" class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <span class="text-2xl">📚</span>
            <div>
              <p class="font-semibold text-gray-800">{{ alunoSelecionado.turmas[0].nome }}</p>
              <p class="text-xs text-gray-400 mt-0.5">Turma atual</p>
            </div>
          </div>

          <select
            v-else
            v-model="turmaOrigemId"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          >
            <option value="">Selecione a turma de origem</option>
            <option v-for="t in alunoSelecionado.turmas" :key="t.id" :value="t.id">{{ t.nome }}</option>
          </select>
        </div>

        <!-- Selecionar turma destino -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">4. Nova turma (destino)</p>

          <div v-if="carregandoTurmas" class="flex items-center gap-2 text-green-700">
            <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-sm">Carregando turmas...</span>
          </div>

          <select
            v-else
            v-model="turmaDestinoId"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          >
            <option value="">Selecione a turma de destino</option>
            <option
              v-for="t in turmasDisponiveis"
              :key="t.id"
              :value="t.id"
              :disabled="t.id === turmaOrigemId"
            >
              {{ t.nome }}{{ t.id === turmaOrigemId ? ' (atual)' : '' }}
            </option>
          </select>

          <!-- Preview da transferência -->
          <div v-if="turmaOrigemNome && turmaDestinoNome" class="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            <p class="font-semibold mb-1">Resumo da transferência:</p>
            <p>
              <span class="font-medium">{{ alunoSelecionado.nome }}</span> será movido de
              <span class="font-medium">{{ turmaOrigemNome }}</span> para
              <span class="font-medium">{{ turmaDestinoNome }}</span>.
            </p>
            <p class="text-xs text-blue-600 mt-2">
              As presenças registradas serão replicadas na nova turma (mesma sequência de aulas).
              O histórico de estrelas é mantido.
            </p>
          </div>
        </div>

        <!-- Botão confirmar -->
        <div class="flex justify-end gap-3">
          <button
            @click="limparSelecao"
            class="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            @click="confirmarTroca"
            :disabled="!podeConfirmar || transferindo"
            class="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white text-sm font-semibold transition active:scale-95 flex items-center gap-2"
          >
            <div v-if="transferindo" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ transferindo ? 'Transferindo...' : '✅ Confirmar Troca' }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Modal de sucesso -->
    <Transition name="fade">
      <div
        v-if="sucessoModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
        @click.self="fecharSucesso"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
          <p class="text-5xl mb-4">🎉</p>
          <h2 class="text-lg font-bold text-gray-800 mb-2">Transferência concluída!</h2>
          <p class="text-sm text-gray-600 mb-1">
            <span class="font-semibold">{{ ultimoResultado?.nome }}</span> foi transferido(a) com sucesso.
          </p>
          <p class="text-xs text-gray-400 mb-1">
            De: <span class="font-medium">{{ ultimoResultado?.origem }}</span>
          </p>
          <p class="text-xs text-gray-400 mb-4">
            Para: <span class="font-medium">{{ ultimoResultado?.destino }}</span>
          </p>
          <p v-if="ultimoResultado?.presencasTransferidas > 0" class="text-xs text-green-700 bg-green-50 rounded-xl px-3 py-2 mb-4">
            {{ ultimoResultado.presencasTransferidas }} presença(s) replicada(s) na nova turma.
          </p>
          <p v-else class="text-xs text-gray-400 mb-4">
            Nenhuma presença para replicar (nenhuma aula realizada na turma anterior).
          </p>
          <button
            @click="fecharSucesso"
            class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition text-sm"
          >
            Fazer outra transferência
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { supabase } from '~/utils/supabase'

definePageMeta({ middleware: 'admin' })

const { $toast } = useNuxtApp()

const termoBusca = ref('')
const buscando = ref(false)
const buscaFeita = ref(false)
const resultados = ref([])
const alunoSelecionado = ref(null)
const turmaOrigemId = ref('')
const turmaDestinoId = ref('')
const turmasDisponiveis = ref([])
const carregandoTurmas = ref(false)
const transferindo = ref(false)
const sucessoModal = ref(false)
const ultimoResultado = ref(null)

let buscaTimer = null

function onBuscaInput() {
  buscaFeita.value = false
  resultados.value = []
  clearTimeout(buscaTimer)
  if (termoBusca.value.trim().length < 2) return
  buscaTimer = setTimeout(buscar, 400)
}

async function buscar() {
  buscando.value = true
  try {
    const data = await $fetch('/api/admin/buscar-alunos', { query: { q: termoBusca.value.trim() } })
    resultados.value = data || []
    buscaFeita.value = true
  } catch {
    $toast.error('Erro ao buscar estudantes.')
  } finally {
    buscando.value = false
  }
}

function selecionarAluno(aluno) {
  alunoSelecionado.value = aluno
  resultados.value = []
  turmaOrigemId.value = aluno.turmas.length === 1 ? aluno.turmas[0].id : ''
  turmaDestinoId.value = ''
  carregarTurmasDisponiveis()
}

async function carregarTurmasDisponiveis() {
  carregandoTurmas.value = true
  const { data } = await supabase
    .from('turma')
    .select('id, nome')
    .eq('status', 'ATIVA')
    .eq('is_teste', false)
    .order('nome')
  turmasDisponiveis.value = data || []
  carregandoTurmas.value = false
}

function limparSelecao() {
  alunoSelecionado.value = null
  turmaOrigemId.value = ''
  turmaDestinoId.value = ''
  resultados.value = []
  termoBusca.value = ''
  buscaFeita.value = false
}

function fecharSucesso() {
  sucessoModal.value = false
  limparSelecao()
}

const turmaOrigemNome = computed(() => {
  if (!alunoSelecionado.value) return ''
  const id = turmaOrigemId.value || (alunoSelecionado.value.turmas[0]?.id ?? '')
  return alunoSelecionado.value.turmas.find(t => t.id === id)?.nome || ''
})

const turmaDestinoNome = computed(() => {
  if (!turmaDestinoId.value) return ''
  return turmasDisponiveis.value.find(t => t.id === turmaDestinoId.value)?.nome || ''
})

const podeConfirmar = computed(() => {
  const origemId = turmaOrigemId.value || alunoSelecionado.value?.turmas[0]?.id
  return !!alunoSelecionado.value && !!origemId && !!turmaDestinoId.value && origemId !== turmaDestinoId.value
})

async function confirmarTroca() {
  if (!podeConfirmar.value) return
  const origemId = turmaOrigemId.value || alunoSelecionado.value.turmas[0].id

  transferindo.value = true
  try {
    const resultado = await $fetch('/api/admin/trocar-turma', {
      method: 'POST',
      body: {
        aluno_id: alunoSelecionado.value.id,
        turma_origem_id: origemId,
        turma_destino_id: turmaDestinoId.value,
      },
    })

    ultimoResultado.value = {
      nome: alunoSelecionado.value.nome,
      origem: turmaOrigemNome.value,
      destino: turmaDestinoNome.value,
      presencasTransferidas: resultado.presencasTransferidas || 0,
    }
    sucessoModal.value = true
  } catch (err) {
    console.error(err)
    $toast.error(err?.data?.message || 'Erro ao realizar a transferência.')
  } finally {
    transferindo.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
