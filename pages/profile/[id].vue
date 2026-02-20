<template>
  <div class="min-h-screen bg-gray-100 p-4 md:p-8">

    <!-- Header -->
    <div class="max-w-3xl mx-auto mb-6 flex items-center gap-4">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-800">
        Editar Usuário
      </h1>
    </div>

    <!-- Card -->
    <div class="max-w-3xl mx-auto bg-white rounded-xl shadow-md border border-gray-100 p-6 md:p-8">

      <form @submit.prevent="salvarPerfil" class="space-y-6">

        <!-- Nome -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Nome
          </label>
          <input
            v-model="nome"
            type="text"
            placeholder="Digite o nome"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            E-mail
          </label>
          <input
            v-model="email"
            @input="validarEmail"
            type="email"
            placeholder="Digite o e-mail"
            :class="[
              'w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition',
              emailInvalido
                ? 'border border-red-500 focus:ring-red-400'
                : 'border border-gray-300 focus:ring-green-500 focus:border-green-500'
            ]"
          />
          <p v-if="emailInvalido" class="text-red-500 text-sm mt-1">
            Formato de e-mail inválido.
          </p>
        </div>

        <!-- Tipo Usuário -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Tipo de Usuário
          </label>
          <select
            v-model="tipoUsuario"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          >
            <option disabled value="">Selecione</option>
            <option value="ALUNO">Aluno</option>
            <option value="PROFESSOR">Professor</option>
          </select>
        </div>

        <!-- Botão -->
        <div class="pt-4">
          <button
            :disabled="!nome || !email || !tipoUsuario || emailInvalido"
            class="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
          >
            Salvar Alterações
          </button>
        </div>

      </form>

    </div>

  </div>
</template>
<script>
import { supabase } from '@/utils/supabase'

export default {
  data() {
    return {
      nome: '',
      email: '',
      tipoUsuario: '',
      emailInvalido: false,
      userId: null
    };
  },
  methods: {
    async salvarPerfil() {
      if (!this.nome || !this.email || !this.tipoUsuario) {
        alert('Preencha todos os campos');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('usuarios')
          .update({
            nome: this.nome,
            email: this.email,
            tipoUsuario: this.tipoUsuario
          })
          .eq('id', this.userId);

        if (error) {
          alert(error.message);
          return;
        }

        alert('Perfil atualizado com sucesso!');

      } catch (err) {
        console.error('Erro ao atualizar usuário:', err);
        alert('Erro ao atualizar usuário');
      }
    },

    async getUser() {
      try {
        const { data: usuario, error } = await supabase
          .from('usuarios')
          .select('id, nome, email, tipoUsuario, dtInclusao')
          .eq('id', this.userId)
          .single();

        if (error || !usuario) {
          alert('Erro ao carregar dados do usuário');
          return;
        }

        this.nome = usuario.nome;
        this.email = usuario.email;
        this.tipoUsuario = usuario.tipoUsuario;

      } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        alert('Erro ao buscar usuário');
      }
    },

    validarEmail() {
      const regexEmail = /\S+@\S+\.\S+/;
      this.emailInvalido = !regexEmail.test(this.email);
    },
  },

  created() {
    this.userId = Number(this.$route.params.id);
    if (this.userId) {
      this.getUser();
    }
  }
};
</script>