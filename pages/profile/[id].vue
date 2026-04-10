<template>
  <div class="min-h-screen bg-gray-100 p-4 md:p-8">

    <div class="mb-10">
      <h1 class="text-3xl font-bold text-green-700">Editar Perfil</h1>
      <p class="text-gray-500 mt-2">Atualize suas informações pessoais.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div class="max-w-3xl mx-auto bg-white rounded-xl shadow-md border border-gray-100 p-6 md:p-8">

      <div v-if="loading" class="flex items-center gap-3 text-green-700">
        <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Carregando...</span>
      </div>

      <form v-else @submit.prevent="salvarPerfil" class="space-y-6">

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Nome</label>
          <input
            v-model="nome"
            type="text"
            placeholder="Digite o nome"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">E-mail</label>
          <input
            v-model="email"
            @input="validarEmail"
            type="email"
            placeholder="Digite o e-mail"
            disabled
            :class="[
              'w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition',
              emailInvalido
                ? 'border border-red-500 focus:ring-red-400'
                : 'border border-gray-300 focus:ring-green-500'
            ]"
          />
          <p v-if="emailInvalido" class="text-red-500 text-sm mt-1">Formato de e-mail inválido.</p>
        </div>

        <div class="pt-4">
          <button
            type="submit"
            :disabled="salvando || !nome || !email || emailInvalido"
            class="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
          >
            <div v-if="salvando" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ salvando ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>

      </form>

    </div>
  </div>
</template>

<script setup>
import { supabase } from '~/utils/supabase'

definePageMeta({ middleware: 'auth' })

const { user, reidratar } = useAuth()
const { $toast } = useNuxtApp()

const loading = ref(true)
const salvando = ref(false)
const nome = ref('')
const email = ref('')
const emailInvalido = ref(false)

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
  email.value = user.value.email // email vem da sessão auth
  loading.value = false
})

function validarEmail() {
  emailInvalido.value = !/\S+@\S+\.\S+/.test(email.value)
}

async function salvarPerfil() {
  if (!nome.value || !email.value || emailInvalido.value) return
  salvando.value = true

  try {
    // Atualiza nome em usuarios
    const { error: dbError } = await supabase
      .from('usuarios')
      .update({ nome: nome.value.trim() })
      .eq('id', user.value.id)

    if (dbError) throw dbError

    // Atualiza email no Auth (só se mudou)
    if (email.value.trim() !== user.value.email) {
      const { error: authError } = await supabase.auth.updateUser({
        email: email.value.trim(),
      })

      if (authError) throw authError

      // Atualiza o estado local
      user.value = { ...user.value, nome: nome.value.trim(), email: email.value.trim() }

      $toast.success('Perfil atualizado! Confirme o novo e-mail para continuar.')
      return
    }

    // Atualiza o estado local
    user.value = { ...user.value, nome: nome.value.trim() }

    $toast.success('Perfil atualizado com sucesso!')

  } catch (err) {
    console.error(err)
    $toast.error('Erro ao atualizar perfil.')
  } finally {
    salvando.value = false
  }
}
</script>