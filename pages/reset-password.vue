<template>
  <div class="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-white flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

      <!-- Verificando -->
      <div v-if="estado === 'verificando'" class="text-center py-8">
        <div class="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-500 text-sm">Verificando link...</p>
      </div>

      <!-- Formulário nova senha -->
      <div v-else-if="estado === 'formulario'">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Nova senha</h1>
        <p class="text-gray-500 text-sm mb-6">Digite e confirme sua nova senha abaixo.</p>
        <form @submit.prevent="redefinirSenha" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
            <input
              v-model="novaSenha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
              minlength="6"
              class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
            <input
              v-model="confirmarSenha"
              type="password"
              placeholder="Repita a nova senha"
              required
              class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>
          <button
            type="submit"
            :disabled="carregando || !novaSenha || !confirmarSenha"
            class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
          >
            <div v-if="carregando" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ carregando ? 'Salvando...' : 'Salvar nova senha' }}
          </button>
        </form>
      </div>

      <!-- Sucesso -->
      <div v-else-if="estado === 'sucesso'" class="text-center py-8">
        <div class="text-5xl mb-4">✅</div>
        <h2 class="text-xl font-bold text-gray-800 mb-2">Senha redefinida!</h2>
        <p class="text-gray-500 text-sm mb-6">Sua senha foi atualizada com sucesso.</p>
        <NuxtLink to="/" class="text-sm font-semibold text-green-600 hover:underline">
          Ir para o login →
        </NuxtLink>
      </div>

      <!-- Link inválido -->
      <div v-else-if="estado === 'invalido'" class="text-center py-8">
        <div class="text-5xl mb-4">⚠️</div>
        <h2 class="text-xl font-bold text-gray-800 mb-2">Link inválido ou expirado</h2>
        <p class="text-gray-500 text-sm mb-6">
          O link de redefinição expirou ou já foi utilizado.<br>
          Solicite um novo link na tela de login.
        </p>
        <NuxtLink to="/" class="text-sm font-semibold text-green-600 hover:underline">
          ← Voltar ao login
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'auth' })

import { supabase } from '~/utils/supabase'

const { $toast } = useNuxtApp()

const estado = ref('verificando')
const novaSenha = ref('')
const confirmarSenha = ref('')
const carregando = ref(false)

onMounted(async () => {
  const hash = typeof window !== 'undefined' ? window.location.hash : ''

  // Erro explícito no hash (link expirado/inválido enviado pelo Supabase)
  if (hash.includes('error=')) {
    estado.value = 'invalido'
    return
  }

  // Listener para o evento PASSWORD_RECOVERY (fluxo principal)
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      estado.value = 'formulario'
    }
  })

  // Fallback: verifica sessão ativa — o cliente Supabase pode já ter
  // processado o hash antes deste componente montar
  const { data: { session } } = await supabase.auth.getSession()
  if (session && estado.value === 'verificando') {
    estado.value = 'formulario'
  }

  // Fallback final: se após 8s nenhum estado mudar, o link é inválido
  const timeout = setTimeout(() => {
    if (estado.value === 'verificando') {
      estado.value = 'invalido'
    }
  }, 8000)

  onUnmounted(() => {
    subscription.unsubscribe()
    clearTimeout(timeout)
  })
})

async function redefinirSenha() {
  if (novaSenha.value !== confirmarSenha.value) {
    $toast.error('As senhas não coincidem.')
    return
  }
  if (novaSenha.value.length < 6) {
    $toast.error('A senha deve ter pelo menos 6 caracteres.')
    return
  }

  carregando.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: novaSenha.value })
    if (error) {
      $toast.error('Não foi possível redefinir a senha. Tente novamente.')
      return
    }
    await supabase.auth.signOut()
    estado.value = 'sucesso'
  } finally {
    carregando.value = false
  }
}
</script>
