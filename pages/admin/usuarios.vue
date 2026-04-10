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
              <div class="flex flex-wrap gap-1 justify-center">
                <span
                  v-for="papel in usuario.papeis"
                  :key="papel"
                  class="text-xs font-semibold px-2.5 py-1 rounded-full"
                  :class="{
                    'bg-purple-100 text-purple-700': papel === 'ADMIN',
                    'bg-blue-100 text-blue-700': papel === 'PROFESSOR',
                    'bg-green-100 text-green-700': papel === 'ALUNO',
                  }"
                >
                  {{ papel }}
                </span>
              </div>
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
          
         <div v-if="modo === 'criar'">
            <label class="text-sm font-medium text-gray-700 mb-3 block">Papéis</label>

            <!-- Papéis selecionados -->
            <div class="flex flex-wrap gap-2 mb-3">
              <div
                v-for="papel in papeisCriacao"
                :key="papel"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                :class="{
                  'bg-purple-100 text-purple-700': papel === 'ADMIN',
                  'bg-blue-100 text-blue-700': papel === 'PROFESSOR',
                  'bg-green-100 text-green-700': papel === 'ALUNO',
                }"
              >
                {{ papel }}
                <button
                  @click="removerPapelCriacao(papel)"
                  class="hover:opacity-60 transition font-bold text-sm leading-none"
                >×</button>
              </div>
              <span v-if="papeisCriacao.length === 0" class="text-xs text-gray-400">
                Nenhum papel selecionado.
              </span>
            </div>

            <!-- Adicionar papel -->
            <div class="flex gap-2">
              <select
                v-model="novoPapel"
                class="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              >
                <option value="">Selecionar papel...</option>
                <option
                  v-for="opcao in ['ALUNO', 'PROFESSOR', 'ADMIN'].filter(o => !papeisCriacao.includes(o))"
                  :key="opcao"
                  :value="opcao"
                >{{ opcao }}</option>
              </select>
              <button
                @click="adicionarPapelCriacao(novoPapel)"
                :disabled="!novoPapel"
                class="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition"
              >
                + Adicionar
              </button>
            </div>
          </div>

          <!-- Papéis (só na edição) -->
          <div v-if="modo === 'editar'">
            <label class="text-sm font-medium text-gray-700 mb-3 block">Papéis</label>

            <!-- Papéis ativos -->
            <div class="flex flex-wrap gap-2 mb-3">
              <div
                v-for="p in papeisUsuario.filter(p => p.ativo)"
                :key="p.id"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                :class="{
                  'bg-purple-100 text-purple-700': p.papel === 'ADMIN',
                  'bg-blue-100 text-blue-700': p.papel === 'PROFESSOR',
                  'bg-green-100 text-green-700': p.papel === 'ALUNO',
                }"
              >
                {{ p.papel }}
                <button
                  @click="removerPapel(p.id)"
                  class="hover:opacity-60 transition font-bold text-sm leading-none"
                >×</button>
              </div>
              <span v-if="papeisUsuario.filter(p => p.ativo).length === 0" class="text-xs text-gray-400">
                Nenhum papel ativo.
              </span>
            </div>

            <!-- Adicionar papel -->
            <div class="flex gap-2">
              <select
                v-model="novoPapel"
                class="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              >
                <option value="">Selecionar papel...</option>
                <option
                  v-for="opcao in ['ALUNO', 'PROFESSOR', 'ADMIN'].filter(o =>
                    !papeisUsuario.some(p => p.papel === o && p.ativo)
                  )"
                  :key="opcao"
                  :value="opcao"
                >{{ opcao }}</option>
              </select>
              <button
                @click="adicionarPapel(novoPapel); novoPapel = ''"
                :disabled="!novoPapel"
                class="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition"
              >
                + Adicionar
              </button>
            </div>
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
const papeisUsuario = ref([])
const novoPapel = ref('')

const form = ref({
  nome: '',
  email: '',
  senha: '',
})
const papeisCriacao = ref([])

// ── Filtro corrigido ──────────────────────────────────────────────
const usuariosFiltrados = computed(() => {
  return usuarios.value.filter(u => {
    const termo = filtro.value.trim().toLowerCase()
    const matchTexto = !termo || u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo)
    const matchTipo = !filtroTipo.value || u.papeis.includes(filtroTipo.value) // ✅ array
    const matchAtivo = filtroAtivo.value === '' || String(u.ativo) === filtroAtivo.value
    return matchTexto && matchTipo && matchAtivo
  })
})

async function carregarUsuarios() {
  loading.value = true
  const { data, error } = await supabase
    .from('usuarios_completo')
    .select('*, usuario_papel(papel, ativo)')
    .order('nome')

  if (error) {
    $toast.error('Erro ao carregar usuários.')
  } else {
    usuarios.value = (data || []).map(u => ({
      ...u,
      papeis: (u.usuario_papel || [])
        .filter(p => p.ativo)
        .map(p => p.papel),
    }))
  }
  loading.value = false
}

function abrirCriacao() {
  modo.value = 'criar'
  form.value = { nome: '', email: '', senha: '' }
  painelAberto.value = true
}

function abrirEdicao(usuario) {
  modo.value = 'editar'
  usuarioEditando.value = usuario
  form.value = { nome: usuario.nome, email: usuario.email, senha: '' }
  carregarPapeisUsuario(usuario.id)
  painelAberto.value = true
}

function fecharPainel() {
  painelAberto.value = false
  usuarioEditando.value = null
  papeisUsuario.value = []
  papeisCriacao.value = []
  novoPapel.value = ''
}

function adicionarPapelCriacao(papel) {
  if (!papel || papeisCriacao.value.includes(papel)) return
  papeisCriacao.value.push(papel)
  novoPapel.value = ''
}

function removerPapelCriacao(papel) {
  if (papeisCriacao.value.length <= 1) {
    $toast.warning('O usuário precisa ter pelo menos um papel.')
    return
  }
  papeisCriacao.value = papeisCriacao.value.filter(p => p !== papel)
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

      const { data, error: authError } = await supabase.auth.signUp({
        email: form.value.email.trim(),
        password: form.value.senha,
      })

      if (authError || !data.user) {
        $toast.error(authError?.message ?? 'Erro ao criar usuário.')
        return
      }

      const novoId = data.user.id

      const { error: dbError } = await supabase
        .from('usuarios')
        .insert({ id: novoId, nome: form.value.nome.trim() })

      if (dbError) {
        $toast.error('Erro ao salvar perfil do usuário.')
        console.error(dbError)
        return
      }

      // Insere o papel selecionado após ter o id
      await supabase
        .from('usuario_papel')
        .insert(papeisCriacao.value.map(papel => ({ usuario_id: novoId, papel, ativo: true })))

      $toast.success('Usuário criado com sucesso!')

    } else {
      // Edição: só nome, sem tipo_usuario
      const { error } = await supabase
        .from('usuarios')
        .update({ nome: form.value.nome.trim() })
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

async function carregarPapeisUsuario(usuarioId) {
  const { data } = await supabase
    .from('usuario_papel')
    .select('id, papel, ativo')
    .eq('usuario_id', usuarioId)

  papeisUsuario.value = data || []
}

async function adicionarPapel(papel) {
  const existente = papeisUsuario.value.find(p => p.papel === papel)

  if (existente && !existente.ativo) {
    await supabase.from('usuario_papel').update({ ativo: true }).eq('id', existente.id)
  } else if (!existente) {
    await supabase.from('usuario_papel').insert({ usuario_id: usuarioEditando.value.id, papel, ativo: true })
  }

  await carregarPapeisUsuario(usuarioEditando.value.id)
}

async function removerPapel(papelId) {
  const total = papeisUsuario.value.filter(p => p.ativo).length
  if (total <= 1) {
    $toast.warning('O usuário precisa ter pelo menos um papel.')
    return
  }
  await supabase.from('usuario_papel').update({ ativo: false }).eq('id', papelId)
  await carregarPapeisUsuario(usuarioEditando.value.id)
}

onMounted(carregarUsuarios)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>