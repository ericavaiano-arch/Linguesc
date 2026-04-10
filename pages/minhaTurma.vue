<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <div class="mb-10">
      <h1 class="text-3xl font-bold text-green-700">Minha Turma</h1>
      <p class="text-gray-500 mt-2">Acompanhe sua turma.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando...</span>
    </div>

    <div v-else-if="!turma" class="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
      <p class="text-4xl mb-4">📚</p>
      <p class="text-gray-500 font-medium">Você ainda não está matriculado em nenhuma turma.</p>
    </div>

    <div v-else class="space-y-6">

      <!-- ── CARD DA TURMA ── -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-xl font-bold text-gray-800">{{ turma.nome }}</h2>
            <p class="text-sm text-gray-500 mt-1">
              👨‍🏫 {{ nomeProfessor }}
            </p>
            <p v-if="turma.sala" class="text-sm text-gray-500 mt-0.5">
              🚪 Sala {{ turma.sala }}
            </p>
          </div>
          <span
            class="text-xs font-semibold px-3 py-1 rounded-full"
            :class="turma.status === 'ATIVA' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
          >
            {{ turma.status === 'ATIVA' ? '🟢 Ativa' : '🔒 Finalizada' }}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
          <div class="bg-gray-50 rounded-xl p-3 text-center">
            <p class="text-lg font-bold text-gray-800">{{ totalAlunos }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Alunos</p>
          </div>
          <div class="bg-gray-50 rounded-xl p-3 text-center">
            <p class="text-lg font-bold text-gray-800">{{ metaFrequencia }}%</p>
            <p class="text-xs text-gray-400 mt-0.5">Meta de frequência</p>
          </div>
          <div class="bg-gray-50 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
            <p class="text-lg font-bold text-gray-800">
              {{ proximaAula ? formatarDataCurta(proximaAula.data) : '—' }}
            </p>
            <p class="text-xs text-gray-400 mt-0.5">Próxima aula</p>
          </div>
        </div>
      </div>

        <!-- ── SUA POSIÇÃO ── -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-4">Sua posição na turma</p>
        <div class="flex items-center justify-between">
            <div>
            <p class="text-2xl font-bold text-gray-800">
                {{ minhaPosicao.emoji }} {{ minhaPosicao.posicao }}º de {{ rankingAtivos.length }}
            </p>
            <p
                class="text-sm mt-2 font-medium"
                :class="minhaPosicao.cor === 'green'
                ? 'text-green-600'
                : minhaPosicao.cor === 'yellow'
                    ? 'text-yellow-600'
                    : 'text-red-500'"
            >
                {{ minhaPosicao.mensagem }}
            </p>
            </div>
            <div
            class="text-right px-5 py-4 rounded-2xl"
            :class="minhaPosicao.cor === 'green'
                ? 'bg-green-50'
                : minhaPosicao.cor === 'yellow'
                ? 'bg-yellow-50'
                : 'bg-red-50'"
            >
            <p
                class="text-4xl font-bold"
                :class="minhaPosicao.cor === 'green'
                ? 'text-green-600'
                : minhaPosicao.cor === 'yellow'
                    ? 'text-yellow-600'
                    : 'text-red-500'"
            >
                {{ minhaFrequencia }}%
            </p>
            <p class="text-xs text-gray-400 mt-1">frequência</p>
            </div>
        </div>
        </div>

      <!-- ── RANKING DA TURMA ── -->
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-800">🏆 Ranking da Turma</h2>
          <span class="text-xs text-gray-400">{{ aulasRealizadas }} aula(s) realizadas</span>
        </div>

        <div v-if="aulasRealizadas === 0" class="text-center py-12 text-sm text-gray-400">
          Nenhuma aula realizada ainda. O ranking aparecerá assim que houver chamadas registradas.
        </div>

        <ul v-else class="divide-y divide-gray-50">
          <li
            v-for="(aluno, index) in rankingAtivos"
            :key="aluno.id"
            class="flex items-center gap-4 px-6 py-4 transition"
            :class="aluno.isVoce ? 'bg-green-50' : 'hover:bg-gray-50'"
          >
            <!-- Posição -->
            <div class="w-8 text-center flex-shrink-0">
              <span v-if="index === 0" class="text-xl">🥇</span>
              <span v-else-if="index === 1" class="text-xl">🥈</span>
              <span v-else-if="index === 2" class="text-xl">🥉</span>
              <span v-else class="text-sm font-bold text-gray-400">{{ index + 1 }}º</span>
            </div>

            <!-- Avatar + nome -->
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            >
              {{ aluno.isVoce ? '👤' : '👤' }}
            </div>

            <!-- Nome -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-800 truncate">
                {{ aluno.isVoce ? 'Você' : aluno.nomeAnonimo }}
                <span v-if="aluno.isVoce" class="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">você</span>
              </p>
              <!-- Barra de frequência -->
              <div class="flex items-center gap-2 mt-1.5">
                <div class="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div
                    class="h-1.5 rounded-full transition-all duration-500"
                    :class="aluno.frequencia >= metaFrequencia
                      ? 'bg-green-500'
                      : aluno.frequencia >= 50
                        ? 'bg-yellow-400'
                        : 'bg-red-400'"
                    :style="{ width: aluno.frequencia + '%' }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Frequência -->
            <div class="text-right flex-shrink-0">
              <span
                class="text-sm font-bold"
                :class="aluno.frequencia >= metaFrequencia
                  ? 'text-green-600'
                  : aluno.frequencia >= 50
                    ? 'text-yellow-600'
                    : 'text-red-500'"
              >
                {{ aluno.frequencia }}%
              </span>
              <p class="text-xs text-gray-400">{{ aluno.presencas }}/{{ aulasRealizadas }}</p>
            </div>
          </li>
        </ul>

        <!-- Alunos inativos -->
        <div v-if="inativos.length > 0" class="px-6 py-3 border-t border-gray-100">
          <p class="text-xs text-gray-400">
            + {{ inativos.length }} aluno(s) inativo(s) não exibido(s) no ranking
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { supabase } from '~/utils/supabase'

definePageMeta({ middleware: 'auth' })

const { user } = useAuth()
const { metaFrequencia, carregarConfig } = useConfigSistema()


const loading = ref(true)
const turma = ref(null)
const nomeProfessor = ref('—')
const todosAlunos = ref([])
const todasPresencas = ref([])
const totalAulas = ref(0)
const proximaAula = ref(null)
const todasJustificativas = ref([])

onMounted(async () => {
  const alunoId = user.value?.id
  if (!alunoId) { loading.value = false; return }

  // Busca vínculo + turma

  const { data: vinculo } = await supabase
    .from('turma_aluno')
    .select('turma_id, turma(id, nome, status, meta_frequencia, professor_id, sala)')
    // adicione aqui qualquer campo extra que precisar ↑
    .eq('aluno_id', alunoId)
    .single()

  if (!vinculo) { loading.value = false; return }
  turma.value = vinculo.turma

  const turmaId = turma.value.id
  const professorId = turma.value.professor_id
  
  const [
    { data: professorData },
    { data: vinculosData },
    { data: aulasData },
  ] = await Promise.all([
    supabase.from('usuarios').select('nome').eq('id', professorId).single(),
    supabase.from('turma_aluno').select('aluno_id, usuarios(id, nome, ativo)').eq('turma_id', turmaId),
    supabase.from('aula').select('id, data, status').eq('turma_id', turmaId).order('data', { ascending: true }),
  ])

  nomeProfessor.value = professorData?.nome ?? '—'

  const alunosIds = (vinculosData || []).map(v => v.aluno_id)
  todosAlunos.value = (vinculosData || []).map(v => ({
    id: v.aluno_id,
    nome: v.usuarios?.nome ?? '',
    ativo: v.usuarios?.ativo ?? true,
  }))

  const aulasRealizadasIds = (aulasData || [])
    .filter(a => a.status === 'REALIZADA')
    .map(a => a.id)

  totalAulas.value = aulasRealizadasIds.length

  const hoje = new Date().toISOString().split('T')[0]
  proximaAula.value = (aulasData || [])
    .filter(a => a.status === 'AGENDADA' && a.data >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data))[0] ?? null

  if (alunosIds.length > 0 && aulasRealizadasIds.length > 0) {
  const [{ data: presencasData }, { data: justData }] = await Promise.all([
    supabase
      .from('presenca')
      .select('aluno_id, aula_id')
      .in('aluno_id', alunosIds)
      .in('aula_id', aulasRealizadasIds),
    supabase
      .from('justificativa_falta')
      .select('aluno_id, aula_id, status')
      .in('aluno_id', alunosIds)
      .in('aula_id', aulasRealizadasIds)
      .eq('status', 'ACEITA'),   // só as aceitas
  ])

  todasPresencas.value = presencasData || []
  todasJustificativas.value = justData || []
}

  loading.value = false
})

// ── Computeds ────────────────────────────────────────────────────

const aulasRealizadas = computed(() => totalAulas.value)

const totalAlunos = computed(() =>
  todosAlunos.value.filter(a => a.ativo).length
)

const inativos = computed(() =>
  todosAlunos.value.filter(a => !a.ativo)
)

// Calcula frequência de cada aluno ativo
const rankingAtivos = computed(() => {
  const meuId = user.value?.id

  const lista = todosAlunos.value
    .filter(a => a.ativo)
    .map((aluno) => {
      const presencas = todasPresencas.value
        .filter(p => p.aluno_id === aluno.id).length

      // Justificativas aceitas que não têm presença já registrada
      const justAceitas = todasJustificativas.value
        .filter(j =>
          j.aluno_id === aluno.id &&
          !todasPresencas.value.some(p => p.aluno_id === aluno.id && p.aula_id === j.aula_id)
        ).length

      const totalValidas = presencas + justAceitas

      const frequencia = aulasRealizadas.value > 0
        ? Math.round((totalValidas / aulasRealizadas.value) * 100)
        : 0

      return {
        id: aluno.id,
        isVoce: aluno.id === meuId,
        presencas: totalValidas,   // mostra o total válido (presença + just. aceita)
        frequencia,
      }
    })
    .sort((a, b) => b.frequencia - a.frequencia)

  let contador = 1
  return lista.map(aluno => ({
    ...aluno,
    nomeAnonimo: aluno.isVoce ? 'Você' : `Colega ${contador++}`,
  }))
})

const minhaFrequencia = computed(() => {
  const eu = rankingAtivos.value.find(a => a.isVoce)
  return eu?.frequencia ?? 0
})

const minhaPosicao = computed(() => {
  const pos = rankingAtivos.value.findIndex(a => a.isVoce) + 1
  const total = rankingAtivos.value.length
  const freq = minhaFrequencia.value
  const meta = turma.value?.meta_frequencia ?? 75

  let emoji = '📊'
  if (pos === 1) emoji = '🥇'
  else if (pos === 2) emoji = '🥈'
  else if (pos === 3) emoji = '🥉'

  let cor = 'green'
  let mensagem = 'Ótimo trabalho! Continue assim.'

  if (freq < meta) {
    cor = 'red'
    mensagem = 'Sua frequência está abaixo da meta. Tente não faltar!'
  } else if (pos > Math.ceil(total / 2)) {
    cor = 'yellow'
    mensagem = 'Você está na metade inferior da turma. Dá pra melhorar!'
  }

  return { posicao: pos, emoji, cor, mensagem }
})

// ── Formatação ───────────────────────────────────────────────────

function formatarDataCurta(dataStr) {
  const d = new Date(dataStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
}
</script>