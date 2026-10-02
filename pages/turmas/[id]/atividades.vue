<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <!-- Header -->
    <div class="mb-8 flex items-start justify-between">
      <div>
        <button
          @click="$router.back()"
          class="text-sm text-gray-400 hover:text-gray-600 transition mb-4 flex items-center gap-1"
        >
          ← Voltar
        </button>
        <h1 class="text-3xl font-bold text-green-700">
          Atividades — {{ turma?.nome }}
        </h1>
        <p class="text-gray-500 mt-2">Gerencie as atividades desta turma.</p>
        <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
      </div>
      <button
        @click="abrirCriacao"
        class="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl transition active:scale-95 flex items-center gap-2 mt-8"
      >
        + Nova Atividade
      </button>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div
        class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"
      ></div>
      <span class="text-sm">Carregando...</span>
    </div>

    <div
      v-else
      class="flex flex-col sm:grid gap-4"
      style="grid-template-columns: 280px 1fr; align-items: start"
    >
      <!-- Lista de atividades -->
      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div class="px-3.5 py-2 border-b border-gray-100 flex items-center justify-between gap-2">
          <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Atividades ({{ atividadesFiltradas.length }})
          </p>
          <div class="flex gap-1">
            <button
              v-for="f in filtrosStatus"
              :key="f.value"
              @click="filtroAtivo = f.value"
              class="text-[10px] font-semibold px-2 py-0.5 rounded-full transition"
              :class="filtroAtivo === f.value ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
            >{{ f.label }}</button>
          </div>
        </div>
        <div
          v-if="atividadesFiltradas.length === 0 && atividades.length === 0"
          class="px-4 py-8 text-center space-y-1"
        >
          <p class="text-2xl">📋</p>
          <p class="text-xs text-gray-400">Nenhuma atividade cadastrada.</p>
          <p class="text-xs text-gray-400">
            Clique em <strong>+ Nova Atividade</strong> para começar.
          </p>
        </div>
        <div
          v-else-if="atividadesFiltradas.length === 0"
          class="px-4 py-8 text-center"
        >
          <p class="text-xs text-gray-400">Nenhuma atividade neste filtro.</p>
        </div>

        <!-- Seção: Provas -->
        <template v-if="provasFiltradas.length > 0">
          <div class="px-3.5 py-2 bg-gray-50 border-b border-gray-100">
            <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">📝 Provas</p>
          </div>
          <button
            v-for="atividade in provasFiltradas"
            :key="atividade.id"
            @click="escolherAtividade(atividade)"
            class="w-full flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 last:border-0 text-left gap-2 transition"
            :class="
              atividadeSelecionada?.id === atividade.id
                ? 'bg-green-50'
                : 'hover:bg-gray-50 cursor-pointer'
            "
          >
            <div class="min-w-0 flex-1">
              <p class="text-xs font-medium text-gray-800 truncate">
                {{ atividade.titulo }}
              </p>
              <p v-if="atividade.data_final" class="text-[10px] text-gray-400 mt-0.5">
                até {{ formatarDataCurta(atividade.data_final) }}
              </p>
            </div>
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
              :class="badgeStatus(atividade)"
            >
              {{ labelStatus(atividade) }}
            </span>
          </button>
        </template>

        <!-- Seção: Missões -->
        <template v-if="missoesFiltradas.length > 0">
          <div class="px-3.5 py-2 bg-amber-50 border-b border-gray-100" :class="provasFiltradas.length > 0 ? 'border-t border-gray-100' : ''">
            <p class="text-[10px] font-semibold text-amber-600 uppercase tracking-widest">⭐ Missões da semana</p>
          </div>
          <button
            v-for="atividade in missoesFiltradas"
            :key="atividade.id"
            @click="escolherAtividade(atividade)"
            class="w-full flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 last:border-0 text-left gap-2 transition"
            :class="
              atividadeSelecionada?.id === atividade.id
                ? 'bg-amber-50'
                : 'hover:bg-gray-50 cursor-pointer'
            "
          >
            <div class="min-w-0 flex-1">
              <p class="text-xs font-medium text-gray-800 truncate flex items-center gap-1">
                <span class="text-amber-400">⭐</span>
                {{ atividade.titulo }}
              </p>
              <p v-if="atividade.data_final" class="text-[10px] text-gray-400 mt-0.5">
                até {{ formatarDataCurta(atividade.data_final) }}
              </p>
            </div>
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
              :class="badgeStatus(atividade)"
            >
              {{ labelStatus(atividade) }}
            </span>
          </button>
        </template>
      </div>

      <!-- Painel da atividade selecionada -->
      <div
        v-if="atividadeSelecionada"
        class="bg-white border border-gray-200 rounded-2xl overflow-hidden"
      >
        <!-- Cabeçalho -->
        <div
          class="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100"
        >
          <div class="flex items-center gap-2 min-w-0">
            <h2 class="text-sm font-semibold text-gray-800 truncate">
              <span v-if="atividadeSelecionada.tipo_missao === 'MISSAO'" class="text-amber-400 mr-1">⭐</span>
              {{ atividadeSelecionada.titulo }}
            </h2>
          </div>

          <div class="flex items-center gap-2 shrink-0 ml-2">
            <!-- Botão encerrar — só para atividades publicadas -->
            <button
              v-if="atividadeSelecionada.status === 'PUBLICADA'"
              @click="confirmarEncerrar"
              class="text-xs px-3 py-1.5 rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 transition"
            >
              🔒 Encerrar atividade
            </button>

            <!-- Botão editar — só enquanto publicada -->
            <button
              v-if="atividadeSelecionada.status === 'PUBLICADA'"
              @click="abrirEdicao(atividadeSelecionada)"
              class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
            >
              ✏️ Editar
            </button>

            <!-- Badge leitura — encerrada -->
            <span
              v-if="atividadeSelecionada.status === 'ENCERRADA'"
              class="text-xs px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-red-500 font-medium"
            >
              🔒 Encerrada
            </span>

            <Transition name="fade">
              <div v-if="temAlteracoes" class="flex items-center gap-2">
                <span
                  class="text-xs text-amber-600 font-medium whitespace-nowrap hidden sm:inline"
                >
                  ← salve para confirmar
                </span>
                <button
                  @click="salvarRegistros"
                  :disabled="salvando"
                  class="text-xs font-bold px-4 py-1.5 rounded-lg transition active:scale-95 flex items-center gap-1.5 ring-2 ring-offset-1"
                  :class="
                    salvando
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed ring-transparent'
                      : 'bg-green-600 text-white hover:bg-green-700 ring-green-400 animate-pulse'
                  "
                >
                  <div
                    v-if="salvando"
                    class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"
                  ></div>
                  {{ salvando ? "Salvando..." : "💾 Salvar" }}
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Info da atividade -->
        <div
          v-if="atividadeSelecionada.descricao"
          class="px-3.5 py-2.5 border-b border-gray-100 bg-gray-50"
        >
          <p class="text-sm text-gray-500 whitespace-pre-line">
            {{ atividadeSelecionada.descricao }}
          </p>
        </div>

        <!-- Dica de uso -->
        <div
          class="px-3.5 py-2 border-b border-gray-100 bg-amber-50 flex items-center gap-2"
        >
          <span class="text-amber-500 text-xs">💡</span>
          <p class="text-sm text-amber-700">
            <template v-if="atividadeSelecionada.tipo_missao === 'MISSAO'">
              Missão opcional da semana. Os estudantes respondem pelo sistema.
            </template>
            <template v-else>
              Digite a nota (0–10) de cada estudante e clique em 💬 para
              adicionar feedback individual. Salve ao final.
            </template>
          </p>
        </div>

        <!-- Painel de respostas — apenas para missões -->
        <!-- ── Respostas da missão da semana ── -->
        <div v-if="atividadeSelecionada.tipo_missao === 'MISSAO'">
          <!-- Header com contadores -->
          <div class="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
            <span class="text-base">⭐</span>
            <p class="text-xs font-bold text-amber-800 uppercase tracking-wider">Respostas dos estudantes</p>
            <span class="ml-auto flex items-center gap-1.5">
              <span v-if="atividadeSelecionada.conteudo_json?.anonimo" class="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                🔒 Anônima
              </span>
              <span class="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {{ registros.filter(r => r.respondido_em).length }}/{{ registros.length }} responderam
              </span>
            </span>
          </div>

          <!-- Aviso modo anônimo -->
          <div v-if="atividadeSelecionada.conteudo_json?.anonimo" class="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-start gap-2">
            <span class="text-gray-400 mt-0.5">🔒</span>
            <p class="text-xs text-gray-500 leading-relaxed">Esta missão está em <strong>modo anônimo</strong>. As identidades dos estudantes não são exibidas para garantir respostas mais sinceras.</p>
          </div>

          <!-- Respondidos -->
          <div v-if="registros.some(r => r.respondido_em)" class="divide-y divide-gray-50">
            <div
              v-for="(r, idx) in registros.filter(r => r.respondido_em)"
              :key="r.aluno_id"
              class="px-4 py-3.5"
            >
              <div class="flex items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[11px] font-bold flex-shrink-0">✓</span>
                  <span class="text-sm font-semibold text-gray-800">
                    {{ atividadeSelecionada.conteudo_json?.anonimo ? `Participante ${idx + 1}` : r.nome }}
                  </span>
                </div>
                <span class="text-[11px] text-gray-400 flex-shrink-0">{{ formatarDataCurta(r.respondido_em) }}</span>
              </div>
              <!-- Resposta múltipla escolha -->
              <div v-if="r.resposta_opcao" class="ml-7">
                <span class="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-800 text-xs font-medium px-3 py-1.5 rounded-lg">
                  <span>✦</span> {{ r.resposta_opcao }}
                </span>
              </div>
              <!-- Resposta texto livre -->
              <div v-else-if="r.resposta_texto" class="ml-7">
                <p class="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 leading-relaxed">{{ r.resposta_texto }}</p>
              </div>
            </div>
          </div>

          <!-- Não respondidos -->
          <div v-if="registros.some(r => !r.respondido_em)" class="border-t border-gray-100 bg-gray-50/60">
            <p class="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Aguardando resposta</p>
            <div class="px-4 pb-3 flex flex-wrap gap-2">
              <!-- Em modo anônimo: mostra só o número, não os nomes -->
              <span v-if="atividadeSelecionada.conteudo_json?.anonimo" class="text-xs text-gray-400">
                {{ registros.filter(r => !r.respondido_em).length }} estudante(s) ainda não responderam
              </span>
              <template v-else>
                <span
                  v-for="r in registros.filter(r => !r.respondido_em)"
                  :key="r.aluno_id"
                  class="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  <span class="w-3.5 h-3.5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] text-gray-400">–</span>
                  {{ r.nome }}
                </span>
              </template>
            </div>
          </div>
        </div>

        <!-- ── Tabela nota/feedback (só para prova final) ── -->
        <template v-else>
          <!-- Resumo -->
          <div class="flex gap-2 px-3.5 py-2.5 border-b border-gray-100 flex-wrap items-center">
            <div class="flex-1"></div>
            <span class="text-xs text-gray-400">{{ resumoParticipacao }}</span>
          </div>

          <!-- Lista de alunos -->
          <div v-if="loadingAlunos" class="flex items-center gap-3 text-green-700 px-4 py-6">
            <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-sm">Carregando alunos...</span>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 bg-gray-50">
                  <th class="text-left px-4 py-2 text-xs font-medium text-gray-400 w-full">Estudante</th>
                  <th class="text-center px-3 py-2 text-xs font-medium text-gray-400 whitespace-nowrap">Nota</th>
                  <th class="text-center px-3 py-2 text-xs font-medium text-gray-400">Feedback</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="registro in registros" :key="registro.aluno_id" class="hover:bg-gray-50 transition">
                  <td class="px-4 py-2.5">
                    <span class="text-sm font-medium" :class="registro.nota !== null ? 'text-gray-800' : 'text-gray-700'">
                      {{ registro.nome }}
                    </span>
                  </td>
                  <td class="px-3 py-2.5 text-center">
                    <input
                      :value="notaDisplay(registro)"
                      @keydown="onNotaKeydown($event, registro)"
                      @focus="onNotaFocus(registro)"
                      inputmode="numeric"
                      placeholder="–"
                      readonly
                      :disabled="atividadeSelecionada.status === 'ENCERRADA'"
                      class="w-16 text-center text-sm font-bold rounded-lg px-2 py-1.5 border-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-400 transition-all cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-60"
                      :class="notaInputClass(registro._digitos)"
                    />
                  </td>
                  <td class="px-3 py-2.5 text-center">
                    <button
                      @click="abrirFeedback(registro)"
                      :disabled="atividadeSelecionada.status === 'ENCERRADA'"
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition disabled:opacity-50 disabled:cursor-not-allowed"
                      :class="registro.feedback ? 'bg-green-500 border-green-500 text-white hover:bg-green-600' : 'bg-white border-green-200 text-green-600 hover:bg-green-50'"
                    >
                      💬
                      <span v-if="registro.feedback" class="hidden sm:inline">Editar</span>
                      <span v-else class="hidden sm:inline">Adicionar</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>

      <!-- Estado vazio -->
      <div
        v-else
        class="bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center py-16 text-center px-6 space-y-3"
      >
        <p class="text-3xl">📝</p>
        <p class="text-sm font-medium text-gray-600">Selecione uma atividade</p>
        <p class="text-xs text-gray-400 max-w-xs leading-relaxed">
          Clique em uma atividade à esquerda para ver e editar os registros dos
          estudantes — notas e feedbacks individuais.
        </p>
        <p class="text-xs text-gray-400">
          Não tem nenhuma ainda? Clique em
          <strong class="text-green-600">+ Nova Atividade</strong> para criar.
        </p>
      </div>
    </div>

    <!-- ── MODAL FEEDBACK ── -->
    <Transition name="fade">
      <div
        v-if="modalFeedback"
        class="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-4"
      >
        <div
          class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
        >
          <!-- Header -->
          <div
            class="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100"
          >
            <div>
              <h3 class="text-base font-semibold text-gray-800">
                💬 Feedback do estudante
              </h3>
              <p class="text-sm text-gray-400 mt-0.5">
                {{ registroFeedback?.nome }}
              </p>
            </div>
            <button
              @click="modalFeedback = false"
              class="text-gray-400 hover:text-gray-600 text-2xl leading-none mt-0.5"
            >
              ×
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5">
            <textarea
              v-model="textoFeedback"
              rows="7"
              placeholder="Escreva um feedback para este estudante..."
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none text-gray-700 leading-relaxed"
            />
            <p class="text-xs text-gray-400 mt-2">
              {{ textoFeedback.length }} caracteres
            </p>
          </div>

          <!-- Footer -->
          <div class="px-6 pb-5 flex gap-3">
            <button
              v-if="registroFeedback?.feedback"
              @click="excluirFeedback"
              class="px-4 py-2.5 rounded-xl border border-red-200 text-sm font-semibold text-red-500 hover:bg-red-50 transition"
            >
              🗑 Excluir
            </button>
            <div class="flex-1"></div>
            <button
              @click="modalFeedback = false"
              class="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              @click="salvarFeedback"
              class="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition"
            >
              Salvar feedback
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── MODAL CONFIRMAR ENCERRAR ── -->
    <Transition name="fade">
      <div
        v-if="modalEncerrar"
        class="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-4"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
          <div class="px-6 pt-6 pb-4">
            <p class="text-2xl mb-3">🔒</p>
            <h3 class="text-base font-semibold text-gray-800 mb-1">Encerrar atividade?</h3>
            <p class="text-sm text-gray-500">
              Os estudantes não poderão mais responder. Esta ação não pode ser desfeita.
            </p>
          </div>
          <div class="px-6 pb-6 flex gap-3">
            <button
              @click="modalEncerrar = false"
              class="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              @click="encerrarAtividade"
              :disabled="encerrando"
              class="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              <div v-if="encerrando" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {{ encerrando ? 'Encerrando...' : 'Sim, encerrar' }}
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

    <!-- ── DRAWER CRIAR/EDITAR ── -->
    <Transition name="slide">
      <div
        v-if="painelAberto"
        class="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
      >
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-lg font-semibold text-gray-800">
            {{ modo === "criar" ? "➕ Nova Atividade" : "✏️ Editar Atividade" }}
          </h2>
          <button
            @click="fecharPainel"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition text-xl"
          >
            ×
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-5">

          <!-- PASSO 1: Escolher tipo (só na criação) -->
          <div v-if="modo === 'criar' && !form.tipoEscolhido">
            <p class="text-sm font-medium text-gray-700 mb-3">O que você quer criar?</p>
            <div :class="turma?.nivel === 'CONVERSACAO' ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-2 gap-3'">
              <button
                v-if="turma?.nivel !== 'CONVERSACAO'"
                @click="escolherTipoCriacao('NOTA')"
                class="flex flex-col items-center gap-2 py-5 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-600 hover:text-green-700 transition"
              >
                <span class="text-3xl">📝</span>
                <span class="text-sm font-semibold">Prova Final</span>
                <span class="text-xs text-gray-400">Lança nota 0–10</span>
              </button>
              <button
                @click="escolherTipoCriacao('MISSAO')"
                :disabled="bloqueioMissao.bloqueado"
                class="flex flex-col items-center gap-2 py-5 rounded-xl border-2 transition"
                :class="bloqueioMissao.bloqueado
                  ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                  : 'border-gray-200 hover:border-amber-400 hover:bg-amber-50 text-gray-600 hover:text-amber-700'"
              >
                <span class="text-3xl">{{ bloqueioMissao.bloqueado ? '🔒' : '⭐' }}</span>
                <span class="text-sm font-semibold" :class="bloqueioMissao.bloqueado ? 'text-gray-400' : ''">Missão da Semana</span>
                <span class="text-[10px] text-center leading-tight px-1" :class="bloqueioMissao.bloqueado ? 'text-gray-400' : 'text-gray-400'">
                  {{ bloqueioMissao.bloqueado
                    ? (bloqueioMissao.motivo === 'ativa' ? 'Encerre a missão ativa' : 'Já criada neste ciclo')
                    : 'Interativa · +20 ⭐' }}
                </span>
              </button>
            </div>
          </div>

          <!-- Formulário (após escolha de tipo ou em modo editar) -->
          <template v-if="modo === 'editar' || form.tipoEscolhido">

            <!-- Badge do tipo (criação) -->
            <div v-if="modo === 'criar'" class="flex items-center gap-2">
              <span
                class="text-xs font-semibold px-3 py-1 rounded-full"
                :class="form.tipo_missao === 'MISSAO'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-green-100 text-green-700'"
              >
                {{ form.tipo_missao === 'MISSAO' ? '⭐ Missão da Semana' : '📝 Prova Final' }}
              </span>
              <button
                @click="form.tipoEscolhido = false"
                class="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Trocar
              </button>
            </div>

            <!-- Título -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">Título</label>
              <input
                v-model="form.titulo"
                type="text"
                :placeholder="form.tipo_missao === 'MISSAO' ? 'Ex: Tema da semana – Verbos irregulares' : 'Ex: Prova Final – Módulo 1'"
                class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>

            <!-- Informações adicionais -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">
                Informações adicionais
                <span class="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                v-model="form.descricao"
                rows="3"
                placeholder="Instruções, links de conteúdo, observações..."
                class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
              />
            </div>

            <!-- Data de encerramento -->
            <div>
              <label class="text-sm font-medium text-gray-700 mb-2 block">
                Data de encerramento
                <span class="text-gray-400 font-normal">(opcional)</span>
              </label>
              <div class="flex gap-2 items-end">
                <div class="flex-1">
                  <p class="text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-wide">Data</p>
                  <input
                    :value="dataFinalDate"
                    @input="e => atualizarDataFinal(e.target.value, horaFinalTime)"
                    type="date"
                    class="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  />
                </div>
                <div class="w-28">
                  <p class="text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-wide">Horário</p>
                  <select
                    :value="horaFinalTime"
                    @change="e => atualizarDataFinal(dataFinalDate, e.target.value)"
                    class="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition bg-white"
                  >
                    <option v-for="h in horariosOpcoes" :key="h" :value="h">{{ h }}</option>
                  </select>
                </div>
                <button
                  type="button"
                  @click="form.data_final = ''"
                  v-if="form.data_final"
                  class="text-xs text-gray-400 hover:text-red-500 px-2 py-2.5 rounded-lg hover:bg-red-50 transition flex-shrink-0"
                  title="Remover data"
                >✕</button>
              </div>
              <p class="text-xs text-gray-400 mt-1.5">
                Pré-preenchido com 7 dias a partir de hoje — edite conforme necessário.
              </p>
            </div>

            <!-- Conteúdo da missão -->
            <template v-if="form.tipo_missao === 'MISSAO'">
              <div class="border-t border-gray-100 pt-4">
                <p class="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-4">Configuração da missão</p>

                <!-- Modo Anônimo -->
                <div class="mt-4 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <div>
                    <p class="text-sm font-medium text-gray-700">🔒 Modo Anônimo</p>
                    <p class="text-xs text-gray-400 mt-0.5">Os estudantes não serão identificados nas respostas</p>
                  </div>
                  <button
                    type="button"
                    @click="form.anonimo = !form.anonimo"
                    class="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none"
                    :class="form.anonimo ? 'bg-green-500' : 'bg-gray-200'"
                  >
                    <span
                      class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                      :class="form.anonimo ? 'translate-x-6' : 'translate-x-1'"
                    ></span>
                  </button>
                </div>

                <!-- Formato da resposta -->
                <div class="mb-4">
                  <label class="text-sm font-medium text-gray-700 mb-2 mt-4 block">Formato da resposta</label>
                  <div class="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      @click="form.formato_missao = 'multipla_escolha'"
                      class="py-3 rounded-xl border-2 text-sm font-semibold transition"
                      :class="form.formato_missao === 'multipla_escolha'
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'"
                    >
                      🔘 Múltipla escolha
                    </button>
                    <button
                      type="button"
                      @click="form.formato_missao = 'texto_livre'"
                      class="py-3 rounded-xl border-2 text-sm font-semibold transition"
                      :class="form.formato_missao === 'texto_livre'
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'"
                    >
                      ✍️ Texto livre
                    </button>
                  </div>
                </div>

                <!-- Opções (só para múltipla escolha) -->
                <div v-if="form.formato_missao === 'multipla_escolha'">
                  <label class="text-sm font-medium text-gray-700 mb-2 block">Opções de resposta</label>
                  <div class="space-y-2">
                    <div
                      v-for="(opcao, i) in form.opcoes_missao"
                      :key="i"
                      class="flex items-center gap-2"
                    >
                      <span class="text-xs font-bold text-gray-400 w-5 text-center">{{ ['A','B','C','D'][i] }}</span>
                      <input
                        v-model="form.opcoes_missao[i]"
                        type="text"
                        :placeholder="`Opção ${['A','B','C','D'][i]}`"
                        class="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </template>
        </div>

        <div class="p-6 border-t" v-if="modo === 'editar' || form.tipoEscolhido">
          <button
            @click="salvar"
            :disabled="salvandoForm || !form.titulo.trim()"
            class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
          >
            <div
              v-if="salvandoForm"
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></div>
            {{
              salvandoForm
                ? "Salvando..."
                : modo === "criar"
                  ? "✅ Criar Atividade"
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
const { user, atualizarEstrelasLocal } = useAuth();
const route = useRoute();
const router = useRouter();
const turmaId = Number(route.params.id);

const turma = ref(null);
const atividades = ref([]);
const aulasDatas = ref([]); // datas das aulas da turma para calcular o ciclo
const atividadeSelecionada = ref(null);
const registros = ref([]);
const registrosSnapshot = ref(""); // JSON dos registros ao carregar/salvar
const loading = ref(true);
const loadingAlunos = ref(false);
const salvando = ref(false);
const salvandoForm = ref(false);
const painelAberto = ref(false);
const modo = ref("criar");
const modalFeedback = ref(false);
const registroFeedback = ref(null);
const textoFeedback = ref("");
const modalEncerrar = ref(false);
const encerrando = ref(false);

const form = reactive({
  titulo: "",
  tipo: "NOTA",
  descricao: "",
  tipo_missao: "NORMAL",
  formato_missao: "multipla_escolha",
  pergunta_missao: "",
  opcoes_missao: ["", "", "", ""],
  data_final: "",
  anonimo: false,
  tipoEscolhido: false, // controla o step de seleção no drawer de criação
});

// ── Ciclo de missão (última aula ≤ hoje, fallback: segunda da semana) ────────
const inicioCicloAtual = computed(() => {
  const hoje = new Date()
  hoje.setHours(23, 59, 59, 999)
  const passadas = aulasDatas.value
    .map((d) => new Date(d + 'T00:00:00'))
    .filter((d) => d <= hoje)
    .sort((a, b) => b - a)

  if (passadas.length > 0) {
    const inicio = new Date(passadas[0])
    inicio.setHours(0, 0, 0, 0)
    return inicio
  }

  // Fallback: segunda-feira da semana atual
  const d = new Date()
  const dia = d.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
})

// ── Bloqueio de criação de missão ─────────────────────────────────────────
const bloqueioMissao = computed(() => {
  const ativa = atividades.value.find(
    (a) => a.tipo_missao === 'MISSAO' && a.status === 'PUBLICADA'
  )
  if (ativa) {
    return { bloqueado: true, motivo: 'ativa', msg: 'Já existe uma missão ativa nesta turma. Encerre-a antes de criar uma nova.' }
  }

  const ciclo = inicioCicloAtual.value
  const noCiclo = atividades.value.find(
    (a) => a.tipo_missao === 'MISSAO' && new Date(a.criado_em) >= ciclo
  )
  if (noCiclo) {
    return {
      bloqueado: true,
      motivo: 'ciclo',
      msg: `A missão "${noCiclo.titulo}" já foi criada neste ciclo. Uma nova só pode ser criada após a próxima aula.`,
    }
  }

  return { bloqueado: false, motivo: null, msg: null }
})

// ── Filtro de status ───────────────────────────────────────────────────────
const filtroAtivo = ref('todas')
const filtrosStatus = [
  { value: 'todas', label: 'Todas' },
  { value: 'ativas', label: 'Ativas' },
  { value: 'encerradas', label: 'Encerradas' },
]

// ── Listas separadas por tipo + filtro ────────────────────────────────────
const atividadesFiltradas = computed(() => {
  if (filtroAtivo.value === 'ativas') return atividades.value.filter((a) => a.status === 'PUBLICADA')
  if (filtroAtivo.value === 'encerradas') return atividades.value.filter((a) => a.status === 'ENCERRADA')
  return atividades.value
})
const provasFiltradas = computed(() =>
  atividadesFiltradas.value.filter((a) => a.tipo_missao !== "MISSAO")
);
const missoesFiltradas = computed(() =>
  atividadesFiltradas.value.filter((a) => a.tipo_missao === "MISSAO")
);
const provas = computed(() =>
  atividades.value.filter((a) => a.tipo_missao !== "MISSAO")
);
const missoes = computed(() =>
  atividades.value.filter((a) => a.tipo_missao === "MISSAO")
);

// ── Detecção de alterações não salvas ──────────────────────────────────────
const snapshotKey = (r) =>
  JSON.stringify({
    id: r.aluno_id,
    nota: r._digitos ?? null,
    feedback: r.feedback,
  });

const temAlteracoes = computed(() => {
  if (!atividadeSelecionada.value || registros.value.length === 0) return false;
  return (
    JSON.stringify(registros.value.map(snapshotKey)) !== registrosSnapshot.value
  );
});

function tirarSnapshot() {
  registrosSnapshot.value = JSON.stringify(registros.value.map(snapshotKey));
}

// ── Máscara de nota (estilo caixa registradora) ────────────────────────────
function notaDisplay(registro) {
  const d = registro._digitos ?? "";
  if (!d) return "";
  if (d === "1000") return "10,00";
  const padded = d.padStart(3, "0");
  const inteiro = padded.slice(0, -2).replace(/^0+/, "") || "0";
  const decimal = padded.slice(-2);
  return `${inteiro},${decimal}`;
}

function digitsToNota(d) {
  if (!d) return null;
  if (d === "1000") return 10.0;
  const padded = d.padStart(3, "0");
  return parseFloat(`${padded.slice(0, -2)}.${padded.slice(-2)}`);
}

function onNotaKeydown(e, registro) {
  if (atividadeSelecionada.value?.status === "ENCERRADA") return;
  const d = registro._digitos ?? "";

  if (e.key >= "0" && e.key <= "9") {
    e.preventDefault();
    const novo = (d + e.key).replace(/^0+/, "") || "0";
    if (novo.length > 4) return;
    const valorNum = digitsToNota(novo);
    if (valorNum !== null && valorNum > 10) return;
    registro._digitos = novo === "0" ? "" : novo;
    registro.nota = digitsToNota(registro._digitos);
  } else if (e.key === "Backspace") {
    e.preventDefault();
    registro._digitos = d.slice(0, -1);
    registro.nota = digitsToNota(registro._digitos);
  } else if (e.key === "Delete" || e.key === "Escape") {
    e.preventDefault();
    registro._digitos = "";
    registro.nota = null;
  }
}

function onNotaFocus(registro) {
  if (registro._digitos === undefined && registro.nota !== null) {
    const s = Number(registro.nota).toFixed(2).replace(".", "");
    registro._digitos = s.replace(/^0+/, "") || "";
  }
}

// ── Classes visuais ────────────────────────────────────────────────────────
function notaInputClass(digitos) {
  if (!digitos) return "border-gray-200 text-gray-400 bg-white";
  const n = digitsToNota(digitos);
  if (n >= 7) return "border-green-400 text-green-700 bg-green-50";
  if (n >= 5) return "border-yellow-400 text-yellow-700 bg-yellow-50";
  return "border-red-400 text-red-600 bg-red-50";
}

const resumoParticipacao = computed(() => {
  if (!atividadeSelecionada.value) return "";
  const comNota = registros.value.filter((r) => r.nota !== null).length;
  return `${comNota}/${registros.value.length} com nota`;
});

function formatarDataCurta(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

// Badge de status — considera expiração via data_final
function badgeStatus(atividade) {
  if (
    atividade.status === "PUBLICADA" &&
    atividade.data_final &&
    new Date(atividade.data_final) < new Date()
  ) {
    return "bg-yellow-100 text-yellow-600"; // expirando (lag do cron)
  }
  return (
    {
      PUBLICADA: "bg-blue-100 text-blue-700",
      ENCERRADA: "bg-red-100 text-red-500",
    }[atividade.status] ?? "bg-gray-100 text-gray-500"
  );
}

function labelStatus(atividade) {
  if (
    atividade.status === "PUBLICADA" &&
    atividade.data_final &&
    new Date(atividade.data_final) < new Date()
  ) {
    return "expirando...";
  }
  return (
    { PUBLICADA: "publicada", ENCERRADA: "encerrada" }[atividade.status] ??
    atividade.status.toLowerCase()
  );
}

// ── Encerrar atividade ─────────────────────────────────────────────────────
function confirmarEncerrar() {
  modalEncerrar.value = true;
}

async function encerrarAtividade() {
  encerrando.value = true;
  try {
    const { error } = await supabase
      .from("atividade")
      .update({ status: "ENCERRADA" })
      .eq("id", atividadeSelecionada.value.id);

    if (error) throw error;
    $toast.success("Atividade encerrada.");
    modalEncerrar.value = false;
    await carregarAtividades();
    // Atualiza o painel com os dados frescos
    const atualizada = atividades.value.find(
      (a) => a.id === atividadeSelecionada.value.id
    );
    if (atualizada) atividadeSelecionada.value = atualizada;
  } catch (err) {
    console.error(err);
    $toast.error("Erro ao encerrar atividade.");
  } finally {
    encerrando.value = false;
  }
}

// ── Dados ──────────────────────────────────────────────────────────────────
async function carregarTurma() {
  const { data } = await supabase
    .from("turma")
    .select("*")
    .eq("id", turmaId)
    .single();
  turma.value = data;
}

async function carregarAulas() {
  const { data } = await supabase
    .from("aula")
    .select("data")
    .eq("turma_id", turmaId)
    .order("data", { ascending: false });
  aulasDatas.value = (data || []).map((a) => a.data);
}

async function carregarAtividades() {
  const { data, error } = await supabase
    .from("atividade")
    .select("*")
    .eq("turma_id", turmaId)
    .order("criado_em", { ascending: false });
  if (error) { $toast.error("Erro ao carregar atividades."); return; }

  let lista = data || [];

  // Auto-encerrar atividades com data_final expirada
  const agora = new Date();
  const expiradas = lista.filter(
    (a) => a.status === "PUBLICADA" && a.data_final && new Date(a.data_final) < agora
  );
  if (expiradas.length > 0) {
    const ids = expiradas.map((a) => a.id);
    await supabase.from("atividade").update({ status: "ENCERRADA" }).in("id", ids);
    lista = lista.map((a) =>
      ids.includes(a.id) ? { ...a, status: "ENCERRADA" } : a
    );
  }

  atividades.value = lista;
}

async function escolherAtividade(atividade) {
  atividadeSelecionada.value = atividade;
  loadingAlunos.value = true;
  registros.value = [];
  registrosSnapshot.value = "";

  const { data: alunosTurma } = await supabase
    .from("turma_aluno")
    .select("aluno_id, usuarios!inner(id, nome)")
    .eq("turma_id", turmaId);

  const { data: registrosExistentes } = await supabase
    .from("atividade_aluno")
    .select("*")
    .eq("atividade_id", atividade.id);

  const mapaRegistros = Object.fromEntries(
    (registrosExistentes || []).map((r) => [r.aluno_id, r])
  );

  registros.value = (alunosTurma || [])
    .map((v) => {
      const reg = mapaRegistros[v.aluno_id];
      const notaVal = reg?.nota ?? null;
      let digitos = "";
      if (notaVal !== null) {
        digitos =
          Number(notaVal).toFixed(2).replace(".", "").replace(/^0+/, "") || "";
      }
      return {
        aluno_id: v.aluno_id,
        nome: v.usuarios?.nome ?? "",
        nota: notaVal,
        _digitos: digitos,
        feedback: reg?.feedback ?? "",
        resposta_texto: reg?.resposta_texto ?? null,
        resposta_opcao: reg?.resposta_opcao ?? null,
        respondido_em: reg?.respondido_em ?? null,
        _id: reg?.id ?? null,
      };
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  loadingAlunos.value = false;
  tirarSnapshot();
}

function abrirFeedback(registro) {
  registroFeedback.value = registro;
  textoFeedback.value = registro.feedback ?? "";
  modalFeedback.value = true;
}

function salvarFeedback() {
  if (registroFeedback.value) {
    registroFeedback.value.feedback = textoFeedback.value;
  }
  modalFeedback.value = false;
}

function excluirFeedback() {
  if (registroFeedback.value) {
    registroFeedback.value.feedback = "";
    textoFeedback.value = "";
  }
  modalFeedback.value = false;
}

async function salvarRegistros() {
  salvando.value = true;
  try {
    const upserts = toRaw(registros.value).map((r) => {
      const raw = toRaw(r);
      return {
        ...(raw._id ? { id: raw._id } : {}),
        atividade_id: atividadeSelecionada.value.id,
        aluno_id: raw.aluno_id,
        nota: raw.nota ?? null,
        feito: false,
        feedback: raw.feedback || null,
      };
    });

    const { error } = await supabase
      .from("atividade_aluno")
      .upsert(upserts, { onConflict: "atividade_id,aluno_id" });

    if (error) throw error;
    $toast.success("Registros salvos com sucesso!");

    await escolherAtividade(atividadeSelecionada.value, { forcar: true });
  } catch (err) {
    console.error(err);
    $toast.error("Erro ao salvar registros.");
  } finally {
    salvando.value = false;
  }
}

// ── Date/time picker helpers ───────────────────────────────────────────────
const horariosOpcoes = (() => {
  const h = []
  for (let i = 0; i < 24; i++) {
    h.push(`${String(i).padStart(2, '0')}:00`)
    h.push(`${String(i).padStart(2, '0')}:30`)
  }
  return h
})()

const dataFinalDate = computed(() => {
  if (!form.data_final) return ''
  return form.data_final.slice(0, 10)
})

const horaFinalTime = computed(() => {
  if (!form.data_final) return '23:00'
  const time = form.data_final.slice(11, 16)
  // Round to nearest 30min option
  const [h, m] = time.split(':').map(Number)
  const rounded = m >= 30 ? `${String(h).padStart(2, '0')}:30` : `${String(h).padStart(2, '0')}:00`
  return horariosOpcoes.includes(rounded) ? rounded : '23:00'
})

function atualizarDataFinal(date, time) {
  if (!date) { form.data_final = ''; return }
  form.data_final = `${date}T${time || '23:00'}`
}

// ── Drawer criar/editar ────────────────────────────────────────────────────
function umaSemanaAPartirDeHoje() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return `${d.toISOString().slice(0, 10)}T23:00`;
}

function abrirCriacao() {
  modo.value = "criar";
  form.titulo = "";
  form.tipo = "NOTA";
  form.descricao = "";
  form.tipo_missao = "NORMAL";
  form.formato_missao = "multipla_escolha";
  form.pergunta_missao = "";
  form.opcoes_missao = ["", "", "", ""];
  form.data_final = umaSemanaAPartirDeHoje();
  form.anonimo = false;
  form.tipoEscolhido = false;
  painelAberto.value = true;
}

function escolherTipoCriacao(tipo) {
  if (tipo === "MISSAO" && bloqueioMissao.value.bloqueado) {
    $toast.error(bloqueioMissao.value.msg)
    return
  }
  if (tipo === "MISSAO") {
    form.tipo_missao = "MISSAO";
    form.tipo = "NOTA";
  } else {
    form.tipo_missao = "NORMAL";
    form.tipo = "NOTA";
  }
  form.tipoEscolhido = true;
}

function abrirEdicao(atividade) {
  modo.value = "editar";
  form.titulo = atividade.titulo;
  form.tipo = atividade.tipo;
  form.descricao = atividade.descricao ?? "";
  form.tipo_missao = atividade.tipo_missao ?? "NORMAL";
  const conteudo = atividade.conteudo_json ?? {};
  form.formato_missao = conteudo.formato ?? "multipla_escolha";
  form.pergunta_missao = conteudo.pergunta ?? "";
  form.opcoes_missao = conteudo.opcoes ?? ["", "", "", ""];
  form.anonimo = conteudo.anonimo ?? false;
  // Converter timestamptz → datetime-local (sem segundos)
  form.data_final = atividade.data_final
    ? atividade.data_final.slice(0, 16)
    : "";
  form.tipoEscolhido = true;
  painelAberto.value = true;
}

function fecharPainel() {
  painelAberto.value = false;
}

async function salvar() {
  if (!form.titulo.trim()) return;

  // Guard: bloqueia criação de missão duplicada
  if (modo.value === 'criar' && form.tipo_missao === 'MISSAO' && bloqueioMissao.value.bloqueado) {
    $toast.error(bloqueioMissao.value.msg)
    return
  }

  salvandoForm.value = true;
  try {
    const conteudo_json =
      form.tipo_missao === "MISSAO"
        ? {
            formato: form.formato_missao,
            pergunta: form.titulo.trim(),
            anonimo: form.anonimo,
            ...(form.formato_missao === "multipla_escolha"
              ? {
                  opcoes: form.opcoes_missao
                    .map((o) => o.trim())
                    .filter(Boolean),
                }
              : {}),
          }
        : null;

    const payload = {
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      descricao: form.descricao.trim() || null,
      tipo_missao: form.tipo_missao,
      conteudo_json,
      data_final: form.data_final ? new Date(form.data_final).toISOString() : null,
    };

    if (modo.value === "criar") {
      // Sempre publica ao criar
      payload.status = "PUBLICADA";
      payload.turma_id = turmaId;

      const { data, error } = await supabase
        .from("atividade")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      const { data: alunosTurma } = await supabase
        .from("turma_aluno")
        .select("aluno_id")
        .eq("turma_id", turmaId);

      if (alunosTurma && alunosTurma.length > 0) {
        const { error: e } = await supabase.from("atividade_aluno").insert(
          alunosTurma.map((a) => ({
            atividade_id: data.id,
            aluno_id: a.aluno_id,
            feito: false,
            nota: null,
          }))
        );
        if (e) throw e;
      }

      // Bônus do professor por criar missão da semana (+20, até 8 vezes)
      if (payload.tipo_missao === "MISSAO" && user.value?.id) {
        await creditarBonusMissaoProfessor(user.value.id);
      }

      $toast.success("Atividade criada!");
    } else {
      // Edição: apenas campos não-estruturais (título, descrição, data_final)
      const { error } = await supabase
        .from("atividade")
        .update({
          titulo: payload.titulo,
          descricao: payload.descricao,
          data_final: payload.data_final,
          tipo_missao: payload.tipo_missao,
          conteudo_json: payload.conteudo_json,
        })
        .eq("id", atividadeSelecionada.value.id);

      if (error) throw error;
      $toast.success("Atividade atualizada!");
    }

    fecharPainel();
    await carregarAtividades();

    if (modo.value === "editar" && atividadeSelecionada.value) {
      const atualizada = atividades.value.find(
        (a) => a.id === atividadeSelecionada.value.id
      );
      if (atualizada) {
        await escolherAtividade(atualizada, { forcar: true });
      }
    }
  } catch (err) {
    console.error(err);
    $toast.error("Erro ao salvar atividade.");
  } finally {
    salvandoForm.value = false;
  }
}

async function creditarBonusMissaoProfessor(professorId) {
  // Conta quantas missões este professor já criou (via turmas dele)
  const { count } = await supabase
    .from('atividade')
    .select('id', { count: 'exact', head: true })
    .eq('tipo_missao', 'MISSAO')
    .in('turma_id', await turmasIdsDoProfessor(professorId))

  if ((count ?? 0) > 8) return // Limite de 8 missões com bônus

  const { data: prof } = await supabase
    .from('usuarios')
    .select('estrelas')
    .eq('id', professorId)
    .single()

  if (!prof) return

  const novoSaldo = (prof.estrelas ?? 0) + 20
  await supabase.from('usuarios').update({ estrelas: novoSaldo }).eq('id', professorId)
  atualizarEstrelasLocal(novoSaldo)
  supabase.from('estrelas_historico').insert({
    usuario_id: professorId,
    quantidade: 20,
    motivo: 'CRIOU_MISSAO',
    descricao: 'Criou uma missão da semana',
    turma_id: turmaId ?? null,
  }).then(() => {})
  $toast.success('Missão da semana criada! +20 ⭐')
}

async function turmasIdsDoProfessor(professorId) {
  const { data } = await supabase
    .from('turma')
    .select('id')
    .eq('professor_id', professorId)
  return (data ?? []).map((t) => t.id)
}

onMounted(async () => {
  await Promise.all([carregarTurma(), carregarAtividades(), carregarAulas()]);
  loading.value = false;
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

/* Remove setas do input number */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>