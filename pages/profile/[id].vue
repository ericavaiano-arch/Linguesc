<template>
  <div class="min-h-screen bg-gray-100 p-4 md:p-8">
    <!-- Animação de subida de nível -->
    <Transition name="levelup">
      <div
        v-if="showLevelUp"
        class="levelup-overlay"
        @click="showLevelUp = false"
      >
        <div class="levelup-card">
          <div class="levelup-stars">
            <span
              v-for="i in 5"
              :key="i"
              class="levelup-star"
              :style="{ animationDelay: `${i * 0.08}s` }"
              >⭐</span
            >
          </div>
          <p class="levelup-label">Nível desbloqueado</p>
          <div class="levelup-badge">
            {{ levelupNome }}
          </div>
          <p class="levelup-desc">{{ levelupDesc }}</p>
          <div class="levelup-particles">
            <span
              v-for="i in 18"
              :key="i"
              class="particle"
              :style="particleStyle(i)"
            />
          </div>
        </div>
      </div>
    </Transition>

    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-800">Editar perfil</h1>
      <p class="text-gray-500 text-sm mt-1">
        Atualize suas informações e preferências de acesso.
      </p>
      <div class="w-8 h-0.5 bg-green-700 mt-3 rounded-full"></div>
    </div>

    <div
      v-if="loading"
      class="flex items-center gap-3 text-green-700 py-8 max-w-4xl mx-auto"
    >
      <div
        class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"
      ></div>
      <span class="text-sm">Carregando...</span>
    </div>

    <template v-else>
      <!-- Card de nível — apenas para ALUNO -->
      <div v-if="(isAluno || isProfessor)" class="nivel-card max-w-4xl mx-auto mb-4">
        <div class="nivel-card-header">
          <p class="section-label mb-0">Nível do perfil</p>
          <div class="nivel-header-next">
            <span class="text-xs text-gray-400">Próximo nível</span>
            <span
              v-if="nivelAtual < 2"
              class="nivel-mini-badge"
              :class="`nivel-badge--${nivelAtual + 1}`"
            >
              {{ proximoNivelNome }}
            </span>
            <span v-else class="nivel-mini-badge nivel-badge--2">
              Nível máximo
            </span>
          </div>
        </div>

        <div class="nivel-card-content" :class="{ 'nivel-card-content--max': nivelAtual >= 2 }">
          <!-- Nível atual -->
          <section class="nivel-atual">
            <div class="nivel-hero">
              <div class="nivel-avatar" :class="`nivel-avatar--${nivelAtual}`">
                <span class="nivel-avatar-icon">{{ nivelEmoji }}</span>
                <span class="nivel-avatar-star">★</span>
              </div>

              <div class="nivel-atual-info">
                <div class="flex items-center gap-2 flex-wrap mb-2">
                  <span class="nivel-number">Nível {{ nivelAtual }}</span>
                  <span class="estrelas-pill">⭐ {{ estrelas }} estrelas</span>
                </div>
                <h2 class="nivel-title">{{ nivelNome }}</h2>
                <p class="nivel-description">
                  {{ nivelDescricaoAtual }}
                </p>
              </div>
            </div>

            <!-- Lista de acesso só aparece quando NÃO é nível máximo -->
            <div v-if="nivelAtual < 2" class="nivel-section-block">
              <p class="nivel-block-title">Você tem acesso a</p>
              <div class="feature-list">
                <div
                  v-for="feature in funcionalidadesAtuais"
                  :key="feature.id"
                  class="feature-row"
                >
                  <span class="feature-icon feature-icon--active">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3.5 8L6.5 11L12.5 5"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  <span>{{ feature.label }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Indicador visual de progressão -->
          <div v-if="nivelAtual < 2" class="nivel-progress-indicator" aria-hidden="true">
            <div class="progress-line"></div>
            <div class="progress-arrow">→</div>
          </div>

          <!-- Próximo nível -->
          <section v-if="nivelAtual < 2" class="proximo-nivel">
            <div class="proximo-nivel-intro">
              <div class="proximo-icon">
                <span>{{ proximoNivelEmoji }}</span>
              </div>
              <div>
                <p class="proximo-label">Próximo nível</p>
                <h3>{{ proximoNivelNome }}</h3>
                <p class="proximo-description">
                  Complete as atividades abaixo para desbloquear este nível.
                </p>
              </div>
            </div>

            <div class="nivel-section-block requisitos-block">
              <p class="nivel-block-title">
                O que fazer para subir ao {{ proximoNivelNome }}
              </p>
              <div class="feature-list">
                <div
                  v-for="req in requisitosProximoNivel"
                  :key="req.id"
                  class="feature-row requirement-row"
                >
                  <span
                    class="feature-icon"
                    :class="
                      req.ok
                        ? 'feature-icon--active'
                        : 'feature-icon--pending'
                    "
                  >
                    <svg
                      v-if="req.ok"
                      class="w-3.5 h-3.5"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M3.5 8L6.5 11L12.5 5"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <span v-else class="requirement-dot"></span>
                  </span>

                  <span
                    :class="
                      req.ok
                        ? 'text-green-700 line-through'
                        : 'text-gray-600'
                    "
                  >
                    {{ req.label }}
                  </span>
                </div>
              </div>
            </div>

            <div class="nivel-section-block desbloqueios-block">
              <p class="nivel-block-title">O que será desbloqueado</p>
              <div class="feature-list">
                <div
                  v-for="feature in funcionalidadesProximoNivel"
                  :key="feature.id"
                  class="feature-row feature-row--locked"
                >
                  <span class="feature-icon feature-icon--locked">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M5 7V5.5a3 3 0 016 0V7M4 7h8v6H4V7z"
                        stroke="currentColor"
                        stroke-width="1.35"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  <span>{{ feature.label }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Estado de nível máximo: card unificado, sem repetição -->
          <section v-else class="nivel-maximo-card">
            <div class="nivel-maximo-intro">
              <div class="proximo-icon proximo-icon--max">
                <span>🏆</span>
              </div>
              <div>
                <p class="proximo-label">Progressão completa</p>
                <h3 class="nivel-maximo-titulo">Você chegou ao nível máximo</h3>
                <p class="proximo-description">
                  Todas as funcionalidades disponíveis para o seu perfil estão desbloqueadas.
                </p>
              </div>
            </div>

            <div class="nivel-section-block nivel-maximo-features">
              <p class="nivel-block-title">Funcionalidades desbloqueadas</p>
              <div class="feature-list feature-list--grid">
                <div
                  v-for="feature in funcionalidadesAtuais"
                  :key="feature.id"
                  class="feature-row"
                >
                  <span class="feature-icon feature-icon--active">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3.5 8L6.5 11L12.5 5"
                        stroke="currentColor"
                        stroke-width="1.6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  <span>{{ feature.label }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Foto de perfil — card próprio, gateado por nível -->
      <div
        v-if="(isAluno || isProfessor)"
        class="max-w-4xl mx-auto bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4"
      >
        <p class="section-label">Foto de perfil</p>

        <!-- Linha principal: avatar atual + ações -->
        <div class="avatar-row">
          <!-- Preview atual -->
          <div
            class="avatar-wrap"
            :class="{ 'avatar-wrap--locked': !avatarLiberado }"
            @click="avatarLiberado && (mostrarPainelAvatar = !mostrarPainelAvatar)"
          >
            <!-- Avatar tipo emoji (string curta sem /) -->
            <span
              v-if="avatarPreview && !avatarPreview.includes('/')"
              class="avatar-emoji-display"
            >{{ avatarPreview }}</span>
            <!-- Foto enviada -->
            <img
              v-else-if="avatarPreview"
              :src="avatarPreview"
              class="avatar-img"
              :class="{ 'avatar-img--locked': !avatarLiberado }"
              alt="Foto de perfil"
            />
            <!-- Placeholder vazio -->
            <div v-else class="avatar-placeholder">
              <svg class="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m-8-8h16" />
              </svg>
            </div>

            <!-- Cadeado -->
            <div v-if="!avatarLiberado" class="avatar-overlay avatar-overlay--static">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                <path d="M6 10V8a6 6 0 1112 0v2M5 10h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <!-- Ícone editar -->
            <div v-else class="avatar-overlay">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6.293-6.293a1 1 0 011.414 0l1.586 1.586a1 1 0 010 1.414L12 16H9v-3z" />
              </svg>
            </div>
          </div>

          <!-- Textos e botões -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-700">
              {{ avatarLiberado ? "Foto ou avatar" : "Foto bloqueada" }}
            </p>
            <p v-if="avatarLiberado" class="text-xs text-gray-400 mt-0.5">
              Envie uma foto ou escolha um avatar abaixo
            </p>
            <p v-else class="text-xs text-gray-400 mt-0.5">
              Complete as informações abaixo para desbloquear.
            </p>
            <p v-if="avatarLiberado && nivelAtual < 2" class="text-xs text-green-700 mt-1 font-medium">
              Adicionar foto ou avatar sobe ao nível 2 e garante +10 ⭐
            </p>

            <!-- Estados de feedback -->
            <p v-if="avatarSalvando" class="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
              <span class="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></span>
              Salvando...
            </p>
            <Transition name="fade">
              <p v-if="avatarSalvo" class="text-xs text-green-700 mt-1 font-medium">✓ Salvo</p>
            </Transition>

            <!-- Botões de ação (só aparecem se tiver foto/avatar e estiver liberado) -->
            <div v-if="avatarLiberado && avatarPreview" class="flex items-center gap-2 mt-3 flex-wrap">
              <button
                @click="mostrarPainelAvatar = !mostrarPainelAvatar"
                class="avatar-action-btn avatar-action-btn--primary"
              >
                Trocar
              </button>
              <button
                @click="confirmarRemocaoAvatar"
                :disabled="removendoAvatar"
                class="avatar-action-btn avatar-action-btn--danger"
              >
                <span v-if="removendoAvatar" class="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></span>
                {{ removendoAvatar ? 'Removendo...' : 'Remover foto' }}
              </button>
            </div>
            <div v-else-if="avatarLiberado && !avatarPreview" class="mt-3">
              <button
                @click="mostrarPainelAvatar = !mostrarPainelAvatar"
                class="avatar-action-btn avatar-action-btn--primary"
              >
                + Adicionar foto ou avatar
              </button>
            </div>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            :disabled="!avatarLiberado"
            @change="onAvatarChange"
          />
        </div>

        <!-- ── Painel expandido: escolher avatar ou foto ── -->
        <Transition name="fade">
          <div v-if="mostrarPainelAvatar && avatarLiberado" class="avatar-panel mt-5">

            <!-- Abas -->
            <div class="avatar-tabs">
              <button
                @click="abaAvatar = 'emoji'"
                class="avatar-tab"
                :class="{ 'avatar-tab--active': abaAvatar === 'emoji' }"
              >
                🎭 Avatares
              </button>
              <button
                @click="abaAvatar = 'foto'"
                class="avatar-tab"
                :class="{ 'avatar-tab--active': abaAvatar === 'foto' }"
              >
                📷 Enviar foto
              </button>
            </div>

            <!-- Aba: avatares emoji -->
            <div v-if="abaAvatar === 'emoji'" class="avatar-emoji-grid">
              <button
                v-for="op in AVATAR_OPTIONS"
                :key="op.emoji"
                @click="selecionarAvatarEmoji(op)"
                class="avatar-emoji-btn"
                :class="{ 'avatar-emoji-btn--active': avatarPreview === op.emoji }"
                :title="op.label"
              >
                <span class="avatar-emoji-opt">{{ op.emoji }}</span>
                <span class="avatar-emoji-label">{{ op.label }}</span>
              </button>
            </div>

            <!-- Aba: upload de foto -->
            <div v-if="abaAvatar === 'foto'" class="avatar-upload-zone" @click="fileInput?.click()">
              <svg class="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p class="text-sm font-medium text-gray-500">Clique para selecionar uma foto</p>
              <p class="text-xs text-gray-400 mt-1">JPG, PNG ou WEBP · máx. 2 MB</p>
            </div>

          </div>
        </Transition>

        <!-- Modal de confirmação de remoção -->
        <Transition name="fade">
          <div v-if="modalRemoverAberto" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <div class="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm text-center">
              <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24">
                  <path d="M6 10V8a6 6 0 1112 0v2M5 10h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <h3 class="text-base font-semibold text-gray-800 mb-1">Remover foto de perfil?</h3>
              <p class="text-sm text-gray-500 leading-relaxed mb-5">
                Sua foto será removida e seu perfil voltará ao <strong class="text-gray-700">Nível 1 — Estudante</strong>. Você perderá o acesso à loja de recompensas.
              </p>
              <div class="flex gap-3">
                <button @click="modalRemoverAberto = false" class="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button @click="removerAvatar" class="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition flex items-center justify-center gap-2">
                  Sim, remover
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Informações pessoais -->
      <div
        class="max-w-4xl mx-auto bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4"
      >
        <p class="section-label">Informações pessoais</p>

        <form @submit.prevent="submeterPerfil" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="field-label">Nome</label>
              <input
                v-model="nome"
                type="text"
                placeholder="Seu nome completo"
                class="field-input"
              />
            </div>
            <div>
              <label class="field-label">E-mail</label>
              <input
                v-model="email"
                type="email"
                disabled
                class="field-input field-input--disabled"
              />
            </div>
          </div>

          <!-- Campos extras — aluno e professor -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="field-label">Curso</label>
              <input
                v-model="curso"
                type="text"
                placeholder="ex: Ciência da Computação"
                class="field-input"
              />
            </div>
            <div>
              <label class="field-label">Idade</label>
              <input
                v-model="idade"
                type="number"
                min="16"
                max="80"
                placeholder="ex: 21"
                class="field-input"
              />
            </div>
          </div>

          <div>
            <label class="field-label">Interesses</label>
            <input
              v-model="interesses"
              type="text"
              placeholder="ex: música, viagens, programação"
              class="field-input"
            />
            <p class="text-xs text-gray-400 mt-1">
              Separe por vírgulas. Visível para colegas de turma.
            </p>
          </div>

          <div>
            <label class="field-label">{{
              (isAluno || isProfessor) ? "Motivação com o inglês" : "Sobre você"
            }}</label>
            <textarea
              v-model="motivacao"
              rows="2"
              :placeholder="
                (isAluno || isProfessor)
                  ? 'Por que você quer aprender inglês?'
                  : 'Conte um pouco sobre você para os alunos.'
              "
              class="field-input resize-none"
            />
          </div>

          <div class="flex items-center justify-between gap-3 pt-1 flex-wrap">
            <!-- Gerenciar visibilidade (edições posteriores) -->
            <button
              v-if="(isAluno || isProfessor) && !primeiroSave"
              type="button"
              @click="modalVisibilidadeAberto = true"
              class="text-xs text-gray-400 hover:text-gray-600 transition flex items-center gap-1"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Gerenciar visibilidade
            </button>
            <div v-else class="flex-1" />

            <div class="flex items-center gap-3">
              <Transition name="fade">
                <span
                  v-if="perfilSalvo"
                  class="flex items-center gap-1.5 text-sm text-green-700"
                >
                  <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" fill="#EAF3DE" />
                    <path
                      d="M5 8L7 10L11 6"
                      stroke="#3B6D11"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  Salvo com sucesso
                </span>
              </Transition>
              <button
                type="submit"
                :disabled="salvando || !nome"
                class="btn-primary"
              >
                <div
                  v-if="salvando"
                  class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"
                ></div>
                {{ salvando ? "Salvando..." : "Salvar alterações" }}
              </button>
            </div>
          </div>
        </form>

        <!-- ── Modal de visibilidade ── -->
        <Transition name="fade">
          <div v-if="modalVisibilidadeAberto" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

              <div class="px-6 pt-6 pb-4">
                <h3 class="text-base font-semibold text-gray-800 mb-1">
                  👀 Quem pode ver suas informações?
                </h3>
                <p class="text-sm text-gray-500 leading-relaxed">
                  Essas informações ficam visíveis para os colegas da sua turma. Escolha o que você quer compartilhar — isso não afeta sua gamificação.
                </p>
              </div>

              <div class="px-6 pb-2 space-y-1">
                <div
                  v-for="campo in CAMPOS_CONFIG"
                  :key="campo.key"
                  class="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-700">{{ campo.label }}</span>
                    <span v-if="campo.fixo" class="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">sempre visível</span>
                  </div>
                  <!-- Toggle switch -->
                  <button
                    type="button"
                    :disabled="campo.fixo"
                    @click="toggleCampo(campo.bit)"
                    class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none"
                    :class="campoVisivel(campo.bit) ? 'bg-green-500' : 'bg-gray-200'"
                  >
                    <span
                      class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
                      :class="campoVisivel(campo.bit) ? 'translate-x-4' : 'translate-x-1'"
                    />
                  </button>
                </div>
              </div>

              <div class="px-6 py-4 bg-gray-50 flex gap-3">
                <button
                  v-if="primeiroSave"
                  @click="modalVisibilidadeAberto = false"
                  class="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancelar
                </button>
                <button
                  @click="salvarPerfil()"
                  class="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition"
                >
                  Salvar
                </button>
              </div>

            </div>
          </div>
        </Transition>
      </div>

      <!-- Alterar Senha -->
      <div
        class="max-w-4xl mx-auto bg-white rounded-xl border border-gray-100 shadow-sm p-6"
      >
        <p class="section-label">Alterar senha</p>

        <form @submit.prevent="alterarSenhaUsuario" class="space-y-4">
          <div>
            <label class="field-label">Senha atual</label>
            <input
              v-model="senhaAtual"
              type="password"
              placeholder="••••••••"
              class="field-input"
            />
          </div>
          <hr class="border-gray-100" />
          <div>
            <label class="field-label">Nova senha</label>
            <input
              v-model="novaSenha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              class="field-input"
            />
            <div class="h-0.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :style="{ width: forcaSenhaLargura, background: forcaSenhaCor }"
              ></div>
            </div>
          </div>
          <div>
            <label class="field-label">Confirmar nova senha</label>
            <input
              v-model="confirmarSenha"
              type="password"
              placeholder="Repita a nova senha"
              :class="[
                'field-input',
                senhasDivergem
                  ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
                  : '',
              ]"
            />
            <p v-if="senhasDivergem" class="text-xs text-red-500 mt-1.5">
              As senhas não coincidem.
            </p>
          </div>
          <div class="flex items-center justify-end gap-3 pt-1">
            <Transition name="fade">
              <span
                v-if="senhaAlterada"
                class="flex items-center gap-1.5 text-sm text-green-700"
              >
                <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill="#EAF3DE" />
                  <path
                    d="M5 8L7 10L11 6"
                    stroke="#3B6D11"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                Senha alterada
              </span>
            </Transition>
            <span v-if="erroSenha" class="text-sm text-red-500">{{
              erroSenha
            }}</span>
            <button
              type="submit"
              :disabled="alterandoSenha || !podeSalvarSenha"
              class="btn-primary"
            >
              <div
                v-if="alterandoSenha"
                class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"
              ></div>
              {{ alterandoSenha ? "Alterando..." : "Alterar senha" }}
            </button>
          </div>
        </form>
      </div>
    </template>
  </div>
</template>

<script setup>
import { supabase } from "~/utils/supabase";

definePageMeta({ middleware: "auth" });

const { user, isAluno, isProfessor, isAdmin, reidratar, alterarSenha, atualizarPerfilLocal, atualizarEstrelasLocal } = useAuth()
const { $toast } = useNuxtApp();

// ─── Estado base ────────────────────────────────────────────────
const loading = ref(true);
const salvando = ref(false);
const perfilSalvo = ref(false);

const nome = ref("");
const email = ref("");
const curso = ref("");
const idade = ref("");
const interesses = ref("");
const motivacao = ref("");

// ─── Visibilidade de campos (bitmask) ───────────────────────────
// Nome=1 Email=2 Curso=4 Idade=8 Interesses=16 Motivação=32
const CAMPOS = Object.freeze({ nome: 1, email: 2, curso: 4, idade: 8, interesses: 16, motivacao: 32 })
const CAMPOS_CONFIG = [
  { key: 'nome',       label: 'Nome',              bit: CAMPOS.nome,       fixo: true  },
  { key: 'email',      label: 'E-mail',             bit: CAMPOS.email,      fixo: false },
  { key: 'curso',      label: 'Curso',     bit: CAMPOS.curso,      fixo: false },
  { key: 'idade',      label: 'Idade',              bit: CAMPOS.idade,      fixo: false },
  { key: 'interesses', label: 'Interesses',         bit: CAMPOS.interesses, fixo: false },
  { key: 'motivacao',  label: 'Motivação',          bit: CAMPOS.motivacao,  fixo: false },
]
const VISIBILIDADE_DEFAULT = 63 // todos visíveis (1+2+4+8+16+32)
const camposVisiveis = ref(VISIBILIDADE_DEFAULT)

function campoVisivel(bit) { return (camposVisiveis.value & bit) > 0 }
function toggleCampo(bit) {
  if (bit === CAMPOS.nome) return // nome sempre visível
  camposVisiveis.value ^= bit
}

// Modal de visibilidade
const modalVisibilidadeAberto = ref(false)
// true = é o primeiro save (nivelPerfil === 0 ao montar)
const primeiroSave = ref(false)

// Bônus de +10 ⭐ por preencher informações pela primeira vez
const perfilBonusConcedido = ref(false)

// ─── Avatar ─────────────────────────────────────────────────────
const fileInput = ref(null);
const avatarPreview = ref(null);
const avatarFile = ref(null);
const avatarSalvando = ref(false);
const avatarSalvo = ref(false);
const removendoAvatar = ref(false);
const modalRemoverAberto = ref(false);
const mostrarPainelAvatar = ref(false);
const abaAvatar = ref('emoji'); // 'emoji' | 'foto'
// Flag permanente: garante que o bônus de +10 ⭐ por foto/avatar seja dado
// apenas uma vez na vida do usuário, mesmo que ele remova e recoloque a foto.
const avatarBonusConcedido = ref(false);

const AVATAR_OPTIONS = [
  { emoji: '🦊', label: 'Raposa' },
  { emoji: '🐼', label: 'Panda' },
  { emoji: '🦁', label: 'Leão' },
  { emoji: '🐯', label: 'Tigre' },
  { emoji: '🐻', label: 'Urso' },
  { emoji: '🐸', label: 'Sapo' },
  { emoji: '🦋', label: 'Borboleta' },
  { emoji: '🐙', label: 'Polvo' },
  { emoji: '🦄', label: 'Unicórnio' },
  { emoji: '🐧', label: 'Pinguim' },
  { emoji: '🦜', label: 'Papagaio' },
  { emoji: '🐬', label: 'Golfinho' },
  { emoji: '🌟', label: 'Estrela' },
  { emoji: '🚀', label: 'Foguete' },
  { emoji: '🌈', label: 'Arco-íris' },
  { emoji: '🎯', label: 'Alvo' },
  { emoji: '🎸', label: 'Guitarra' },
  { emoji: '🌊', label: 'Onda' },
];

// Funcionalidades por nível — fonte única de verdade
const FUNCIONALIDADES_POR_NIVEL = {
  0: [
    { id: 'presenca',   label: 'Visualizar minha presença' },
    { id: 'turma',      label: 'Visualizar minha turma' },
    { id: 'atividades', label: 'Minhas atividades' },
  ],
  1: [
    { id: 'presenca',     label: 'Visualizar minha presença' },
    { id: 'turma',        label: 'Visualizar minha turma' },
    { id: 'atividades',   label: 'Minhas atividades' },
    { id: 'mural',        label: 'Colegas da Turma' },
    { id: 'justificativa', label: 'Justificativa de falta' },
    { id: 'estrelas',     label: 'Acúmulo de estrelas ⭐' },
  ],
  2: [
    { id: 'presenca',     label: 'Visualizar minha presença' },
    { id: 'turma',        label: 'Visualizar minha turma' },
    { id: 'atividades',   label: 'Minhas atividades' },
    { id: 'mural',        label: 'Colegas da Turma' },
    { id: 'justificativa', label: 'Justificativa de falta' },
    { id: 'estrelas',     label: 'Acúmulo de estrelas ⭐' },
    { id: 'loja',         label: 'Loja de recompensas 🎁' },
    { id: 'foto',         label: 'Foto de perfil no mural' },
  ],
}

const funcionalidadesAtuais = computed(
  () => FUNCIONALIDADES_POR_NIVEL[nivelAtual.value] ?? FUNCIONALIDADES_POR_NIVEL[0]
)

const funcionalidadesProximoNivel = computed(() => {
  const proximo = nivelAtual.value + 1
  if (proximo > 2) return []
  const atual = new Set((FUNCIONALIDADES_POR_NIVEL[nivelAtual.value] ?? []).map(f => f.id))
  return (FUNCIONALIDADES_POR_NIVEL[proximo] ?? []).filter(f => !atual.has(f.id))
})

// Foto só pode ser alterada após o Nível 1 (informações básicas) concluído —
// são conquistas de níveis diferentes.
const avatarLiberado = computed(() => nivelAtual.value >= 1);

function triggerUpload() {
  if (!avatarLiberado.value) return;
  fileInput.value?.click();
}

async function onAvatarChange(e) {
  if (!avatarLiberado.value) return;
  const file = e.target.files?.[0];
  if (!file) return;

  // Redimensiona para 200x200 via canvas (~15-30kb)
  const img = new Image();
  const reader = new FileReader();
  reader.onload = (ev) => {
    img.src = ev.target.result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 200;
      const ctx = canvas.getContext("2d");
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, 200, 200);
      canvas.toBlob(
        (blob) => {
          avatarFile.value = new File([blob], "avatar.jpg", {
            type: "image/jpeg",
          });
          avatarPreview.value = canvas.toDataURL("image/jpeg", 0.8);
          salvarAvatar();
        },
        "image/jpeg",
        0.8,
      );
    };
  };
  reader.readAsDataURL(file);
}

async function uploadAvatar() {
  if (!avatarFile.value) return null;
  const path = `${user.value.id}/avatar.jpg`;
  const { error } = await supabase.storage
    .from("avatares")
    .upload(path, avatarFile.value, {
      upsert: true,
      contentType: "image/jpeg",
    });
  if (error) throw error;
  // Retorna apenas o path — a URL assinada é gerada na leitura
  return path;
}

// Seleciona avatar emoji (sem upload — salva diretamente no banco)
async function selecionarAvatarEmoji(op) {
  if (!avatarLiberado.value) return;
  avatarSalvando.value = true;
  avatarSalvo.value = false;

  try {
    const jaTemFoto = avatarPreview.value && avatarPreview.value.includes('/');
    // Se tinha foto real no storage, remove antes de trocar por emoji
    if (jaTemFoto) {
      await supabase.storage.from('avatares').remove([`${user.value.id}/avatar.jpg`]);
    }

    const payload = { avatar_url: op.emoji };
    const novoNivel = calcularNivel({
      curso: curso.value,
      idade: idade.value,
      interesses: interesses.value,
      motivacao_ingles: motivacao.value,
      avatar_url: op.emoji,
    });
    if (novoNivel > nivelAtual.value) payload.nivel_perfil = novoNivel;

    // Bônus de +10 ⭐ concedido apenas uma vez na vida do usuário
    const concederBonus = (isAluno.value || isProfessor.value) && !avatarBonusConcedido.value;
    if (concederBonus) {
      payload.estrelas = (estrelas.value ?? 0) + 10;
      payload.avatar_bonus_concedido = true;
    }

    const { error } = await supabase.from('usuarios').update(payload).eq('id', user.value.id);
    if (error) throw error;

    avatarPreview.value = op.emoji;
    mostrarPainelAvatar.value = false;

    if (concederBonus) {
      estrelas.value = payload.estrelas;
      avatarBonusConcedido.value = true;
      atualizarEstrelasLocal(payload.estrelas);
      $toast.success('+10 ⭐ por adicionar um avatar!');
    }

    if (payload.nivel_perfil && payload.nivel_perfil > nivelAtual.value) {
      nivelAtual.value = payload.nivel_perfil;
      await nextTick();
      dispararLevelUp(payload.nivel_perfil);
    }

    atualizarPerfilLocal({
      avatarUrl: op.emoji,
      ...(payload.nivel_perfil ? { nivelPerfil: payload.nivel_perfil } : {}),
    });

    avatarSalvo.value = true;
    setTimeout(() => (avatarSalvo.value = false), 3000);
  } catch {
    $toast.error('Erro ao salvar avatar.');
  } finally {
    avatarSalvando.value = false;
  }
}

function confirmarRemocaoAvatar() {
  modalRemoverAberto.value = true;
}

async function removerAvatar() {
  modalRemoverAberto.value = false;
  removendoAvatar.value = true;

  try {
    const eraFoto = avatarPreview.value && avatarPreview.value.includes('/');
    if (eraFoto) {
      await supabase.storage.from('avatares').remove([`${user.value.id}/avatar.jpg`]);
    }

    const { error } = await supabase
      .from('usuarios')
      .update({ avatar_url: null, nivel_perfil: 1 })
      .eq('id', user.value.id);

    if (error) throw error;

    avatarPreview.value = null;
    avatarFile.value = null;
    nivelAtual.value = 1;

    atualizarPerfilLocal({ avatarUrl: null, nivelPerfil: 1 });

    $toast.success('Foto removida. Perfil voltou ao Nível 1.');
  } catch {
    $toast.error('Erro ao remover foto.');
  } finally {
    removendoAvatar.value = false;
  }
}

// Salva a foto assim que selecionada — ação independente do card de
// informações, já que pertencem a níveis diferentes do perfil.
async function salvarAvatar() {
  if (!avatarFile.value || !avatarLiberado.value) return;
  avatarSalvando.value = true;
  avatarSalvo.value = false;

  try {
    const path = await uploadAvatar();

    const payload = { avatar_url: path };
    if (isAluno.value || isProfessor.value) {
      const novoNivel = calcularNivel({
        curso: curso.value,
        idade: idade.value,
        interesses: interesses.value,
        motivacao_ingles: motivacao.value,
        avatar_url: path,
      });
      if (novoNivel > nivelAtual.value) payload.nivel_perfil = novoNivel;
    }

    // Bônus de +10 ⭐ concedido apenas uma vez na vida do usuário
    const concederBonus = (isAluno.value || isProfessor.value) && !avatarBonusConcedido.value;
    if (concederBonus) {
      payload.estrelas = (estrelas.value ?? 0) + 10;
      payload.avatar_bonus_concedido = true;
    }

    const { error } = await supabase
      .from("usuarios")
      .update(payload)
      .eq("id", user.value.id);

    if (error) throw error;

    if (concederBonus) {
      estrelas.value = payload.estrelas;
      avatarBonusConcedido.value = true;
      atualizarEstrelasLocal(payload.estrelas);
      $toast.success('+10 ⭐ por adicionar foto de perfil!');
    }

    if (payload.nivel_perfil && payload.nivel_perfil > nivelAtual.value) {
      nivelAtual.value = payload.nivel_perfil;
      await nextTick();
      dispararLevelUp(payload.nivel_perfil);
    }

    // Reflete a mudança em qualquer componente que leia o user do useAuth
    // (ex: navbar) sem precisar buscar de novo no Supabase.
    atualizarPerfilLocal({
      avatarUrl: avatarPreview.value,
      ...(payload.nivel_perfil ? { nivelPerfil: payload.nivel_perfil } : {}),
    });

    avatarFile.value = null;
    avatarSalvo.value = true;
    setTimeout(() => (avatarSalvo.value = false), 3000);
  } catch {
    $toast.error("Erro ao atualizar foto de perfil.");
  } finally {
    avatarSalvando.value = false;
  }
}

// ─── Nível de perfil (apenas aluno) ─────────────────────────────
const nivelAtual = ref(0);
const estrelas = ref(0);

const nivelNome = computed(
  () => ["Visitante", "Estudante", "Membro"][nivelAtual.value],
);
const nivelDescricaoAtual = computed(() => [
  "Você está começando sua jornada. Preencha seu perfil para desbloquear mais funcionalidades.",
  "Seu perfil está ativo. Adicione uma foto para completar sua identidade na plataforma.",
  "Perfil completo. Todas as funcionalidades estão disponíveis para você.",
][nivelAtual.value] ?? "");
const proximoNivelNome = computed(
  () => ["Estudante", "Membro"][nivelAtual.value] ?? "",
);
const proximoNivelEmoji = computed(
  () => ["🚀", "⭐"][nivelAtual.value] ?? "",
);
const nivelEmoji = computed(() => ["🛸", "🚀", "⭐"][nivelAtual.value]);

const requisitosProximoNivel = computed(() => {
  if (nivelAtual.value === 0)
    return [
      { id: "curso", label: "Preencher curso", estrelas: 2, ok: !!curso.value },
      { id: "idade", label: "Preencher idade", estrelas: 2, ok: !!idade.value },
      {
        id: "interesses",
        label: "Preencher interesses",
        estrelas: 2,
        ok: !!interesses.value,
      },
      {
        id: "motivacao",
        label: "Preencher motivação",
        estrelas: 4,
        ok: !!motivacao.value,
      },
    ];
  if (nivelAtual.value === 1)
    return [
      {
        id: "avatar",
        label: "Adicionar foto de perfil",
        estrelas: 10,
        ok: !!avatarPreview.value,
      },
    ];
  return [];
});

function calcularNivel(dados) {
  if (dados.avatar_url) return 2;
  if (dados.curso && dados.idade && dados.interesses && dados.motivacao_ingles)
    return 1;
  return 0;
}

// ─── Level-up overlay ────────────────────────────────────────────
const showLevelUp = ref(false);
const levelupNome = ref("");
const levelupDesc = ref("");

function dispararLevelUp(novoNivel) {
  const nomes = ["Visitante", "Estudante", "Membro"];
  const descs = [
    "",
    "Agora você aparece nos Colegas da Turma e acumula estrelas.",
    "Acesso à Loja desbloqueado. Bora resgatar recompensas! 🎁",
  ];
  levelupNome.value = `${["🛸", "🚀", "⭐"][novoNivel]} ${nomes[novoNivel]}`;
  levelupDesc.value = descs[novoNivel];
  showLevelUp.value = true;
  setTimeout(() => (showLevelUp.value = false), 4500);
}

function particleStyle(i) {
  const angle = (i / 18) * 360;
  const dist = 60 + Math.random() * 40;
  return {
    "--angle": `${angle}deg`,
    "--dist": `${dist}px`,
    animationDelay: `${(i % 6) * 0.05}s`,
    background: [
      "#97C459",
      "#639922",
      "#FAEEDA",
      "#FAC775",
      "#EAF3DE",
      "#3B6D11",
    ][i % 6],
  };
}

// ─── Senha ──────────────────────────────────────────────────────
const senhaAtual = ref("");
const novaSenha = ref("");
const confirmarSenha = ref("");
const alterandoSenha = ref(false);
const senhaAlterada = ref(false);
const erroSenha = ref("");

const senhasDivergem = computed(
  () => !!confirmarSenha.value && novaSenha.value !== confirmarSenha.value,
);
const podeSalvarSenha = computed(
  () =>
    !!senhaAtual.value &&
    !!novaSenha.value &&
    !!confirmarSenha.value &&
    !senhasDivergem.value &&
    novaSenha.value.length >= 8,
);
const forcaSenhaLargura = computed(() =>
  !novaSenha.value
    ? "0%"
    : novaSenha.value.length >= 8
      ? "100%"
      : `${(novaSenha.value.length / 8) * 100}%`,
);
const forcaSenhaCor = computed(() =>
  novaSenha.value.length >= 8 ? "#639922" : "#E24B4A",
);

// ─── Lifecycle ───────────────────────────────────────────────────
onMounted(async () => {
  await reidratar();
  if (!user.value) return;

  const { data, error } = await supabase
    .from("usuarios")
    .select("nome, curso, idade, interesses, motivacao_ingles, estrelas, avatar_bonus_concedido, campos_visiveis, perfil_bonus_concedido")
    .eq("id", user.value.id)
    .single();

  if (error || !data) {
    $toast.error("Erro ao carregar dados do perfil.");
    loading.value = false;
    return;
  }

  nome.value = data.nome ?? "";
  email.value = user.value.email;
  curso.value = data.curso ?? "";
  idade.value = data.idade ?? "";
  interesses.value = data.interesses ?? "";
  motivacao.value = data.motivacao_ingles ?? "";
  estrelas.value = data.estrelas ?? 0;
  avatarBonusConcedido.value = data.avatar_bonus_concedido ?? false;
  camposVisiveis.value = data.campos_visiveis ?? VISIBILIDADE_DEFAULT;
  perfilBonusConcedido.value = data.perfil_bonus_concedido ?? false;

  // nivelPerfil e avatarUrl já vêm carregados pelo reidratar() do useAuth
  avatarPreview.value = user.value.avatarUrl ?? null;
  if (isAluno.value || isProfessor.value) {
    nivelAtual.value = user.value.nivelPerfil ?? 0;
    primeiroSave.value = nivelAtual.value === 0;
  }

  loading.value = false;
});

// ─── Salvar perfil ───────────────────────────────────────────────

// Chamado pelo botão "Salvar alterações".
// No primeiro save (nivelPerfil === 0) abre o modal de visibilidade antes
// de persistir; nas edições seguintes salva direto com a visibilidade atual.
function submeterPerfil() {
  if (!nome.value) return;
  if ((isAluno.value || isProfessor.value) && primeiroSave.value) {
    modalVisibilidadeAberto.value = true;
  } else {
    salvarPerfil();
  }
}

async function salvarPerfil() {
  if (!nome.value) return;
  modalVisibilidadeAberto.value = false;
  salvando.value = true;

  try {
    const payload = {
      nome: nome.value.trim(),
      curso: curso.value.trim() || null,
      idade: idade.value || null,
      interesses: interesses.value.trim() || null,
      motivacao_ingles: motivacao.value.trim() || null,
      campos_visiveis: camposVisiveis.value,
    };

    // Recalcular nível se for aluno (foto é tratada separadamente por salvarAvatar)
    if (isAluno.value || isProfessor.value) {
      const dadosParaNivel = {
        curso: payload.curso,
        idade: payload.idade,
        interesses: payload.interesses,
        motivacao_ingles: payload.motivacao_ingles,
        avatar_url: avatarPreview.value,
      };
      const novoNivel = calcularNivel(dadosParaNivel);
      if (novoNivel > nivelAtual.value) {
        payload.nivel_perfil = novoNivel;
      }
    }

    // Bônus de +10 ⭐ por preencher informações pela primeira vez
    const concederBonus = (isAluno.value || isProfessor.value) && !perfilBonusConcedido.value;
    if (concederBonus) {
      payload.estrelas = (estrelas.value ?? 0) + 10;
      payload.perfil_bonus_concedido = true;
    }

    const { error } = await supabase
      .from("usuarios")
      .update(payload)
      .eq("id", user.value.id);

    if (error) throw error;

    if (concederBonus) {
      estrelas.value = payload.estrelas;
      perfilBonusConcedido.value = true;
      primeiroSave.value = false;
      atualizarEstrelasLocal(payload.estrelas);
      $toast.success('+10 ⭐ por preencher seu perfil!');
    }

    // Verificar se subiu de nível
    if (
      (isAluno.value || isProfessor.value) &&
      payload.nivel_perfil &&
      payload.nivel_perfil > nivelAtual.value
    ) {
      nivelAtual.value = payload.nivel_perfil;
      await nextTick();
      dispararLevelUp(payload.nivel_perfil);
    }

    atualizarPerfilLocal({
      nome: nome.value.trim(),
      ...((isAluno.value || isProfessor.value) && payload.nivel_perfil
        ? { nivelPerfil: payload.nivel_perfil }
        : {}),
    });
    perfilSalvo.value = true;
    setTimeout(() => (perfilSalvo.value = false), 3000);
  } catch {
    $toast.error("Erro ao atualizar perfil.");
  } finally {
    salvando.value = false;
  }
}

// ─── Alterar senha ────────────────────────────────────────────────
async function alterarSenhaUsuario() {
  if (!podeSalvarSenha.value) return;
  alterandoSenha.value = true;
  erroSenha.value = "";

  try {
    const erro = await alterarSenha(senhaAtual.value, novaSenha.value);
    if (erro) {
      erroSenha.value = erro;
      return;
    }
    senhaAtual.value = "";
    novaSenha.value = "";
    confirmarSenha.value = "";
    senhaAlterada.value = true;
    setTimeout(() => (senhaAlterada.value = false), 3000);
  } finally {
    alterandoSenha.value = false;
  }
}
</script>

<style scoped>
/* ── Seções ── */
.section-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 1rem;
}

/* ── Campos ── */
.field-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 6px;
}
.field-input {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 0 12px;
  font-size: 14px;
  color: #1f2937;
  background: #fff;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  outline: none;
}
.field-input:focus {
  border-color: #3b6d11;
  box-shadow: 0 0 0 3px rgba(99, 153, 34, 0.12);
}
.field-input--disabled {
  color: #9ca3af;
  background: #f9fafb;
  cursor: not-allowed;
}
textarea.field-input {
  height: auto;
  padding: 8px 12px;
}

/* ── Botão ── */
.btn-primary {
  height: 36px;
  padding: 0 16px;
  background: #3b6d11;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition:
    background 0.15s,
    transform 0.1s;
}
.btn-primary:hover:not(:disabled) {
  background: #2d5509;
}
.btn-primary:active:not(:disabled) {
  transform: scale(0.97);
}
.btn-primary:disabled {
  background: #86b84a;
  cursor: not-allowed;
}

/* ── Avatar ── */
.avatar-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 4px;
}
.avatar-wrap {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
}
.avatar-img {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-placeholder {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #eaf3de;
  border: 2px dashed #97c459;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.avatar-wrap:hover .avatar-overlay {
  opacity: 1;
}
.avatar-wrap--locked {
  cursor: not-allowed;
}
.avatar-img--locked {
  filter: grayscale(1);
  opacity: 0.5;
}
.avatar-wrap--locked .avatar-placeholder {
  background: #f3f4f6;
  border-color: #d1d5db;
}
.avatar-wrap--locked .avatar-placeholder svg {
  color: #9ca3af;
}
.avatar-overlay--static {
  opacity: 1;
  background: rgba(31, 41, 55, 0.55);
}

/* ── Card de nível ── */
.nivel-card {
  background: #fff;
  border: 1.5px solid #c0dd97;
  border-radius: 16px;
  padding: 1.35rem 1.5rem 1.5rem;
  overflow: hidden;
}

.nivel-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f2ee;
}

.nivel-header-next {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.nivel-mini-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 13px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.nivel-card-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16px minmax(0, 1fr);
  gap: 1.35rem;
  padding-top: 1.35rem;
}

.nivel-atual {
  min-width: 0;
  padding: 0.35rem 0.35rem 0;
}

.nivel-hero {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  min-height: 190px;
}

.nivel-avatar {
  position: relative;
  width: 148px;
  height: 148px;
  border-radius: 50%;
  flex: 0 0 148px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eaf3de;
  border: 2px solid #c0dd97;
  box-shadow: inset 0 0 0 11px rgba(255, 255, 255, 0.48);
}

.nivel-avatar--0 {
  background: #eef5e8;
  border-color: #c7dda9;
}

.nivel-avatar--1 {
  background: #eaf3de;
}

.nivel-avatar--2 {
  background: #e7f1d7;
  border-color: #a9cc77;
}

.nivel-avatar-icon {
  font-size: 64px;
  line-height: 1;
  filter: drop-shadow(0 3px 2px rgba(59, 109, 17, 0.08));
}

.nivel-avatar-star {
  position: absolute;
  right: 6px;
  bottom: 7px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fac775;
  color: #633806;
  border: 3px solid #fff;
  font-size: 21px;
  line-height: 1;
}

.nivel-atual-info {
  min-width: 0;
}

.nivel-number {
  display: inline-flex;
  align-items: center;
  padding: 5px 11px;
  border-radius: 999px;
  background: #eef1f5;
  color: #607086;
  font-size: 13px;
  font-weight: 600;
}

.nivel-title {
  margin: 0;
  color: #172b4d;
  font-size: clamp(30px, 4vw, 43px);
  line-height: 1.05;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.nivel-description {
  margin: 0.65rem 0 0;
  color: #7a8da8;
  font-size: 14px;
  line-height: 1.55;
  max-width: 350px;
}

.nivel-section-block {
  margin-top: 1.2rem;
  padding: 1rem 1.1rem;
  border: 1px solid #edf1eb;
  border-radius: 13px;
  background: #fbfdf9;
}

.nivel-block-title {
  margin: 0 0 0.65rem;
  color: #8a9bb2;
  font-size: 11px;
  line-height: 1.4;
  font-weight: 600;
  letter-spacing: 0.055em;
  text-transform: uppercase;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.feature-row {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 32px;
  color: #52677f;
  font-size: 13px;
  line-height: 1.35;
}

.feature-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 22px;
}

.feature-icon--active {
  background: #eaf3de;
  color: #3b6d11;
}

.feature-icon--pending {
  background: #f3f4f6;
  color: #9ca3af;
}

.feature-icon--locked {
  background: #f5f7f4;
  color: #9aaa9a;
}

.requirement-row {
  position: relative;
}

.requirement-stars {
  margin-left: auto;
  color: #9a6b24;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.requirement-dot {
  width: 7px;
  height: 7px;
  border: 1.5px solid currentColor;
  border-radius: 50%;
}

.nivel-progress-indicator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}

.progress-line {
  width: 1px;
  height: 78%;
  border-left: 1px dashed #c9d8bf;
}

.progress-arrow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f7ed;
  border: 1px solid #d9e8cc;
  color: #639922;
  font-size: 17px;
  font-weight: 500;
}

.proximo-nivel {
  min-width: 0;
  padding: 0.35rem 0.35rem 0;
}

.proximo-nivel-intro {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 92px;
}

.proximo-icon {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  flex: 0 0 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef6e7;
  border: 1px solid #d8e9ca;
  font-size: 36px;
}

.proximo-icon--max {
  background: #faeeda;
  border-color: #f0d7ad;
}

.proximo-label {
  margin: 0 0 2px;
  color: #7890ad;
  font-size: 13px;
}

.proximo-nivel h3 {
  margin: 0;
  color: #172b4d;
  font-size: 26px;
  line-height: 1.15;
  font-weight: 700;
}

.proximo-description {
  margin: 0.4rem 0 0;
  color: #7890ad;
  font-size: 13px;
  line-height: 1.45;
}

.requisitos-block {
  background: #fbfdf9;
  border-color: #e8eee3;
}

.desbloqueios-block {
  background: #fafcf9;
}

.feature-row--locked {
  color: #71839a;
}

/* ── Nível máximo: layout unificado ── */
.nivel-card-content--max {
  grid-template-columns: 1fr; /* coluna única quando nível máximo */
}

.nivel-maximo-card {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.nivel-maximo-intro {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nivel-maximo-titulo {
  margin: 0;
  color: #172b4d;
  font-size: 22px;
  line-height: 1.2;
  font-weight: 700;
}

.nivel-maximo-features {
  margin-top: 0;
}

.feature-list--grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2px 16px;
}

@media (max-width: 768px) {
  .nivel-card {
    padding: 1rem;
  }

  .nivel-card-header {
    padding-bottom: 0.85rem;
  }

  .nivel-card-content {
    display: block;
    padding-top: 1rem;
  }

  .nivel-hero {
    min-height: auto;
    align-items: flex-start;
    gap: 1rem;
  }

  .nivel-avatar {
    width: 108px;
    height: 108px;
    flex-basis: 108px;
  }

  .nivel-avatar-icon {
    font-size: 48px;
  }

  .nivel-avatar-star {
    width: 34px;
    height: 34px;
    right: 1px;
    bottom: 1px;
    font-size: 17px;
  }

  .nivel-title {
    font-size: 32px;
  }

  .nivel-description {
    font-size: 13px;
  }

  .nivel-progress-indicator {
    display: none;
  }

  .proximo-nivel {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #f0f2ee;
  }
}

@media (max-width: 480px) {
  .nivel-hero {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .nivel-atual-info {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .nivel-header-next {
    align-items: flex-end;
  }

  .proximo-nivel-intro {
    align-items: flex-start;
  }

  .proximo-icon {
    width: 62px;
    height: 62px;
    flex-basis: 62px;
    font-size: 29px;
  }
}

/* ── Level-up overlay ── */
.levelup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
}
.levelup-card {
  position: relative;
  background: #fff;
  border-radius: 20px;
  padding: 2.5rem 2rem 2rem;
  text-align: center;
  max-width: 320px;
  width: 90%;
  overflow: hidden;
}
.levelup-stars {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 1rem;
}
.levelup-star {
  font-size: 28px;
  display: inline-block;
  animation: starPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.levelup-label {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9ca3af;
  margin: 0 0 10px;
}
.levelup-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border-radius: 30px;
  background: #eaf3de;
  color: #27500a;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  animation: badgePop 0.5s 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.levelup-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

/* Partículas */
.levelup-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  animation: burst 0.7s ease-out both;
}
@keyframes burst {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle))
      translateX(var(--dist));
    opacity: 0;
  }
}
@keyframes starPop {
  0% {
    transform: scale(0) rotate(-20deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}
@keyframes badgePop {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Transições */
.levelup-enter-active {
  transition: opacity 0.25s;
}
.levelup-leave-active {
  transition: opacity 0.4s;
}
.levelup-enter-from,
.levelup-leave-to {
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── Avatar: emoji display no círculo ── */
.avatar-emoji-display {
  font-size: 44px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  user-select: none;
}

/* ── Botões de ação abaixo do avatar ── */
.avatar-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  border: 1px solid transparent;
}
.avatar-action-btn--primary {
  background: #eaf3de;
  color: #3b6d11;
  border-color: #d0e8b8;
}
.avatar-action-btn--primary:hover {
  background: #d6ecbf;
}
.avatar-action-btn--danger {
  background: #fff0f0;
  color: #dc2626;
  border-color: #fecaca;
}
.avatar-action-btn--danger:hover {
  background: #fee2e2;
}
.avatar-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Painel expandido ── */
.avatar-panel {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
}

/* Abas */
.avatar-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}
.avatar-tab {
  flex: 1;
  padding: 10px 0;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  border-bottom: 2px solid transparent;
}
.avatar-tab--active {
  color: #3b6d11;
  border-bottom-color: #3b6d11;
  background: #fff;
}

/* Grid de emojis */
.avatar-emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
  gap: 8px;
  padding: 16px;
  background: #fff;
}
.avatar-emoji-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px 8px;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  background: #fafafa;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.1s;
}
.avatar-emoji-btn:hover {
  border-color: #97c459;
  background: #f0f7e7;
  transform: scale(1.06);
}
.avatar-emoji-btn--active {
  border-color: #3b6d11;
  background: #eaf3de;
}
.avatar-emoji-opt {
  font-size: 30px;
  line-height: 1;
}
.avatar-emoji-label {
  font-size: 10px;
  color: #6b7280;
  font-weight: 500;
}

/* Zona de upload */
.avatar-upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 20px;
  background: #fff;
  cursor: pointer;
  transition: background 0.15s;
}
.avatar-upload-zone:hover {
  background: #f9fafb;
}
</style>