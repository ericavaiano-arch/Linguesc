<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-red-600">🔄 Reset Semestral</h1>
      <p class="text-gray-500 mt-2">
        Encerre o semestre atual: inativa usuários, finaliza turmas e zera a gamificação de todos.
      </p>
      <div class="w-20 h-1 bg-red-500 mt-4 rounded"></div>
    </div>

    <!-- Preview -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Usuários que serão inativados</p>
        <div v-if="loadingPreview" class="h-8 w-16 bg-gray-100 rounded animate-pulse"></div>
        <p v-else class="text-3xl font-bold text-red-500">{{ preview.usuarios }}</p>
        <p class="text-xs text-gray-400 mt-1">admins ficam ativos</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Turmas que serão finalizadas</p>
        <div v-if="loadingPreview" class="h-8 w-16 bg-gray-100 rounded animate-pulse"></div>
        <p v-else class="text-3xl font-bold text-orange-500">{{ preview.turmas }}</p>
        <p class="text-xs text-gray-400 mt-1">status = ATIVA agora</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Usuários com gamificação zerável</p>
        <div v-if="loadingPreview" class="h-8 w-16 bg-gray-100 rounded animate-pulse"></div>
        <p v-else class="text-3xl font-bold text-blue-500">{{ preview.comGamificacao }}</p>
        <p class="text-xs text-gray-400 mt-1">estrelas &gt; 0 ou nível &gt; 0</p>
      </div>
    </div>

    <!-- O que será feito -->
    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8">
      <h2 class="font-semibold text-gray-700 mb-4">O que o reset faz:</h2>
      <ul class="space-y-3">
        <li class="flex items-start gap-3">
          <span class="mt-0.5 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
          <div>
            <p class="text-sm font-medium text-gray-700">Inativar usuários</p>
            <p class="text-xs text-gray-400">Todos os alunos e professores ficam inativos. Admins permanecem ativos.</p>
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span class="mt-0.5 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
          <div>
            <p class="text-sm font-medium text-gray-700">Finalizar turmas</p>
            <p class="text-xs text-gray-400">Todas as turmas com status ATIVA mudam para FINALIZADA.</p>
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span class="mt-0.5 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
          <div>
            <p class="text-sm font-medium text-gray-700">Zerar gamificação</p>
            <p class="text-xs text-gray-400">
              Para todos os usuários: estrelas → 0, nível de perfil → 0, bônus de sequência → false,
              último bônus de login → null, bônus avatar → false, bônus perfil → false,
              termo de aceite → false, interesses/motivação/curso/avatar → null.
            </p>
          </div>
        </li>
      </ul>
    </div>

    <!-- Aviso -->
    <div class="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 flex gap-3">
      <span class="text-2xl flex-shrink-0">⚠️</span>
      <div>
        <p class="font-semibold text-red-700 mb-1">Ação irreversível</p>
        <p class="text-sm text-red-600">
          Esta operação não pode ser desfeita. Usuários inativados precisarão ser reativados manualmente.
          Gamificação zerará para todos sem exceção.
        </p>
      </div>
    </div>

    <!-- Confirmação e execução -->
    <div v-if="!executado" class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <h2 class="font-semibold text-gray-700 mb-4">Confirmar reset</h2>

      <div v-if="!confirmando">
        <button
          @click="confirmando = true"
          :disabled="loadingPreview"
          class="bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition active:scale-95"
        >
          🔄 Iniciar Reset Semestral
        </button>
      </div>

      <div v-else class="space-y-4">
        <p class="text-sm text-gray-600">
          Digite <strong class="text-red-600">RESET</strong> para confirmar:
        </p>
        <input
          v-model="confirmacaoTexto"
          type="text"
          placeholder="RESET"
          class="border-2 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none transition w-48"
          :class="confirmacaoTexto === 'RESET' ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-gray-300 focus:ring-gray-300'"
          @keyup.enter="executar"
        />
        <div class="flex gap-3">
          <button
            @click="confirmando = false; confirmacaoTexto = ''"
            class="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            @click="executar"
            :disabled="confirmacaoTexto !== 'RESET' || executando"
            class="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white text-sm font-semibold transition flex items-center gap-2"
          >
            <div v-if="executando" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ executando ? 'Executando...' : '🔄 Confirmar e Executar' }}
          </button>
        </div>

        <!-- Progresso -->
        <div v-if="executando" class="space-y-2 mt-4">
          <div
            v-for="passo in passos"
            :key="passo.key"
            class="flex items-center gap-3 text-sm"
            :class="{
              'text-green-600': passo.status === 'done',
              'text-blue-600': passo.status === 'running',
              'text-gray-400': passo.status === 'pending',
              'text-red-600': passo.status === 'error',
            }"
          >
            <span class="w-5 text-center flex-shrink-0">
              <span v-if="passo.status === 'done'">✅</span>
              <span v-else-if="passo.status === 'running'" class="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
              <span v-else-if="passo.status === 'error'">❌</span>
              <span v-else>○</span>
            </span>
            {{ passo.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- Sucesso -->
    <div v-if="executado" class="bg-green-50 border border-green-300 rounded-2xl p-8 text-center">
      <p class="text-5xl mb-4">✅</p>
      <h2 class="text-xl font-semibold text-green-700 mb-2">Reset concluído com sucesso!</h2>
      <p class="text-sm text-gray-500 mb-6">O semestre foi encerrado. Usuários, turmas e gamificação foram atualizados.</p>
      <button
        @click="resetarTudo"
        class="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition"
      >
        Recarregar preview
      </button>
    </div>

  </div>
</template>

<script setup>
import { supabase } from '~/utils/supabase'

definePageMeta({ middleware: 'admin' })

const { $toast } = useNuxtApp()

const loadingPreview = ref(true)
const preview = ref({ usuarios: 0, turmas: 0, comGamificacao: 0 })
const confirmando = ref(false)
const confirmacaoTexto = ref('')
const executando = ref(false)
const executado = ref(false)

const passos = ref([
  { key: 'usuarios', label: 'Inativando usuários (exceto admins)...', status: 'pending' },
  { key: 'turmas', label: 'Finalizando turmas ativas...', status: 'pending' },
  { key: 'gamificacao', label: 'Zerando gamificação...', status: 'pending' },
])

async function carregarPreview() {
  loadingPreview.value = true

  const [{ count: countNaoAdmin }, { count: countTurmas }, { count: countGam }] = await Promise.all([
    // Usuários que NÃO são admin e estão ativos
    supabase
      .from('usuarios')
      .select('id', { count: 'exact', head: true })
      .eq('ativo', true)
      .not('id', 'in',
        `(SELECT usuario_id FROM usuario_papel WHERE papel = 'ADMIN' AND ativo = true)`
      ),
    supabase
      .from('turma')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'ATIVA'),
    supabase
      .from('usuarios')
      .select('id', { count: 'exact', head: true })
      .or('estrelas.gt.0,nivel_perfil.gt.0'),
  ])

  preview.value = {
    usuarios: countNaoAdmin ?? 0,
    turmas: countTurmas ?? 0,
    comGamificacao: countGam ?? 0,
  }
  loadingPreview.value = false
}

async function executar() {
  if (confirmacaoTexto.value !== 'RESET') return
  executando.value = true

  passos.value.forEach(p => { p.status = 'pending' })

  try {
    const { data: { session } } = await supabase.auth.getSession()

    passos.value[0].status = 'running'
    const res = await fetch('/api/reset-semestral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token ?? ''}`,
      },
    })
    const resultado = await res.json()

    if (!res.ok || !resultado.success) {
      const stepIdx = resultado.step === 'usuarios' ? 0 : resultado.step === 'turmas' ? 1 : 2
      passos.value[stepIdx].status = 'error'
      $toast.error(resultado.error ?? 'Erro durante o reset.')
      return
    }

    passos.value.forEach(p => { p.status = 'done' })
    executado.value = true
    $toast.success('Reset semestral concluído!')
  } catch (err) {
    console.error(err)
    $toast.error('Erro inesperado durante o reset.')
  } finally {
    executando.value = false
  }
}

function resetarTudo() {
  executado.value = false
  confirmando.value = false
  confirmacaoTexto.value = ''
  passos.value.forEach(p => { p.status = 'pending' })
  carregarPreview()
}

onMounted(carregarPreview)
</script>
