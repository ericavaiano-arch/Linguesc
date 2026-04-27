<template>
  <div class="min-h-screen bg-gray-100 p-4 md:p-8">

    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-800">Editar perfil</h1>
      <p class="text-gray-500 text-sm mt-1">Atualize suas informações e preferências de acesso.</p>
      <div class="w-8 h-0.5 bg-green-700 mt-3 rounded-full"></div>
    </div>

    <!-- Informações pessoais -->
    <div class="max-w-2xl mx-auto bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
      <p class="text-xs font-medium tracking-widest uppercase text-gray-400 mb-5">Informações pessoais</p>

      <div v-if="loading" class="flex items-center gap-3 text-green-700 py-4">
        <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm">Carregando...</span>
      </div>

      <form v-else @submit.prevent="salvarPerfil" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">Nome</label>
          <input
            v-model="nome"
            type="text"
            placeholder="Seu nome completo"
            class="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-700 transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">
            E-mail
            <span class="ml-2 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">não editável</span>
          </label>
          <input
            v-model="email"
            type="email"
            disabled
            class="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
          />
          <p class="text-xs text-gray-400 mt-1.5">O e-mail não pode ser alterado por aqui.</p>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <Transition name="fade">
            <span v-if="perfilSalvo" class="flex items-center gap-1.5 text-sm text-green-700">
              <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="#EAF3DE"/>
                <path d="M5 8L7 10L11 6" stroke="#3B6D11" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Salvo com sucesso
            </span>
          </Transition>
          <button
            type="submit"
            :disabled="salvando || !nome"
            class="h-9 px-4 bg-green-700 hover:bg-green-800 disabled:bg-green-300 text-white text-sm font-medium rounded-lg transition active:scale-95 flex items-center gap-2"
          >
            <div v-if="salvando" class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
            {{ salvando ? 'Salvando...' : 'Salvar alterações' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Segurança -->
    <div class="max-w-2xl mx-auto bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <p class="text-xs font-medium tracking-widest uppercase text-gray-400 mb-5">Alterar Senha</p>

      <form @submit.prevent="alterarSenhaUsuario" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">Senha atual</label>
          <input
            v-model="senhaAtual"
            type="password"
            placeholder="••••••••"
            class="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-700 transition"
          />
        </div>

        <hr class="border-gray-100" />

        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">Nova senha</label>
          <input
            v-model="novaSenha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            class="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-700 transition"
          />
          <!-- Barra de força -->
          <div class="h-0.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :style="{ width: forcaSenhaLargura, background: forcaSenhaCor }"
            ></div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">Confirmar nova senha</label>
          <input
            v-model="confirmarSenha"
            type="password"
            placeholder="Repita a nova senha"
            :class="[
              'w-full h-10 rounded-lg border px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 transition',
              senhasDivergem
                ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
                : 'border-gray-200 focus:ring-green-600/20 focus:border-green-700'
            ]"
          />
          <p v-if="senhasDivergem" class="text-xs text-red-500 mt-1.5">As senhas não coincidem.</p>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <Transition name="fade">
            <span v-if="senhaAlterada" class="flex items-center gap-1.5 text-sm text-green-700">
              <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="#EAF3DE"/>
                <path d="M5 8L7 10L11 6" stroke="#3B6D11" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Senha alterada
            </span>
          </Transition>
          <span v-if="erroSenha" class="text-sm text-red-500">{{ erroSenha }}</span>
          <button
            type="submit"
            :disabled="alterandoSenha || !podeSalvarSenha"
            class="h-9 px-4 bg-green-700 hover:bg-green-800 disabled:bg-green-300 text-white text-sm font-medium rounded-lg transition active:scale-95 flex items-center gap-2"
          >
            <div v-if="alterandoSenha" class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
            {{ alterandoSenha ? 'Alterando...' : 'Alterar senha' }}
          </button>
        </div>
      </form>
    </div>

  </div>
</template>

<script setup>
import { supabase } from '~/utils/supabase'

definePageMeta({ middleware: 'auth' })

const { user, reidratar, alterarSenha } = useAuth()
const { $toast } = useNuxtApp()

// Perfil
const loading = ref(true)
const salvando = ref(false)
const perfilSalvo = ref(false)
const nome = ref('')
const email = ref('')

// Senha
const senhaAtual = ref('')
const novaSenha = ref('')
const confirmarSenha = ref('')
const alterandoSenha = ref(false)
const senhaAlterada = ref(false)
const erroSenha = ref('')

onMounted(async () => {
  await reidratar()
  if (!user.value) return

  const { data, error } = await supabase
    .from('usuarios')
    .select('nome')
    .eq('id', user.value.id)
    .single()

  if (error || !data) {
    $toast.error('Erro ao carregar dados do perfil.')
    return
  }

  nome.value = data.nome
  email.value = user.value.email
  loading.value = false
})

async function salvarPerfil() {
  if (!nome.value) return
  salvando.value = true

  try {
    const { error } = await supabase
      .from('usuarios')
      .update({ nome: nome.value.trim() })
      .eq('id', user.value.id)

    if (error) throw error

    user.value = { ...user.value, nome: nome.value.trim() }
    perfilSalvo.value = true
    setTimeout(() => perfilSalvo.value = false, 3000)
  } catch {
    $toast.error('Erro ao atualizar perfil.')
  } finally {
    salvando.value = false
  }
}

// Senha
const senhasDivergem = computed(() =>
  !!confirmarSenha.value && novaSenha.value !== confirmarSenha.value
)

const podeSalvarSenha = computed(() =>
  !!senhaAtual.value && !!novaSenha.value && !!confirmarSenha.value &&
  !senhasDivergem.value && novaSenha.value.length >= 8
)

const forcaSenha = computed(() => {
  if (!novaSenha.value) return 0
  let f = 0
  if (novaSenha.value.length >= 8) f++
  if (novaSenha.value.length >= 10) f++
  if (/[A-Z]/.test(novaSenha.value) && /[0-9]/.test(novaSenha.value)) f++
  return f
})

const forcaSenhaLargura = computed(() => {
  if (!novaSenha.value) return '0%'
  return ['33%', '66%', '100%'][forcaSenha.value - 1] || '10%'
})

const forcaSenhaCor = computed(() =>
  ['#E24B4A', '#EF9F27', '#639922'][forcaSenha.value - 1] || '#E24B4A'
)

async function alterarSenhaUsuario() {
  if (!podeSalvarSenha.value) return
  alterandoSenha.value = true
  erroSenha.value = ''

  try {
    const erro = await alterarSenha(senhaAtual.value, novaSenha.value)
    if (erro) {
      erroSenha.value = erro
      return
    }

    senhaAtual.value = ''
    novaSenha.value = ''
    confirmarSenha.value = ''
    senhaAlterada.value = true
    setTimeout(() => senhaAlterada.value = false, 3000)
  } finally {
    alterandoSenha.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>