<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <div class="mb-10">
      <h1 class="text-3xl font-bold text-green-700">Dashboard Admin</h1>
      <p class="text-gray-500 mt-2">Visão global de todos os professores e turmas.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando...</span>
    </div>

    <div v-else class="space-y-10">

      <!-- Cards globais -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p class="text-xs text-gray-400 font-medium mb-1">Professores ativos</p>
          <p class="text-3xl font-bold text-green-700">{{ professores.length }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p class="text-xs text-gray-400 font-medium mb-1">Alunos ativos</p>
          <p class="text-3xl font-bold text-green-700">{{ totalAlunos }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p class="text-xs text-gray-400 font-medium mb-1">Turmas ativas</p>
          <p class="text-3xl font-bold text-green-700">{{ turmasAtivas }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p class="text-xs text-gray-400 font-medium mb-1">Aulas realizadas</p>
          <p class="text-3xl font-bold text-green-700">{{ totalAulasRealizadas }}</p>
        </div>
      </div>

      <!-- Por Professor -->
      <div>
        <h2 class="text-lg font-semibold text-gray-800 mb-4">👨‍🏫 Por Professor</h2>
        <div class="space-y-4">
          <div
            v-for="prof in resumoPorProfessor"
            :key="prof.id"
            class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
          >
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-base font-semibold text-gray-800">{{ prof.nome }}</h3>
                <p class="text-xs text-gray-400 mt-0.5">{{ prof.email }}</p>
              </div>
              <div class="flex items-center gap-3 text-xs text-gray-500">
                <span class="bg-green-50 text-green-700 px-2 py-1 rounded-lg font-medium">{{ prof.turmas.length }} turma(s)</span>
                <span class="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium">{{ prof.totalAlunos }} aluno(s)</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div
                v-for="turma in prof.turmas"
                :key="turma.id"
                class="border border-gray-100 rounded-xl p-4 bg-gray-50"
              >
                <div class="flex items-center justify-between mb-2">
                  <p class="text-sm font-semibold text-gray-700 truncate">{{ turma.nome }}</p>
                  <span
                    class="text-xs font-bold ml-2 flex-shrink-0"
                    :class="turma.status === 'FINALIZADA' ? 'text-gray-400' : 'text-green-600'"
                  >
                    {{ turma.status === 'FINALIZADA' ? '🔒' : '🟢' }}
                  </span>
                </div>
                <p class="text-xs text-gray-400 mb-3">
                  {{ turma.totalAlunos }} aluno(s) · {{ turma.aulasRealizadas }} aula(s) · meta {{ turma.meta_frequencia }}%
                </p>
                <div class="flex gap-2">
                  <button
                    @click="$router.push(`/turmas/${turma.id}/historico`)"
                    class="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  >
                    📋 Histórico
                  </button>
                  <button
                    @click="$router.push(`/turmas/${turma.id}/relatorio`)"
                    class="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                  >
                    📄 Relatório
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { supabase } from '~/utils/supabase'

definePageMeta({ middleware: 'admin' })

const loading = ref(true)
const professores = ref([])
const todasTurmas = ref([])
const todasAulas = ref([])
const todosVinculos = ref([])

onMounted(async () => {
  const [
    { data: profsData },
    { data: turmasData },
    { data: aulasData },
    { data: vinculosData },
  ] = await Promise.all([
    // usuarios_completo traz email + tipo_usuario
    supabase
      .from('usuarios_completo')
      .select('id, nome, email, tipo_usuario, ativo')
      .eq('tipo_usuario', 'PROFESSOR')
      .eq('ativo', true)
      .order('nome'),

    supabase
      .from('turma')
      .select('id, nome, status, meta_frequencia, professor_id')
      .order('nome'),

    supabase
      .from('aula')
      .select('id, turma_id, status'),

    // join com usuarios_completo para pegar tipo_usuario e ativo dos alunos
    supabase
      .from('turma_aluno')
      .select('turma_id, aluno_id, usuarios_completo!aluno_id(ativo, tipo_usuario)'),
  ])

  professores.value = profsData || []
  todasTurmas.value = turmasData || []
  todasAulas.value = aulasData || []
  todosVinculos.value = vinculosData || []

  loading.value = false
})

const totalAlunos = computed(() => {
  const ids = new Set(
    todosVinculos.value
      .filter(v => v.usuarios_completo?.ativo === true && v.usuarios_completo?.tipo_usuario === 'ALUNO')
      .map(v => v.aluno_id)
  )
  return ids.size
})

const turmasAtivas = computed(() =>
  todasTurmas.value.filter(t => t.status === 'ATIVA').length
)

const totalAulasRealizadas = computed(() =>
  todasAulas.value.filter(a => a.status === 'REALIZADA').length
)

const resumoPorProfessor = computed(() =>
  professores.value.map(prof => {
    const turmas = todasTurmas.value
      .filter(t => t.professor_id === prof.id)
      .map(turma => ({
        ...turma,
        totalAlunos: todosVinculos.value.filter(v => v.turma_id === turma.id).length,
        aulasRealizadas: todasAulas.value.filter(a => a.turma_id === turma.id && a.status === 'REALIZADA').length,
      }))

    return {
      ...prof,
      turmas,
      totalAlunos: new Set(
        todosVinculos.value
          .filter(v =>
            turmas.some(t => t.id === v.turma_id) &&
            v.usuarios_completo?.ativo === true &&
            v.usuarios_completo?.tipo_usuario === 'ALUNO'
          )
          .map(v => v.aluno_id)
      ).size
    }
  }).filter(p => p.turmas.length > 0)
)
</script>