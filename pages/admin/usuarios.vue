<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <!-- Header -->
    <div class="mb-8 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold text-green-700">Usuários</h1>
        <p class="text-gray-500 mt-2">Gerencie usuários, acessos e atividade do sistema.</p>
        <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
      </div>
      <button
        @click="abrirCriacao"
        class="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl transition active:scale-95"
      >
        + Novo Usuário
      </button>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total de usuários</p>
        <p class="text-3xl font-bold text-gray-800">{{ stats.total }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total de logins</p>
        <p class="text-3xl font-bold text-green-700">{{ stats.logins.toLocaleString('pt-BR') }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Alunos</p>
        <p class="text-3xl font-bold text-blue-600">{{ stats.alunos }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Professores</p>
        <p class="text-3xl font-bold text-purple-600">{{ stats.professores }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex gap-3 mb-6 flex-wrap items-center">
      <input
        v-model="filtro"
        type="text"
        placeholder="Buscar por nome ou e-mail..."
        class="flex-1 min-w-48 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
      />
      <select
        v-model="filtroTipo"
        class="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
      >
        <option value="">Todos os tipos</option>
        <option value="ADMIN">Admin</option>
        <option value="PROFESSOR">Professor</option>
        <option value="ALUNO">Aluno</option>
      </select>
      <select
        v-model="filtroAtivo"
        class="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
      >
        <option value="">Todos</option>
        <option value="true">Ativos</option>
        <option value="false">Inativos</option>
      </select>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-500 whitespace-nowrap">Último acesso de</label>
        <input
          v-model="filtroDataDe"
          type="date"
          class="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        />
        <span class="text-sm text-gray-400">até</span>
        <input
          v-model="filtroDataAte"
          type="date"
          class="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        />
      </div>
      <button
        v-if="temFiltro"
        @click="limparFiltros"
        class="text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition"
      >
        Limpar filtros
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando...</span>
    </div>

    <!-- Tabela -->
    <div v-else class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100">
            <th
              v-for="col in colunas"
              :key="col.key"
              class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 transition select-none whitespace-nowrap"
              :class="col.align === 'center' ? 'text-center' : 'text-left'"
              @click="setOrdem(col.key)"
            >
              {{ col.label }}
              <span v-if="ordemCol === col.key" class="ml-1">{{ ordemDir === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center whitespace-nowrap">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="usuariosFiltrados.length === 0">
            <td :colspan="colunas.length + 1" class="text-center py-10 text-sm text-gray-400">
              Nenhum usuário encontrado.
            </td>
          </tr>
          <tr
            v-for="usuario in usuariosFiltrados"
            :key="usuario.id"
            class="hover:bg-gray-50 transition"
          >
            <td class="px-4 py-3 font-medium text-gray-800">{{ usuario.nome }}</td>
            <td class="px-4 py-3 text-gray-500 text-xs">{{ usuario.email }}</td>
            <td class="px-4 py-3 text-center">
              <div class="flex flex-wrap gap-1 justify-center">
                <span
                  v-for="papel in usuario.papeis"
                  :key="papel"
                  class="text-xs font-semibold px-2 py-0.5 rounded-full"
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
            <td class="px-4 py-3 text-center">
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :class="usuario.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
              >
                {{ usuario.ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <span
                class="text-sm font-bold"
                :class="{
                  'text-green-600': usuario.total_logins >= 20,
                  'text-blue-600': usuario.total_logins >= 5 && usuario.total_logins < 20,
                  'text-gray-400': usuario.total_logins < 5,
                }"
              >
                {{ usuario.total_logins ?? 0 }}
              </span>
            </td>
            <td class="px-4 py-3 text-center text-gray-500 text-xs">{{ fmt(usuario.ultimo_login) }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-1.5 flex-wrap">
                <button
                  @click="abrirDetalhes(usuario)"
                  class="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition font-semibold whitespace-nowrap"
                >
                  👁 Detalhes
                </button>
                <button
                  @click="abrirEdicao(usuario)"
                  class="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition font-semibold whitespace-nowrap"
                >
                  ✏️ Editar
                </button>
                <button
                  @click="toggleAtivo(usuario)"
                  class="text-xs px-2.5 py-1.5 rounded-lg font-semibold transition whitespace-nowrap"
                  :class="usuario.ativo ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'"
                >
                  {{ usuario.ativo ? 'Desativar' : 'Ativar' }}
                </button>
                <button
                  v-if="isAdminLogado"
                  @click="usuarioParaDeletar = usuario"
                  class="text-xs px-2.5 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition font-semibold whitespace-nowrap"
                >
                  Deletar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="usuariosFiltrados.length > 0" class="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
        {{ usuariosFiltrados.length }} usuário{{ usuariosFiltrados.length !== 1 ? 's' : '' }}
        exibido{{ usuariosFiltrados.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Modal deleção -->
    <div
      v-if="usuarioParaDeletar"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="usuarioParaDeletar = null"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 space-y-4">
        <h3 class="text-lg font-semibold text-gray-800">Deletar usuário</h3>
        <p class="text-sm text-gray-600">
          Tem certeza que deseja deletar o usuário
          <span class="font-medium">{{ usuarioParaDeletar.nome }}</span>?
          Todos os dados relacionados serão removidos permanentemente. Esta ação não pode ser desfeita.
        </p>
        <div class="flex gap-3 justify-end">
          <button
            @click="usuarioParaDeletar = null"
            class="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            @click="confirmarDelecao"
            :disabled="deletando"
            class="px-4 py-2 rounded-xl text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <div v-if="deletando" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ deletando ? 'Deletando...' : 'Deletar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="detalhesAberto || painelAberto"
        class="fixed inset-0 bg-black/40 z-[60]"
        @click="detalhesAberto ? fecharDetalhes() : fecharPainel()"
      ></div>
    </Transition>

    <!-- Drawer: Detalhes -->
    <Transition name="slide">
      <div
        v-if="detalhesAberto"
        class="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-[70] flex flex-col"
      >
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-lg font-semibold text-gray-800">👁 Detalhes do Usuário</h2>
          <button
            @click="fecharDetalhes"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition text-xl"
          >
            ×
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- Cabeçalho -->
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg flex-shrink-0">
              {{ usuarioDetalhes?.nome?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-semibold text-gray-800 text-lg leading-tight">{{ usuarioDetalhes?.nome }}</h3>
              <p class="text-sm text-gray-500 truncate">{{ usuarioDetalhes?.email }}</p>
            </div>
            <span
              class="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
              :class="usuarioDetalhes?.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
            >
              {{ usuarioDetalhes?.ativo ? 'Ativo' : 'Inativo' }}
            </span>
          </div>

          <!-- Papéis -->
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Papéis</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="papel in usuarioDetalhes?.papeis"
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
          </div>

          <!-- Acesso -->
          <div class="bg-gray-50 rounded-xl p-4">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Acesso</p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <p class="text-xs text-gray-400">Total de logins</p>
                <p class="font-semibold text-gray-800">{{ usuarioDetalhes?.total_logins ?? 0 }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">Cadastrado em</p>
                <p class="font-semibold text-gray-800">{{ fmt(usuarioDetalhes?.dt_inclusao) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">Primeiro acesso</p>
                <p class="font-semibold text-gray-800">{{ fmt(usuarioDetalhes?.primeiro_login) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">Último acesso</p>
                <p class="font-semibold text-gray-800">{{ fmt(usuarioDetalhes?.ultimo_login) }}</p>
              </div>
            </div>
          </div>

          <!-- Gamificação -->
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Gamificação</p>
            <div v-if="loadingDetalhes" class="flex items-center gap-2 text-green-700 text-sm">
              <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              Carregando...
            </div>
            <div v-else-if="detalhesExtra" class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center">
                  <p class="text-2xl font-bold text-yellow-600">{{ detalhesExtra.estrelas ?? 0 }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">estrelas ⭐</p>
                </div>
                <div class="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                  <p class="text-2xl font-bold text-blue-600">{{ detalhesExtra.nivel_perfil ?? 0 }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">nível de perfil</p>
                </div>
              </div>
              <div class="space-y-1.5">
                <div class="flex items-center justify-between text-sm py-1 border-b border-gray-100">
                  <span class="text-gray-500">Sequência semestre</span>
                  <span :class="detalhesExtra.bonus_sequencia_semestre ? 'text-green-600 font-semibold' : 'text-gray-400'">
                    {{ detalhesExtra.bonus_sequencia_semestre ? '✓ Sim' : '—' }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm py-1 border-b border-gray-100">
                  <span class="text-gray-500">Bônus avatar</span>
                  <span :class="detalhesExtra.avatar_bonus_concedido ? 'text-green-600 font-semibold' : 'text-gray-400'">
                    {{ detalhesExtra.avatar_bonus_concedido ? '✓ Concedido' : '—' }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm py-1 border-b border-gray-100">
                  <span class="text-gray-500">Bônus perfil</span>
                  <span :class="detalhesExtra.perfil_bonus_concedido ? 'text-green-600 font-semibold' : 'text-gray-400'">
                    {{ detalhesExtra.perfil_bonus_concedido ? '✓ Concedido' : '—' }}
                  </span>
                </div>
                <div v-if="detalhesExtra.ultimo_bonus_login_semana" class="flex items-center justify-between text-sm py-1">
                  <span class="text-gray-500">Último bônus login</span>
                  <span class="text-gray-700 text-xs font-mono">{{ detalhesExtra.ultimo_bonus_login_semana }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Dados do perfil -->
          <div v-if="detalhesExtra && (detalhesExtra.curso || detalhesExtra.idade || detalhesExtra.data_nascimento)">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Perfil</p>
            <div class="space-y-2 text-sm">
              <div v-if="detalhesExtra.curso" class="flex justify-between py-1 border-b border-gray-100">
                <span class="text-gray-500">Curso</span>
                <span class="text-gray-700">{{ detalhesExtra.curso }}</span>
              </div>
              <div v-if="detalhesExtra.idade" class="flex justify-between py-1 border-b border-gray-100">
                <span class="text-gray-500">Idade</span>
                <span class="text-gray-700">{{ detalhesExtra.idade }}</span>
              </div>
              <div v-if="detalhesExtra.data_nascimento" class="flex justify-between py-1 border-b border-gray-100">
                <span class="text-gray-500">Data de nascimento</span>
                <span class="text-gray-700">{{ fmt(detalhesExtra.data_nascimento) }}</span>
              </div>
            </div>
          </div>

          <!-- Documento Federal -->
          <div v-if="detalhesExtra?.documento_federal">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Documento Federal</p>
            <p class="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3 font-mono">{{ detalhesExtra.documento_federal }}</p>
          </div>

          <!-- Turmas -->
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Turmas</p>
            <div v-if="loadingDetalhes" class="text-sm text-gray-400">Carregando...</div>
            <p
              v-else-if="!detalhesExtra?.turmas?.length && !detalhesExtra?.turmasProf?.length"
              class="text-sm text-gray-400 italic"
            >
              Nenhuma turma vinculada.
            </p>
            <div v-else class="space-y-2">
              <div
                v-for="t in (detalhesExtra?.turmas ?? [])"
                :key="'aluno-' + t.id"
                class="flex items-center justify-between px-3 py-2.5 bg-green-50 border border-green-100 rounded-xl"
              >
                <span class="text-sm text-green-800 font-medium">{{ t.nome }}</span>
                <span class="text-xs text-gray-400 bg-green-100 px-2 py-0.5 rounded-full">aluno</span>
              </div>
              <div
                v-for="t in (detalhesExtra?.turmasProf ?? [])"
                :key="'prof-' + t.id"
                class="flex items-center justify-between px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl"
              >
                <span class="text-sm text-blue-800 font-medium">{{ t.nome }}</span>
                <span class="text-xs text-gray-400 bg-blue-100 px-2 py-0.5 rounded-full">professor</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer ações -->
        <div class="p-6 border-t flex gap-3">
          <button
            @click="editarDoDetalhes"
            class="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            ✏️ Editar
          </button>
          <button
            @click="toggleAtivoDoDetalhes"
            class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition"
            :class="usuarioDetalhes?.ativo
              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
              : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'"
          >
            {{ usuarioDetalhes?.ativo ? '🚫 Desativar' : '✅ Ativar' }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Drawer: Criar / Editar -->
    <Transition name="slide">
      <div
        v-if="painelAberto"
        class="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
      >
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-lg font-semibold text-gray-800">
            {{ modo === 'criar' ? '➕ Novo Usuário' : '✏️ Editar Usuário' }}
          </h2>
          <button
            @click="fecharPainel"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition text-xl"
          >
            ×
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block">Nome</label>
            <input
              v-model="form.nome"
              type="text"
              placeholder="Nome completo"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block">E-mail</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="email@exemplo.com"
              :disabled="modo === 'editar'"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition disabled:bg-gray-50 disabled:text-gray-400"
            />
            <p v-if="modo === 'editar'" class="text-xs text-gray-400 mt-1">E-mail não pode ser alterado por aqui.</p>
          </div>
          <div v-if="modo === 'criar'">
            <label class="text-sm font-medium text-gray-700 mb-2 block">Senha</label>
            <input
              v-model="form.senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>

          <!-- Papéis criação -->
          <div v-if="modo === 'criar'">
            <label class="text-sm font-medium text-gray-700 mb-3 block">Papéis</label>
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
                <button @click="removerPapelCriacao(papel)" class="hover:opacity-60 transition font-bold text-sm leading-none">×</button>
              </div>
              <span v-if="papeisCriacao.length === 0" class="text-xs text-gray-400">Nenhum papel selecionado.</span>
            </div>
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
                >
                  {{ opcao }}
                </option>
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

          <!-- Papéis edição -->
          <div v-if="modo === 'editar'">
            <label class="text-sm font-medium text-gray-700 mb-3 block">Papéis</label>
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
                <button @click="removerPapel(p.id)" class="hover:opacity-60 transition font-bold text-sm leading-none">×</button>
              </div>
              <span v-if="papeisUsuario.filter(p => p.ativo).length === 0" class="text-xs text-gray-400">Nenhum papel ativo.</span>
            </div>
            <div class="flex gap-2">
              <select
                v-model="novoPapel"
                class="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              >
                <option value="">Selecionar papel...</option>
                <option
                  v-for="opcao in ['ALUNO', 'PROFESSOR', 'ADMIN'].filter(o => !papeisUsuario.some(p => p.papel === o && p.ativo))"
                  :key="opcao"
                  :value="opcao"
                >
                  {{ opcao }}
                </option>
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
            {{ salvando ? 'Salvando...' : modo === 'criar' ? '✅ Criar Usuário' : '💾 Salvar' }}
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

// ── Estado ───────────────────────────────────────────────────────────
const loading = ref(true)
const usuarios = ref([])

const filtro = ref('')
const filtroTipo = ref('')
const filtroAtivo = ref('')
const filtroDataDe = ref('')
const filtroDataAte = ref('')

const ordemCol = ref('nome')
const ordemDir = ref('asc')

const painelAberto = ref(false)
const modo = ref('criar')
const salvando = ref(false)
const usuarioEditando = ref(null)
const papeisUsuario = ref([])
const novoPapel = ref('')
const usuarioParaDeletar = ref(null)
const deletando = ref(false)
const papeisCriacao = ref([])
const form = ref({ nome: '', email: '', senha: '' })

const detalhesAberto = ref(false)
const usuarioDetalhes = ref(null)
const detalhesExtra = ref(null)
const loadingDetalhes = ref(false)

// ── Auth ─────────────────────────────────────────────────────────────
const { data: authData } = await supabase.auth.getSession()
const usuarioLogadoId = authData?.session?.user?.id

const { data: papelLogado } = await supabase
  .from('usuario_papel')
  .select('papel')
  .eq('usuario_id', usuarioLogadoId)
  .eq('ativo', true)

const isAdminLogado = computed(() =>
  (papelLogado || []).some(p => p.papel === 'ADMIN')
)

// ── Colunas ───────────────────────────────────────────────────────────
const colunas = [
  { key: 'nome', label: 'Nome', align: 'left' },
  { key: 'email', label: 'E-mail', align: 'left' },
  { key: 'tipo_usuario', label: 'Tipo', align: 'center' },
  { key: 'ativo', label: 'Status', align: 'center' },
  { key: 'total_logins', label: 'Logins', align: 'center' },
  { key: 'ultimo_login', label: 'Último acesso', align: 'center' },
]

// ── Computed ──────────────────────────────────────────────────────────
const temFiltro = computed(() =>
  filtro.value || filtroTipo.value || filtroAtivo.value || filtroDataDe.value || filtroDataAte.value
)

const stats = computed(() => ({
  total: usuarios.value.length,
  logins: usuarios.value.reduce((s, r) => s + (r.total_logins ?? 0), 0),
  alunos: usuarios.value.filter(r => (r.papeis ?? []).includes('ALUNO')).length,
  professores: usuarios.value.filter(r => (r.papeis ?? []).includes('PROFESSOR')).length,
}))

const usuariosFiltrados = computed(() => {
  let lista = usuarios.value.filter(u => {
    const termo = filtro.value.trim().toLowerCase()
    const matchTexto =
      !termo ||
      (u.nome ?? '').toLowerCase().includes(termo) ||
      (u.email ?? '').toLowerCase().includes(termo)
    const matchTipo = !filtroTipo.value || (u.papeis ?? []).includes(filtroTipo.value)
    const matchAtivo = filtroAtivo.value === '' || String(u.ativo) === filtroAtivo.value
    const dtUltimo = u.ultimo_login ? u.ultimo_login.slice(0, 10) : null
    const matchDe = !filtroDataDe.value || (dtUltimo && dtUltimo >= filtroDataDe.value)
    const matchAte = !filtroDataAte.value || (dtUltimo && dtUltimo <= filtroDataAte.value)
    return matchTexto && matchTipo && matchAtivo && matchDe && matchAte
  })

  lista = [...lista].sort((a, b) => {
    let va = a[ordemCol.value]
    let vb = b[ordemCol.value]
    if (va == null) return 1
    if (vb == null) return -1
    if (typeof va === 'number') return ordemDir.value === 'asc' ? va - vb : vb - va
    va = String(va).toLowerCase()
    vb = String(vb).toLowerCase()
    if (va < vb) return ordemDir.value === 'asc' ? -1 : 1
    if (va > vb) return ordemDir.value === 'asc' ? 1 : -1
    return 0
  })

  return lista
})

// ── Helpers ───────────────────────────────────────────────────────────
function fmt(dtStr) {
  if (!dtStr) return '—'
  return new Date(dtStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
  })
}

function setOrdem(col) {
  if (ordemCol.value === col) {
    ordemDir.value = ordemDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    ordemCol.value = col
    ordemDir.value = col === 'total_logins' ? 'desc' : 'asc'
  }
}

function limparFiltros() {
  filtro.value = ''
  filtroTipo.value = ''
  filtroAtivo.value = ''
  filtroDataDe.value = ''
  filtroDataAte.value = ''
}

// ── Dados ─────────────────────────────────────────────────────────────
async function carregarUsuarios() {
  loading.value = true
  const { data, error } = await supabase
    .from('vw_usuarios_acessos')
    .select('*')
    .order('nome')
  if (error) {
    $toast.error('Erro ao carregar usuários.')
  } else {
    usuarios.value = data || []
  }
  loading.value = false
}

// ── Detalhes ──────────────────────────────────────────────────────────
async function abrirDetalhes(usuario) {
  usuarioDetalhes.value = usuario
  detalhesExtra.value = null
  detalhesAberto.value = true
  loadingDetalhes.value = true

  const [{ data: extra }, { data: turmasAluno }, { data: turmasProf }] = await Promise.all([
    supabase.from('usuarios')
      .select('estrelas, nivel_perfil, bonus_sequencia_semestre, ultimo_bonus_login_semana, avatar_bonus_concedido, perfil_bonus_concedido, documento_federal, curso, idade, data_nascimento')
      .eq('id', usuario.id)
      .single(),
    supabase.from('turma_aluno')
      .select('turma:turma_id(id, nome, status)')
      .eq('aluno_id', usuario.id),
    supabase.from('turma')
      .select('id, nome, status')
      .eq('professor_id', usuario.id),
  ])

  detalhesExtra.value = {
    ...(extra ?? {}),
    turmas: (turmasAluno ?? []).map(m => m.turma).filter(Boolean),
    turmasProf: turmasProf ?? [],
  }
  loadingDetalhes.value = false
}

function fecharDetalhes() {
  detalhesAberto.value = false
  usuarioDetalhes.value = null
  detalhesExtra.value = null
}

function editarDoDetalhes() {
  const u = usuarioDetalhes.value
  fecharDetalhes()
  abrirEdicao(u)
}

async function toggleAtivoDoDetalhes() {
  const u = usuarioDetalhes.value
  if (!u) return
  await toggleAtivo(u)
  const atualizado = usuarios.value.find(x => x.id === u.id)
  if (atualizado) usuarioDetalhes.value = atualizado
}

// ── CRUD ──────────────────────────────────────────────────────────────
function abrirCriacao() {
  modo.value = 'criar'
  form.value = { nome: '', email: '', senha: '' }
  papeisCriacao.value = []
  novoPapel.value = ''
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

async function confirmarDelecao() {
  if (!usuarioParaDeletar.value) return
  deletando.value = true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deletar-usuario`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ usuario_id: usuarioParaDeletar.value.id }),
      }
    )
    const resultado = await res.json()
    if (!res.ok) {
      $toast.error(resultado.error ?? 'Erro ao deletar usuário.')
      return
    }
    $toast.success('Usuário deletado com sucesso!')
    usuarioParaDeletar.value = null
    await carregarUsuarios()
  } catch (err) {
    console.error(err)
    $toast.error('Erro ao deletar usuário.')
  } finally {
    deletando.value = false
  }
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
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/criar-usuario`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token ?? ''}`,
          },
          body: JSON.stringify({
            nome: form.value.nome.trim(),
            email: form.value.email.trim(),
            senha: form.value.senha,
            papeis: papeisCriacao.value,
          }),
        }
      )
      const resultado = await res.json()
      if (!res.ok) {
        $toast.error(resultado.error ?? 'Erro ao criar usuário.')
        return
      }
      $toast.success('Usuário criado com sucesso!')
    } else {
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
