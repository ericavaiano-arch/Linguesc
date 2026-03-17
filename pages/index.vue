<template>
  <div class="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-white flex items-center justify-center px-4 py-10">

    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

      <!-- Logo / Header -->
      <div class="text-center mb-8">
        <div class="text-4xl mb-3 flex justify-center">
          <img
            src="~/assets/images/logo_linguesc.png"
            alt="Linguesc"
            class="h-40"
          />
        </div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800 leading-snug">
          Plataforma de acompanhamento e engajamento no aprendizado de línguas
        </h1>
        <p class="text-sm text-gray-500 mt-2">
          Faça login para continuar
        </p>
      </div>

      <!-- Formulário -->
      <form @submit.prevent="verificarUsuario" class="space-y-5">

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            v-model="email"
            id="email"
            type="email"
            autocomplete="email"
            placeholder="seuemail@exemplo.com"
            required
            class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </div>

        <!-- Senha -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <input
            v-model="senha"
            id="password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            required
            class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </div>

        <!-- Botão -->
        <button
          :disabled="!email || !senha"
          class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition active:scale-95"
          type="submit"
        >
          Entrar
        </button>

      </form>

      <!-- Cadastro -->
      <div class="mt-8 text-center text-sm">
        <p class="text-gray-600">
          Ainda não tem cadastro?
        </p>
        <button
          @click="goToProfile"
          class="mt-2 text-green-600 font-semibold hover:underline"
          type="button"
        >
          Criar conta
        </button>
      </div>

    </div>

  </div>
</template>

<script>
import { supabase } from '@/utils/supabase'

definePageMeta({
  layout: 'auth'
})

export default {
  setup() {
    const { $toast } = useNuxtApp()
    return { toast: $toast }
  },

  data() {
    return {
      email: '',
      senha: '',
    };
  },

  methods: {
    async verificarUsuario() {
      if (!this.email || !this.senha) {
        this.toast.warning('Email e senha obrigatórios.')
        return;
      }

      try {
        const { data: usuario, error } = await supabase
          .from('usuarios')
          .select('id, nome, email, tipoUsuario, dtInclusao')
          .eq('email', this.email)
          .eq('senha', this.senha)
          .single();

        if (error || !usuario) {
          this.toast.error('Email ou senha incorretos.')
          return;
        }

        localStorage.setItem('user', JSON.stringify({
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipoUsuario: usuario.tipoUsuario
        }));

        this.$router.push('/hub');

      } catch (err) {
        console.error('Erro ao conectar com Supabase:', err);
        this.toast.error('Erro ao conectar com o servidor.')
      }
    },

    goToProfile() {
      this.$router.push('/register');
    }
  }
};
</script>