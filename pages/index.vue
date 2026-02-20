<template>
  <div class="min-h-screen bg-gray-200 flex flex-col">
    <div class="flex justify-center mt-12">
      <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-2xl font-bold text-center text-gray-800 mb-8">
          Plataforma de acompanhamento e engajamento no aprendizado de línguas
        </h1>
        <form @submit.prevent="verificarUsuario" class="space-y-6">
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
              E-mail
            </label>
            <input v-model="email" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="email" placeholder="E-mail">
          </div>
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
              Senha
            </label>
            <input v-model="senha" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="********">
          </div>
          <div class="flex items-center justify-between">
            <button :class="{ 'opacity-50': !email || !senha }" :disabled="!email || !senha" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full focus:outline-none focus:shadow-outline transition ease-in-out duration-300" type="submit">
              Entrar
            </button>
          </div>
        </form>
        <div class="flex items-center justify-center mt-6">
          <p class="text-gray-700">Ainda não tem cadastro?</p>
          <button @click="goToProfile" class="ml-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline transition ease-in-out duration-300" type="button">
            Cadastre-se
          </button>
        </div>
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
  data() {
    return {
      email: '',
      senha: '',
    };
  },

  methods: {
    async verificarUsuario() {
      if (!this.email || !this.senha) {
        alert('Email e senha obrigatórios');
        return;
      }

      try {
        // Faz login pelo Supabase Auth
        const { data: usuario, error } = await supabase
          .from('usuarios')
          .select('id, nome, email, tipoUsuario, dtInclusao')
          .eq('email', this.email)
          .eq('senha', this.senha)
          .single();

        if (error || !usuario) {
          alert('Email ou senha incorretos');
          return;
        }

        // login OK
        localStorage.setItem('user', JSON.stringify({
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipoUsuario: usuario.tipoUsuario
        }));
        this.$router.push('/hub');

      } catch (err) {
        console.error('Erro ao conectar com Supabase:', err);
        alert('Erro ao conectar com o servidor');
      }
    },

    goToProfile() {
      this.$router.push('/register');
    }
  }
};
</script>