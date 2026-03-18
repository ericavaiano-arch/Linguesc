<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <!-- Header -->
    <div class="mb-10">
      <button @click="$router.back()" class="text-sm text-gray-400 hover:text-gray-600 transition mb-4 flex items-center gap-1">
        ← Voltar
      </button>
      <h1 class="text-3xl font-bold text-green-700">Chamada — {{ turma?.nome }}</h1>
      <p class="text-gray-500 mt-2">Selecione a aula e marque os alunos presentes.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando...</span>
    </div>

    <div v-else>

      <!-- Seleção de aula -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">📅 Selecione a Aula</h2>

        <div v-if="aulas.length === 0" class="text-sm text-gray-400 py-4 text-center">
          Nenhuma aula cadastrada para esta turma.
          <br>
          <button @click="$router.push(`/turmas/${turmaId}/aulas`)" class="mt-2 text-green-600 hover:underline font-medium">
            Cadastrar aulas →
          </button>
        </div>

        <ul v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <li
            v-for="aula in aulasOrdenadas"
            :key="aula.id"
            @click="selecionarAula(aula)"
            class="flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-all"
            :class="aulaSelecionada?.id === aula.id
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-gray-50 hover:border-green-300'"
          >
            <div>
              <p class="text-sm font-semibold text-gray-800">{{ formatarData(aula.data) }}</p>
              <span
                class="text-xs px-2 py-0.5 rounded font-medium"
                :class="{
                  'bg-green-200 text-green-800': aula.status === 'REALIZADA',
                  'bg-yellow-100 text-yellow-800': aula.status === 'AGENDADA',
                  'bg-red-200 text-red-800': aula.status === 'CANCELADA',
                }"
              >
                {{ aula.status }}
              </span>
            </div>
            <div v-if="aulaSelecionada?.id === aula.id" class="w-4 h-4 rounded-full bg-green-500"></div>
          </li>
        </ul>
      </div>

      <!-- Grid de alunos (só aparece se tiver aula selecionada) -->
      <div v-if="aulaSelecionada" class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-800">👥 Alunos da Turma</h2>
          <div class="flex items-center gap-3">
            <div v-if="loadingPresencas" class="flex items-center gap-2 text-sm text-green-700">
              <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <span
              v-else-if="modoEdicao"
              class="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium"
            >
              ✏️ Editando chamada
            </span>
            <span v-else class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              🆕 Nova chamada
            </span>
            <span class="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              {{ presentesCount }}/{{ alunos.length }}
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
          <button
            @click="registrarAulaVazia"
            class="text-sm px-4 py-2 rounded-xl border border-orange-200 text-orange-600 hover:bg-orange-50 transition"
          >
            🚫 Ninguém presente
          </button>
        </div>

        <!-- Lista de alunos -->
        <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <li
          v-for="aluno in alunos"
          :key="aluno.id"
          @click="aluno.ativo ? togglePresenca(aluno.id) : null"
          class="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150"
          :class="!aluno.ativo
            ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
            : presentes.has(aluno.id)
              ? 'border-green-400 bg-green-50 text-green-800 cursor-pointer'
              : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100 cursor-pointer'"
        >
            <div
              class="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
              :class="presentes.has(aluno.id) ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'"
            >
              <svg v-if="presentes.has(aluno.id)" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span class="text-sm font-medium truncate" :class="!aluno.ativo ? 'text-gray-400' : ''">
              {{ aluno.nome }}
              <span v-if="!aluno.ativo" class="ml-1 text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">Inativo</span>
            </span>
          </li>
        </ul>

        <p v-if="alunos.length === 0" class="text-sm text-gray-400 text-center py-8">
          Nenhum aluno encontrado nesta turma.
        </p>
      </div>

      <!-- Botão salvar -->
      <div v-if="aulaSelecionada" class="flex justify-end">
        <button
          @click="salvarChamada"
          :disabled="salvando"
          class="bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition active:scale-95 flex items-center gap-2"
        >
          <div v-if="salvando" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {{ salvando ? 'Salvando...' : (modoEdicao ? 'Atualizar Chamada' : 'Salvar Chamada') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/utils/supabase'

definePageMeta({ middleware: 'professor' })

const route = useRoute()
const router = useRouter()
const { $toast } = useNuxtApp()

const turmaId = route.params.id
const turma = ref(null)
const aulas = ref([])
const alunos = ref([])
const loading = ref(true)
const loadingPresencas = ref(false)
const salvando = ref(false)

const aulaSelecionada = ref(null)
const presentes = ref(new Set())
const presentesOriginais = ref(new Set())
const presencaIds = ref({})
const modoEdicao = ref(false)

const presentesCount = computed(() => presentes.value.size)
const aulasOrdenadas = computed(() => [...aulas.value].sort((a, b) => new Date(a.data) - new Date(b.data)))

function formatarData(dataStr) {
  const d = new Date(dataStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function carregarTurma() {
  const { data } = await supabase.from('turma').select('*').eq('id', turmaId).single()
  turma.value = data
}

async function carregarAulas() {
  const { data, error } = await supabase.from('aula').select('*').eq('turma_id', turmaId)
  if (!error) aulas.value = data
}

async function carregarAlunos() {
  const { data, error } = await supabase
    .from('turma_aluno')
    .select('aluno_id, usuarios(id, nome, ativo)')
    .eq('turma_id', turmaId)

  if (!error) {
    alunos.value = data.map(item => ({
      id: item.aluno_id,
      nome: item.usuarios?.nome || 'Aluno',
      ativo: item.usuarios?.ativo ?? true
    }))
  }
}

async function selecionarAula(aula) {
  aulaSelecionada.value = aula
  loadingPresencas.value = true
  presencaIds.value = {}

  const { data, error } = await supabase
    .from('presenca')
    .select('id, aluno_id')
    .eq('aula_id', aula.id)

  if (error) {
    console.error(error)
    loadingPresencas.value = false
    return
  }

  const novosPresentes = new Set()
  data.forEach(p => {
    novosPresentes.add(p.aluno_id)
    presencaIds.value[p.aluno_id] = p.id
  })

  presentes.value = novosPresentes
  presentesOriginais.value = new Set(novosPresentes)
  modoEdicao.value = novosPresentes.size > 0
  loadingPresencas.value = false
}

function togglePresenca(alunoId) {
  const s = new Set(presentes.value)
  s.has(alunoId) ? s.delete(alunoId) : s.add(alunoId)
  presentes.value = s
}

function marcarTodos() { presentes.value = new Set(alunos.value.filter(a => a.ativo).map(a => a.id)) }
function desmarcarTodos() { presentes.value = new Set() }

async function salvarChamada() {
  salvando.value = true
  try {
    const aInserir = [...presentes.value].filter(id => !presentesOriginais.value.has(id))
    const aRemover = [...presentesOriginais.value].filter(id => !presentes.value.has(id))

    const promessas = []

    if (aInserir.length > 0) {
      promessas.push(
        supabase.from('presenca').insert(
          aInserir.map(aluno_id => ({ aluno_id, aula_id: aulaSelecionada.value.id, status: 'PRESENTE' }))
        )
      )
    }

    if (aRemover.length > 0) {
      const ids = aRemover.map(id => presencaIds.value[id]).filter(Boolean)
      if (ids.length > 0) promessas.push(supabase.from('presenca').delete().in('id', ids))
    }

    if (promessas.length === 0) {
      $toast.warning('Nenhuma alteração detectada.')
      salvando.value = false
      return
    }

    const resultados = await Promise.all(promessas)
    const erros = resultados.filter(r => r.error)

    if (erros.length > 0) throw erros[0].error

    // Marcar aula como REALIZADA
    await supabase.from('aula').update({ status: 'REALIZADA' }).eq('id', aulaSelecionada.value.id)

    const msg = modoEdicao.value
      ? `Chamada atualizada! +${aInserir.length} adicionado(s), -${aRemover.length} removido(s).`
      : `Chamada salva! ${presentes.value.size} presença(s) registrada(s).`

    $toast.success(msg)
    router.push('/chamada-manual')

  } catch (err) {
    console.error(err)
    $toast.error('Erro ao salvar chamada.')
  } finally {
    salvando.value = false
  }
}

async function registrarAulaVazia() {
  salvando.value = true
  try {
    await supabase.from('presenca').delete().eq('aula_id', aulaSelecionada.value.id)

    await supabase.from('aula').update({ status: 'REALIZADA' }).eq('id', aulaSelecionada.value.id)

    $toast.success('Aula registrada sem presenças.')
    router.push('/chamada-manual')
  } catch (err) {
    console.error(err)
    $toast.error('Erro ao registrar aula.')
  } finally {
    salvando.value = false
  }
}

onMounted(async () => {
  await Promise.all([carregarTurma(), carregarAulas(), carregarAlunos()])
  loading.value = false
})
</script>
