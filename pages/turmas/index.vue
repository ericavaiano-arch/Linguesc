<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <!-- Header -->
    <div class="mb-10 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold text-green-700">
          {{ isAdmin ? "Todas as Turmas" : "Minhas Turmas" }}
        </h1>
        <p class="text-gray-500 mt-2">
          {{
            isAdmin
              ? "Gerencie as turmas de todos os professores."
              : "Gerencie suas turmas e aulas."
          }}
        </p>
        <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
      </div>
      <button
        v-if="isAdmin"
        @click="abrirCriacao"
        class="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl transition active:scale-95 flex items-center gap-2"
      >
        + Nova Turma
      </button>
    </div>

    <!-- Filtro de professor (admin apenas) -->
    <div v-if="isAdmin" class="mb-8 flex items-center gap-3">
      <label class="text-sm font-medium text-gray-600"
        >Filtrar por professor:</label
      >
      <select
        v-model="professorFiltro"
        class="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
      >
        <option value="">Todos os professores</option>
        <option v-for="prof in professores" :key="prof.id" :value="prof.id">
          {{ prof.nome }}
        </option>
      </select>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div
        class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"
      ></div>
      <span>Carregando turmas...</span>
    </div>

    <div v-else class="space-y-10">
      <!-- ── VISÃO ADMIN: agrupado por professor ── -->
      <template v-if="isAdmin">
        <div
          v-for="grupo in gruposFiltrados"
          :key="grupo.professorId"
          class="space-y-4"
        >
          <!-- Cabeçalho do grupo -->
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0"
            >
              {{ grupo.professorNome.charAt(0).toUpperCase() }}
            </div>
            <h2 class="text-base font-semibold text-gray-700">
              {{ grupo.professorNome }}
            </h2>
            <span
              class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full"
            >
              {{ grupo.turmasAtivas.length }} ativa(s)
              <template v-if="grupo.turmasFinalizadas.length > 0">
                · {{ grupo.turmasFinalizadas.length }} finalizada(s)
              </template>
            </span>
            <div class="flex-1 h-px bg-gray-200"></div>
          </div>

          <!-- Turmas ativas -->
          <div
            v-if="grupo.turmasAtivas.length === 0"
            class="ml-11 text-sm text-gray-400 italic"
          >
            Nenhuma turma ativa.
          </div>
          <div
            v-else
            class="ml-11 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <div
              v-for="turma in grupo.turmasAtivas"
              :key="turma.id"
              class="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-green-400 transition-all duration-200"
            >
              <div
                class="flex items-start justify-between mb-3"
              >
                <div class="flex-1 min-w-0 pr-2">
                  <h2
                    class="text-base font-semibold text-gray-800 group-hover:text-green-700 transition truncate"
                  >
                    {{ turma.nome }}
                  </h2>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {{ turma.sala != null ? "Sala " + turma.sala : "" }}
                  </p>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {{ turma.turma_aluno[0]?.count ?? 0 }} aluno(s)
                  </p>
                </div>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <div class="relative">
                    <button
                      @click.stop="toggleMenu(turma.id)"
                      class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition text-lg"
                    >
                      ⋮
                    </button>
                    <Transition name="dropdown">
                      <div
                        v-if="menuAberto === turma.id"
                        class="absolute right-0 top-9 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden"
                      >
                        <button
                          @click.stop="
                            $router.push(`/chamada-manual/${turma.id}`)
                          "
                          class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                        >
                          ✅ <span>Fazer Chamada</span>
                        </button>
                        <button
                          @click.stop="navegar(`/turmas/${turma.id}/aulas`)"
                          class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                        >
                          📅 <span>Cadastrar Aulas</span>
                        </button>
                        <button
                          @click.stop="navegar(`/turmas/${turma.id}/relatorio`)"
                          class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                        >
                          📄 <span>Relatório</span>
                        </button>
                        <button
                          v-if="isAdmin"
                          @click.stop="abrirEdicaoMenu(turma)"
                          class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                        >
                          ✏️ <span>Editar turma</span>
                        </button>
                        <div class="border-t border-gray-100 my-1"></div>
                        <button
                          @click.stop="confirmarEncerramentoMenu(turma)"
                          class="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition flex items-center gap-2"
                        >
                          🔒 <span>Encerrar turma</span>
                        </button>
                      </div>
                    </Transition>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Turmas finalizadas -->
          <div v-if="grupo.turmasFinalizadas.length > 0" class="ml-11">
            <p
              class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3"
            >
              🔒 Finalizadas
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div
                v-for="turma in grupo.turmasFinalizadas"
                :key="turma.id"
                class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm opacity-70"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0 pr-2">
                    <h2 class="text-base font-semibold text-gray-500 truncate">
                      {{ turma.nome }}
                    </h2>
                    <p class="text-xs text-gray-400 mt-0.5">
                      {{ turma.turma_aluno[0]?.count ?? 0 }} aluno(s)
                    </p>
                  </div>
                  <div class="flex items-center gap-1 flex-shrink-0">
                    <span
                      class="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium"
                      >Finalizada</span
                    >
                    <div class="relative">
                      <button
                        @click.stop="toggleMenu(turma.id)"
                        class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition text-lg"
                      >
                        ⋮
                      </button>
                      <Transition name="dropdown">
                        <div
                          v-if="menuAberto === turma.id"
                          class="absolute right-0 top-9 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden"
                        >
                          <button
                            @click="navegar(`/turmas/${turma.id}/relatorio`)"
                            class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                          >
                            📄 <span>Relatório</span>
                          </button>
                          <div class="border-t border-gray-100 my-1"></div>
                          <button
                            @click="reativarTurmaMenu(turma)"
                            class="w-full text-left px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 transition flex items-center gap-2"
                          >
                            ↩ <span>Reativar turma</span>
                          </button>
                        </div>
                      </Transition>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sem resultados -->
        <div
          v-if="gruposFiltrados.length === 0"
          class="text-center py-16 text-gray-400"
        >
          <p class="text-4xl mb-3">📭</p>
          <p class="font-medium">Nenhuma turma encontrada.</p>
        </div>
      </template>

      <!-- ── VISÃO PROFESSOR: igual ao original ── -->
      <template v-else>
        <div>
          <div
            v-if="turmasAtivas.length === 0"
            class="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center"
          >
            <p class="text-4xl mb-4">📚</p>
            <p class="text-gray-500 font-medium">Nenhuma turma ativa.</p>
            <button
              @click="abrirCriacao"
              class="mt-4 text-green-600 font-semibold hover:underline text-sm"
            >
              Criar minha primeira turma →
            </button>
          </div>
          <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <div
              v-for="turma in turmasAtivas"
              :key="turma.id"
              class="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-green-400 transition-all duration-200"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1 min-w-0 pr-2">
                  <h2
                    class="text-base font-semibold text-gray-800 group-hover:text-green-700 transition truncate"
                  >
                    {{ turma.nome }}
                  </h2>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {{ turma.sala != null ? "Sala " + turma.sala : "" }}
                  </p>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {{ turma.turma_aluno[0]?.count ?? 0 }} aluno(s)
                  </p>
                </div>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <div class="relative">
                    <button
                      @click.stop="toggleMenu(turma.id)"
                      class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition text-lg"
                    >
                      ⋮
                    </button>
                    <Transition name="dropdown">
                      <div
                        v-if="menuAberto === turma.id"
                        class="absolute right-0 top-9 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden"
                      >
                        <button
                          @click.stop="
                            $router.push(`/chamada-manual/${turma.id}`)
                          "
                          class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                        >
                          ✅ <span>Fazer Chamada</span>
                        </button>
                        <button
                          @click.stop="navegar(`/turmas/${turma.id}/aulas`)"
                          class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                        >
                          📅 <span>Cadastrar Aulas</span>
                        </button>
                        <button
                          @click.stop="navegar(`/turmas/${turma.id}/relatorio`)"
                          class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                        >
                          📄 <span>Relatório</span>
                        </button>
                        <button
                          v-if="isAdmin"
                          @click.stop="abrirEdicaoMenu(turma)"
                          class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                        >
                          ✏️ <span>Editar turma</span>
                        </button>
                        <div class="border-t border-gray-100 my-1"></div>
                        <button
                          @click.stop="confirmarEncerramentoMenu(turma)"
                          class="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition flex items-center gap-2"
                        >
                          🔒 <span>Encerrar turma</span>
                        </button>
                      </div>
                    </Transition>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="turmasFinalizadas.length > 0">
          <h2
            class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4"
          >
            🔒 Turmas Finalizadas
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div
              v-for="turma in turmasFinalizadas"
              :key="turma.id"
              class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm opacity-70"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0 pr-2">
                  <h2 class="text-base font-semibold text-gray-500 truncate">
                    {{ turma.nome }}
                  </h2>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {{ turma.turma_aluno[0]?.count ?? 0 }} aluno(s)
                  </p>
                </div>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <span
                    class="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium"
                    >Finalizada</span
                  >
                  <div class="relative">
                    <button
                      @click.stop="toggleMenu(turma.id)"
                      class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition text-lg"
                    >
                      ⋮
                    </button>
                    <Transition name="dropdown">
                      <div
                        v-if="menuAberto === turma.id"
                        class="absolute right-0 top-9 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden"
                      >
                        <button
                          @click="navegar(`/turmas/${turma.id}/relatorio`)"
                          class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                        >
                          📄 <span>Relatório</span>
                        </button>
                        <div class="border-t border-gray-100 my-1"></div>
                        <button
                          @click="reativarTurmaMenu(turma)"
                          class="w-full text-left px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 transition flex items-center gap-2"
                        >
                          ↩ <span>Reativar turma</span>
                        </button>
                      </div>
                    </Transition>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ── MODAL DE CONFIRMAÇÃO ── -->
    <Transition name="fade">
      <div
        v-if="modalEncerramento"
        class="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-4"
      >
        <div class="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">
            🔒 Encerrar turma?
          </h3>
          <p class="text-sm text-gray-500 mb-1">
            Você está prestes a encerrar a turma
            <strong>{{ turmaParaEncerrar?.nome }}</strong
            >.
          </p>
          <p class="text-sm text-gray-400 mb-6">
            Os dados serão preservados, mas a turma ficará bloqueada para novos
            registros. Você pode reativá-la depois.
          </p>
          <div class="flex gap-3">
            <button
              @click="modalEncerramento = false"
              class="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              @click="encerrarTurma"
              :disabled="encerrando"
              class="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              <div
                v-if="encerrando"
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></div>
              {{ encerrando ? "Encerrando..." : "Encerrar" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── OVERLAY DRAWER ── -->
    <Transition name="fade">
      <div
        v-if="painelAberto"
        class="fixed inset-0 bg-black/40 z-[60]"
        @click="fecharPainel"
      ></div>
    </Transition>

    <!-- ── DRAWER ── -->
    <Transition name="slide">
      <div
        v-if="painelAberto"
        class="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
      >
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-lg font-semibold text-gray-800">
            {{ modo === "criar" ? "➕ Nova Turma" : "✏️ Editar Turma" }}
          </h2>
          <button
            @click="fecharPainel"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition text-xl"
          >
            ×
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- Seletor de professor (admin + modo criar) -->
          <div v-if="isAdmin && modo === 'criar'">
            <label class="text-sm font-medium text-gray-700 mb-2 block"
              >Professor responsável</label
            >
            <select
              v-model="professorSelecionadoCriacao"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            >
              <option value="">Selecione um professor...</option>
              <option
                v-for="prof in professores"
                :key="prof.id"
                :value="prof.id"
              >
                {{ prof.nome }}
              </option>
            </select>
          </div>

          <!-- Professor read-only no modo editar (admin) -->
          <div
            v-if="isAdmin && modo === 'editar'"
            class="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
          >
            <p class="text-xs text-gray-400 mb-1">Professor responsável</p>
            <p class="text-sm font-semibold text-gray-700">
              {{ turmaSelecionada?.professor_nome ?? "—" }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block"
              >Identificador da Turma</label
            >
            <input
              v-model="edicaoIdentificador"
              type="text"
              placeholder="Ex: Básico 1, Intermediário 2B..."
              class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block"
                >Ano</label
              >
              <select
                v-model="edicaoAno"
                class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              >
                <option v-for="ano in anosDisponiveis" :key="ano" :value="ano">
                  {{ ano }}
                </option>
              </select>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block"
                >Semestre</label
              >
              <select
                v-model="edicaoSemestre"
                class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              >
                <option value="01">1º semestre</option>
                <option value="02">2º semestre</option>
              </select>
            </div>
          </div>

          <div
            v-if="edicaoIdentificador.trim()"
            class="bg-green-50 border border-green-200 rounded-xl px-4 py-3"
          >
            <p class="text-xs text-gray-400 mb-1">Nome gerado:</p>
            <p class="text-sm font-semibold text-green-800">{{ nomeGerado }}</p>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block">
              Sala de Aula
              <span class="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              v-model="edicaoSala"
              type="text"
              placeholder="Ex: Sala 3, Lab 2..."
              class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>

          <div v-if="modo === 'editar'">
            <p class="text-sm font-medium text-gray-700 mb-3">
              Alunos na turma
              <span class="text-xs text-gray-400 font-normal ml-1"
                >({{ edicaoAlunos.length }} matriculado(s))</span
              >
            </p>
            <div
              v-if="loadingAlunos"
              class="flex items-center gap-2 text-green-700 text-sm py-2"
            >
              <div
                class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"
              ></div>
              Carregando...
            </div>
            <ul v-else-if="edicaoAlunos.length > 0" class="space-y-2 mb-4">
              <li
                v-for="aluno in edicaoAlunos"
                :key="aluno.id"
                class="flex items-center justify-between px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl"
              >
                <span class="text-sm font-medium text-green-800">{{
                  aluno.nome
                }}</span>
                <button
                  @click="removerAluno(aluno.id)"
                  class="text-gray-300 hover:text-red-500 transition font-bold text-lg leading-none"
                >
                  ×
                </button>
              </li>
            </ul>
            <p v-else class="text-sm text-gray-400 text-center py-3 mb-4">
              Nenhum aluno na turma.
            </p>
          </div>

          <div v-if="modo === 'criar' && edicaoAlunos.length > 0">
            <p class="text-xs text-gray-500 font-medium mb-2">
              {{ edicaoAlunos.length }} aluno(s) selecionado(s):
            </p>
            <ul class="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
              <li
                v-for="aluno in edicaoAlunos"
                :key="aluno.id"
                class="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-xs px-3 py-1.5 rounded-full"
              >
                {{ aluno.nome }}
                <button
                  @click="removerAluno(aluno.id)"
                  class="hover:text-red-500 transition font-bold leading-none"
                >
                  ×
                </button>
              </li>
            </ul>
          </div>

          <div>
            <p class="text-sm font-medium text-gray-700 mb-2">
              Adicionar alunos
            </p>
            <div class="relative mb-3">
              <input
                v-model="filtroEdicao"
                type="text"
                placeholder="Filtrar por nome ou e-mail..."
                class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
              <div v-if="loadingAlunos" class="absolute right-3 top-3.5">
                <div
                  class="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"
                ></div>
              </div>
            </div>
            <ul
              class="border border-gray-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-gray-100"
            >
              <li
                v-if="todosAlunosFiltrados.length === 0"
                class="px-4 py-3 text-sm text-gray-400 text-center"
              >
                Nenhum aluno encontrado.
              </li>
              <li
                v-for="aluno in todosAlunosFiltrados"
                :key="aluno.id"
                class="flex items-center justify-between px-4 py-3 transition"
                :class="
                  jaMatriculadoEmOutraTurma(aluno.id) ||
                  edicaoAlunos.some((a) => a.id === aluno.id)
                    ? 'bg-gray-50'
                    : 'hover:bg-gray-50'
                "
              >
                <div>
                  <p
                    class="text-sm font-medium"
                    :class="
                      jaMatriculadoEmOutraTurma(aluno.id)
                        ? 'text-gray-400'
                        : 'text-gray-800'
                    "
                  >
                    {{ aluno.nome }}
                  </p>
                  <p class="text-xs text-gray-400">{{ aluno.email }}</p>
                  <p
                    v-if="jaMatriculadoEmOutraTurma(aluno.id)"
                    class="text-xs text-orange-500 font-medium mt-0.5"
                  >
                    ⚠️ Já matriculado em "{{ nomeTurmaDoAluno(aluno.id) }}"
                  </p>
                </div>
                <button
                  @click="adicionarAluno(aluno)"
                  :disabled="
                    jaMatriculadoEmOutraTurma(aluno.id) ||
                    edicaoAlunos.some((a) => a.id === aluno.id)
                  "
                  class="text-xs px-3 py-1.5 rounded-lg font-semibold transition flex-shrink-0 ml-3"
                  :class="
                    jaMatriculadoEmOutraTurma(aluno.id)
                      ? 'bg-orange-50 text-orange-400 cursor-not-allowed'
                      : edicaoAlunos.some((a) => a.id === aluno.id)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                  "
                >
                  {{
                    jaMatriculadoEmOutraTurma(aluno.id)
                      ? "Bloqueado"
                      : edicaoAlunos.some((a) => a.id === aluno.id)
                        ? "✓"
                        : "+ Adicionar"
                  }}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div class="p-6 border-t">
          <button
            @click="salvar"
            :disabled="
              salvando ||
              !edicaoIdentificador.trim() ||
              (isAdmin && modo === 'criar' && !professorSelecionadoCriacao)
            "
            class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
          >
            <div
              v-if="salvando"
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></div>
            {{
              salvando
                ? "Salvando..."
                : modo === "criar"
                  ? "✅ Criar Turma"
                  : "💾 Salvar Alterações"
            }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { supabase } from "~/utils/supabase";

definePageMeta({ middleware: "professor" });

const { $toast } = useNuxtApp();
const router = useRouter();
const { user, isAdmin } = useAuth();

const turmas = ref([]);
const professores = ref([]);
const loading = ref(true);
const menuAberto = ref(null);

const modalEncerramento = ref(false);
const turmaParaEncerrar = ref(null);
const encerrando = ref(false);

const painelAberto = ref(false);
const modo = ref("criar");
const salvando = ref(false);
const loadingAlunos = ref(false);
const turmaSelecionada = ref(null);
const edicaoAlunos = ref([]);
const alunosOriginais = ref([]);
const todosAlunos = ref([]);
const filtroEdicao = ref("");
const mapaMatriculas = ref({});

const edicaoIdentificador = ref("");
const edicaoAno = ref(new Date().getFullYear());
const edicaoSemestre = ref(new Date().getMonth() < 6 ? "01" : "02");
const edicaoSala = ref("");
const professorSelecionadoCriacao = ref("");

const professorFiltro = ref("");

const anosDisponiveis = computed(() => {
  const atual = new Date().getFullYear();
  return [
    atual - 3,
    atual - 2,
    atual - 1,
    atual,
    atual + 1,
    atual + 2,
    atual + 3,
  ];
});

const nomeGerado = computed(() =>
  edicaoIdentificador.value.trim()
    ? `${edicaoIdentificador.value.trim()} - ${edicaoAno.value}/${edicaoSemestre.value}`
    : "",
);

// Visão professor
const turmasAtivas = computed(() =>
  turmas.value.filter((t) => t.status !== "FINALIZADA"),
);
const turmasFinalizadas = computed(() =>
  turmas.value.filter((t) => t.status === "FINALIZADA"),
);

// Visão admin: agrupado por professor
const grupos = computed(() => {
  const mapa = {};
  for (const turma of turmas.value) {
    const pid = turma.professor_id;
    if (!mapa[pid]) {
      mapa[pid] = {
        professorId: pid,
        professorNome: turma.professor_nome ?? "Professor desconhecido",
        turmasAtivas: [],
        turmasFinalizadas: [],
      };
    }
    if (turma.status === "FINALIZADA") {
      mapa[pid].turmasFinalizadas.push(turma);
    } else {
      mapa[pid].turmasAtivas.push(turma);
    }
  }
  return Object.values(mapa).sort((a, b) =>
    a.professorNome.localeCompare(b.professorNome),
  );
});

const gruposFiltrados = computed(() => {
  if (!professorFiltro.value) return grupos.value;
  return grupos.value.filter((g) => g.professorId === professorFiltro.value);
});

const todosAlunosFiltrados = computed(() => {
  const termo = filtroEdicao.value.trim().toLowerCase();
  const disponiveis = todosAlunos.value.filter(
    (a) => !jaMatriculadoEmOutraTurma(a.id),
  );
  const lista = termo
    ? disponiveis.filter(
        (a) =>
          a.nome.toLowerCase().includes(termo) ||
          a.email.toLowerCase().includes(termo),
      )
    : disponiveis;
  return [...lista].sort((a, b) => a.nome.localeCompare(b.nome));
});

function toggleMenu(turmaId) {
  menuAberto.value = menuAberto.value === turmaId ? null : turmaId;
}

function navegar(rota) {
  menuAberto.value = null;
  router.push(rota);
}

function abrirEdicaoMenu(turma) {
  menuAberto.value = null;
  abrirEdicao(turma);
}

function confirmarEncerramentoMenu(turma) {
  menuAberto.value = null;
  confirmarEncerramento(turma);
}

function reativarTurmaMenu(turma) {
  menuAberto.value = null;
  reativarTurma(turma);
}

function fecharMenuFora() {
  menuAberto.value = null;
}
onMounted(() => document.addEventListener("click", fecharMenuFora));
onUnmounted(() => document.removeEventListener("click", fecharMenuFora));

function jaMatriculadoEmOutraTurma(alunoId) {
  const matricula = mapaMatriculas.value[alunoId];
  if (!matricula) return false;
  if (modo.value === "editar" && turmaSelecionada.value)
    return matricula.turmaId !== turmaSelecionada.value.id;
  return true;
}

function nomeTurmaDoAluno(alunoId) {
  return mapaMatriculas.value[alunoId]?.turmaNome || "";
}

async function carregarTurmas() {
  loading.value = true;
  const professorId = user.value?.id;
  if (!professorId) {
    loading.value = false;
    return;
  }

  let query = supabase
    .from("turma")
    .select(
      `
      *,
      turma_aluno(count),
      usuarios_completo!professor_id(id, nome)
    `,
    )
    .order("nome", { ascending: true });

  if (!isAdmin.value) {
    query = query.eq("professor_id", professorId);
  }

  const { data, error } = await query;

  if (error) console.error(error.message);
  else {
    turmas.value = (data || []).map((t) => ({
      ...t,
      professor_nome: t.usuarios_completo?.nome ?? null,
    }));
  }

  loading.value = false;
}

async function carregarProfessores() {
  const { data } = await supabase
    .from("usuarios_completo")
    .select("id, nome")
    .eq("tipo_usuario", "PROFESSOR")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  professores.value = data || [];
}

async function carregarMatriculas() {
  const { data } = await supabase
    .from("turma_aluno")
    .select("aluno_id, turma_id, turma(id, nome)");

  const mapa = {};
  (data || []).forEach((v) => {
    mapa[v.aluno_id] = { turmaId: v.turma_id, turmaNome: v.turma?.nome || "" };
  });
  mapaMatriculas.value = mapa;
}

async function carregarTodosAlunos() {
  const { data } = await supabase
    .from("usuarios_completo")
    .select("id, nome, email, tipo_usuario, ativo")
    .eq("tipo_usuario", "ALUNO")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  todosAlunos.value = data || [];
}

function confirmarEncerramento(turma) {
  turmaParaEncerrar.value = turma;
  modalEncerramento.value = true;
}

async function encerrarTurma() {
  encerrando.value = true;
  const { error } = await supabase
    .from("turma")
    .update({ status: "FINALIZADA" })
    .eq("id", turmaParaEncerrar.value.id);

  if (error) {
    $toast.error("Erro ao encerrar turma.");
  } else {
    $toast.success(`Turma "${turmaParaEncerrar.value.nome}" encerrada.`);
    modalEncerramento.value = false;
    turmaParaEncerrar.value = null;
    await carregarTurmas();
  }
  encerrando.value = false;
}

async function reativarTurma(turma) {
  const { error } = await supabase
    .from("turma")
    .update({ status: "ATIVA" })
    .eq("id", turma.id);

  if (error) {
    $toast.error("Erro ao reativar turma.");
  } else {
    $toast.success(`Turma "${turma.nome}" reativada.`);
    await carregarTurmas();
  }
}

async function abrirCriacao() {
  modo.value = "criar";
  edicaoIdentificador.value = "";
  edicaoAno.value = new Date().getFullYear();
  edicaoSemestre.value = new Date().getMonth() < 6 ? "01" : "02";
  edicaoSala.value = "";
  edicaoAlunos.value = [];
  alunosOriginais.value = [];
  filtroEdicao.value = "";
  professorSelecionadoCriacao.value = "";
  painelAberto.value = true;
  loadingAlunos.value = true;
  await Promise.all([carregarTodosAlunos(), carregarMatriculas()]);
  loadingAlunos.value = false;
}

async function abrirEdicao(turma) {
  modo.value = "editar";
  turmaSelecionada.value = turma;
  edicaoAlunos.value = [];
  filtroEdicao.value = "";
  painelAberto.value = true;
  loadingAlunos.value = true;

  const partes = turma.nome.split(" - ");
  edicaoIdentificador.value = partes[0] ?? turma.nome;
  const sufixo = partes[1] ?? "";
  const [ano, sem] = sufixo.split("/");
  edicaoAno.value = Number(ano) || new Date().getFullYear();
  edicaoSemestre.value = sem || "01";
  edicaoSala.value = turma.sala ?? "";

  const [{ data: vinculos }, { data: todos }] = await Promise.all([
    supabase
      .from("turma_aluno")
      .select("aluno_id, usuarios_completo(id, nome, email)")
      .eq("turma_id", turma.id),
    supabase
      .from("usuarios_completo")
      .select("id, nome, email, tipo_usuario, ativo")
      .eq("tipo_usuario", "ALUNO")
      .eq("ativo", true)
      .order("nome", { ascending: true }),
  ]);

  await carregarMatriculas();

  edicaoAlunos.value = (vinculos || [])
    .map((v) => ({
      id: v.aluno_id,
      nome: v.usuarios_completo?.nome || "",
      email: v.usuarios_completo?.email || "",
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  alunosOriginais.value = edicaoAlunos.value.map((a) => a.id);
  todosAlunos.value = todos || [];
  loadingAlunos.value = false;
}

function fecharPainel() {
  painelAberto.value = false;
  turmaSelecionada.value = null;
}

function adicionarAluno(aluno) {
  if (jaMatriculadoEmOutraTurma(aluno.id)) return;
  if (!edicaoAlunos.value.some((a) => a.id === aluno.id)) {
    edicaoAlunos.value = [...edicaoAlunos.value, aluno].sort((a, b) =>
      a.nome.localeCompare(b.nome),
    );
  }
}

function removerAluno(id) {
  edicaoAlunos.value = edicaoAlunos.value.filter((a) => a.id !== id);
}

async function salvar() {
  if (!edicaoIdentificador.value.trim()) return;
  if (
    isAdmin.value &&
    modo.value === "criar" &&
    !professorSelecionadoCriacao.value
  )
    return;
  salvando.value = true;
  try {
    if (modo.value === "criar") await salvarCriacao();
    else await salvarEdicao();
  } catch (err) {
    console.error(err);
    $toast.error("Erro ao salvar.");
  } finally {
    salvando.value = false;
  }
}

async function salvarCriacao() {
  const professorId = isAdmin.value
    ? professorSelecionadoCriacao.value
    : user.value?.id;

  const nomeTrimmed = nomeGerado.value.trim();

  if (
    turmas.value.some((t) => t.nome.toLowerCase() === nomeTrimmed.toLowerCase())
  ) {
    $toast.error("Já existe uma turma com este nome.");
    return;
  }

  const { data: novaTurma, error } = await supabase
    .from("turma")
    .insert([
      {
        nome: nomeTrimmed,
        professor_id: professorId,
        sala: edicaoSala.value.trim() || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  if (edicaoAlunos.value.length > 0) {
    const { error: e } = await supabase.from("turma_aluno").insert(
      edicaoAlunos.value.map((a) => ({
        turma_id: novaTurma.id,
        aluno_id: a.id,
      })),
    );
    if (e) throw e;
  }

  $toast.success("Turma criada com sucesso!");
  fecharPainel();
  await carregarTurmas();
}

async function salvarEdicao() {
  const nomeTrimmed = nomeGerado.value.trim();
  const turmaId = turmaSelecionada.value.id;

  if (
    turmas.value.some(
      (t) =>
        t.nome.toLowerCase() === nomeTrimmed.toLowerCase() && t.id !== turmaId,
    )
  ) {
    $toast.error("Já existe uma turma com este nome.");
    return;
  }

  const promessas = [];

  if (
    nomeTrimmed !== turmaSelecionada.value.nome ||
    edicaoSala.value.trim() !== (turmaSelecionada.value.sala ?? "")
  ) {
    promessas.push(
      supabase
        .from("turma")
        .update({ nome: nomeTrimmed, sala: edicaoSala.value.trim() || null })
        .eq("id", turmaId),
    );
  }

  const idsAtuais = edicaoAlunos.value.map((a) => a.id);
  const aInserir = idsAtuais.filter(
    (id) => !alunosOriginais.value.includes(id),
  );
  const aRemover = alunosOriginais.value.filter(
    (id) => !idsAtuais.includes(id),
  );

  if (aInserir.length > 0) {
    promessas.push(
      supabase
        .from("turma_aluno")
        .insert(aInserir.map((aluno_id) => ({ turma_id: turmaId, aluno_id }))),
    );
  }
  if (aRemover.length > 0) {
    promessas.push(
      supabase
        .from("turma_aluno")
        .delete()
        .eq("turma_id", turmaId)
        .in("aluno_id", aRemover),
    );
  }

  if (promessas.length === 0) {
    $toast.warning("Nenhuma alteração detectada.");
    return;
  }

  const resultados = await Promise.all(promessas);
  const erros = resultados.filter((r) => r.error);
  if (erros.length > 0) throw erros[0].error;

  $toast.success("Turma atualizada com sucesso!");
  fecharPainel();
  await carregarTurmas();
}

onMounted(async () => {
  await carregarTurmas();
  if (isAdmin.value) {
    await carregarProfessores();
  }
});
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
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
