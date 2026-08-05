<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-green-700">Minhas Atividades</h1>
      <p class="text-gray-500 mt-2">Veja suas atividades, notas e feedbacks.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div
        class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"
      ></div>
      <span class="text-sm">Carregando...</span>
    </div>

    <div v-else>
      <!-- Sem atividades -->
      <div
        v-if="grupos.length === 0"
        class="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center"
      >
        <p class="text-4xl mb-4">📚</p>
        <p class="text-gray-500 font-medium">Nenhuma atividade disponível.</p>
      </div>

      <div v-else class="space-y-8 max-w-5xl">
        <!-- ── BOLETIM POR TURMA ── -->
        <div
          v-for="grupo in grupos"
          :key="grupo.turmaId"
          class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
        >
          <div class="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0"
            >
              {{ grupo.turmaNome.charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <h2 class="text-base font-semibold text-gray-800 truncate">
                {{ grupo.turmaNome }}
              </h2>
              <p class="text-xs text-gray-400">{{ grupo.atividades.length }} atividade(s)</p>
            </div>
          </div>

          <!-- Com nota -->
          <div v-if="notasDoGrupo(grupo).length > 0">
            <p class="px-5 sm:px-6 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              📝 Com nota
            </p>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left border-b border-gray-100">
                    <th class="font-medium text-xs text-gray-400 px-5 sm:px-6 py-2">Atividade</th>
                    <th class="font-medium text-xs text-gray-400 px-4 py-2 text-right">Nota</th>
                    <th class="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr
                    v-for="item in notasDoGrupo(grupo)"
                    :key="item.atividade_id"
                    @click="abrirDetalhe(item)"
                    class="cursor-pointer hover:bg-gray-50 transition"
                  >
                    <td class="px-5 sm:px-6 py-3">
                      <p class="font-medium text-gray-800 truncate max-w-[14rem] sm:max-w-xs">
                        {{ item.titulo }}
                      </p>
                    </td>

                    <td class="px-4 py-3 text-right whitespace-nowrap">
                      <span class="font-bold text-gray-700">
                        {{ item.nota !== null ? formatarNota(item.nota) : '—' }}
                      </span>
                    </td>

                    <td class="px-4 py-3 text-right whitespace-nowrap">
                      <span v-if="item.feedback" class="text-xs font-medium text-blue-500">💬 Feedback do(a) professor(a)</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div
            v-if="notasDoGrupo(grupo).length > 0 && participacoesDoGrupo(grupo).length > 0"
            class="h-px bg-gray-100 mx-5 sm:mx-6"
          ></div>

          <!-- Participação -->
          <div v-if="participacoesDoGrupo(grupo).length > 0">
            <p class="px-5 sm:px-6 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              ✅ Participação
            </p>
            <div class="overflow-x-auto pb-1">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left border-b border-gray-100">
                    <th class="font-medium text-xs text-gray-400 px-5 sm:px-6 py-2">Atividade</th>
                    <th class="font-medium text-xs text-gray-400 px-4 py-2 text-right">Situação</th>
                    <th class="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr
                    v-for="item in participacoesDoGrupo(grupo)"
                    :key="item.atividade_id"
                    @click="abrirDetalhe(item)"
                    class="cursor-pointer hover:bg-gray-50 transition"
                  >
                    <td class="px-5 sm:px-6 py-3">
                      <p class="font-medium text-gray-800 truncate max-w-[14rem] sm:max-w-xs">
                        {{ item.titulo }}
                      </p>
                    </td>

                    <td class="px-4 py-3 text-right whitespace-nowrap">
                      <span
                        class="inline-flex items-center gap-1.5 font-medium"
                        :class="item.feito ? 'text-green-600' : 'text-gray-400'"
                      >
                        <span
                          class="w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0"
                          :class="item.feito ? 'bg-green-500 border-green-500' : 'border-gray-300'"
                        >
                          <svg
                            v-if="item.feito"
                            class="w-2.5 h-2.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="4"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                        {{ item.feito ? 'Participou' : 'Não participou' }}
                      </span>
                    </td>

                    <td class="px-4 py-3 text-right whitespace-nowrap">
                      <span v-if="item.feedback" class="text-xs font-medium text-blue-500">💬 Feedback do(a) professor(a)</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div
        v-if="modalDetalhe"
        class="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-4"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
          <div class="px-6 pt-6 pb-4 border-b border-gray-100">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="text-base font-semibold text-gray-800">
                  {{ atividadeDetalhe?.titulo }}
                </h3>
                <p class="text-xs text-gray-400 mt-0.5">
                  {{ atividadeDetalhe?.turmaNome }}
                </p>
              </div>
              <button
                @click="modalDetalhe = false"
                class="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
          </div>

          <div class="px-6 py-4 space-y-4">
            <div class="bg-gray-50 rounded-xl p-4 text-center">
              <template v-if="atividadeDetalhe?.tipo === 'NOTA'">
                <p class="text-xs text-gray-400 mb-1">Sua nota</p>
                <p class="text-4xl font-bold text-gray-700">
                  {{
                    atividadeDetalhe?.nota !== null
                      ? formatarNota(atividadeDetalhe?.nota)
                      : '—'
                  }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  {{
                    atividadeDetalhe?.nota !== null
                      ? 'de 10,00'
                      : 'Ainda não avaliado'
                  }}
                </p>
              </template>
              <template v-else>
                <p class="text-xs text-gray-400 mb-2">Participação</p>
                <div
                  class="flex items-center justify-center gap-2"
                  :class="
                    atividadeDetalhe?.feito ? 'text-green-600' : 'text-gray-400'
                  "
                >
                  <div
                    class="w-6 h-6 rounded flex items-center justify-center border-2"
                    :class="
                      atividadeDetalhe?.feito
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300'
                    "
                  >
                    <svg
                      v-if="atividadeDetalhe?.feito"
                      class="w-3.5 h-3.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="3.5"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span class="text-base font-semibold">
                    {{ atividadeDetalhe?.feito ? 'Participou' : 'Não participou' }}
                  </span>
                </div>
              </template>
            </div>

            <div v-if="atividadeDetalhe?.feedback">
              <p class="text-xs font-medium text-gray-500 mb-1">
                💬 Feedback do(a) professor(a)
              </p>
              <p
                class="text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 whitespace-pre-line"
              >
                {{ atividadeDetalhe?.feedback }}
              </p>
            </div>

            <div v-if="atividadeDetalhe?.descricao">
              <p class="text-xs font-medium text-gray-500 mb-1">
                📋 Informações adicionais
              </p>
              <p
                class="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 whitespace-pre-line"
              >
                {{ atividadeDetalhe?.descricao }}
              </p>
            </div>
          </div>

          <div class="px-6 pb-6">
            <button
              @click="modalDetalhe = false"
              class="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { supabase } from '~/utils/supabase'

definePageMeta({ middleware: 'auth' })

const { user } = useAuth()
const loading = ref(true)
const grupos = ref([])
const modalDetalhe = ref(false)
const atividadeDetalhe = ref(null)

function formatarNota(nota) {
  if (nota === null || nota === undefined) return '—'
  return Number(nota).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Atividades com nota / de participação de uma turma, já separadas
function notasDoGrupo(grupo) {
  return grupo.atividades.filter((a) => a.tipo === 'NOTA')
}

function participacoesDoGrupo(grupo) {
  return grupo.atividades.filter((a) => a.tipo !== 'NOTA')
}

function abrirDetalhe(item) {
  atividadeDetalhe.value = item
  modalDetalhe.value = true
}

async function carregarAtividades() {
  const alunoId = user.value?.id
  if (!alunoId) return

  // Buscar turmas do aluno
  const { data: turmasAluno } = await supabase
    .from('turma_aluno')
    .select('turma_id, turma!inner(id, nome)')
    .eq('aluno_id', alunoId)

  if (!turmasAluno || turmasAluno.length === 0) {
    loading.value = false
    return
  }

  const turmaIds = turmasAluno.map((t) => t.turma_id)
  const mapaTurmas = Object.fromEntries(
    turmasAluno.map((t) => [t.turma_id, t.turma?.nome ?? '']),
  )

  // Buscar atividades publicadas/encerradas dessas turmas
  const { data: atividades } = await supabase
    .from('atividade')
    .select('*')
    .in('turma_id', turmaIds)
    .in('status', ['PUBLICADA', 'ENCERRADA'])
    .order('criado_em', { ascending: false })

  if (!atividades || atividades.length === 0) {
    loading.value = false
    return
  }

  const atividadeIds = atividades.map((a) => a.id)

  // Buscar registros do aluno
  const { data: registros } = await supabase
    .from('atividade_aluno')
    .select('*')
    .eq('aluno_id', alunoId)
    .in('atividade_id', atividadeIds)

  const mapaRegistros = Object.fromEntries(
    (registros || []).map((r) => [r.atividade_id, r]),
  )

  // Montar lista enriquecida
  const lista = atividades.map((a) => {
    const reg = mapaRegistros[a.id]
    return {
      atividade_id: a.id,
      titulo: a.titulo,
      tipo: a.tipo,
      status: a.status,
      descricao: a.descricao,
      turmaId: a.turma_id,
      turmaNome: mapaTurmas[a.turma_id] ?? '',
      nota: reg?.nota ?? null,
      feito: reg?.feito ?? false,
      feedback: reg?.feedback ?? '',
    }
  })

  // Agrupar por turma
  const mapaGrupos = {}
  for (const item of lista) {
    if (!mapaGrupos[item.turmaId]) {
      mapaGrupos[item.turmaId] = {
        turmaId: item.turmaId,
        turmaNome: item.turmaNome,
        atividades: [],
      }
    }
    mapaGrupos[item.turmaId].atividades.push(item)
  }

  grupos.value = Object.values(mapaGrupos).sort((a, b) =>
    a.turmaNome.localeCompare(b.turmaNome),
  )
  loading.value = false
}

onMounted(carregarAtividades)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>