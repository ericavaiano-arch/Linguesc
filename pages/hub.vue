<template>
  <div class="min-h-screen bg-gray-50">
    <ModalTermo v-if="mostrarTermo" @aceitar="handleAceitarTermo" />

    <!-- ── ALUNO ─────────────────────────────────────────────── -->
    <div v-if="isAluno" class="max-w-4xl mx-auto px-4 py-8 space-y-8">

      <!-- Saudação -->
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ saudacao }}, {{ primeiroNome }} 👋</h1>
          <p class="text-gray-500 text-sm mt-1">{{ dataHoje }}</p>
        </div>
        <NuxtLink :to="`/profile/${user?.id}`"
          class="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-3 py-2 hover:border-green-400 transition">
          <span v-if="user?.avatarUrl && !user.avatarUrl.includes('/')"
            class="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex-shrink-0 flex items-center justify-center text-lg leading-none">
            {{ user.avatarUrl }}
          </span>
          <img v-else-if="user?.avatarUrl" :src="user.avatarUrl"
            class="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          <div v-else class="w-8 h-8 rounded-full bg-green-500 text-white flex-shrink-0 flex items-center justify-center font-bold text-sm">
            {{ primeiroNome?.[0] }}
          </div>
          <div class="text-left">
            <p class="text-xs font-semibold text-gray-800 leading-none">{{ user?.nome }}</p>
            <p class="text-[11px] text-gray-400 mt-0.5">Ver perfil</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
          <p class="text-2xl font-bold text-green-600">{{ user?.estrelas ?? 0 }} <span class="text-lg">⭐</span></p>
          <p class="text-xs text-gray-400 mt-1 font-medium">Estrelas</p>
        </div>
        <div class="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
          <p class="text-2xl font-bold" :class="corFrequencia">
            {{ frequenciaAluno ?? '—' }}<span class="text-base font-medium text-gray-400" v-if="frequenciaAluno !== null">%</span>
          </p>
          <p class="text-xs text-gray-400 mt-1 font-medium">Frequência</p>
        </div>
        <div class="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
          <p class="text-2xl font-bold text-gray-700">{{ nivelLabel }}</p>
          <p class="text-xs text-gray-400 mt-1 font-medium">Nível perfil</p>
        </div>
      </div>

      <!-- Teaser de Recompensas -->
      <div @click="irPara('/aluno/gamificacao')"
        class="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-4 cursor-pointer hover:border-amber-400 hover:shadow-md transition group">
        <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">🏆</div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold text-amber-500 uppercase tracking-wide mb-0.5">Novidade deste semestre</p>
          <p class="text-sm font-bold text-amber-900">Gamificação no Linguesc!</p>
          <p class="text-xs text-amber-600 mt-0.5">Você tem <strong>{{ user?.estrelas ?? 0 }} ⭐</strong>! Acumule mais e troque por prêmios.</p>
        </div>
        <span class="text-amber-500 text-sm font-semibold flex-shrink-0 group-hover:translate-x-0.5 transition-transform">Ver mais →</span>
      </div>

      <!-- Alerta de missão pendente -->
      <div v-if="missaoPendente" @click="irPara('/aluno/turmas?destino=minhas-atividades')"
        class="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 flex items-center gap-3 cursor-pointer hover:border-amber-400 transition">
        <span class="text-xl">📬</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-amber-800">Missão da semana disponível</p>
          <p class="text-xs text-amber-600 truncate mt-0.5">{{ missaoPendente.titulo }}</p>
        </div>
        <span class="text-amber-500 text-sm font-semibold flex-shrink-0">Responder →</span>
      </div>

      <!-- Próxima aula -->
      <div v-if="proximaAulaAluno" class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-green-50 flex flex-col items-center justify-center flex-shrink-0 border border-green-100">
          <span class="text-[11px] font-bold text-green-600 uppercase">{{ mesAbrev(proximaAulaAluno.data) }}</span>
          <span class="text-xl font-extrabold text-green-700 leading-none">{{ diaNum(proximaAulaAluno.data) }}</span>
        </div>
        <div class="min-w-0">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wide">Próxima aula</p>
          <p class="text-sm font-semibold text-gray-800 mt-0.5">{{ turmaNomeAluno }}</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ diaSemana(proximaAulaAluno.data) }}, {{ formatarData(proximaAulaAluno.data) }}</p>
        </div>
      </div>
      <div v-else-if="!loadingAluno" class="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-4 text-center text-sm text-gray-400">
        Nenhuma aula agendada no momento
      </div>

      <!-- Ações rápidas -->
      <div>
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Acesso rápido</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button v-for="link in linksAluno" :key="link.href" @click="irPara(link.href)"
            class="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:border-green-400 hover:shadow-md transition shadow-sm group">
            <span class="text-2xl block mb-2">{{ link.emoji }}</span>
            <p class="text-xs font-semibold text-gray-700 group-hover:text-green-700 transition">{{ link.label }}</p>
          </button>
        </div>
      </div>
    </div>

    <!-- ── PROFESSOR ──────────────────────────────────────────── -->
    <div v-else-if="isProfessor" class="max-w-4xl mx-auto px-4 py-8 space-y-8">

      <!-- Saudação -->
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ saudacao }}, Prof. {{ primeiroNome }} 👋</h1>
          <p class="text-gray-500 text-sm mt-1">{{ dataHoje }}</p>
        </div>
        <NuxtLink :to="`/profile/${user?.id}`"
          class="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-3 py-2 hover:border-blue-400 transition">
          <span v-if="user?.avatarUrl && !user.avatarUrl.includes('/')"
            class="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex-shrink-0 flex items-center justify-center text-lg leading-none">
            {{ user.avatarUrl }}
          </span>
          <img v-else-if="user?.avatarUrl" :src="user.avatarUrl"
            class="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          <div v-else class="w-8 h-8 rounded-full bg-green-500 text-white flex-shrink-0 flex items-center justify-center font-bold text-sm">
            {{ primeiroNome?.[0] }}
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-800 leading-none">{{ user?.nome }}</p>
            <p class="text-[11px] text-gray-400 mt-0.5">Ver perfil</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
          <p class="text-2xl font-bold text-green-600">{{ user?.estrelas ?? 0 }} <span class="text-lg">⭐</span></p>
          <p class="text-xs text-gray-400 mt-1 font-medium">Estrelas</p>
        </div>
        <div class="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
          <p class="text-2xl font-bold text-blue-600">{{ statsProf.turmasAtivas }}</p>
          <p class="text-xs text-gray-400 mt-1 font-medium">Turmas ativas</p>
        </div>
        <div @click="statsProf.freqBaixa > 0 && irPara('/dashboard')"
          class="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm"
          :class="statsProf.freqBaixa > 0 ? 'cursor-pointer hover:border-amber-300 border-amber-100 bg-amber-50' : ''">
          <p class="text-2xl font-bold" :class="statsProf.freqBaixa > 0 ? 'text-amber-600' : 'text-green-600'">
            {{ statsProf.freqBaixa }}
          </p>
          <p class="text-xs mt-1 font-medium" :class="statsProf.freqBaixa > 0 ? 'text-amber-500' : 'text-gray-400'">
            Freq. abaixo da média
          </p>
        </div>
      </div>

      <!-- Alerta de alunos com freq baixa -->
      <div v-if="statsProf.freqBaixa > 0" @click="irPara('/dashboard')"
        class="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 flex items-center gap-3 cursor-pointer hover:border-amber-400 transition">
        <span class="text-xl">⚠️</span>
        <div class="flex-1">
          <p class="text-sm font-semibold text-amber-800">
            {{ statsProf.freqBaixa }} aluno(s) com presença abaixo da média
          </p>
          <p class="text-xs text-amber-600 mt-0.5">Verifique o dashboard para detalhes</p>
        </div>
        <span class="text-amber-500 text-sm font-semibold flex-shrink-0">Ver →</span>
      </div>

      <!-- Próxima aula -->
      <div v-if="proximaAulaProf" class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-blue-50 flex flex-col items-center justify-center flex-shrink-0 border border-blue-100">
          <span class="text-[11px] font-bold text-blue-600 uppercase">{{ mesAbrev(proximaAulaProf.data) }}</span>
          <span class="text-xl font-extrabold text-blue-700 leading-none">{{ diaNum(proximaAulaProf.data) }}</span>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wide">Próxima aula</p>
          <p class="text-sm font-semibold text-gray-800 mt-0.5">{{ proximaAulaProf.turmaNome }}</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ diaSemana(proximaAulaProf.data) }}, {{ formatarData(proximaAulaProf.data) }}</p>
        </div>
        <button @click.stop="irPara(`/chamada-manual/${proximaAulaProf.turma_id}`)"
          class="flex-shrink-0 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition">
          Fazer chamada
        </button>
      </div>
      <div v-else-if="!loadingProf" class="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-4 text-center text-sm text-gray-400">
        Nenhuma aula agendada
      </div>

      <!-- Turmas ativas -->
      <div v-if="turmasAtivasProf.length > 0">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Suas turmas</p>
        <div class="space-y-2">
          <div v-for="turma in turmasAtivasProf" :key="turma.id"
            class="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 flex items-center gap-4 shadow-sm">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-gray-800">{{ turma.nome }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ turma.totalAlunos }} aluno(s)</p>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <button @click="irPara('/turmas')"
                class="text-xs text-blue-600 border border-blue-200 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition font-medium">
                Ver turma
              </button>
              <button v-if="turma.proximaAulaId" @click="irPara(`/chamada-manual/${turma.id}`)"
                class="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg transition font-medium">
                Chamada
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Ações rápidas -->
      <div>
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Acesso rápido</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button v-for="link in linksProf" :key="link.href" @click="irPara(link.href)"
            class="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:border-blue-400 hover:shadow-md transition shadow-sm group">
            <span class="text-2xl block mb-2">{{ link.emoji }}</span>
            <p class="text-xs font-semibold text-gray-700 group-hover:text-blue-700 transition">{{ link.label }}</p>
          </button>
        </div>
      </div>
    </div>

    <!-- ── ADMIN ──────────────────────────────────────────────── -->
    <div v-else-if="isAdmin" class="max-w-4xl mx-auto px-4 py-8 space-y-8">

      <!-- Saudação -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ saudacao }}, {{ primeiroNome }} 👋</h1>
        <p class="text-gray-500 text-sm mt-1">{{ dataHoje }} · Painel administrativo</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
          <p class="text-2xl font-bold text-purple-600">{{ statsAdmin.turmas }}</p>
          <p class="text-xs text-gray-400 mt-1 font-medium">Turmas ativas</p>
        </div>
        <div class="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
          <p class="text-2xl font-bold text-blue-600">{{ statsAdmin.professores }}</p>
          <p class="text-xs text-gray-400 mt-1 font-medium">Professores ativos</p>
        </div>
        <div class="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
          <p class="text-2xl font-bold text-green-600">{{ statsAdmin.alunos }}</p>
          <p class="text-xs text-gray-400 mt-1 font-medium">Alunos matriculados</p>
        </div>
        <div @click="irPara('/justificativas')"
          class="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm cursor-pointer hover:border-amber-300 transition"
          :class="pendentes > 0 ? 'border-amber-200 bg-amber-50' : ''">
          <p class="text-2xl font-bold" :class="pendentes > 0 ? 'text-amber-600' : 'text-gray-700'">{{ pendentes }}</p>
          <p class="text-xs mt-1 font-medium" :class="pendentes > 0 ? 'text-amber-500' : 'text-gray-400'">
            Justificativas pendentes
          </p>
        </div>
      </div>

      <!-- Ações rápidas -->
      <div>
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Módulos</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button v-for="link in linksAdmin" :key="link.href" @click="irPara(link.href)"
            class="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:border-purple-400 hover:shadow-md transition shadow-sm group">
            <span class="text-2xl block mb-3">{{ link.emoji }}</span>
            <p class="text-sm font-semibold text-gray-800 group-hover:text-purple-700 transition">{{ link.label }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ link.desc }}</p>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

import { supabase } from '~/utils/supabase'

const router = useRouter()
const { user, isAluno, isProfessor, isAdmin, aceitarTermoConsciencia } = useAuth()
const { count: pendentes, carregar: carregarPendentes } = useJustificativasPendentes()
const { carregar: carregarNotificacoes } = useNotificacoes()
const { metaFrequencia, carregarConfig } = useConfigSistema()

function irPara(rota) { router.push(rota) }

const mostrarTermo = computed(() => !!user.value && user.value.termoAceite !== true)
async function handleAceitarTermo() { await aceitarTermoConsciencia() }

// ── Saudação ───────────────────────────────────────────────────────────────
const primeiroNome = computed(() => user.value?.nome?.split(' ')[0] ?? '')

const saudacao = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
})

const dataHoje = computed(() =>
  new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(/^\w/, c => c.toUpperCase())
)

// ── Helpers de data ────────────────────────────────────────────────────────
function formatarData(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}
function mesAbrev(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
}
function diaNum(iso) {
  return new Date(iso + 'T12:00:00').getDate()
}
function diaSemana(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })
    .replace(/^\w/, c => c.toUpperCase())
}

// ── ALUNO ──────────────────────────────────────────────────────────────────
const loadingAluno     = ref(true)
const frequenciaAluno  = ref(null)
const turmaNomeAluno   = ref('')
const proximaAulaAluno = ref(null)
const missaoPendente   = ref(null)

const nivelLabel = computed(() => {
  const n = user.value?.nivelPerfil ?? 0
  return n === 0 ? '—' : n === 1 ? 'Nível 1' : 'Nível 2'
})

const corFrequencia = computed(() => {
  const f = frequenciaAluno.value
  if (f === null) return 'text-gray-400'
  if (f >= 75) return 'text-green-600'
  if (f >= 60) return 'text-yellow-600'
  return 'text-red-500'
})

const linksAluno = [
  { emoji: '🏆', label: 'Recompensas',   href: '/aluno/gamificacao' },
  { emoji: '📅', label: 'Presença',       href: '/aluno/turmas?destino=minha-presenca' },
  { emoji: '📚', label: 'Atividades',     href: '/aluno/turmas?destino=minhas-atividades' },
  { emoji: '👥', label: 'Minha turma',    href: '/aluno/turmas?destino=minha-turma' },
]

async function carregarDadosAluno() {
  if (!user.value?.id) return
  const hoje = new Date().toISOString().slice(0, 10)

  const { data: matricula } = await supabase
    .from('turma_aluno')
    .select('turma_id, turma!inner(id, nome, status)')
    .eq('aluno_id', user.value.id)
    .eq('turma.status', 'ATIVA')
    .maybeSingle()

  if (!matricula) { loadingAluno.value = false; return }

  turmaNomeAluno.value = matricula.turma.nome

  const { data: aulas } = await supabase
    .from('aula')
    .select('id, data, status')
    .eq('turma_id', matricula.turma_id)
    .neq('status', 'CANCELADA')
    .order('data', { ascending: true })

  const aulasRealizadas = (aulas ?? []).filter(a => a.status === 'REALIZADA')

  if (aulasRealizadas.length > 0) {
    const { count } = await supabase
      .from('presenca')
      .select('id', { count: 'exact', head: true })
      .eq('aluno_id', user.value.id)
      .in('aula_id', aulasRealizadas.map(a => a.id))

    frequenciaAluno.value = Math.round(((count ?? 0) / aulasRealizadas.length) * 100)
  }

  proximaAulaAluno.value = (aulas ?? []).find(a => a.data >= hoje && a.status === 'AGENDADA') ?? null

  // Missão pendente
  const { data: missao } = await supabase
    .from('atividade')
    .select('id, titulo')
    .eq('turma_id', matricula.turma_id)
    .eq('tipo_missao', 'MISSAO')
    .eq('status', 'ATIVA')
    .maybeSingle()

  if (missao) {
    const { data: resposta } = await supabase
      .from('atividade_aluno')
      .select('id, respondido_em')
      .eq('aluno_id', user.value.id)
      .eq('atividade_id', missao.id)
      .maybeSingle()

    if (!resposta?.respondido_em) missaoPendente.value = missao
  }

  loadingAluno.value = false
}

// ── PROFESSOR ──────────────────────────────────────────────────────────────
const loadingProf     = ref(true)
const proximaAulaProf = ref(null)
const turmasAtivasProf = ref([])
const statsProf = reactive({ turmasAtivas: 0, freqBaixa: 0 })

const linksProf = computed(() => [
  { emoji: '🏆', label: 'Recompensas',   href: '/aluno/gamificacao' },
  { emoji: '📊', label: 'Dashboard',     href: '/dashboard' },
  { emoji: '📚', label: 'Minhas Turmas', href: '/turmas' },
  { emoji: '👤', label: 'Meu perfil',    href: `/profile/${user.value?.id}` },
])

async function carregarDadosProf() {
  if (!user.value?.id) return
  const hoje = new Date().toISOString().slice(0, 10)

  const { data: turmas } = await supabase
    .from('turma')
    .select('id, nome')
    .eq('professor_id', user.value.id)
    .eq('status', 'ATIVA')

  statsProf.turmasAtivas = turmas?.length ?? 0
  const turmaIds = (turmas ?? []).map(t => t.id)

  if (turmaIds.length === 0) { loadingProf.value = false; return }

  // Uma única query para próximas aulas — usada tanto no card do topo quanto nos cards de turma
  const { data: todasAulas } = await supabase
    .from('aula')
    .select('id, data, turma_id, status')
    .in('turma_id', turmaIds)
    .eq('status', 'AGENDADA')
    .gte('data', hoje)
    .order('data', { ascending: true })

  if (todasAulas?.[0]) {
    const turma = turmas?.find(t => t.id === todasAulas[0].turma_id)
    proximaAulaProf.value = { ...todasAulas[0], turmaNome: turma?.nome ?? '' }
  }

  const proximaPorTurma = {}
  for (const a of (todasAulas ?? [])) {
    if (!proximaPorTurma[a.turma_id]) proximaPorTurma[a.turma_id] = a.id
  }

  // Total de alunos por turma
  const { data: matriculas } = await supabase
    .from('turma_aluno')
    .select('turma_id, aluno_id')
    .in('turma_id', turmaIds)

  const alunosPorTurma = {}
  for (const m of (matriculas ?? [])) {
    alunosPorTurma[m.turma_id] = (alunosPorTurma[m.turma_id] ?? 0) + 1
  }

  turmasAtivasProf.value = (turmas ?? []).map(t => ({
    ...t,
    totalAlunos: alunosPorTurma[t.id] ?? 0,
    proximaAulaId: proximaPorTurma[t.id] ?? null,
  }))

  // Alunos com freq abaixo da meta — calculado a partir da frequência real atual
  await carregarConfig()
  const alunoIds = (matriculas ?? []).map(m => m.aluno_id)
  const aulasPorTurma = {}

  const [{ data: aulasRealizadas }, { data: presencasData }, { data: justsAceitas }] = await Promise.all([
    supabase.from('aula').select('id, turma_id').in('turma_id', turmaIds).eq('status', 'REALIZADA'),
    supabase.from('presenca').select('aluno_id, aula_id').in('aluno_id', alunoIds),
    supabase.from('justificativa_falta').select('aluno_id, aula_id').in('aluno_id', alunoIds).eq('status', 'ACEITA'),
  ])

  for (const a of (aulasRealizadas ?? [])) {
    if (!aulasPorTurma[a.turma_id]) aulasPorTurma[a.turma_id] = []
    aulasPorTurma[a.turma_id].push(a.id)
  }

  const presencaSet = new Set((presencasData ?? []).map(p => `${p.aluno_id}:${p.aula_id}`))
  const justSet = new Set(
    (justsAceitas ?? [])
      .filter(j => !presencaSet.has(`${j.aluno_id}:${j.aula_id}`))
      .map(j => `${j.aluno_id}:${j.aula_id}`)
  )

  const alunosBaixaFreq = new Set()
  for (const { aluno_id, turma_id } of (matriculas ?? [])) {
    const aulasDaTurma = aulasPorTurma[turma_id] ?? []
    if (aulasDaTurma.length === 0) continue
    let count = 0
    for (const aulaId of aulasDaTurma) {
      if (presencaSet.has(`${aluno_id}:${aulaId}`) || justSet.has(`${aluno_id}:${aulaId}`)) count++
    }
    const freq = Math.round((count / aulasDaTurma.length) * 100)
    if (freq < metaFrequencia.value) alunosBaixaFreq.add(aluno_id)
  }

  statsProf.freqBaixa = alunosBaixaFreq.size
  loadingProf.value = false
}

// ── ADMIN ──────────────────────────────────────────────────────────────────
const statsAdmin = reactive({ turmas: 0, professores: 0, alunos: 0 })

const linksAdmin = computed(() => [
  { emoji: '📊', label: 'Dashboard Global',   desc: 'Visão geral de todas as turmas', href: '/admin' },
  { emoji: '📚', label: 'Turmas',             desc: 'Gerenciar turmas e aulas',       href: '/turmas' },
  { emoji: '👥', label: 'Usuários',           desc: 'Professores e alunos',           href: '/admin/usuarios' },
  { emoji: '📝', label: 'Justificativas',     desc: pendentes.value > 0 ? `${pendentes.value} pendente(s)` : 'Em dia', href: '/justificativas' },
  { emoji: '📦', label: 'Cadastro em lote',   desc: 'Importar via CSV',               href: '/admin/cadastro-lote' },
  { emoji: '⚙️', label: 'Configurações',      desc: 'Parâmetros do sistema',          href: '/admin/configuracoes' },
])

async function carregarDadosAdmin() {
  // Turmas ativas
  const { count: turmasAtivas } = await supabase
    .from('turma').select('id', { count: 'exact', head: true }).eq('status', 'ATIVA')

  statsAdmin.turmas = turmasAtivas ?? 0

  // Professores com pelo menos uma turma ativa
  const { data: profsTurmas } = await supabase
    .from('turma').select('professor_id').eq('status', 'ATIVA')

  statsAdmin.professores = new Set((profsTurmas ?? []).map(t => t.professor_id)).size

  // Alunos matriculados em turmas ativas
  const { data: alunosTurmas } = await supabase
    .from('turma_aluno')
    .select('aluno_id, turma!inner(status)')
    .eq('turma.status', 'ATIVA')

  statsAdmin.alunos = new Set((alunosTurmas ?? []).map(t => t.aluno_id)).size
}

// ── Init ───────────────────────────────────────────────────────────────────
onMounted(async () => {
  carregarNotificacoes(user.value?.id)
  if (isAluno.value) {
    await carregarDadosAluno()
  } else if (isProfessor.value) {
    await carregarDadosProf()
  } else if (isAdmin.value) {
    carregarPendentes(user.value.id)
    await carregarDadosAdmin()
  }
})
</script>
