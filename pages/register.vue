<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <div class="relative">
      <button @click="voltar" class="absolute top-4 left-4 text-gray-600 hover:text-gray-800 focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <p class="mt-4 mx-8 md:mx-16 lg:mx-32 xl:mx-48 text-3xl font-bold text-center">
        Cadastro de Usuário
      </p>
    </div>
    <div class="flex justify-center mt-8 w-full">
      <div class="w-full max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl">
        <form @submit.prevent="cadastrarUsuario" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 border border-gray-300">
          <div class="mb-4">
            <label class="block text-gray-700 text-md font-bold mb-2" for="nome">
              Nome
            </label>
            <input v-model="nome" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="nome" type="text" placeholder="Nome">
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-md font-bold mb-2" for="email">
              E-mail
            </label>
            <input v-model="email" @input="validarEmail" :class="{ 'border-red-500': emailInvalido }" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="email" placeholder="E-mail">
            <p v-if="emailInvalido" class="text-red-500 text-xs italic">Formato de e-mail inválido.</p>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-md font-bold mb-2" for="senha">
              Senha
            </label>
            <input v-model="senha" @input="validarSenha" :class="{ 'border-red-500': senhaCurta }" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="senha" type="password" placeholder="Senha">
            <p v-if="senhaCurta" class="text-red-500 text-xs italic">A senha deve ter pelo menos 8 caracteres.</p>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-md font-bold mb-2">
              Tipo de Usuário
            </label>
            <select v-model="tipoUsuario"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700">
              <option disabled value="">Selecione</option>
              <option value="ALUNO">Aluno</option>
              <option value="PROFESSOR">Professor</option>
            </select>
          </div>
          <!-- <div class="mb-4">
            <label class="block text-gray-700 text-md font-bold mb-2" for="dataNascimento">
              Data de Nascimento
            </label>
            <input v-model="dataNascimento" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="dataNascimento" type="date">
          </div> -->

          <div class="flex justify-center mt-8">
            <button :class="{ 'opacity-50': !nome || !email || !senha || !tipoUsuario }" :disabled="!nome || !email || !senha || !tipoUsuario" class="bg-green-500 hover:bg-green-600 w-full text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

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
      senhaCurta: false,
      erro: ''
    };
  },
  methods: {
    async cadastrarUsuario() {
      const payload = {
        nome: this.nome,
        email: this.email,
        senha: this.senha,
        tipoUsuario: this.tipoUsuario
      };

      try {
        const response = await axios.post(
          'http://localhost:4000/usuarios',
          payload,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        this.resetForm();
        this.voltar();

      } catch (error) {
        alert(error.response?.data?.error || 'Erro ao cadastrar');
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
