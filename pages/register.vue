<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-200 via-green-100 to-white flex items-center justify-center px-4 py-10">

    <div class="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/40 p-8 relative">

      <!-- Botão voltar -->
      <button
        @click="voltar"
        class="absolute top-5 left-5 text-gray-500 hover:text-gray-800 transition"
        aria-label="Voltar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
             viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round"
                stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Header -->
      <div class="text-center mb-8">
        <div class="text-4xl mb-3">📝</div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800">
          Criar Conta
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Preencha os dados para começar
        </p>
      </div>

      <!-- Formulário -->
      <form @submit.prevent="cadastrarUsuario" class="space-y-5">

        <!-- Nome -->
        <div>
          <label for="nome" class="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <input
            v-model="nome"
            id="nome"
            type="text"
            required
            placeholder="Seu nome completo"
            class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            v-model="email"
            @input="validarEmail"
            id="email"
            type="email"
            required
            autocomplete="email"
            placeholder="seuemail@exemplo.com"
            :class="[
              'w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition',
              emailInvalido
                ? 'border-red-500 focus:ring-red-400'
                : 'border-gray-300 focus:ring-green-500'
            ]"
          />
          <p v-if="emailInvalido" class="text-red-500 text-xs mt-1">
            Formato de e-mail inválido.
          </p>
        </div>

        <!-- Senha -->
        <div>
          <label for="senha" class="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <input
            v-model="senha"
            @input="validarSenha"
            id="senha"
            type="password"
            required
            autocomplete="new-password"
            placeholder="Mínimo 8 caracteres"
            :class="[
              'w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition',
              senhaCurta
                ? 'border-red-500 focus:ring-red-400'
                : 'border-gray-300 focus:ring-green-500'
            ]"
          />
          <p v-if="senhaCurta" class="text-red-500 text-xs mt-1">
            A senha deve ter pelo menos 8 caracteres.
          </p>
        </div>

        <!-- Tipo de usuário -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Usuário
          </label>
          <select
            v-model="tipoUsuario"
            required
            class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          >
            <option disabled value="">Selecione</option>
            <option value="ALUNO">Aluno</option>
            <option value="PROFESSOR">Professor</option>
          </select>
        </div>

        <!-- Botão -->
        <button
          :disabled="!nome || !email || !senha || !tipoUsuario"
          class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition active:scale-95"
        >
          Cadastrar
        </button>

      </form>

    </div>

  </div>
</template>

<script>
import { supabase } from '@/utils/supabase'
import { useToast } from 'vue-toastification'

const toast = useToast()

definePageMeta({
  layout: 'auth'
})

export default {
  data() {
    return {
      nome: '',
      email: '',
      senha: '',
      tipoUsuario: '',
      emailInvalido: false,
      senhaCurta: false
    };
  },
  methods: {
    async cadastrarUsuario() {
      if (!this.nome || !this.email || !this.senha || !this.tipoUsuario) {
        toast.warning('Todos os campos são obrigatórios.')
        return
      }

      if (this.emailInvalido || this.senhaCurta) {
        toast.error('Corrija os erros antes de cadastrar.')
        return
      }

      try {
        const { error } = await supabase
          .from('usuarios')
          .insert([{
            nome: this.nome,
            email: this.email,
            senha: this.senha,
            tipoUsuario: this.tipoUsuario
          }])

        if (error) {
          if (error.code === '23505') {
            toast.error('Este e-mail já está cadastrado.')
            return
          }

          toast.error('Erro ao cadastrar usuário.')
          console.error(error)
          return
        }

        toast.success('Usuário cadastrado com sucesso!')
        this.resetForm()
        this.voltar()

      } catch (err) {
        console.error('Erro inesperado:', err)
        toast.error('Erro ao conectar com o servidor.')
      }
    },

    resetForm() {
      this.nome = '';
      this.email = '';
      this.senha = '';
      this.tipoUsuario = '';
    },

    voltar() {
      this.$router.push('/');
    },

    validarEmail() {
      const regexEmail = /\S+@\S+\.\S+/;
      this.emailInvalido = !regexEmail.test(this.email);
    },

    validarSenha() {
      this.senhaCurta = this.senha.length < 8;
    },
  },
  created(){
    this.resetForm();
  }
};
</script>