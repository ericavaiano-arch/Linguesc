<template>
  <div class="min-h-screen bg-gray-100 p-4 md:p-8">

       <!-- Header -->
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-green-700">
        Editar Perfil
      </h1>
      <p class="text-gray-500 mt-2">
        Atualize suas informações pessoais.
      </p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
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

        <!-- Botão -->
        <div class="pt-4">
          <button
            :disabled="!nome || !email || emailInvalido"
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

definePageMeta({ middleware: 'auth' })

export default {
  setup() {
    const { $toast } = useNuxtApp()
    return { toast: $toast }
  },

  data() {
    return {
      nome: '',
      email: '',
      emailInvalido: false,
      userId: null
    };
  },

  methods: {
    async salvarPerfil() {
      if (!this.nome || !this.email) {
        this.$toast.warning('Preencha todos os campos.')
        return;
      }

      try {
        const { error } = await supabase
          .from('usuarios')
          .update({
            nome: this.nome,
            email: this.email
          })
          .eq('id', this.userId);

        if (error) {
          this.toast.error(error.message);
          return;
        }

        this.toast.success('Perfil atualizado com sucesso!')

      } catch (err) {
        this.toast.error('Erro ao atualizar perfil.')
      }
    },

    async getUser() {
      try {
        const { data: usuario, error } = await supabase
          .from('usuarios')
          .select('id, nome, email, dtInclusao')
          .eq('id', this.userId)
          .single();

        if (error || !usuario) {
          this.toast.error('Erro ao carregar dados do usuário.')
          return;
        }

        this.nome = usuario.nome;
        this.email = usuario.email;

      } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        this.toast.error('Erro ao buscar usuário.')
      }
    },

    validarEmail() {
      const regexEmail = /\S+@\S+\.\S+/
      this.emailInvalido = !regexEmail.test(this.email)
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