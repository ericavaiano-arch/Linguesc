<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col items-center justify-start py-10 px-4">
    <!-- Logo / Cabeçalho -->
    <div class="mb-8 text-center">
      <div class="flex justify-center items-center gap-5 mb-3">
        <img src="~/assets/images/logo_linguesc.png" alt="Linguesc" class="h-14 w-auto" />
        <div class="w-px h-10 bg-gray-200 rounded-full"></div>
        <img src="~/assets/images/logo_udesc.png" alt="UDESC Joinville" class="h-11 w-auto" />
      </div>
      <p class="text-sm text-gray-500">Inscrição de estudante</p>
    </div>

    <!-- PASSO: AUTH -->
    <Transition name="fade" mode="out-in">
      <div v-if="passo === 'auth'" key="auth" class="w-full max-w-md">
        <div class="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <!-- escolher modo -->
          <div v-if="modoAuth === 'escolher'">
            <h2 class="text-xl font-bold text-gray-800 mb-1">Bem-vindo(a)!</h2>
            <p class="text-sm text-gray-500 mb-6">Para se inscrever, nos diga se você já tem uma conta.</p>
            <div class="space-y-3">
              <button
                @click="modoAuth = 'cadastro'"
                class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition active:scale-95"
              >
                Quero me cadastrar
              </button>
              <button
                @click="modoAuth = 'login'"
                class="w-full border border-gray-300 hover:border-green-500 text-gray-700 font-semibold py-3.5 rounded-xl transition active:scale-95"
              >
                Já tenho uma conta
              </button>
            </div>
          </div>

          <!-- Login -->
          <div v-else-if="modoAuth === 'login'">
            <button @click="modoAuth = 'escolher'" class="text-sm text-green-600 hover:underline mb-4 flex items-center gap-1">← Voltar</button>
            <h2 class="text-xl font-bold text-gray-800 mb-1">Entrar com minha conta</h2>
            <p class="text-sm text-gray-500 mb-6">Use as credenciais que você já possui no Linguesc.</p>
            <form @submit.prevent="fazerLogin" class="space-y-4">
              <div>
                <label class="text-sm font-medium text-gray-700 mb-1.5 block">E-mail</label>
                <input
                  v-model="loginEmail"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="seu@email.com"
                  class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 mb-1.5 block">Senha</label>
                <input
                  v-model="loginSenha"
                  type="password"
                  required
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              </div>
              <p v-if="erroAuth" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{{ erroAuth }}</p>
              <button
                type="submit"
                :disabled="carregandoAuth"
                class="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition active:scale-95"
              >
                <span v-if="carregandoAuth">Entrando...</span>
                <span v-else>Entrar</span>
              </button>
            </form>
          </div>

          <!-- Cadastro -->
          <div v-else-if="modoAuth === 'cadastro'">
            <button @click="modoAuth = 'escolher'" class="text-sm text-green-600 hover:underline mb-4 flex items-center gap-1">← Voltar</button>
            <h2 class="text-xl font-bold text-gray-800 mb-1">Criar minha conta</h2>
            <p class="text-sm text-gray-500 mb-6">Preencha os dados para se pré-cadastrar.</p>
            <form @submit.prevent="fazerCadastro" class="space-y-4">
              <div>
                <label class="text-sm font-medium text-gray-700 mb-1.5 block">Nome completo</label>
                <input
                  v-model="cadNome"
                  type="text"
                  required
                  placeholder="Seu nome"
                  class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 mb-1.5 block">E-mail</label>
                <input
                  v-model="cadEmail"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="seu@email.com"
                  class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 mb-1.5 block">CPF</label>
                <input
                  v-model="cadCpf"
                  type="text"
                  required
                  maxlength="14"
                  placeholder="000.000.000-00"
                  @input="mascaraCpf"
                  class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 mb-1.5 block">Data de nascimento</label>
                <input
                  v-model="cadDataNasc"
                  type="date"
                  required
                  class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 mb-1.5 block">Gênero</label>
                <select
                  v-model="cadGenero"
                  required
                  class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition bg-white"
                >
                  <option value="">Selecione...</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Prefiro não informar">Prefiro não informar</option>
                  <option value="Outro">Outro</option>
                </select>
                <input
                  v-if="cadGenero === 'Outro'"
                  v-model="cadGeneroOutro"
                  type="text"
                  maxlength="60"
                  placeholder="Como você se identifica?"
                  class="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              </div>
              <div>
                <label class="text-sm font-medium text-gray-700 mb-1.5 block">Senha</label>
                <input
                  v-model="cadSenha"
                  type="password"
                  required
                  minlength="8"
                  autocomplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              </div>
              <p v-if="erroAuth" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{{ erroAuth }}</p>
              <button
                type="submit"
                :disabled="carregandoAuth"
                class="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition active:scale-95"
              >
                <span v-if="carregandoAuth">Criando conta...</span>
                <span v-else>Criar conta e continuar</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </Transition>

    <!-- PASSO: NÍVEL -->
    <Transition name="fade" mode="out-in">
      <div v-if="passo === 'nivel'" key="nivel" class="w-full max-w-3xl">
        <div class="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <h2 class="text-xl font-bold text-gray-800 mb-1">Qual é o seu nível de inglês?</h2>
          <p class="text-sm text-gray-500 mb-7">Leia as descrições e clique em <strong>Selecionar</strong> no nível que melhor combina com você.</p>
          <div class="space-y-4">
            <div
              v-for="n in NIVEIS"
              :key="n.id"
              class="border-2 rounded-2xl p-6 transition-all"
              :class="nivelSelecionado?.id === n.id ? 'border-green-500 bg-green-50' : 'border-gray-200'"
            >
              <div class="flex items-start gap-4">
                <!-- <span class="text-3xl mt-0.5 shrink-0">{{ n.emoji }}</span> -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-4 flex-wrap">
                    <h3 class="font-bold text-gray-800 text-base">{{ n.label }}</h3>
                    <button
                      @click="confirmarNivel(n)"
                      class="shrink-0 px-5 py-2 rounded-xl text-sm font-semibold transition active:scale-95"
                      :class="nivelSelecionado?.id === n.id
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700'"
                    >
                      {{ nivelSelecionado?.id === n.id ? '✓ Selecionado' : 'Selecionar →' }}
                    </button>
                  </div>
                  <p class="text-sm font-medium text-gray-600 mt-1 mb-3">{{ n.desc }}</p>
                  <p class="text-sm text-gray-400 leading-relaxed border-t border-gray-100 pt-3">{{ n.detalhe }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- PASSO: TURMA -->
    <Transition name="fade" mode="out-in">
      <div v-if="passo === 'turma'" key="turma" class="w-full max-w-xl">
        <div class="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <button @click="inscricaoExistente ? null : passo = 'nivel'" :class="inscricaoExistente ? 'hidden' : ''" class="text-sm text-green-600 hover:underline mb-4 flex items-center gap-1">← Voltar ao nível</button>

          <!-- Banner de pré-inscrição existente -->
          <div v-if="inscricaoExistente" class="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 flex items-start gap-3 mb-5">
            <span class="text-xl flex-shrink-0">📋</span>
            <div>
              <p class="text-sm font-semibold text-amber-800">Você já tem uma pré-inscrição</p>
              <p class="text-xs text-amber-600 mt-0.5">Suas escolhas anteriores foram carregadas abaixo. Selecione outra turma se quiser atualizar.</p>
              <button @click="passo = 'nivel'" class="text-xs text-amber-700 underline mt-1">Alterar nível →</button>
            </div>
          </div>

          <h2 class="text-xl font-bold text-gray-800 mb-1">{{ inscricaoExistente ? 'Sua pré-inscrição' : 'Escolha sua turma' }}</h2>
          <p class="text-sm text-gray-500 mb-2">
            Mostrando turmas disponíveis para
            <span class="font-semibold text-green-700">Nível: {{ nivelSelecionado?.label }}</span>
            abaixo.
          </p>
          <div class="w-full h-px bg-gray-100 mb-2"></div>

          <div v-if="carregandoTurmas" class="flex items-center gap-2 text-green-700 text-sm py-6 justify-center">
            <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            Carregando turmas...
          </div>

          <!-- Modo pré-inscrição existente: exibe apenas a turma já escolhida -->
          <div v-else-if="inscricaoExistente && !modoTrocarTurma" class="mt-4">
            <div v-if="turmaClicada" class="border-2 border-green-500 bg-green-50 rounded-2xl px-5 py-4">
              <div class="flex items-start justify-between gap-2">
                <h3 class="font-semibold text-gray-800 text-sm">{{ turmaClicada.nome }}</h3>
                <span class="shrink-0 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">✓ Selecionada</span>
              </div>
              <p v-if="turmaClicada.professor_nome" class="text-xs text-gray-500 mt-0.5">👤 {{ turmaClicada.professor_nome }}</p>
              <p v-if="turmaClicada.sala" class="text-xs text-gray-400 mt-0.5">Sala {{ turmaClicada.sala }}</p>
              <p v-if="turmaClicada.descricao" class="text-xs text-gray-400 mt-0.5">{{ turmaClicada.descricao }}</p>
              <div v-if="turmaClicada.horarios?.length" class="mt-3 space-y-2">
                <div
                  v-for="h in turmaClicada.horarios"
                  :key="h.dia + h.hora"
                  class="flex items-center gap-3 bg-white border border-green-200 rounded-xl px-4 py-2.5"
                >
                  <span class="text-lg shrink-0">📅</span>
                  <div>
                    <p class="text-sm font-semibold text-gray-800">{{ h.toda }} · {{ h.hora }}<span v-if="h.horaFim"> – {{ h.horaFim }}</span></p>
                    <p class="text-xs text-gray-400">Semanalmente · {{ h.count }} encontro{{ h.count !== 1 ? 's' : '' }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="py-4 text-sm text-gray-400 italic">Nenhuma turma selecionada anteriormente.</div>
            <div class="mt-4 flex flex-col gap-2">
              <button
                @click="confirmarInscricao"
                :disabled="salvandoInscricao"
                class="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition active:scale-95"
              >
                <span v-if="salvandoInscricao">Salvando...</span>
                <span v-else>Confirmar pré-inscrição</span>
              </button>
              <button
                @click="modoTrocarTurma = true"
                class="w-full text-sm text-green-700 border border-green-300 hover:bg-green-50 py-2.5 rounded-xl transition font-medium"
              >
                Trocar turma →
              </button>
            </div>
            <p v-if="erroInscricao" class="text-sm text-red-600 mt-2 text-center">{{ erroInscricao }}</p>
          </div>

          <div v-else-if="!inscricaoExistente && turmasFiltradas.length === 0" class="text-center py-8">
            <div class="text-4xl mb-3">📭</div>
            <p class="text-gray-500 text-sm">Nenhuma turma disponível no momento.</p>
            <p class="text-gray-400 text-xs mt-1">Por favor, entre em contato em: linguesc.cct@udesc.br ou udescinteragir@gmail.com</p>
          </div>

          <div v-else-if="!inscricaoExistente || modoTrocarTurma" class="mt-4 space-y-6">
            <div v-if="modoTrocarTurma" class="flex items-center gap-2 mb-2">
              <button @click="modoTrocarTurma = false; turmaClicada = turmaAnterior" class="text-xs text-green-600 hover:underline flex items-center gap-1">← Manter turma atual</button>
            </div>

            <!-- Turmas do nível exato -->
            <div v-if="turmasNivelExato.length">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-xs font-bold text-green-700 uppercase tracking-wide">Turmas do seu nível</span>
                <div class="flex-1 h-px bg-green-100"></div>
                <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Nível: {{ nivelSelecionado?.label }}</span>
              </div>
              <div class="space-y-2">
                <button
                  v-for="turma in turmasNivelExato"
                  :key="turma.id"
                  @click="clicarTurma(turma)"
                  class="w-full text-left border-2 rounded-2xl px-5 py-4 transition-all hover:shadow-md active:scale-98"
                  :class="turmaClicada?.id === turma.id ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-green-400'"
                >
                  <div class="flex items-start justify-between gap-2">
                    <h3 class="font-semibold text-gray-800 text-sm">{{ turma.nome }}</h3>
                    <span v-if="turmaClicada?.id === turma.id" class="shrink-0 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">✓ Selecionada</span>
                  </div>
                  <p v-if="turma.professor_nome" class="text-xs text-gray-500 mt-0.5">👤 {{ turma.professor_nome }}</p>
                  <p v-if="turma.sala" class="text-xs text-gray-400 mt-0.5">Sala {{ turma.sala }}</p>
                  <p v-if="turma.descricao" class="text-xs text-gray-400 mt-0.5">{{ turma.descricao }}</p>
                  <div v-if="turma.horarios?.length" class="mt-3 space-y-2">
                    <div
                      v-for="h in turma.horarios"
                      :key="h.dia + h.hora"
                      class="flex items-center gap-3 rounded-xl px-3 py-2"
                      :class="turmaClicada?.id === turma.id ? 'bg-white border border-green-200' : 'bg-gray-50 border border-gray-100'"
                    >
                      <span class="text-base shrink-0">📅</span>
                      <div>
                        <p class="text-sm font-semibold text-gray-800">{{ h.toda }} · {{ h.hora }}<span v-if="h.horaFim"> – {{ h.horaFim }}</span></p>
                        <p class="text-xs text-gray-400">Semanalmente · {{ h.count }} encontro{{ h.count !== 1 ? 's' : '' }}</p>
                      </div>
                    </div>
                  </div>
                  <p v-else class="text-xs text-gray-300 mt-2 italic">Horário a confirmar</p>
                </button>
              </div>
            </div>

            <!-- Turmas de outros níveis -->
            <div v-if="turmasOutrosNiveis.length">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wide">Outras turmas disponíveis</span>
                <div class="flex-1 h-px bg-gray-100"></div>
              </div>
              <p class="text-xs text-gray-400 mb-3">Turmas de nível inferior ao seu. Você pode escolher se preferir um horário específico.</p>
              <div class="space-y-2">
                <button
                  v-for="turma in turmasOutrosNiveis"
                  :key="turma.id"
                  @click="clicarTurma(turma)"
                  class="w-full text-left border-2 rounded-2xl px-5 py-4 transition-all hover:shadow-sm active:scale-98"
                  :class="turmaClicada?.id === turma.id ? 'border-amber-400 bg-amber-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'"
                >
                  <div class="flex items-start justify-between gap-2">
                    <h3 class="font-semibold text-gray-700 text-sm">{{ turma.nome }}</h3>
                    <span class="shrink-0 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Nível: {{ NIVEL_MAP[turma.nivel] ?? 'Sem nível' }}</span>
                  </div>
                  <p v-if="turma.professor_nome" class="text-xs text-gray-500 mt-0.5">👤 {{ turma.professor_nome }}</p>
                  <p v-if="turma.sala" class="text-xs text-gray-400 mt-0.5">Sala {{ turma.sala }}</p>
                  <div v-if="turma.horarios?.length" class="mt-3 space-y-2">
                    <div
                      v-for="h in turma.horarios"
                      :key="h.dia + h.hora"
                      class="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
                    >
                      <span class="text-base shrink-0">📅</span>
                      <div>
                        <p class="text-sm font-semibold text-gray-700">{{ h.toda }} · {{ h.hora }}<span v-if="h.horaFim"> – {{ h.horaFim }}</span></p>
                        <p class="text-xs text-gray-400">Semanalmente · {{ h.count }} encontro{{ h.count !== 1 ? 's' : '' }}</p>
                      </div>
                    </div>
                  </div>
                  <p v-else class="text-xs text-gray-300 mt-2 italic">Horário a confirmar</p>
                </button>
              </div>
            </div>
          </div>

          <!-- confirmação inline / motivo -->
          <Transition name="fade">
            <div v-if="turmaClicada && (!inscricaoExistente || modoTrocarTurma)" class="mt-5 border-t border-gray-100 pt-5">
              <div v-if="turmaNivelInferior">
                <p class="text-sm font-semibold text-amber-700 mb-1">⚠️ Esta turma é de nível inferior ao seu perfil</p>
                <p class="text-xs text-gray-500 mb-3">Por que você prefere esta turma?</p>
                <select
                  v-model="motivoNivelInferior"
                  class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition bg-white mb-3"
                >
                  <option value="">Selecione um motivo...</option>
                  <option value="revisao">Quero revisar conteúdos anteriores</option>
                  <option value="horario">O horário desta turma é mais conveniente</option>
                  <option value="recomendacao">Fui indicado por um professor</option>
                  <option value="outro">Outro motivo</option>
                </select>
                <div v-if="motivoNivelInferior === 'outro'" class="mb-4">
                  <label class="text-xs text-gray-500 mb-1.5 block">Descreva o motivo:</label>
                  <input
                    v-model="motivoOutroTexto"
                    type="text"
                    maxlength="120"
                    class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  />
                </div>
              </div>
              <p v-else class="text-sm text-gray-600 mb-4">
                {{ inscricaoExistente ? 'Confirme para atualizar sua pré-inscrição com a turma' : 'Você está confirmando a inscrição em' }}
                <strong>{{ turmaClicada.nome }}</strong>.
              </p>
              <button
                @click="confirmarInscricao"
                :disabled="salvandoInscricao || (turmaNivelInferior && (!motivoNivelInferior || (motivoNivelInferior === 'outro' && !motivoOutroTexto.trim())))"
                class="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition active:scale-95"
              >
                <span v-if="salvandoInscricao">Salvando...</span>
                <span v-else>{{ inscricaoExistente ? 'Atualizar pré-inscrição' : 'Confirmar inscrição' }}</span>
              </button>
              <p v-if="erroInscricao" class="text-sm text-red-600 mt-2 text-center">{{ erroInscricao }}</p>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>

    <!-- PASSO: SUCESSO -->
    <Transition name="fade" mode="out-in">
      <div v-if="passo === 'sucesso'" key="sucesso" class="w-full max-w-md">
        <div class="bg-white rounded-3xl shadow-lg border border-gray-100 p-10 text-center">
          <div class="text-5xl mb-4">🎉</div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">{{ inscricaoExistente ? 'Pré-inscrição atualizada!' : 'Pré-inscrição realizada!' }}</h2>
          <p class="text-sm text-gray-500 mb-6 leading-relaxed">
            {{ inscricaoExistente
              ? 'Suas preferências foram atualizadas com sucesso. Entraremos em contato em breve.'
              : 'Sua solicitação foi enviada com sucesso. Entraremos em contato em breve para confirmar sua matrícula.' }}
          </p>
          <div v-if="nivelSelecionado" class="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-4 text-left">
            <p class="text-xs text-gray-400 mb-1">Nível selecionado</p>
            <p class="font-semibold text-green-800">{{ nivelSelecionado.emoji }} {{ nivelSelecionado.label }}</p>
          </div>
          <div v-if="turmaConfirmada" class="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 mb-6 text-left">
            <p class="text-xs text-gray-400 mb-1">Turma de interesse</p>
            <p class="font-semibold text-gray-800">{{ turmaConfirmada.nome }}</p>
          </div>
          <p class="text-xs text-gray-400">Em caso de dúvidas, entre em contato em:</p>
          <p class="text-xs text-gray-700"> linguesc.cct@udesc.br ou udescinteragir@gmail.com</p>
          <div v-if="inscricaoExistente" class="mt-6 pt-5 border-t border-gray-100">
            <button
              @click="() => { modoTrocarTurma = false; passo = 'turma' }"
              class="text-sm text-green-600 hover:text-green-700 underline underline-offset-2"
            >
              ← Voltar e editar minha pré-inscrição
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { supabase } from '~/utils/supabase'

definePageMeta({ layout: 'auth' })

const NIVEIS = [
  {
    id: 'INICIANTE',
    label: 'Iniciante',
    emoji: '🌱',
    desc: 'Introdução à língua inglesa e construção das primeiras bases.',
    detalhe: 'Voltado para quem possui pouco ou nenhum conhecimento de inglês. Trabalha vocabulário e expressões básicas do dia a dia, apresentação pessoal, números, cores, horários, objetos e situações comuns. Também aborda a estrutura de frases simples e os principais tempos verbais básicos, como o Simple Present e o Simple Past, além de desenvolver as primeiras habilidades de compreensão, leitura e comunicação em inglês.',
  },
  {
    id: 'BASICO',
    label: 'Básico',
    emoji: '📘',
    desc: 'Ampliação do vocabulário e desenvolvimento da comunicação em situações cotidianas.',
    detalhe: 'Voltado para quem já possui conhecimentos básicos da língua e deseja ampliar sua capacidade de compreender e formar frases. Trabalha vocabulário relacionado a situações do cotidiano, construção de frases mais elaboradas e tempos verbais como Present Continuous, Past Continuous e formas futuras. Também desenvolve a compreensão de textos e diálogos simples, além da prática de conversas em situações comuns.',
  },
  {
    id: 'INTERMEDIARIO',
    label: 'Intermediário',
    emoji: '📗',
    desc: 'Aprofundamento da gramática e desenvolvimento da comunicação com maior autonomia.',
    detalhe: 'Voltado para quem já possui uma base de inglês e deseja aprimorar a compreensão e a produção da língua. Trabalha estruturas gramaticais mais complexas, incluindo Present Continuous, Present Perfect, Modal Verbs e Past Perfect, além de ampliar o vocabulário e a capacidade de compreender textos e conversas. O nível também busca desenvolver maior segurança para expressar opiniões, relatar experiências e lidar com diferentes situações de comunicação.',
  },
  {
    id: 'CONVERSACAO',
    label: 'Conversação',
    emoji: '💬',
    desc: 'Foco na prática da comunicação e no desenvolvimento da fluência.',
    detalhe: 'Voltado para estudantes que já possuem conhecimentos intermediários ou avançados de inglês e desejam principalmente praticar a comunicação oral. As aulas são centradas em conversas, discussões, debates e situações práticas, trabalhando a compreensão auditiva, pronúncia, vocabulário e espontaneidade ao falar. O objetivo é proporcionar mais segurança para utilizar o inglês em situações reais de comunicação.',
  },
]

const NIVEL_MAP = {
  INICIANTE: 'Iniciante',
  BASICO: 'Básico',
  INTERMEDIARIO: 'Intermediário',
  CONVERSACAO: 'Conversação',
}

const NIVEL_ORDEM = { INICIANTE: 1, BASICO: 2, INTERMEDIARIO: 3, CONVERSACAO: 4 }

const DIAS_SEMANA_COMPLETO = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
const DIAS_SEMANA_TODA = ['Todo domingo', 'Toda segunda-feira', 'Toda terça-feira', 'Toda quarta-feira', 'Toda quinta-feira', 'Toda sexta-feira', 'Todo sábado']

function extrairHorarios(aulas) {
  const slots = {}
  for (const a of aulas) {
    if (!a.hora_inicio) continue
    const dow = new Date(a.data + 'T12:00:00').getDay()
    const chave = `${dow}-${a.hora_inicio}-${a.hora_fim}`
    if (!slots[chave]) {
      const inicio = a.hora_inicio.slice(0, 5)
      const fim = a.hora_fim ? a.hora_fim.slice(0, 5) : null
      slots[chave] = { dow, dia: DIAS_SEMANA_COMPLETO[dow], toda: DIAS_SEMANA_TODA[dow], hora: inicio, horaFim: fim, count: 0 }
    }
    slots[chave].count++
  }
  return Object.values(slots)
}

// Estado de navegação
const passo = ref('auth')
const modoAuth = ref('escolher')

// Dados do usuário autenticado
const usuarioId = ref(null)

// Auth - login
const loginEmail = ref('')
const loginSenha = ref('')
const erroAuth = ref('')
const carregandoAuth = ref(false)

// Auth - cadastro
const cadNome = ref('')
const cadEmail = ref('')
const cadCpf = ref('')
const cadDataNasc = ref('')
const cadGenero = ref('')
const cadGeneroOutro = ref('')
const cadSenha = ref('')

// Nível
const nivelSelecionado = ref(null)
const inscricaoExistente = ref(false)

// Turma
const todasTurmas = ref([])
const carregandoTurmas = ref(false)
const turmaClicada = ref(null)
const turmaAnterior = ref(null)
const modoTrocarTurma = ref(false)
const motivoNivelInferior = ref('')
const motivoOutroTexto = ref('')
const salvandoInscricao = ref(false)
const erroInscricao = ref('')
const turmaConfirmada = ref(null)

const turmasFiltradas = computed(() => {
  if (!nivelSelecionado.value) return []
  const ordemMax = NIVEL_ORDEM[nivelSelecionado.value.id]
  return todasTurmas.value.filter((t) => {
    if (!t.nivel) return true
    return (NIVEL_ORDEM[t.nivel] ?? 0) <= ordemMax
  })
})

const turmasNivelExato = computed(() =>
  turmasFiltradas.value.filter((t) => t.nivel === nivelSelecionado.value?.id || !t.nivel)
)

const turmasOutrosNiveis = computed(() =>
  turmasFiltradas.value.filter((t) => t.nivel && t.nivel !== nivelSelecionado.value?.id)
)

const turmaNivelInferior = computed(() => {
  if (!turmaClicada.value || !nivelSelecionado.value || !turmaClicada.value.nivel) return false
  return NIVEL_ORDEM[turmaClicada.value.nivel] < NIVEL_ORDEM[nivelSelecionado.value.id]
})

function mascaraCpf(e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 11)
  if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2')
  cadCpf.value = v
}

async function fazerLogin() {
  erroAuth.value = ''
  carregandoAuth.value = true
  const { data, error } = await supabase.auth.signInWithPassword({
    email: loginEmail.value.trim(),
    password: loginSenha.value,
  })
  carregandoAuth.value = false
  if (error) {
    erroAuth.value = 'E-mail ou senha incorretos.'
    return
  }
  usuarioId.value = data.user.id
  await irParaNivel()
}

async function fazerCadastro() {
  erroAuth.value = ''
  carregandoAuth.value = true
  try {
    await $fetch('/api/pre-cadastro', {
      method: 'POST',
      body: {
        nome: cadNome.value.trim(),
        email: cadEmail.value.trim(),
        senha: cadSenha.value,
        data_nascimento: cadDataNasc.value,
        documento_federal: cadCpf.value.replace(/\D/g, ''),
        genero: cadGenero.value === 'Outro' ? (cadGeneroOutro.value.trim() || 'Outro') : cadGenero.value,
      },
    })
  } catch (err) {
    erroAuth.value = err?.data?.message || 'Erro ao criar conta.'
    carregandoAuth.value = false
    return
  }

  // Auto-login após cadastro
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cadEmail.value.trim(),
    password: cadSenha.value,
  })
  carregandoAuth.value = false
  if (error) {
    erroAuth.value = 'Conta criada, mas não foi possível autenticar. Tente usar "Já tenho conta".'
    return
  }
  usuarioId.value = data.user.id
  await irParaNivel()
}

async function irParaNivel() {
  carregandoTurmas.value = true

  const [{ data: turmasData }, { data: preInscricao }] = await Promise.all([
    supabase
      .from('turma')
      .select('id, nome, sala, descricao, nivel, professor:usuarios!professor_id(nome), aulas:aula(data, hora_inicio, hora_fim)')
      .eq('status', 'ATIVA')
      .order('nome', { ascending: true }),
    supabase
      .from('pre_inscricao')
      .select('nivel_preferido, turma_selecionada_id')
      .eq('usuario_id', usuarioId.value)
      .maybeSingle(),
  ])

  todasTurmas.value = (turmasData || []).map((t) => ({
    ...t,
    professor_nome: t.professor?.nome ?? null,
    horarios: extrairHorarios(t.aulas ?? []),
  }))

  carregandoTurmas.value = false

  if (preInscricao) {
    inscricaoExistente.value = true
    modoTrocarTurma.value = false
    const nivelAnterior = NIVEIS.find((n) => n.id === preInscricao.nivel_preferido)
    if (nivelAnterior) nivelSelecionado.value = nivelAnterior
    if (preInscricao.turma_selecionada_id) {
      const t = todasTurmas.value.find((t) => t.id === preInscricao.turma_selecionada_id) ?? null
      turmaClicada.value = t
      turmaAnterior.value = t
    }
    passo.value = 'turma'
  } else {
    inscricaoExistente.value = false
    passo.value = 'nivel'
  }
}

function confirmarNivel(nivel) {
  nivelSelecionado.value = nivel
  turmaClicada.value = null
  motivoNivelInferior.value = ''
  if (inscricaoExistente.value) modoTrocarTurma.value = true
  passo.value = 'turma'
}

function clicarTurma(turma) {
  turmaClicada.value = turma
  motivoNivelInferior.value = ''
  erroInscricao.value = ''
}

async function confirmarInscricao() {
  erroInscricao.value = ''
  salvandoInscricao.value = true
  try {
    await $fetch('/api/pre-inscricao-salvar', {
      method: 'POST',
      body: {
        usuario_id: usuarioId.value,
        nivel_preferido: nivelSelecionado.value.id,
        turma_selecionada_id: turmaClicada.value.id,
        motivo_turma_diferente: motivoNivelInferior.value
          ? (motivoNivelInferior.value === 'outro' ? `outro: ${motivoOutroTexto.value.trim()}` : motivoNivelInferior.value)
          : null,
      },
    })
    turmaConfirmada.value = turmaClicada.value
    passo.value = 'sucesso'
  } catch (err) {
    erroInscricao.value = err?.data?.message || 'Erro ao salvar inscrição. Tente novamente.'
  } finally {
    salvandoInscricao.value = false
  }
}

async function confirmarSemTurma() {
  erroInscricao.value = ''
  salvandoInscricao.value = true
  try {
    await $fetch('/api/pre-inscricao-salvar', {
      method: 'POST',
      body: {
        usuario_id: usuarioId.value,
        nivel_preferido: nivelSelecionado.value.id,
        turma_selecionada_id: null,
        motivo_turma_diferente: null,
      },
    })
    turmaConfirmada.value = null
    passo.value = 'sucesso'
  } catch (err) {
    erroInscricao.value = err?.data?.message || 'Erro ao salvar. Tente novamente.'
  } finally {
    salvandoInscricao.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
