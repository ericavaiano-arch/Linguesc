<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <div class="mb-10 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold text-green-700">Usuários</h1>
        <p class="text-gray-500 mt-2">Gerencie todos os usuários do sistema.</p>
        <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
      </div>
      <button
        @click="abrirCriacao"
        class="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl transition active:scale-95"
      >
        + Novo Usuário
      </button>
    </div>

    <!-- Filtros -->
    <div class="flex gap-3 mb-6 flex-wrap">
      <input
        v-model="filtro"
        type="text"
        placeholder="Buscar por nome ou e-mail..."
        class="flex-1 min-w-48 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
      />
      <select v-model="filtroTipo" class="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition">
        <option value="">Todos os tipos</option>
        <option value="ADMIN">Admin</option>
        <option value="PROFESSOR">Professor</option>
        <option value="ALUNO">Aluno</option>
      </select>
      <select v-model="filtroAtivo" class="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition">
        <option value="">Todos</option>
        <option value="true">Ativos</option>
        <option value="false">Inativos</option>
      </select>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando...</span>
    </div>

    <!-- Tabela -->
    <div v-else class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100">
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mail</th>
            <th class="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
            <th class="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th class="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="usuariosFiltrados.length === 0">
            <td colspan="5" class="text-center py-10 text-sm text-gray-400">Nenhum usuário encontrado.</td>
          </tr>
          <tr v-for="usuario in usuariosFiltrados" :key="usuario.id" class="hover:bg-gray-50 transition">
            <td class="px-6 py-4 font-medium text-gray-800">{{ usuario.nome }}</td>
            <td class="px-6 py-4 text-gray-500">{{ usuario.email }}</td>
            <td class="px-6 py-4 text-center">
              <span
                class="text-xs font-semibold px-2.5 py-1 rounded-full"
                :class="{
                  'bg-purple-100 text-purple-700': usuario.tipo_usuario === 'ADMIN',
                  'bg-blue-100 text-blue-700': usuario.tipo_usuario === 'PROFESSOR',
                  'bg-green-100 text-green-700': usuario.tipo_usuario === 'ALUNO',
                }"
              >
                {{ usuario.tipo_usuario }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <span
                class="text-xs font-semibold px-2.5 py-1 rounded-full"
                :class="usuario.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
              >
                {{ usuario.ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <div class="flex items-center justify-center gap-2">
                <button @click="abrirEdicao(usuario)" class="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition font-semibold">
                  ✏️ Editar
                </button>
                <button
                  @click="toggleAtivo(usuario)"
                  class="text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                  :class="usuario.ativo ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'"
                >
                  {{ usuario.ativo ? '🚫 Desativar' : '✅ Ativar' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Overlay -->
    <Transition name="fade">
      <div v-if="painelAberto" class="fixed inset-0 bg-black/40 z-[60]" @click="fecharPainel"></div>
    </Transition>

    <!-- Drawer -->
    <Transition name="slide">
      <div v-if="painelAberto" class="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col">
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-lg font-semibold text-gray-800">
            {{ modo === 'criar' ? '➕ Novo Usuário' : '✏️ Editar Usuário' }}
          </h2>
          <button @click="fecharPainel" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition text-xl">×</button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block">Nome</label>
            <input v-model="form.nome" type="text" placeholder="Nome completo"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block">E-mail</label>
            <input v-model="form.email" type="email" placeholder="email@exemplo.com"
              :disabled="modo === 'editar'"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition disabled:bg-gray-50 disabled:text-gray-400" />
            <p v-if="modo === 'editar'" class="text-xs text-gray-400 mt-1">E-mail não pode ser alterado por aqui.</p>
          </div>
          <div v-if="modo === 'criar'">
            <label class="text-sm font-medium text-gray-700 mb-2 block">Senha</label>
            <input v-model="form.senha" type="password" placeholder="Mínimo 8 caracteres"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition" />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block">Tipo de Usuário</label>
            <select v-model="form.tipo_usuario"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition">
              <option value="ALUNO">Aluno</option>
              <option value="PROFESSOR">Professor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        <div class="p-6 border-t">
          <button
            @click="salvar"
            :disabled="salvando || !form.nome.trim() || !form.email.trim()"
            class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
          >
            <div v-if="salvando" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ salvando ? 'Salvando...' : (modo === 'criar' ? '✅ Criar Usuário' : '💾 Salvar') }}
          </button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { supabase } from '~/utils/supabase'

definePageMeta({ middleware: 'admin' })

const { $toast } = useNuxtApp()

const loading = ref(true)
const usuarios = ref([])
const filtro = ref('')
const filtroTipo = ref('')
const filtroAtivo = ref('')
const painelAberto = ref(false)
const modo = ref('criar')
const salvando = ref(false)
const usuarioEditando = ref(null)

const form = ref({
  nome: '',
  email: '',
  senha: '',
  tipo_usuario: 'ALUNO',
})

const usuariosFiltrados = computed(() => {
  return usuarios.value.filter(u => {
    const termo = filtro.value.trim().toLowerCase()
    const matchTexto = !termo || u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo)
    const matchTipo = !filtroTipo.value || u.tipo_usuario === filtroTipo.value
    const matchAtivo = filtroAtivo.value === '' || String(u.ativo) === filtroAtivo.value
    return matchTexto && matchTipo && matchAtivo
  })
})

async function carregarUsuarios() {
  loading.value = true
  // Usa a view usuarios_completo que já traz o email de auth.users
  const { data, error } = await supabase
    .from('usuarios_completo')
    .select('*')
    .order('nome')

  if (error) {
    $toast.error('Erro ao carregar usuários.')
    console.error(error)
  } else {
    usuarios.value = data || []
  }

  loading.value = false
}

function abrirCriacao() {
  modo.value = 'criar'
  form.value = { nome: '', email: '', senha: '', tipo_usuario: 'ALUNO' }
  painelAberto.value = true
}

function abrirEdicao(usuario) {
  modo.value = 'editar'
  usuarioEditando.value = usuario
  form.value = {
    nome: usuario.nome,
    email: usuario.email,
    senha: '',
    tipo_usuario: usuario.tipo_usuario,
  }
  painelAberto.value = true
}

function fecharPainel() {
  painelAberto.value = false
  usuarioEditando.value = null
}

async function salvar() {
  if (!form.value.nome.trim() || !form.value.email.trim()) return
  salvando.value = true

  try {
    if (modo.value === 'criar') {
      if (!form.value.senha.trim() || form.value.senha.length < 8) {
        $toast.warning('A senha deve ter pelo menos 8 caracteres.')
        return
      }

      // 1. Cria no Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.value.email.trim(),
        password: form.value.senha,
      })

      if (authError || !data.user) {
        $toast.error(authError?.message ?? 'Erro ao criar usuário.')
        return
      }

      // 2. Insere perfil
      const { error: dbError } = await supabase
        .from('usuarios')
        .insert({
          id: data.user.id,
          nome: form.value.nome.trim(),
          tipo_usuario: form.value.tipo_usuario,
        })

      if (dbError) {
        $toast.error('Erro ao salvar perfil do usuário.')
        console.error(dbError)
        return
      }

      $toast.success('Usuário criado com sucesso!')

    } else {
      // Edição: só atualiza nome e tipo_usuario em usuarios
      // Email e senha são gerenciados pelo Supabase Auth separadamente
      const { error } = await supabase
        .from('usuarios')
        .update({
          nome: form.value.nome.trim(),
          tipo_usuario: form.value.tipo_usuario,
        })
        .eq('id', usuarioEditando.value.id)

      if (error) throw error

      $toast.success('Usuário atualizado!')
    }

    fecharPainel()
    await carregarUsuarios()
  } catch (err) {
    console.error(err)
    $toast.error('Erro ao salvar usuário.')
  } finally {
    salvando.value = false
  }
}

async function toggleAtivo(usuario) {
  const { error } = await supabase
    .from('usuarios')
    .update({ ativo: !usuario.ativo })
    .eq('id', usuario.id)

  if (error) {
    $toast.error('Erro ao atualizar status.')
  } else {
    $toast.success(usuario.ativo ? 'Usuário desativado.' : 'Usuário ativado.')
    await carregarUsuarios()
  }
}

onMounted(carregarUsuarios)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>