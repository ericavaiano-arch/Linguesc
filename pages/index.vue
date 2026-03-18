<template>
  <div class="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-white flex items-center justify-center px-4 py-10">

    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

      <div class="text-center mb-8">
        <div class="text-4xl mb-3">🌎</div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800 leading-snug">
          Plataforma de acompanhamento e engajamento no aprendizado de línguas
        </h1>
        <p class="text-sm text-gray-500 mt-2">Faça login para continuar</p>
      </div>

      <form @submit.prevent="verificarUsuario" class="space-y-5">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input
            v-model="email"
            id="email"
            type="email"
            autocomplete="email"
            placeholder="seuemail@exemplo.com"
            required
            class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <input
            v-model="senha"
            id="password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            required
            class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
        </div>

        <button
          :disabled="!email || !senha || carregando"
          class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
          type="submit"
        >
          <div v-if="carregando" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <div class="mt-8 text-center text-sm">
        <p class="text-gray-600">Ainda não tem cadastro?</p>
        <button @click="$router.push('/register')" class="mt-2 text-green-600 font-semibold hover:underline" type="button">
          Criar conta
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'auth' })

import { supabase } from '@/utils/supabase'

const { $toast } = useNuxtApp()
const { login } = useAuth()

const email = ref('')
const senha = ref('')
const carregando = ref(false)

async function verificarUsuario() {
  if (!email.value || !senha.value) {
    $toast.warning('Email e senha obrigatórios.')
    return
  }

  carregando.value = true

  try {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, tipoUsuario')
      .eq('email', email.value)
      .eq('senha', senha.value)
      .eq('ativo', true)
      .single()

    if (error || !usuario) {
      $toast.error('Email ou senha incorretos.')
      return
    }

    // Salva sessão via useAuth (useState + cookie)
    login({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario
    })

    navigateTo('/hub')

  } catch (err) {
    console.error(err)
    $toast.error('Erro ao conectar com o servidor.')
  } finally {
    carregando.value = false
  }
}
</script>