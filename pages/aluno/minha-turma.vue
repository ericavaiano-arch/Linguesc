<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-green-700">Minha Turma</h1>
      <p class="text-gray-500 mt-2">Acompanhe sua turma.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div
        class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"
      ></div>
      <span>Carregando...</span>
    </div>

    <div
      v-else-if="!turma"
      class="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center"
    >
      <p class="text-4xl mb-4">📚</p>
      <p class="text-gray-500 font-medium">
        Você ainda não está matriculado em nenhuma turma.
      </p>
    </div>

    <div v-else class="space-y-6">
      <!-- Voltar (só exibe se veio do seletor) -->
      <button
        v-if="temMultiplasTurmas"
        @click="$router.push('/aluno/turmas?destino=minha-turma')"
        class="text-sm text-gray-400 hover:text-gray-600 transition flex items-center gap-1"
      >
        ← Trocar turma
      </button>

      <!-- ── CARD DA TURMA ── -->
      <div
        class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
      >
        <!-- Topo: identidade + meta coletiva -->
        <div class="p-6 turma-header-grid">
          <!-- Esquerda: identidade da turma -->
          <div class="flex items-start gap-4">
            <div
              class="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5"
            >
              <svg
                class="w-5 h-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.6"
                  d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0zM3 17a3 3 0 110-6 3 3 0 010 6z"
                />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3">
                <h2 class="text-xl font-bold text-gray-800 leading-tight">
                  {{ turma.nome }}
                </h2>
              </div>
              <p class="text-sm text-gray-500 mt-1">
                {{ nomeProfessor
                }}<span v-if="turma.sala"> &bull; Sala {{ turma.sala }}</span>
              </p>
            </div>
          </div>

          <!-- Direita: meta coletiva -->
          <div class="turma-meta-box">
            <!-- Cabeçalho da meta -->
            <div class="flex items-center gap-2 mb-2">
              <svg
                class="w-4 h-4 text-green-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span
                class="text-[10px] font-bold text-green-700 uppercase tracking-widest"
                >Meta coletiva da turma</span
              >
            </div>

            <!-- Corpo: texto + recompensa -->
            <div class="flex items-start gap-4">
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-700 leading-snug">
                  Se a turma finalizar o semestre com
                  <strong class="text-green-700"
                    >{{ metaFrequencia }}% de frequência</strong
                  >, todos os estudantes ganham
                  <strong class="text-green-700"
                    >{{ RECOMPENSA_ESTRELAS }} estrelas</strong
                  >!
                </p>

                <!-- Barra de progresso -->
                <div class="mt-3">
                  <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-green-500 rounded-full transition-all duration-700"
                      :style="{ width: metaFrequencia + '%' }"
                    ></div>
                  </div>
                  <div class="flex justify-between mt-1">
                    <span class="text-[10px] text-gray-400"
                      >Frequência necessária</span
                    >
                    <span class="text-[10px] font-semibold text-green-600"
                      >{{ metaFrequencia }}%</span
                    >
                  </div>
                </div>
              </div>

              <!-- Recompensa -->
              <div class="flex-shrink-0 flex flex-col items-center text-center">
                <span class="text-2xl leading-none mb-1">⭐</span>
                <span class="text-[10px] text-gray-400 leading-none"
                  >Recompensa</span
                >
                <span class="text-base font-bold text-gray-800 mt-0.5"
                  >{{ RECOMPENSA_ESTRELAS }} estrelas</span
                >
                <span class="text-[10px] text-gray-400">para todos</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Divisor -->
        <div class="h-px bg-gray-100 mx-6"></div>

        <!-- Rodapé: métricas resumidas -->
        <div class="px-6 py-4 flex items-stretch gap-0 turma-stats-row">
          <div class="turma-stat">
            <div class="turma-stat-icon">
              <svg
                class="w-4 h-4 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.6"
                  d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0zM3 17a3 3 0 110-6 3 3 0 010 6z"
                />
              </svg>
            </div>
            <span class="turma-stat-label">Estudantes</span>
            <span class="turma-stat-value">{{ totalAlunos }}</span>
          </div>

          <div class="turma-stat-divider"></div>

          <div class="turma-stat">
            <div class="turma-stat-icon">
              <svg
                class="w-4 h-4 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.6"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <span class="turma-stat-label">Meta coletiva</span>
            <span class="turma-stat-value">{{ metaFrequencia }}%</span>
          </div>

          <div class="turma-stat-divider"></div>

          <div class="turma-stat">
            <div class="turma-stat-icon">
              <svg
                class="w-4 h-4 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.6"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span class="turma-stat-label">Próxima aula</span>
            <span class="turma-stat-value">{{
              proximaAula ? formatarDataCurta(proximaAula.data) : "—"
            }}</span>
          </div>

          <div class="turma-stat-divider"></div>

          <div class="turma-stat">
            <div class="turma-stat-icon">
              <svg
                class="w-4 h-4 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.6"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span class="turma-stat-label">Carga horária</span>
            <span class="turma-stat-value">{{ aulas.length * 1 }}h</span>
            <span class="turma-stat-sub">Semestre</span>
          </div>
        </div>
      </div>

      <!-- ── JORNADA VISUAL — MISSÃO ESPACIAL ── -->
      <div
        v-if="aulas.length > 0"
        class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
      >
        <!-- Header -->
        <div
          class="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4 flex-wrap"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-lg flex-shrink-0"
            >
              🚀
            </div>
            <div>
              <h2 class="text-base font-semibold text-gray-800 leading-tight">
                Calendário de aulas
              </h2>
              <p class="text-xs text-gray-400 mt-0.5">
                Cada aula é uma jornada. Complete a missão e decole rumo ao
                conhecimento!
              </p>
            </div>
          </div>
          <!-- Próxima conquista — slot pronto para dados futuros -->
          <div
            class="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 flex-shrink-0"
          >
            <span class="text-base">⭐</span>
            <div>
              <p
                class="text-[10px] text-amber-600 font-semibold uppercase tracking-wide leading-none"
              >
                Próxima conquista
              </p>
              <p class="text-xs font-semibold text-amber-800 mt-0.5">
                Aula da Semana <span class="font-bold">+10 ⭐</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Barra de progresso -->
        <div class="px-6 pt-4 pb-1">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs text-gray-500 font-medium">
              Jornada: {{ aulasRealizadas }}/{{ aulasDaJornada.length }} 🚀
            </span>
            <span class="text-xs text-gray-400">
              {{
                aulasRealizadas === aulasDaJornada.length &&
                aulasDaJornada.length > 0
                  ? "🎉 Missão cumprida!"
                  : `${aulasDaJornada.length - aulasRealizadas} aula(s) restante(s)`
              }}
            </span>
          </div>
          <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-green-500 rounded-full transition-all duration-700"
              :style="{
                width:
                  aulasDaJornada.length > 0
                    ? `${(aulasRealizadas / aulasDaJornada.length) * 100}%`
                    : '0%',
              }"
            ></div>
          </div>
        </div>

        <!-- Mapa da jornada -->
        <div class="jornada-scroll-area px-6 py-6">
          <div ref="jornadaMapaRef" class="jornada-mapa">
            <!-- SVG da trilha — responsivo, recalculado pelo ResizeObserver -->
            <svg
              v-if="aulasDaJornada.length > 1 && trilhaSvgWidth > 0"
              class="jornada-trilha-svg"
              :viewBox="`0 0 ${trilhaSvgWidth} ${trilhaSvgHeight}`"
              :width="trilhaSvgWidth"
              :height="trilhaSvgHeight"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              pointer-events="none"
              style="z-index: 0"
            >
              <!-- Trilha completa cinza -->
              <path
                :d="trilhaPath"
                fill="none"
                stroke="#E5E7EB"
                stroke-width="2.5"
                stroke-dasharray="6 5"
                stroke-linecap="round"
              />
              <!-- Trecho concluído verde -->
              <path
                v-if="aulasRealizadas > 0"
                :d="trilhaPathConcluida"
                fill="none"
                stroke="#22C55E"
                stroke-width="2.5"
                stroke-linecap="round"
              />
            </svg>

            <!-- Etapas -->
            <div class="jornada-etapas">
              <div
                v-for="(etapa, idx) in aulasDaJornada"
                :key="etapa.id"
                class="jornada-etapa"
                :class="[
                  `jornada-etapa--${etapa.statusEtapa}`,
                  idx % 2 !== 0 ? 'jornada-etapa--baixo' : '',
                ]"
                role="button"
                tabindex="0"
                :aria-label="`Ver detalhes da aula ${idx + 1}: ${etapa.nomeEtapa}`"
                @click="abrirModal(etapa, idx)"
                @keydown.enter="abrirModal(etapa, idx)"
              >
                <!-- Data -->
                <div class="etapa-data">
                  <span class="etapa-dia-num"
                    >{{ dia(etapa.data) }}/{{ mesNum(etapa.data) }}</span
                  >
                  <span class="etapa-dia-semana">{{
                    diaSemana(etapa.data).toUpperCase()
                  }}</span>
                </div>

                <!-- Planeta -->
                <div class="etapa-planeta-wrap">
                  <div
                    v-if="etapa.statusEtapa === 'atual'"
                    class="etapa-glow"
                  ></div>
                  <div class="etapa-planeta">
                    <span class="etapa-planeta-emoji">{{ etapa.emoji }}</span>
                    <span
                      class="etapa-numero"
                      :class="`etapa-numero--${etapa.statusEtapa}`"
                      >{{ idx + 1 }}</span
                    >
                    <span
                      v-if="etapa.statusEtapa === 'bloqueada'"
                      class="etapa-cadeado"
                      >🔒</span
                    >
                  </div>
                </div>

                <!-- Info textual -->
                <div class="etapa-info">
                  <span class="etapa-aula-label">Aula {{ idx + 1 }}</span>
                  <strong class="etapa-nome-etapa">{{
                    etapa.nomeEtapa
                  }}</strong>
                  <span class="etapa-conteudo">{{ etapa.conteudo }}</span>
                </div>

                <!-- Badge de status -->
                <div class="etapa-status-wrap">
                  <span
                    class="etapa-status-badge"
                    :class="`etapa-status-badge--${etapa.statusEtapa}`"
                  >
                    <span v-if="etapa.statusEtapa === 'concluida'"
                      >Concluída ✓</span
                    >
                    <span v-else-if="etapa.statusEtapa === 'atual'"
                      >Atual 🚀</span
                    >
                    <span v-else-if="etapa.statusEtapa === 'proxima'"
                      >Próxima</span
                    >
                    <span v-else>Bloqueada 🔒</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer motivacional -->
        <div class="px-6 pb-4">
          <p class="text-xs text-amber-600 flex items-center gap-1.5">
            <span>⭐</span>
            <span>
              <template
                v-if="
                  aulasRealizadas === aulasDaJornada.length &&
                  aulasDaJornada.length > 0
                "
              >
                Parabéns! Você completou todas as aulas da missão! 🎉
              </template>
              <template v-else>
                Complete todas as aulas e receba a Recompensa Final! 🚀
              </template>
            </span>
          </p>
        </div>
      </div>

      <!-- ── ESTUDANTES DA TURMA ── -->
      <div
        class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
      >
        <!-- Cabeçalho -->
        <div
          class="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0"
            >
              <svg
                class="w-5 h-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.6"
                  d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0zM3 17a3 3 0 110-6 3 3 0 010 6z"
                />
              </svg>
            </div>
            <div>
              <h2 class="text-base font-semibold text-gray-800 leading-tight">
                Colegas da turma
              </h2>
              <p class="text-xs text-gray-400 mt-0.5">
                Conheça os colegas da sua turma e veja um pouco mais sobre cada
                um.
              </p>
            </div>
          </div>
          <span
            class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium flex-shrink-0"
          >
            {{ totalAlunos }} estudante(s)
          </span>
        </div>

        <!-- Grid de cards -->
        <div class="p-6">
          <div class="alunos-grid">
            <div
              v-for="aluno in alunosAtivos"
              :key="aluno.id"
              class="aluno-card"
              :class="aluno.nivel >= 2 ? 'aluno-card--nivel2' : ''"
            >
              <!-- Badge do nível -->
              <div class="flex justify-end mb-3">
                <span
                  class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                  :class="
                    aluno.nivel === 0
                      ? 'bg-gray-100 text-gray-500'
                      : aluno.nivel === 1
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                  "
                >
                  Nível {{ aluno.nivel ?? 0 }}
                </span>
              </div>

              <!-- Avatar / Foto / Emoji -->
              <div class="flex flex-col items-center mb-4">
                <!-- Emoji avatar — visível para todos, independente de nível -->
                <div
                  v-if="aluno.avatar_url && !aluno.avatar_url.includes('/')"
                  class="w-20 h-20 rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center text-4xl select-none"
                >
                  {{ aluno.avatar_url }}
                </div>

                <!-- Foto real — só se eu e o colega são nível >= 2 -->
                <div
                  v-else-if="
                    aluno.avatar_url &&
                    aluno.avatar_url.includes('/') &&
                    meuNivelLogado >= 2 &&
                    aluno.nivel >= 2
                  "
                  class="aluno-foto-wrap aluno-foto-wrap--nivel2"
                >
                  <img
                    v-if="aluno.signedUrl"
                    :src="aluno.signedUrl"
                    :alt="aluno.nome"
                    class="aluno-foto"
                  />
                  <div
                    v-else
                    class="aluno-foto bg-blue-50 flex items-center justify-center"
                  >
                    <svg
                      class="w-10 h-10 text-blue-200"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z"
                      />
                    </svg>
                  </div>
                </div>

                <!-- Fallback genérico (sem avatar, ou foto bloqueada por nível) -->
                <div v-else class="flex flex-col items-center gap-2">
                  <div
                    class="w-20 h-20 rounded-full bg-green-50 border-2 border-gray-200 flex items-center justify-center"
                  >
                    <svg
                      class="w-10 h-10 text-green-300"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z"
                      />
                    </svg>
                  </div>
                  <!-- Aviso de foto bloqueada: só se o colega tem foto real e eu não tenho nível suficiente -->
                  <button
                    v-if="
                      aluno.avatar_url &&
                      aluno.avatar_url.includes('/') &&
                      aluno.nivel >= 2 &&
                      meuNivelLogado < 2
                    "
                    class="flex items-center gap-1 text-[11px] text-gray-400 hover:text-green-600 transition"
                    @click="modalBloqueadoTipo = 'foto'"
                  >
                    <svg
                      class="w-3 h-3 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 10V8a6 6 0 1112 0v2M5 10h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z"
                      />
                    </svg>
                    Foto bloqueada
                  </button>
                </div>
              </div>

              <!-- Nome (sempre visível — bit 1 é fixo) -->
              <h3
                class="text-sm font-semibold text-gray-800 text-center mb-1 leading-tight"
              >
                {{ aluno.nome }}
              </h3>

              <!-- Informações adicionais — só se EU sou nível >= 1 -->
              <template v-if="meuNivelLogado >= 1">
                <!-- Curso + Idade — respeitando visibilidade do colega -->
                <div class="flex flex-col gap-1 mt-3 w-full">
                  <div
                    v-if="aluno.curso && campoVisivelAluno(aluno, CAMPOS.curso)"
                    class="flex items-center gap-1.5 text-xs text-gray-500"
                  >
                    <svg
                      class="w-3.5 h-3.5 text-green-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0 0H9m3 0h3"
                      />
                    </svg>
                    <span class="truncate">{{ aluno.curso }}</span>
                  </div>
                  <div
                    v-if="aluno.idade && campoVisivelAluno(aluno, CAMPOS.idade)"
                    class="flex items-center gap-1.5 text-xs text-gray-500"
                  >
                    <svg
                      class="w-3.5 h-3.5 text-green-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>{{ aluno.idade }} anos</span>
                  </div>
                </div>

                <!-- Interesses -->
                <div
                  v-if="
                    interesses(aluno).length &&
                    campoVisivelAluno(aluno, CAMPOS.interesses)
                  "
                  class="mt-3 w-full"
                >
                  <p
                    class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1"
                  >
                    <svg
                      class="w-3 h-3 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    Interesses
                  </p>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="(item, i) in interesses(aluno)"
                      :key="i"
                      class="text-[11px] px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-full"
                      >{{ item }}</span
                    >
                  </div>
                </div>

                <!-- Motivações -->
                <div
                  v-if="
                    aluno.motivacoes &&
                    campoVisivelAluno(aluno, CAMPOS.motivacao)
                  "
                  class="mt-3 w-full"
                >
                  <p
                    class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1"
                  >
                    <svg
                      class="w-3 h-3 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Motivações
                  </p>
                  <p
                    class="text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed line-clamp-3"
                  >
                    {{ aluno.motivacoes }}
                  </p>
                </div>
              </template>

              <!-- EU sou nível 0: aviso para desbloquear -->
              <template v-else>
                <button
                  class="mt-3 w-full text-center text-xs text-gray-400 hover:text-green-600 transition leading-relaxed px-1 py-1"
                  @click="modalBloqueadoTipo = 'infos'"
                >
                  <svg
                    class="w-3.5 h-3.5 inline mr-1 -mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.6"
                      d="M6 10V8a6 6 0 1112 0v2M5 10h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z"
                    />
                  </svg>
                  Aumente seu nível para ver as informações dos colegas
                </button>
              </template>
            </div>
          </div>

          <p v-if="inativos.length > 0" class="text-xs text-gray-400 mt-4">
            + {{ inativos.length }} estudante(s) inativo(s) não exibido(s)
          </p>
        </div>
      </div>

      <!-- ── MODAL: NÍVEL DE PERFIL INSUFICIENTE ── -->
      <Teleport to="body">
        <Transition name="modal">
          <div
            v-if="modalBloqueadoTipo"
            class="modal-overlay"
            @click.self="fecharModal"
          >
            <div class="modal-card" role="dialog" aria-modal="true">
              <div class="modal-body">
                <div class="flex flex-col items-center text-center py-2">
                  <div
                    class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4"
                  >
                    <svg
                      class="w-7 h-7 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M6 10V8a6 6 0 1112 0v2M5 10h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 class="text-base font-semibold text-gray-800 mb-1">
                    Funcionalidade bloqueada
                  </h3>
                  <p class="text-sm text-gray-500 leading-relaxed mb-5">
                    {{
                      modalBloqueadoTipo === "foto"
                        ? "Ver a foto dos colegas está disponível a partir do"
                        : "Ver as informações dos colegas está disponível a partir do"
                    }}
                    <strong class="text-gray-700">{{
                      modalBloqueadoTipo === "foto"
                        ? "Nível 2 — Membro"
                        : "Nível 1 — Estudante"
                    }}</strong
                    >. Complete seu perfil para desbloquear.
                  </p>
                  <NuxtLink
                    :to="`/profile/${user?.id}`"
                    @click="fecharModal"
                    class="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition text-center"
                  >
                    Completar perfil agora
                  </NuxtLink>
                  <button
                    @click="fecharModal"
                    class="mt-3 text-sm text-gray-400 hover:text-gray-600 transition"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>

    <!-- ── MODAL DE DETALHES DA AULA ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="aulaModal"
          class="modal-overlay"
          @click.self="aulaModal = null"
        >
          <div class="modal-card" role="dialog" aria-modal="true">
            <!-- Header do modal -->
            <div class="modal-header">
              <div class="modal-planeta">{{ aulaModal.emoji }}</div>
              <div class="modal-header-info">
                <p class="modal-aula-label">
                  Aula {{ aulaModal.idx + 1 }} ·
                  {{ formatarDataCurta(aulaModal.data) }}
                </p>
                <h3 class="modal-titulo">{{ aulaModal.nomeEtapa }}</h3>
                <span
                  class="etapa-status-badge"
                  :class="`etapa-status-badge--${aulaModal.statusEtapa}`"
                  style="margin-top: 6px; display: inline-flex"
                >
                  <span v-if="aulaModal.statusEtapa === 'concluida'"
                    >Concluída ✓</span
                  >
                  <span v-else-if="aulaModal.statusEtapa === 'atual'"
                    >Aula atual 🚀</span
                  >
                  <span v-else-if="aulaModal.statusEtapa === 'proxima'"
                    >Próxima aula</span
                  >
                  <span v-else>Bloqueada 🔒</span>
                </span>
              </div>
              <button
                class="modal-fechar"
                @click="aulaModal = null"
                aria-label="Fechar"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <!-- Tópico principal -->
              <div class="modal-section">
                <p class="modal-section-label">Tópico da aula</p>
                <p class="modal-section-value">
                  {{ aulaModal.conteudo || "—" }}
                </p>
              </div>

              <!-- Objetivos -->
              <div v-if="aulaModal.objetivos?.length" class="modal-section">
                <p class="modal-section-label">Objetivos</p>
                <ul class="modal-lista">
                  <li v-for="(obj, i) in aulaModal.objetivos" :key="i">
                    {{ obj }}
                  </li>
                </ul>
              </div>

              <!-- Vocabulário -->
              <!-- <div v-if="aulaModal.vocabulario?.length" class="modal-section">
                <p class="modal-section-label">Vocabulário-chave</p>
                <div class="modal-tags">
                  <span
                    v-for="(v, i) in aulaModal.vocabulario"
                    :key="i"
                    class="modal-tag"
                    >{{ v }}</span
                  >
                </div>
              </div> -->

              <!-- Atividades -->
              <!-- <div v-if="aulaModal.atividades?.length" class="modal-section">
                <p class="modal-section-label">Atividades previstas</p>
                <ul class="modal-lista">
                  <li v-for="(at, i) in aulaModal.atividades" :key="i">
                    {{ at }}
                  </li>
                </ul>
              </div> -->

              <!-- Dica da aula -->
              <!-- <div v-if="aulaModal.dica" class="modal-dica">
                <span class="text-base">💡</span>
                <p>{{ aulaModal.dica }}</p>
              </div> -->

              <!-- Aviso se bloqueada -->
              <div
                v-if="aulaModal.statusEtapa === 'bloqueada'"
                class="modal-aviso"
              >
                <span>🔒</span>
                <p>
                  Esta aula ainda não foi liberada. Continue frequentando as
                  aulas anteriores!
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { supabase } from "~/utils/supabase";

definePageMeta({ middleware: "auth" });

const { user } = useAuth();
const route = useRoute();
const router = useRouter();
const { metaFrequencia } = useConfigSistema();
const RECOMPENSA_ESTRELAS = 5; // fixo por enquanto; substituir por config futura

const loading = ref(true);
const turma = ref(null);
const nomeProfessor = ref("—");
const todosAlunos = ref([]);
const todasPresencas = ref([]);
const totalAulas = ref(0);
const proximaAula = ref(null);
const todasJustificativas = ref([]);
const temMultiplasTurmas = ref(false);
const aulas = ref([]);

const CAMPOS = Object.freeze({ nome: 1, email: 2, curso: 4, idade: 8, interesses: 16, motivacao: 32 })

function campoVisivelAluno(aluno, bit) {
  return ((aluno.campos_visiveis ?? 63) & bit) > 0
}

const alunosAtivos = computed(() =>
  todosAlunos.value
    .filter((a) => a.ativo)
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
);

// ── Jornada Visual ───────────────────────────────────────────────
//
// COMO EDITAR O CONTEÚDO PROGRAMÁTICO:
// Cada chave do objeto abaixo corresponde ao campo `nivel` da tabela `turma`
// (1 = Básico 1, 2 = Básico 2, 3 = Intermediário 1, 4 = Intermediário 2, 5 = Conversação).
// Cada entrada do array representa uma aula, em ordem cronológica.
// Campos disponíveis por aula:
//   nomeEtapa  — nome da etapa na jornada espacial (obrigatório)
//   emoji      — emoji do planeta/ícone (obrigatório)
//   conteudo   — tópico principal exibido no card (obrigatório)
//   objetivos  — array de strings com os objetivos de aprendizagem
//   vocabulario — array de strings com palavras-chave da aula
//   atividades — array de strings com atividades previstas
//   dica       — string com dica motivacional ou de estudo
//
const CONFIG_ETAPAS_POR_NIVEL = {
  // ── Básico 1 ──────────────────────────────────────────────────
  1: [
    {
      nomeEtapa: "Decolagem",
      emoji: "🚀",
      conteudo: "Introductions & Greetings",
      objetivos: [
        "Apresentar-se em inglês",
        "Dinâmica de apresentação em duplas",
        'Perguntar e responder "What\'s your name?"',
      ],
      vocabulario: ["Hello", "My name is", "Nice to meet you", "Goodbye"],
      atividades: [
        "Dinâmica de apresentação em duplas",
        'Jogo "Duas mentiras e uma verdade"',
      ],
      dica: "Não tenha medo de errar! A prática é a melhor forma de aprender.",
    },
    {
      nomeEtapa: "Órbita Lunar",
      emoji: "🌕",
      conteudo: "Verb to be",
      objetivos: [
        "Usar o verbo to be no presente",
        "Formar frases afirmativas e negativas",
        "Fazer perguntas simples com to be",
      ],
      vocabulario: ["I am", "You are", "He/She is", "We are", "They are"],
      atividades: ["Exercícios de completar lacunas", "Diálogos em pares"],
      dica: "Memorize as contrações: I'm, You're, He's — elas aparecem em tudo!",
    },
    {
      nomeEtapa: "Cinturão de Asteroides",
      emoji: "☄️",
      conteudo: "Present Simple",
      objetivos: [
        "Conjugar verbos no presente simples",
        "Descrever rotinas e hábitos",
        "Usar advérbios de frequência",
      ],
      vocabulario: ["always", "usually", "sometimes", "never", "do/does"],
      atividades: [
        "Questionário de rotinas",
        'Mini-apresentação "My daily routine"',
      ],
      dica: "Atenção ao -s na 3ª pessoa: He work*s*, She eat*s*.",
    },
    {
      nomeEtapa: "Marte",
      emoji: "🔴",
      conteudo: "There is / There are",
      objetivos: [
        "Descrever ambientes e lugares",
        "Usar there is e there are corretamente",
      ],
      vocabulario: ["There is", "There are", "some", "any", "a lot of"],
      atividades: [
        "Descrever a sala de aula em inglês",
        "Jogo de descrição de imagens",
      ],
      dica: 'Use "there is" para singular e "there are" para plural.',
    },
    {
      nomeEtapa: "Júpiter",
      emoji: "🪐",
      conteudo: "Possessive 's & Pronouns",
      objetivos: ["Usar pronomes possessivos", "Indicar posse com 's"],
      vocabulario: ["my", "your", "his", "her", "our", "their", "John's"],
      atividades: ["Atividade com objetos da sala", "Diálogo sobre família"],
      dica: null,
    },
    {
      nomeEtapa: "Saturno",
      emoji: "🪐",
      conteudo: "Past Simple",
      objetivos: [
        "Usar o passado simples de verbos regulares e irregulares",
        "Narrar eventos passados",
      ],
      vocabulario: ["yesterday", "last week", "ago", "went", "had", "was/were"],
      atividades: ["Contar o fim de semana em inglês", "Listening de relatos"],
      dica: "Os verbos irregulares precisam ser memorizados — vale criar um caderninho!",
    },
    {
      nomeEtapa: "Borda do Sistema Solar",
      emoji: "🌌",
      conteudo: "Future with will & going to",
      objetivos: [
        "Fazer planos e previsões em inglês",
        "Diferenciar will e going to",
      ],
      vocabulario: ["will", "going to", "tomorrow", "next week", "I think"],
      atividades: [
        "Planejar uma viagem imaginária",
        "Debate: previsões para o futuro",
      ],
      dica: 'Use "going to" para planos já decididos e "will" para decisões no momento.',
    },
    {
      nomeEtapa: "Estrela Distante",
      emoji: "⭐",
      conteudo: "Review & Final Project",
      objetivos: [
        "Revisar os principais conteúdos do semestre",
        "Apresentar um projeto final",
      ],
      vocabulario: [],
      atividades: [
        "Revisão geral em grupos",
        "Apresentação oral do projeto final",
        "Encerramento e feedback",
      ],
      dica: "Você chegou até aqui — parabéns! Continue praticando após o curso. 🚀",
    },
  ],

  // ── Básico 2 ──────────────────────────────────────────────────
  2: [
    {
      nomeEtapa: "Decolagem",
      emoji: "🚀",
      conteudo: "Review & Warm-up",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Órbita Lunar",
      emoji: "🌕",
      conteudo: "Comparatives & Superlatives",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Cinturão de Asteroides",
      emoji: "☄️",
      conteudo: "Present Continuous",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Marte",
      emoji: "🔴",
      conteudo: "Past Continuous",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Júpiter",
      emoji: "🪐",
      conteudo: "Modal Verbs (can/could/must)",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Saturno",
      emoji: "🪐",
      conteudo: "Conditional (if)",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Borda do Sistema Solar",
      emoji: "🌌",
      conteudo: "Reading & Listening",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Estrela Distante",
      emoji: "⭐",
      conteudo: "Review & Final Project",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
  ],

  // ── Intermediário 1 ───────────────────────────────────────────
  3: [
    {
      nomeEtapa: "Decolagem",
      emoji: "🚀",
      conteudo: "Review & Fluency Goals",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Órbita Lunar",
      emoji: "🌕",
      conteudo: "Present Perfect",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Cinturão de Asteroides",
      emoji: "☄️",
      conteudo: "Passive Voice",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Marte",
      emoji: "🔴",
      conteudo: "Reported Speech",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Júpiter",
      emoji: "🪐",
      conteudo: "Phrasal Verbs",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Saturno",
      emoji: "🪐",
      conteudo: "Conditionals (2nd & 3rd)",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Borda do Sistema Solar",
      emoji: "🌌",
      conteudo: "Academic Reading",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Estrela Distante",
      emoji: "⭐",
      conteudo: "Review & Final Project",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
  ],

  // ── Intermediário 2 ───────────────────────────────────────────
  4: [
    {
      nomeEtapa: "Decolagem",
      emoji: "🚀",
      conteudo: "Advanced Warm-up",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Órbita Lunar",
      emoji: "🌕",
      conteudo: "Complex Sentences",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Cinturão de Asteroides",
      emoji: "☄️",
      conteudo: "Debate & Argumentation",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Marte",
      emoji: "🔴",
      conteudo: "Academic Writing",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Júpiter",
      emoji: "🪐",
      conteudo: "Idiomatic Expressions",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Saturno",
      emoji: "🪐",
      conteudo: "Listening & Pronunciation",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Borda do Sistema Solar",
      emoji: "🌌",
      conteudo: "Presentations in English",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Estrela Distante",
      emoji: "⭐",
      conteudo: "Review & Final Project",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
  ],

  // ── Conversação ───────────────────────────────────────────────
  5: [
    {
      nomeEtapa: "Decolagem",
      emoji: "🚀",
      conteudo: "Ice-breaker & Fluency Check",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Órbita Lunar",
      emoji: "🌕",
      conteudo: "Small Talk & Social Topics",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Cinturão de Asteroides",
      emoji: "☄️",
      conteudo: "Opinions & Debates",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Marte",
      emoji: "🔴",
      conteudo: "Storytelling",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Júpiter",
      emoji: "🪐",
      conteudo: "Negotiation & Persuasion",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Saturno",
      emoji: "🪐",
      conteudo: "Pop Culture & Media",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Borda do Sistema Solar",
      emoji: "🌌",
      conteudo: "Formal vs Informal Speech",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
    {
      nomeEtapa: "Estrela Distante",
      emoji: "⭐",
      conteudo: "Free Conversation & Closing",
      objetivos: [],
      vocabulario: [],
      atividades: [],
      dica: null,
    },
  ],
};

// Fallback: se a turma não tiver nível definido, usa Básico 1
const configEtapas = computed(() => {
  const nivel = turma.value?.nivel ?? 1;
  return CONFIG_ETAPAS_POR_NIVEL[nivel] ?? CONFIG_ETAPAS_POR_NIVEL[1];
});

const aulasDaJornada = computed(() => {
  const hoje = new Date().toISOString().split("T")[0];
  const ordenadas = [...aulas.value].sort((a, b) =>
    a.data.localeCompare(b.data),
  );
  const idxAtual = ordenadas.findIndex(
    (a) => a.status === "AGENDADA" && a.data >= hoje,
  );
  const etapas = configEtapas.value;

  return ordenadas.map((aula, idx) => {
    const config = etapas[idx] ?? {
      nomeEtapa: `Etapa ${idx + 1}`,
      emoji: "🌍",
      conteudo: "",
    };
    let statusEtapa;
    if (aula.status === "REALIZADA") statusEtapa = "concluida";
    else if (idx === idxAtual) statusEtapa = "atual";
    else if (idx === idxAtual + 1) statusEtapa = "proxima";
    else statusEtapa = "bloqueada";
    return { ...aula, ...config, statusEtapa };
  });
});

// ── Modal de detalhes da aula ─────────────────────────────────────
const aulaModal = ref(null);

function abrirModal(etapa, idx) {
  aulaModal.value = { ...etapa, idx };
}

// ── Nível do usuário logado (computed global para o template) ────
const meuNivelLogado = computed(
  () => todosAlunos.value.find((a) => a.id === user.value?.id)?.nivel ?? 0,
);

// ── Modal: perfil bloqueado ───────────────────────────────────────
const modalBloqueadoTipo = ref(null); // 'foto' | 'infos' | null

function fecharModal() {
  modalBloqueadoTipo.value = null;
}

// ── Helper: normaliza interesses (string CSV ou array) ───────────
function interesses(aluno) {
  if (!aluno.interesses) return [];
  if (Array.isArray(aluno.interesses)) return aluno.interesses.filter(Boolean);
  return String(aluno.interesses)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── Trilha SVG responsiva ─────────────────────────────────────────
// O SVG é recalculado sempre que o container muda de tamanho,
// garantindo que os planetas e a linha sempre coincidam.

const jornadaMapaRef = ref(null);
const mapaWidth = ref(0);

// Altura SVG: precisa cobrir o offset vertical das etapas ímpares (40px)
// mais o raio do planeta (36px) + margem. 100px é confortável.
const TRILHA_Y_TOP = 36; // centro do planeta nas etapas pares  (topo)
const TRILHA_Y_BOT = 76; // centro do planeta nas etapas ímpares (baixo, +40px margin-top)
const trilhaSvgHeight = 112;
const trilhaSvgWidth = computed(() => mapaWidth.value || 0);

function etapaX(idx, total, w) {
  if (total === 1) return w / 2;
  // Distribui igualmente da borda esquerda à direita
  return (idx / (total - 1)) * w;
}

function etapaY(idx) {
  return idx % 2 === 0 ? TRILHA_Y_TOP : TRILHA_Y_BOT;
}

function buildPath(etapas, w) {
  if (etapas.length < 2 || w === 0) return "";
  const total = aulasDaJornada.value.length;
  return etapas
    .map((e, i) => {
      const x = etapaX(e._idx, total, w);
      const y = etapaY(e._idx);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");
}

const trilhaPath = computed(() => {
  const w = mapaWidth.value;
  const etapas = aulasDaJornada.value.map((e, i) => ({ ...e, _idx: i }));
  return buildPath(etapas, w);
});

const trilhaPathConcluida = computed(() => {
  const w = mapaWidth.value;
  const etapas = aulasDaJornada.value
    .map((e, i) => ({ ...e, _idx: i }))
    .filter((e) => e.statusEtapa === "concluida");
  return buildPath(etapas, w);
});

// ResizeObserver: atualiza mapaWidth sempre que o container redimensiona
let roJornada = null;
onMounted(() => {
  nextTick(() => {
    if (!jornadaMapaRef.value) return;
    roJornada = new ResizeObserver((entries) => {
      mapaWidth.value = entries[0]?.contentRect.width ?? 0;
    });
    roJornada.observe(jornadaMapaRef.value);
  });
});
onUnmounted(() => roJornada?.disconnect());

const proximasAulas = computed(() => {
  const hoje = new Date().toISOString().split("T")[0];
  return aulas.value.filter((a) => a.status === "AGENDADA" && a.data >= hoje);
});

function diaSemana(dataStr) {
  const d = new Date(dataStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
}

function dia(dataStr) {
  return new Date(dataStr + "T12:00:00").getDate();
}

function mesNum(dataStr) {
  return String(new Date(dataStr + "T12:00:00").getMonth() + 1).padStart(
    2,
    "0",
  );
}

function mes(dataStr) {
  const d = new Date(dataStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
}

onMounted(async () => {
  const alunoId = user.value?.id;
  if (!alunoId) {
    loading.value = false;
    return;
  }

  const turmaId = route.query.turma_id ? Number(route.query.turma_id) : null;

  const { data: vinculos } = await supabase
    .from("turma_aluno")
    .select(
      "turma_id, turma(id, nome, status, meta_frequencia, professor_id, sala, nivel)",
    )
    .eq("aluno_id", alunoId);

  if (!vinculos || vinculos.length === 0) {
    loading.value = false;
    return;
  }

  temMultiplasTurmas.value = vinculos.length > 1;

  let vinculo;
  if (turmaId) {
    vinculo = vinculos.find((v) => v.turma_id === turmaId);
  } else if (vinculos.length === 1) {
    vinculo = vinculos[0];
  } else {
    router.replace("/aluno/turmas?destino=minha-turma");
    return;
  }

  if (!vinculo) {
    loading.value = false;
    return;
  }
  turma.value = vinculo.turma;

  const tId = turma.value.id;
  const professorId = turma.value.professor_id;

  const [{ data: professorData }, { data: vinculosData }, { data: aulasData }] =
    await Promise.all([
      supabase.from("usuarios").select("nome").eq("id", professorId).single(),
      supabase
        .from("turma_aluno")
        .select(
          "aluno_id, usuarios(id, nome, ativo, nivel_perfil, avatar_url, curso, idade, interesses, motivacao_ingles, campos_visiveis)",
        )
        .eq("turma_id", tId),
      supabase
        .from("aula")
        .select("id, data, status")
        .eq("turma_id", tId)
        .order("data", { ascending: true }),
    ]);

  nomeProfessor.value = professorData?.nome ?? "—";
  aulas.value = aulasData || [];

  // Nível do usuário logado — determina o que pode ser exibido
  const meuNivel =
    (vinculosData || []).find((v) => v.aluno_id === alunoId)?.usuarios
      ?.nivel_perfil ?? 0;

  todosAlunos.value = (vinculosData || []).map((v) => ({
    id: v.aluno_id,
    nome: v.usuarios?.nome ?? "",
    ativo: v.usuarios?.ativo ?? true,
    nivel: v.usuarios?.nivel_perfil ?? 0,
    avatar_url: v.usuarios?.avatar_url ?? null,   // ← adicionado
    signedUrl: null,
    curso: v.usuarios?.curso ?? null,
    idade: v.usuarios?.idade ?? null,
    interesses: v.usuarios?.interesses ?? null,
    motivacoes: v.usuarios?.motivacao_ingles ?? null,
    campos_visiveis: v.usuarios?.campos_visiveis ?? 63,  // ← adicionado
  }));

  // Busca signed URLs de avatar apenas se o usuário logado for nível 2
  if (meuNivel >= 2) {
    const nivel2Ids = todosAlunos.value
      .filter((a) => a.ativo && a.nivel >= 2 && a.avatar_url?.includes('/'))
      .map((a) => a.id);

    if (nivel2Ids.length > 0) {
      const paths = nivel2Ids.map((id) => `${id}/avatar.jpg`);
      const { data: signedData } = await supabase.storage
        .from("avatares")
        .createSignedUrls(paths, 3600);

      if (signedData) {
        const urlMap = Object.fromEntries(
          signedData.map((s) => [s.path.split("/")[0], s.signedUrl]),
        );
        todosAlunos.value = todosAlunos.value.map((a) => ({
          ...a,
          signedUrl: urlMap[a.id] ?? null,
        }));
      }
    }
  }

  const aulasRealizadasIds = (aulasData || [])
    .filter((a) => a.status === "REALIZADA")
    .map((a) => a.id);
  totalAulas.value = aulasRealizadasIds.length;

  const hoje = new Date().toISOString().split("T")[0];
  proximaAula.value =
    (aulasData || [])
      .filter((a) => a.status === "AGENDADA" && a.data >= hoje)
      .sort((a, b) => a.data.localeCompare(b.data))[0] ?? null;

  const alunosIds = todosAlunos.value.map((a) => a.id);

  if (alunosIds.length > 0 && aulasRealizadasIds.length > 0) {
    const [{ data: presencasData }, { data: justData }] = await Promise.all([
      supabase
        .from("presenca")
        .select("aluno_id, aula_id")
        .in("aluno_id", alunosIds)
        .in("aula_id", aulasRealizadasIds),
      supabase
        .from("justificativa_falta")
        .select("aluno_id, aula_id, status")
        .in("aluno_id", alunosIds)
        .in("aula_id", aulasRealizadasIds)
        .eq("status", "ACEITA"),
    ]);
    todasPresencas.value = presencasData || [];
    todasJustificativas.value = justData || [];
  }

  loading.value = false;
});

// ── Computeds ────────────────────────────────────────────────────

const aulasRealizadas = computed(() => totalAulas.value);
const totalAlunos = computed(
  () => todosAlunos.value.filter((a) => a.ativo).length,
);
const inativos = computed(() => todosAlunos.value.filter((a) => !a.ativo));

const mediaFrequenciaTurma = computed(() => {
  if (rankingAtivos.value.length === 0) return 0;
  const soma = rankingAtivos.value.reduce((acc, a) => acc + a.frequencia, 0);
  return Math.round(soma / rankingAtivos.value.length);
});

const rankingAtivos = computed(() => {
  const meuId = user.value?.id;
  const lista = todosAlunos.value
    .filter((a) => a.ativo)
    .map((aluno) => {
      const presencas = todasPresencas.value.filter(
        (p) => p.aluno_id === aluno.id,
      ).length;
      const justAceitas = todasJustificativas.value.filter(
        (j) =>
          j.aluno_id === aluno.id &&
          !todasPresencas.value.some(
            (p) => p.aluno_id === aluno.id && p.aula_id === j.aula_id,
          ),
      ).length;
      const totalValidas = presencas + justAceitas;
      const frequencia =
        aulasRealizadas.value > 0
          ? Math.round((totalValidas / aulasRealizadas.value) * 100)
          : 0;
      return {
        id: aluno.id,
        isVoce: aluno.id === meuId,
        presencas: totalValidas,
        frequencia,
      };
    })
    .sort((a, b) => b.frequencia - a.frequencia);

  let contador = 1;
  return lista.map((aluno) => ({
    ...aluno,
    nomeAnonimo: aluno.isVoce ? "Você" : `Colega ${contador++}`,
  }));
});

const minhaFrequencia = computed(
  () => rankingAtivos.value.find((a) => a.isVoce)?.frequencia ?? 0,
);

const minhaPosicao = computed(() => {
  const pos = rankingAtivos.value.findIndex((a) => a.isVoce) + 1;
  const total = rankingAtivos.value.length;
  const freq = minhaFrequencia.value;
  const meta = turma.value?.meta_frequencia ?? 75;

  let emoji = "📊";
  if (pos === 1) emoji = "🥇";
  else if (pos === 2) emoji = "🥈";
  else if (pos === 3) emoji = "🥉";

  let cor = "green";
  let mensagem = "Ótimo trabalho! Continue assim.";
  if (freq < meta) {
    cor = "red";
    mensagem = "Sua frequência está abaixo da meta. Tente não faltar!";
  } else if (pos > Math.ceil(total / 2)) {
    cor = "yellow";
    mensagem = "Você está na metade inferior da turma. Dá pra melhorar!";
  }

  return { posicao: pos, emoji, cor, mensagem };
});

function formatarDataCurta(dataStr) {
  const d = new Date(dataStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}
</script>

<style scoped>
/* ── Grid de alunos ── */
.alunos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 900px) {
  .alunos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .alunos-grid {
    grid-template-columns: 1fr;
  }
}

.aluno-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  transition: box-shadow 0.15s;
}

.aluno-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.aluno-card--nivel2 {
  border-color: #bfdbfe;
}

.aluno-foto-wrap {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 2px solid #bbf7d0;
  overflow: hidden;
  flex-shrink: 0;
}

.aluno-foto-wrap--nivel2 {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px #eff6ff;
}

.aluno-foto {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* ── Card da turma — header ── */
.turma-header-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 24px;
  align-items: start;
}

@media (max-width: 768px) {
  .turma-header-grid {
    grid-template-columns: 1fr;
  }
}

.turma-meta-box {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 14px;
  padding: 16px;
}

/* ── Stats row ── */
.turma-stats-row {
  flex-wrap: wrap;
  gap: 0;
}

.turma-stat {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 4px 16px;
  min-width: 100px;
}

.turma-stat:first-child {
  padding-left: 0;
}

.turma-stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0fdf4;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.turma-stat-label {
  font-size: 11px;
  color: #9ca3af;
}

.turma-stat-value {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.turma-stat-sub {
  font-size: 10px;
  color: #9ca3af;
}

.turma-stat-divider {
  width: 1px;
  background: #f3f4f6;
  align-self: stretch;
  margin: 4px 0;
}

@media (max-width: 600px) {
  .turma-stats-row {
    flex-wrap: wrap;
    gap: 12px;
  }
  .turma-stat-divider {
    display: none;
  }
  .turma-stat {
    flex: 1 1 40%;
    padding: 0;
  }
}

/* ── Mapa da jornada ── */

/* Wrapper: sem scroll horizontal — o mapa estica para preencher o card */
.jornada-scroll-area {
  width: 100%;
  box-sizing: border-box;
}

.jornada-mapa {
  position: relative;
  width: 100%;
  /* Altura mínima para acomodar o offset vertical das etapas ímpares */
  min-height: 220px;
}

/* SVG da trilha: posicionado absolutamente para não empurrar o layout */
.jornada-trilha-svg {
  position: absolute;
  top: 40px; /* alinha com o centro dos planetas nas etapas pares */
  left: 0;
  width: 100%;
  pointer-events: none;
  overflow: visible;
  z-index: 0;
}

.jornada-etapas {
  display: flex;
  align-items: flex-start;
  position: relative;
  z-index: 2;
  width: 100%;
}

/* ── Etapa individual ── */
.jornada-etapa {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Distribui igualmente: cada etapa ocupa 1 parte igual do container */
  flex: 1 1 0;
  min-width: 0;
  gap: 6px;
  padding: 0 4px;
}

/* Etapas ímpares descem 40px para criar o efeito de mapa de fases */
.jornada-etapa--baixo {
  margin-top: 40px;
}

/* ── Data ── */
.etapa-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 34px;
}

.etapa-dia-num {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  line-height: 1;
}

.etapa-dia-semana {
  font-size: 10px;
  font-weight: 500;
  color: #9ca3af;
  letter-spacing: 0.05em;
  margin-top: 2px;
}

.jornada-etapa--atual .etapa-dia-num {
  color: #4f46e5;
}

.jornada-etapa--atual .etapa-dia-semana {
  color: #6366f1;
}

/* ── Planeta ── */
.etapa-planeta-wrap {
  position: relative;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.etapa-glow {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.18) 0%,
    transparent 70%
  );
  animation: pulso 2.2s ease-in-out infinite;
}

@keyframes pulso {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.15);
    opacity: 1;
  }
}

.etapa-planeta {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  line-height: 1;
  transition: transform 0.2s;
}

.jornada-etapa--concluida .etapa-planeta {
  background: #f0fdf4;
  box-shadow: 0 0 0 2px #bbf7d0;
}

.jornada-etapa--atual .etapa-planeta {
  background: #eef2ff;
  box-shadow:
    0 0 0 3px #a5b4fc,
    0 4px 20px rgba(99, 102, 241, 0.2);
  transform: scale(1.12);
}

.jornada-etapa--proxima .etapa-planeta {
  background: #fafafa;
  box-shadow: 0 0 0 2px #e5e7eb;
  opacity: 0.85;
}

.jornada-etapa--bloqueada .etapa-planeta {
  background: #f9fafb;
  box-shadow: 0 0 0 2px #e5e7eb;
  filter: grayscale(0.7);
  opacity: 0.6;
}

.etapa-planeta-emoji {
  line-height: 1;
}

.etapa-numero {
  position: absolute;
  top: -4px;
  left: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}

.etapa-numero--concluida {
  background: #22c55e;
  color: #fff;
}
.etapa-numero--atual {
  background: #6366f1;
  color: #fff;
}
.etapa-numero--proxima {
  background: #d1d5db;
  color: #6b7280;
}
.etapa-numero--bloqueada {
  background: #e5e7eb;
  color: #9ca3af;
}

.etapa-cadeado {
  position: absolute;
  bottom: -2px;
  right: -2px;
  font-size: 13px;
  line-height: 1;
}

/* ── Info textual ── */
.etapa-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2px;
}

.etapa-aula-label {
  font-size: 10px;
  color: #9ca3af;
  font-weight: 500;
}

.etapa-nome-etapa {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  line-height: 1.2;
}

.jornada-etapa--atual .etapa-nome-etapa {
  color: #4338ca;
}

.etapa-conteudo {
  font-size: 11px;
  color: #6b7280;
  line-height: 1.3;
}

/* ── Badge de status ── */
.etapa-status-wrap {
  margin-top: 2px;
}

.etapa-status-badge {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
  white-space: nowrap;
}

.etapa-status-badge--concluida {
  background: #dcfce7;
  color: #15803d;
}

.etapa-status-badge--atual {
  background: #e0e7ff;
  color: #4338ca;
}

.etapa-status-badge--proxima {
  background: #f3f4f6;
  color: #6b7280;
}

.etapa-status-badge--bloqueada {
  background: #f3f4f6;
  color: #9ca3af;
}

/* ── Mobile: jornada em lista vertical ── */
@media (max-width: 600px) {
  .jornada-scroll-area {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .jornada-mapa {
    min-height: unset;
  }

  /* Oculta o SVG da trilha — substituído pela borda esquerda das etapas */
  .jornada-trilha-svg {
    display: none;
  }

  .jornada-etapas {
    flex-direction: column;
    gap: 0;
    border-left: 2px dashed #e5e7eb;
    margin-left: 20px;
    padding-left: 20px;
  }

  .jornada-etapa {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    flex: none;
    width: 100%;
    min-width: unset;
    gap: 12px;
    padding: 10px 0;
    margin-top: 0 !important; /* cancela o offset vertical */
    border-bottom: 1px solid #f3f4f6;
  }

  .jornada-etapa:last-child {
    border-bottom: none;
  }

  /* Planeta menor no mobile */
  .etapa-planeta-wrap {
    width: 52px;
    height: 52px;
    flex-shrink: 0;
  }

  .etapa-planeta {
    width: 48px;
    height: 48px;
    font-size: 26px;
  }

  /* Conteúdo textual à direita do planeta */
  .etapa-info {
    align-items: flex-start;
    text-align: left;
    flex: 1;
  }

  /* Data inline à esquerda do planeta */
  .etapa-data {
    display: none; /* data já está no badge de status abaixo */
  }

  .etapa-status-wrap {
    margin-top: 2px;
  }
}
</style>

<!-- Estilos do modal: fora do scoped pois o modal usa Teleport para o body -->
<style>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  width: 100%;
  max-width: 440px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-planeta {
  font-size: 44px;
  line-height: 1;
  flex-shrink: 0;
}

.modal-header-info {
  flex: 1;
  min-width: 0;
}

.modal-aula-label {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
  margin-bottom: 2px;
}

.modal-titulo {
  font-size: 17px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.modal-fechar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #9ca3af;
  transition:
    background 0.15s,
    color 0.15s;
  cursor: pointer;
}
.modal-fechar:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-section-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #9ca3af;
  margin-bottom: 4px;
}

.modal-section-value {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.modal-lista {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.modal-lista li {
  font-size: 13px;
  color: #374151;
  padding-left: 14px;
  position: relative;
}
.modal-lista li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #22c55e;
  font-weight: 700;
}

.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.modal-tag {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
}

.modal-dica {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 13px;
  color: #92400e;
  line-height: 1.4;
}

.modal-aviso {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

/* Animação */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}

/* Badge de status dentro do modal (não-scoped) */
.modal-card .etapa-status-badge {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
  white-space: nowrap;
}
.modal-card .etapa-status-badge--concluida {
  background: #dcfce7;
  color: #15803d;
}
.modal-card .etapa-status-badge--atual {
  background: #e0e7ff;
  color: #4338ca;
}
.modal-card .etapa-status-badge--proxima {
  background: #f3f4f6;
  color: #6b7280;
}
.modal-card .etapa-status-badge--bloqueada {
  background: #f3f4f6;
  color: #9ca3af;
}
</style>
