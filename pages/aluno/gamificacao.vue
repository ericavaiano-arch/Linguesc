<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <!-- ── HEADER ── -->
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-green-700">Sua Jornada ⭐</h1>
      <p class="text-gray-500 mt-2">Acompanhe seu progresso, acumule estrelas e troque por recompensas.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando...</span>
    </div>

    <div v-else-if="isProfessor" class="space-y-6">
      <div class="mb-2">
        <h2 class="text-xl font-bold text-gray-800">Gamificação do Professor</h2>
        <p class="text-sm text-gray-500 mt-1">Acompanhe suas atividades, acumule estrelas e troque por recompensas.</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-6 flex-wrap">
        <div class="flex flex-col items-center bg-amber-50 border border-amber-200 rounded-xl px-6 py-4 min-w-[130px]">
          <span class="text-xl mb-1">⭐</span><span class="text-4xl font-extrabold text-amber-900 leading-none">{{ estrelas }}</span>
          <span class="text-[10px] text-amber-700 font-semibold uppercase tracking-wider mt-1">estrelas acumuladas</span>
        </div>
        <div class="flex-1 min-w-[220px]">
          <h2 class="text-base font-bold text-gray-800 mb-1">Sua jornada de professor<span v-if="primeiroNome">, {{ primeiroNome }}</span>!</h2>
          <p class="text-sm text-gray-500 leading-relaxed">Acumule até <strong>360 ⭐</strong> realizando as atividades de gamificação ao longo do semestre.</p>
          <div class="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden"><div class="h-full bg-green-500 rounded-full transition-all duration-700" :style="{ width: Math.min(100, Math.round((estrelas / 400) * 100)) + '%' }"></div></div>
          <p class="text-[11px] text-gray-400 mt-1">{{ estrelas }} / 360 ⭐</p>
        </div>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-lg flex-shrink-0">✨</div>
          <div><h2 class="text-base font-semibold text-gray-800 leading-tight">Como ganhar estrelas</h2><p class="text-xs text-gray-400 mt-0.5">Atividades disponíveis para professores</p></div>
        </div>
        <div class="p-4 flex flex-col gap-2">
          <div
            v-for="forma in formasDeGanharProfessor"
            :key="forma.nome"
            class="flex items-center justify-between rounded-xl px-4 py-3 border"
            :class="forma.conquistado ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'"
          >
            <div class="flex items-center gap-3">
              <span class="text-lg w-7 text-center">{{ forma.emoji }}</span>
              <div>
                <p class="text-sm font-semibold" :class="forma.conquistado ? 'text-green-800' : 'text-gray-700'">{{ forma.nome }}</p>
                <p class="text-[11px] text-gray-400 mt-0.5">{{ forma.desc }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0 ml-2">
              <span
                v-if="forma.maxContador"
                class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                :class="forma.conquistado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
              >{{ Math.min(forma.contador, forma.maxContador) }}/{{ forma.maxContador }}</span>
              <span
                class="text-xs font-bold px-2.5 py-1 rounded-lg border"
                :class="forma.conquistado ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'"
              >+{{ forma.pontos }} ⭐<span v-if="forma.conquistado"> ✓</span></span>
            </div>
          </div>
        </div>
        <!-- Histórico -->
        <div v-if="historicoEstrelas.length > 0" class="border-t border-gray-100">
          <div class="px-6 py-3 flex items-center gap-2">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Histórico de estrelas</span>
          </div>
          <div class="divide-y divide-gray-50 max-h-64 overflow-y-auto">
            <div v-for="item in historicoEstrelas" :key="item.id" class="flex items-center justify-between px-6 py-2.5">
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-base flex-shrink-0">{{ motivoEmoji(item.motivo) }}</span>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-700 truncate">{{ motivoLabel(item.motivo) }}</p>
                  <p class="text-xs text-gray-300">{{ formatarDataHora(item.created_at) }}</p>
                </div>
              </div>
              <span class="text-sm font-bold text-amber-600 flex-shrink-0 ml-3">+{{ item.quantidade }} ⭐</span>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-lg flex-shrink-0">🛍️</div><div><h2 class="text-base font-semibold text-gray-800 leading-tight">A Loja — recompensas</h2><p class="text-xs text-gray-400 mt-0.5">Recompensas disponíveis para professores</p></div></div>
        
        <div v-if="nivelPerfil < 2" class="p-6">
          <div class="flex flex-col items-center text-center py-8 px-4 bg-gray-50 border border-gray-100 rounded-2xl">
            <div class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg class="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24">
                <path
                  d="M6 10V8a6 6 0 1112 0v2M5 10h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-700 mb-1">Loja bloqueada 🔒</h3>
            <p class="text-xs text-gray-500 leading-relaxed max-w-xs">
              A loja de recompensas é liberada a partir do <strong class="text-gray-700">Nível 2 — Membro</strong>.
              Complete seu perfil para desbloquear.
            </p>
            <NuxtLink
              :to="`/profile/${user?.id}`"
              class="mt-4 text-xs font-semibold px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white transition"
            >
              Completar perfil agora
            </NuxtLink>
          </div>
        </div>
        
        
        <div v-else class="p-6"><div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div v-for="recompensa in recompensasProfessor" :key="recompensa.nivel" class="relative border rounded-2xl p-4 text-center" :class="recompensa.atingido ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'">
            <span v-if="recompensa.atingido" class="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap">✓ Conquistado</span>
            <div class="text-3xl mb-2 mt-1">{{ recompensa.emoji }}</div>
            <p class="text-[11px] font-bold uppercase tracking-wide mb-0.5" :class="recompensa.atingido ? 'text-green-600' : 'text-gray-400'">{{ recompensa.nivel }}</p>
            <p class="text-sm font-semibold text-gray-700 mb-1.5 leading-snug">{{ recompensa.nome }}</p>
            <p class="text-xs font-bold mb-2" :class="recompensa.atingido ? 'text-green-600' : 'text-gray-400'">{{ recompensa.limiar }} ⭐</p>
            <div v-if="recompensa.atingido && recompensa.jaRequisitado" class="text-[10px] font-semibold px-2 py-1 rounded-lg bg-gray-100 text-gray-500">✓ Já requisitado</div>
            <button v-else-if="recompensa.atingido" @click="requisitarRecompensa(recompensa)" :disabled="!!requisitandoId" class="w-full text-[10px] font-semibold px-2 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300 transition flex items-center justify-center gap-1">
              <div v-if="requisitandoId === recompensa.nivel" class="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {{ requisitandoId === recompensa.nivel ? '...' : 'Requisitar' }}
            </button>
          </div>
        </div></div>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-lg flex-shrink-0">📊</div><div><h2 class="text-base font-semibold text-gray-800 leading-tight">Potencial do semestre</h2><p class="text-xs text-gray-400 mt-0.5">Pontuação máxima por atividade</p></div></div>
        <div class="p-6"><div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div v-for="pot in potencialProfessor" :key="pot.label" class="rounded-xl p-4 text-center border" :class="pot.destaque ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'"><p class="text-xl font-extrabold" :class="pot.destaque ? 'text-green-700' : 'text-gray-700'">{{ pot.valor }} ⭐</p><p class="text-[11px] mt-1" :class="pot.destaque ? 'text-green-600 font-semibold' : 'text-gray-400'">{{ pot.label }}</p></div>
        </div></div>
      </div>
    </div>

    <div v-else class="space-y-6">

      <!-- ── HERO: saldo + próxima recompensa ── -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-6 flex-wrap">
        <!-- Saldo -->
        <div class="flex flex-col items-center bg-amber-50 border border-amber-200 rounded-xl px-6 py-4 min-w-[130px]">
          <span class="text-xl mb-1">⭐</span>
          <span class="text-4xl font-extrabold text-amber-900 leading-none">{{ estrelas }}</span>
          <span class="text-[10px] text-amber-700 font-semibold uppercase tracking-wider mt-1">estrelas acumuladas</span>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-[220px]">
          <h2 class="text-base font-bold text-gray-800 mb-1">
            Você está indo bem<span v-if="nomeAluno">, {{ primeiroNome }}</span>!
          </h2>
          <p class="text-sm text-gray-500 leading-relaxed">
            <span v-if="proximaRecompensa">
              Com <strong>{{ estrelas }} ⭐</strong>, você já passou do nível <strong>{{ nivelAtual.nome }}</strong>.
              Faltam apenas <strong>{{ proximaRecompensa.faltam }} ⭐</strong> para
              <strong>{{ proximaRecompensa.nome }}</strong>.
            </span>
            <span v-else>
              Parabéns! Você atingiu o nível máximo — <strong>{{ nivelAtual.nome }}</strong>. Missão cumprida! 🎉
            </span>
          </p>

          <!-- Próxima recompensa -->
          <div v-if="proximaRecompensa" class="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mt-3">
            <span class="text-2xl">{{ proximaRecompensa.emoji }}</span>
            <div>
              <p class="text-[10px] text-green-700 font-bold uppercase tracking-wide leading-none">Próxima recompensa</p>
              <p class="text-sm font-semibold text-green-800 mt-0.5">{{ proximaRecompensa.nome }} — nível {{ proximaRecompensa.nivel }}</p>
              <p class="text-xs text-green-500 mt-0.5">Faltam {{ proximaRecompensa.faltam }} ⭐</p>
            </div>
          </div>

          <!-- Barra de progresso -->
          <div v-if="proximaRecompensa" class="mt-3">
            <div class="flex justify-between text-[11px] text-gray-400 mb-1">
              <span>{{ estrelas }} ⭐</span>
              <span>{{ proximaRecompensa.limiar }} ⭐</span>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-green-500 rounded-full transition-all duration-700"
                :style="{ width: proximaRecompensa.pct + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── A LOJA ── -->
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-lg flex-shrink-0">🛍️</div>
          <div>
            <h2 class="text-base font-semibold text-gray-800 leading-tight">A Loja — recompensas</h2>
            <p class="text-xs text-gray-400 mt-0.5">Retire presencialmente com o professor ou coordenador</p>
          </div>
        </div>

        <!-- Bloqueada: nível de perfil insuficiente para acessar a loja -->
        <div v-if="nivelPerfil < 2" class="p-6">
          <div class="flex flex-col items-center text-center py-8 px-4 bg-gray-50 border border-gray-100 rounded-2xl">
            <div class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg class="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24">
                <path
                  d="M6 10V8a6 6 0 1112 0v2M5 10h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-700 mb-1">Loja bloqueada 🔒</h3>
            <p class="text-xs text-gray-500 leading-relaxed max-w-xs">
              A loja de recompensas é liberada a partir do <strong class="text-gray-700">Nível 2 — Membro</strong>.
              Complete seu perfil para desbloquear.
            </p>
            <NuxtLink
              :to="`/profile/${user?.id}`"
              class="mt-4 text-xs font-semibold px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white transition"
            >
              Completar perfil agora
            </NuxtLink>
          </div>
        </div>

        <!-- Conteúdo normal: aluno com nível suficiente -->
        <div v-else class="p-6">
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div
              v-for="recompensa in recompensas"
              :key="recompensa.nivel"
              class="relative border rounded-2xl p-4 text-center transition-all"
              :class="{
                'border-green-300 bg-green-50': recompensa.atingido && !recompensa.proxima,
                'border-amber-300 border-2 bg-white': recompensa.proxima,
                'border-gray-200 bg-white': !recompensa.atingido && !recompensa.proxima,
              }"
            >
              <!-- Badges -->
              <span
                v-if="recompensa.atingido && !recompensa.proxima"
                class="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap"
              >✓ Conquistado</span>
              <span
                v-if="recompensa.proxima"
                class="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-[10px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap"
              >Próximo!</span>

              <div class="text-3xl mb-2 mt-1">{{ recompensa.emoji }}</div>
              <p class="text-[11px] font-bold uppercase tracking-wide mb-0.5"
                :class="{
                  'text-green-600': recompensa.atingido && !recompensa.proxima,
                  'text-amber-600': recompensa.proxima,
                  'text-gray-400': !recompensa.atingido && !recompensa.proxima,
                }"
              >{{ recompensa.nivel }}</p>
              <p class="text-sm font-semibold text-gray-700 mb-1.5 leading-snug">{{ recompensa.nome }}</p>
              <p class="text-xs font-bold mb-3"
                :class="{
                  'text-green-600': recompensa.atingido && !recompensa.proxima,
                  'text-amber-700': recompensa.proxima,
                  'text-gray-400': !recompensa.atingido && !recompensa.proxima,
                }"
              >
                {{ recompensa.limiar }} ⭐
                <span v-if="recompensa.proxima" class="font-normal text-amber-500"> — faltam {{ recompensa.limiar - estrelas }}</span>
              </p>

              <!-- Botão requisitar -->
              <div
                v-if="recompensa.atingido && recompensa.jaRequisitado"
                class="w-full text-xs font-semibold px-3 py-1.5 rounded-xl border bg-gray-100 text-gray-500 border-gray-200 text-center"
              >
                ✓ Já requisitado
              </div>
              <button
                v-else-if="recompensa.atingido"
                @click="requisitarRecompensa(recompensa)"
                :disabled="!!requisitandoId"
                class="w-full text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors flex items-center justify-center gap-1"
                :class="
                  recompensa.atingido && !recompensa.proxima
                    ? 'bg-green-600 text-white border-green-600 hover:bg-green-700 disabled:bg-green-300'
                    : 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600 disabled:bg-amber-300'
                "
              >
                <div v-if="requisitandoId === recompensa.nivel" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ requisitandoId === recompensa.nivel ? 'Enviando...' : 'Requisitar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- ── COMO GANHAR ESTRELAS ── -->
        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-lg flex-shrink-0">✨</div>
            <div>
              <h2 class="text-base font-semibold text-gray-800 leading-tight">Como ganhar estrelas</h2>
              <p class="text-xs text-gray-400 mt-0.5">Todas as formas de acumular pontos</p>
            </div>
          </div>
          <div class="p-4 flex flex-col gap-2">
            <div
              v-for="forma in formasDeGanhar"
              :key="forma.nome"
              class="flex items-center justify-between rounded-xl px-4 py-3 border"
              :class="forma.conquistado ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'"
            >
              <div class="flex items-center gap-3">
                <span class="text-lg w-7 text-center">{{ forma.emoji }}</span>
                <div>
                  <p class="text-sm font-semibold"
                    :class="forma.conquistado ? 'text-green-800' : 'text-gray-700'"
                  >{{ forma.nome }}</p>
                  <p class="text-[11px] text-gray-400 mt-0.5">{{ forma.desc }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0 ml-2">
                <span
                  v-if="forma.maxContador"
                  class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  :class="forma.conquistado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                >{{ Math.min(forma.contador, forma.maxContador) }}/{{ forma.maxContador }}</span>
                <span
                  class="text-xs font-bold px-2.5 py-1 rounded-lg border"
                  :class="forma.conquistado
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'"
                >
                  +{{ forma.pontos }} ⭐<span v-if="forma.conquistado"> ✓</span>
                </span>
              </div>
            </div>
          </div>
          <!-- Histórico de estrelas (integrado) -->
          <div v-if="historicoEstrelas.length > 0" class="border-t border-gray-100">
            <div class="px-6 py-3"><span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Histórico de estrelas</span></div>
            <div class="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              <div v-for="item in historicoEstrelas" :key="item.id" class="flex items-center justify-between px-6 py-2.5">
                <div class="flex items-center gap-3 min-w-0">
                  <span class="text-base flex-shrink-0">{{ motivoEmoji(item.motivo) }}</span>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-gray-700 truncate">{{ motivoLabel(item.motivo) }}</p>
                    <p class="text-xs text-gray-300">{{ formatarDataHora(item.created_at) }}</p>
                  </div>
                </div>
                <span class="text-sm font-bold text-amber-600 flex-shrink-0 ml-3">+{{ item.quantidade }} ⭐</span>
              </div>
            </div>
          </div>
          <div v-else class="border-t border-gray-100 p-5 text-center text-xs text-gray-400">Nenhuma estrela registrada ainda.</div>
        </div>

        <!-- ── COLUNA DIREITA ── -->
        <div class="flex flex-col gap-6">

          <!-- Meta Coletiva -->
          <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-lg flex-shrink-0">🤝</div>
              <div>
                <h2 class="text-base font-semibold text-gray-800 leading-tight">Meta Coletiva da Turma</h2>
                <p class="text-xs text-gray-400 mt-0.5">Todos ganham juntos</p>
              </div>
            </div>
            <div class="p-5">
              <div class="flex items-center gap-4 flex-wrap">
                <!-- Anel SVG -->
                <div class="relative w-[72px] h-[72px] flex-shrink-0">
                  <svg width="72" height="72" viewBox="0 0 72 72" class="-rotate-90">
                    <circle cx="36" cy="36" r="28" fill="none" stroke="#e5e7eb" stroke-width="7"/>
                    <circle
                      cx="36" cy="36" r="28"
                      fill="none"
                      :stroke="metaColetiva.atingida ? '#22c55e' : '#fbbf24'"
                      stroke-width="7"
                      :stroke-dasharray="175.9"
                      :stroke-dashoffset="175.9 - (175.9 * metaColetiva.pct / 100)"
                      stroke-linecap="round"
                    />
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-sm font-bold" :class="metaColetiva.atingida ? 'text-green-600' : 'text-amber-600'">{{ metaColetiva.pct }}%</span>
                    <span class="text-[9px] text-gray-400">turma</span>
                  </div>
                </div>
                <div class="flex-1 min-w-[160px]">
                  <p class="text-sm font-bold text-gray-800">Meta: frequência média ≥ {{ metaColetiva.meta }}%</p>
                  <p class="text-xs text-gray-500 mt-1 leading-relaxed">{{ metaColetiva.descricao }}</p>
                  <div class="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mt-2.5">
                    <span class="text-sm">🎁</span>
                    <span class="text-xs font-semibold text-amber-800">Bônus coletivo se atingida: +20 ⭐ para todos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Missão da Semana -->
          <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-lg flex-shrink-0">📬</div>
              <div>
                <h2 class="text-base font-semibold text-gray-800 leading-tight">Missão da Semana</h2>
                <p class="text-xs text-gray-400 mt-0.5">Atividade entre aulas — aberta pelo professor</p>
              </div>
            </div>
            <div class="p-5">

              <!-- Missão aberta -->
              <div v-if="missaoDaSemana">
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">
                  <p class="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                    Missão aberta — prazo: {{ formatarData(missaoDaSemana.prazo) }}
                  </p>
                  <p class="text-sm font-semibold text-gray-800 mb-1">{{ missaoDaSemana.pergunta }}</p>
                  <p class="text-xs text-gray-500">Qualquer resposta válida dentro do prazo conta!</p>
                </div>
                <button
                  v-if="!missaoDaSemana.respondida"
                  @click="responderMissao"
                  class="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors"
                >
                  Responder e ganhar +10 ⭐
                </button>
                <div v-else class="w-full bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-xl py-2.5 text-center">
                  ✓ Você já respondeu esta missão
                </div>
              </div>

              <!-- Sem missão aberta -->
              <div v-else class="flex flex-col items-center text-center py-4 gap-2">
                <span class="text-3xl">📭</span>
                <p class="text-sm font-semibold text-gray-600">Nenhuma missão aberta no momento</p>
                <p class="text-xs text-gray-400 leading-relaxed max-w-[260px]">
                  Solicite ao professor que abra uma Missão da Semana para que você possa pontuar mais <strong>+10 ⭐</strong>.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>

      <!-- ── POTENCIAL DO SEMESTRE ── -->
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-lg flex-shrink-0">📊</div>
          <div>
            <h2 class="text-base font-semibold text-gray-800 leading-tight">Potencial do semestre</h2>
            <p class="text-xs text-gray-400 mt-0.5">Quanto você pode acumular se se engajar</p>
          </div>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div
              v-for="pot in potencial"
              :key="pot.label"
              class="rounded-xl p-4 text-center border"
              :class="pot.destaque ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'"
            >
              <p class="text-xl font-extrabold" :class="pot.destaque ? 'text-green-700' : 'text-gray-700'">{{ pot.valor }} ⭐</p>
              <p class="text-[11px] mt-1" :class="pot.destaque ? 'text-green-600 font-semibold' : 'text-gray-400'">{{ pot.label }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { supabase } from '~/utils/supabase'

const { user, isAluno, isProfessor, isAdmin, reidratar } = useAuth()

const loading = ref(true)

// ── Dados do aluno — lidos diretamente do user reativo do useAuth ────────────
// `user` já é um ref global; computed abaixo reage automaticamente a mudanças
// (ex: após atualizarEstrelasLocal ser chamado em outro componente)
const estrelas   = computed(() => user.value?.estrelas ?? 0)
const nomeAluno  = computed(() => user.value?.nome ?? user.value?.email ?? '')
const primeiroNome = computed(() => nomeAluno.value.split(' ')[0])

// `nivelPerfil` vem do useAuth e determina quais formas de ganhar já foram
// concluídas de forma definitiva (perfil nível 1 e 2)
const nivelPerfil = computed(() => user.value?.nivelPerfil ?? 0)

// ── Configuração das recompensas do professor ───────────────────────────────
const RECOMPENSAS_PROFESSOR_CONFIG = [
  { nivel: 'Nível 1', nome: 'Doce / bombom', emoji: '🍫', limiar: 60 },
  { nivel: 'Nível 2', nome: 'Sticker personalizado', emoji: '🏷️', limiar: 100 },
  { nivel: 'Nível 3', nome: 'Bottom do Linguesc', emoji: '👕', limiar: 180 },
  { nivel: 'Nível 4', nome: 'Marca-página', emoji: '📖', limiar: 220 },
  { nivel: 'Nível 5', nome: 'Troféu impresso em 3D', emoji: '🏆', limiar: 370 },
]
const recompensasProfessor = computed(() =>
  RECOMPENSAS_PROFESSOR_CONFIG.map(r => ({
    ...r,
    atingido: estrelas.value >= r.limiar,
    jaRequisitado: recompensasRequisitadas.value.has(r.nivel),
  }))
)

const contadorLoginSemanalProf = computed(() =>
  historicoEstrelas.value.filter(h => h.motivo === 'LOGIN_SEMANAL').length
)
const contadorCriouMissao = computed(() =>
  historicoEstrelas.value.filter(h => h.motivo === 'CRIOU_MISSAO').length
)
const contadorDadoDestaque = computed(() =>
  historicoEstrelas.value.filter(h => h.motivo === 'DADO_DESTAQUE').length
)

const formasDeGanharProfessor = computed(() => [
  { emoji: '👤', nome: 'Perfil nível 1',          desc: 'Completar o perfil básico',                  pontos: 10, conquistado: nivelPerfil.value >= 1,                 contador: null },
  { emoji: '📸', nome: 'Perfil nível 2',          desc: 'Completar o perfil avançado',                pontos: 10, conquistado: nivelPerfil.value >= 2,                 contador: null },
  { emoji: '🔐', nome: 'Login semanal',           desc: 'Acessar a plataforma — até 8 semanas',       pontos:  5, conquistado: loginNestaSemanaConcluido.value,        contador: contadorLoginSemanalProf.value, maxContador: 8 },
  { emoji: '🏅', nome: 'Destaque para estudante', desc: 'Reconhecer um estudante — até 8 vezes',      pontos: 20, conquistado: contadorDadoDestaque.value > 0,          contador: contadorDadoDestaque.value, maxContador: 8 },
  { emoji: '🚀', nome: 'Criar missão',            desc: 'Criar uma missão da semana — até 8 vezes',   pontos: 20, conquistado: contadorCriouMissao.value > 0,           contador: contadorCriouMissao.value, maxContador: 8 },
])
const potencialProfessor = [
  { valor: 10, label: 'Perfil nível 1', destaque: false },
  { valor: 20, label: 'Perfil nível 2', destaque: false },
  { valor: 40, label: '8 logins semanais', destaque: false },
  { valor: 160, label: '8 destaques', destaque: false },
  { valor: 160, label: '8 missões', destaque: false },
  { valor: 360, label: 'total máximo', destaque: true },
]

// ── Configuração das recompensas ────────────────────────────────────────────
const RECOMPENSAS_CONFIG = [
  { nivel: 'Nível 1', nome: 'Doce / bombom',                    emoji: '🍬', limiar: 60  },
  { nivel: 'Nível 2', nome: 'Sticker personalizado',            emoji: '🎨', limiar: 100 },
  { nivel: 'Nível 3', nome: 'Bottom do Linguesc',               emoji: '📌', limiar: 180 },
  { nivel: 'Nível 4', nome: 'Marca-página',                     emoji: '🔖', limiar: 220 },
  { nivel: 'Nível 5', nome: 'Pontos bônus na prova final +0,5', emoji: '📝', limiar: 260 },
  { nivel: 'Nível 6', nome: 'Troféu impresso em 3D',            emoji: '🏆', limiar: 430 },
]

const recompensas = computed(() => {
  const pts = estrelas.value
  let encontrouProxima = false
  return RECOMPENSAS_CONFIG.map((r) => {
    const atingido = pts >= r.limiar
    const proxima  = !atingido && !encontrouProxima
    if (proxima) encontrouProxima = true
    return { ...r, atingido, proxima, jaRequisitado: recompensasRequisitadas.value.has(r.nivel) }
  })
})

const nivelAtual = computed(() => {
  const atingidos = recompensas.value.filter((r) => r.atingido)
  return atingidos.length > 0 ? atingidos[atingidos.length - 1] : { nome: 'Nenhum ainda' }
})

const proximaRecompensa = computed(() => {
  const prox = recompensas.value.find((r) => r.proxima)
  if (!prox) return null
  const anterior = recompensas.value.filter((r) => r.atingido)
  const base   = anterior.length > 0 ? anterior[anterior.length - 1].limiar : 0
  const faltam = prox.limiar - estrelas.value
  const pct    = Math.min(100, Math.round(((estrelas.value - base) / (prox.limiar - base)) * 100))
  return { ...prox, faltam, pct }
})

// ── Recompensas já requisitadas (localStorage) ────────────────────────────────
const recompensasRequisitadas = ref(new Set())

function carregarRequisitadas() {
  try {
    const saved = localStorage.getItem('linguesc_recompensas_req')
    if (saved) recompensasRequisitadas.value = new Set(JSON.parse(saved))
  } catch {}
}

function salvarRequisitada(nivel) {
  recompensasRequisitadas.value.add(nivel)
  try {
    localStorage.setItem('linguesc_recompensas_req', JSON.stringify([...recompensasRequisitadas.value]))
  } catch {}
}

// ── Formas de ganhar ─────────────────────────────────────────────────────────
const totalPresencas = ref(0)
const jaFoiDestaque = ref(false)
const missaoRespondida = ref(false)

const contadorLoginSemanal = computed(() =>
  historicoEstrelas.value.filter(h => h.motivo === 'LOGIN_SEMANAL').length
)

function getSemanaISO(data = new Date()) {
  const d = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const ano = d.getUTCFullYear()
  const inicioAno = new Date(Date.UTC(ano, 0, 1))
  const semana = Math.ceil(((d.getTime() - inicioAno.getTime()) / 86400000 + 1) / 7)
  return `${ano}-W${String(semana).padStart(2, '0')}`
}

const loginNestaSemanaConcluido = computed(
  () => user.value?.ultimoBonusLoginSemana === getSemanaISO()
)

const formasDeGanhar = computed(() => [
  { emoji: '🌟', nome: 'Presença na primeira aula',       desc: 'Bônus especial de boas-vindas',                    pontos: 30,  conquistado: totalPresencas.value >= 1,              contador: null },
  { emoji: '📅', nome: 'Presença em aula',                desc: 'Da 2ª à 8ª aula — por aula comparecida',           pontos: 10,  conquistado: totalPresencas.value >= 2,              contador: totalPresencas.value, maxContador: 8 },
  { emoji: '🔥', nome: 'Sequência de 3 presenças',        desc: 'Bônus por consistência',                           pontos: 20,  conquistado: user.value?.bonusSequenciaSemestre ?? false, contador: null },
  { emoji: '🏁', nome: 'Presença em todas as aulas',      desc: 'Semestre completo sem faltas',                     pontos: 30,  conquistado: totalPresencas.value >= 8,              contador: null },
  { emoji: '📬', nome: 'Missão da Semana',                desc: 'Atividade entre aulas aberta pelo professor',       pontos: 10,  conquistado: missaoRespondida.value,                 contador: null },
  { emoji: '👤', nome: 'Perfil nível 1 completo',         desc: 'Preencher informações básicas',                    pontos: 10,  conquistado: nivelPerfil.value >= 1,                 contador: null },
  { emoji: '📸', nome: 'Perfil nível 2 completo',         desc: 'Adicionar foto de perfil',                         pontos: 10,  conquistado: nivelPerfil.value >= 2,                 contador: null },
  { emoji: '🔐', nome: 'Login na semana',                 desc: 'Acessar a plataforma ao menos uma vez por semana',  pontos:  5,  conquistado: loginNestaSemanaConcluido.value,        contador: contadorLoginSemanal.value, maxContador: 8 },
  { emoji: '✨', nome: 'Participação destaque em aula',   desc: 'Escolhido pelo professor — semanal e opcional',     pontos: 15,  conquistado: jaFoiDestaque.value,                    contador: null },
  { emoji: '🤝', nome: 'Meta Coletiva da Turma',          desc: '75% da turma com presença ≥ 75% na 4ª aula',       pontos: 20,  conquistado: false,                                  contador: null },
])

// ── Meta Coletiva ────────────────────────────────────────────────────────────
const metaColetiva = ref({
  pct: 0,
  meta: 75,
  atingida: false,
  descricao: 'Carregando dados da turma...',
})

// ── Missão da Semana ─────────────────────────────────────────────────────────
// null = professor não abriu nenhuma missão ativa
const missaoDaSemana = ref(null)

// ── Potencial do semestre ────────────────────────────────────────────────────
const potencial = [
  { valor: 30,  label: '1ª aula (bônus boas-vindas)', destaque: false },
  { valor: 120, label: '8 presenças (2ª a 8ª aula)',  destaque: false },
  { valor: 40,  label: '8 logins semanais',           destaque: false },
  { valor: 80,  label: 'missões da semana (variável)', destaque: false },
  { valor: 160, label: 'destaques do professor (máx)', destaque: false },
  { valor: 430, label: 'total possível (aprox.)',      destaque: true  },
]

// ── Histórico de estrelas ─────────────────────────────────────────────────────
const historicoEstrelas = ref([])

const MOTIVO_INFO = {
  PRESENCA_BOAS_VINDAS: { emoji: '🌟', label: 'Boas-vindas (1ª aula)' },
  PRESENCA:             { emoji: '📅', label: 'Presença em aula' },
  SEQUENCIA_PRESENCAS:  { emoji: '🔥', label: 'Sequência de 3 presenças' },
  PRESENCA_COMPLETA:    { emoji: '🏁', label: 'Presença em todas as aulas' },
  META_COLETIVA:        { emoji: '🤝', label: 'Meta coletiva da turma' },
  MISSAO_RESPONDIDA:    { emoji: '📬', label: 'Missão da semana' },
  DESTAQUE_AULA:        { emoji: '✨', label: 'Destaque em aula' },
  LOGIN_SEMANAL:        { emoji: '🔐', label: 'Login semanal' },
  PERFIL_N1:            { emoji: '👤', label: 'Perfil nível 1 completo' },
  PERFIL_N2:            { emoji: '📸', label: 'Perfil nível 2 completo' },
  CRIOU_MISSAO:         { emoji: '🚀', label: 'Criou missão da semana' },
  DADO_DESTAQUE:        { emoji: '🏅', label: 'Reconheceu aluno destaque' },
}

function motivoEmoji(motivo) { return MOTIVO_INFO[motivo]?.emoji ?? '⭐' }
function motivoLabel(motivo) { return MOTIVO_INFO[motivo]?.label ?? motivo }

function formatarDataHora(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatarData(dataStr) {
  if (!dataStr) return ''
  const d = new Date(dataStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

// ── Ações ────────────────────────────────────────────────────────────────────

const requisitandoId = ref(null)

async function requisitarRecompensa(recompensa) {
  if (!user.value?.id || requisitandoId.value) return
  requisitandoId.value = recompensa.nivel
  try {
    await $fetch('/api/requisitar-recompensa', {
      method: 'POST',
      body: { aluno_id: user.value.id, recompensa },
    })
    salvarRequisitada(recompensa.nivel)
    useNuxtApp().$toast.success(`Recompensa requisitada! A coordenação foi notificada. 🎉`)
  } catch {
    useNuxtApp().$toast.error('Não foi possível enviar a requisição. Tente novamente.')
  } finally {
    requisitandoId.value = null
  }
}

function responderMissao() {
  navigateTo('/aluno/minhas-atividades')
}

// ── Carregar dados complementares do Supabase ────────────────────────────────
async function carregarDadosDaTurma(turmaId) {
  if (!user.value?.id) return

  // Missão da Semana ativa: busca da tabela `atividade` com tipo_missao = 'MISSAO'
  const { data: missaoAtividade } = await supabase
    .from('atividade')
    .select('id, titulo, conteudo_json, data_final, status')
    .eq('turma_id', turmaId)
    .eq('tipo_missao', 'MISSAO')
    .eq('status', 'PUBLICADA')
    .maybeSingle()

  if (missaoAtividade) {
    // Verifica se o aluno já respondeu
    const { data: registro } = await supabase
      .from('atividade_aluno')
      .select('respondido_em')
      .eq('atividade_id', missaoAtividade.id)
      .eq('aluno_id', user.value.id)
      .maybeSingle()

    const jaRespondeu = !!registro?.respondido_em
    missaoRespondida.value = jaRespondeu
    missaoDaSemana.value = {
      id: missaoAtividade.id,
      pergunta: missaoAtividade.conteudo_json?.pergunta ?? missaoAtividade.titulo,
      prazo: missaoAtividade.data_final,
      respondida: jaRespondeu,
    }
  } else {
    missaoDaSemana.value = null
  }

  // Total de presenças do aluno na turma
  const { data: aulasDaTurma } = await supabase
    .from('aula')
    .select('id')
    .eq('turma_id', turmaId)
    .neq('status', 'CANCELADA')

  if (aulasDaTurma && aulasDaTurma.length > 0) {
    const aulaIds = aulasDaTurma.map((a) => a.id)
    const { count } = await supabase
      .from('presenca')
      .select('id', { count: 'exact', head: true })
      .eq('aluno_id', user.value.id)
      .in('aula_id', aulaIds)
    totalPresencas.value = count ?? 0
  }

  // Verifica se o aluno já foi destaque em alguma aula da turma
  const { count: destaqueCount } = await supabase
    .from('destaque_aula')
    .select('id', { count: 'exact', head: true })
    .eq('aluno_id', user.value.id)
  jaFoiDestaque.value = (destaqueCount ?? 0) > 0

  // Meta Coletiva: frequência média da turma
  const totalAulas = aulasDaTurma?.length ?? 0
  if (totalAulas > 0) {
    const { data: matriculas } = await supabase
      .from('turma_aluno')
      .select('aluno_id')
      .eq('turma_id', turmaId)

    const totalAlunos = matriculas?.length ?? 0
    if (totalAlunos > 0) {
      const aulaIds = (aulasDaTurma ?? []).map((a) => a.id)
      const { data: presencasTurma } = await supabase
        .from('presenca')
        .select('aluno_id')
        .in('aula_id', aulaIds)

      const presencasPorAluno = new Map()
      for (const p of presencasTurma ?? []) {
        presencasPorAluno.set(p.aluno_id, (presencasPorAluno.get(p.aluno_id) ?? 0) + 1)
      }

      const totalComFreq75 = (matriculas ?? []).filter(
        (m) => ((presencasPorAluno.get(m.aluno_id) ?? 0) / totalAulas) >= 0.75
      ).length

      const pct = Math.round((totalComFreq75 / totalAlunos) * 100)
      metaColetiva.value = {
        pct,
        meta: 75,
        atingida: pct >= 75,
        descricao: pct >= 75
          ? 'Sua turma atingiu a meta! O bônus coletivo será creditado em breve. 🎉'
          : 'Incentive sua turma! Se a média de presença chegar a 75%, todos ganham +20 ⭐.',
      }
    }
  }
}

// ── Inicialização ─────────────────────────────────────────────────────────────
onMounted(async () => {
  carregarRequisitadas()
  try {
    await reidratar()

    if (user.value?.id && (isAluno.value || isProfessor.value)) {
      if (isAluno.value) {
        const { data: matricula } = await supabase
          .from('turma_aluno')
          .select('turma_id')
          .eq('aluno_id', user.value.id)
          .limit(1)
          .maybeSingle()

        if (matricula?.turma_id) {
          await carregarDadosDaTurma(matricula.turma_id)
        }
      }

      const { data: historico } = await supabase
        .from('estrelas_historico')
        .select('id, quantidade, motivo, descricao, created_at')
        .eq('usuario_id', user.value.id)
        .order('created_at', { ascending: false })
        .limit(30)

      historicoEstrelas.value = historico ?? []
    }
  } finally {
    loading.value = false
  }
})
</script>