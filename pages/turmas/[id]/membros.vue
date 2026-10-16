<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mb-10">
      <button
        @click="$router.push('/turmas')"
        class="text-sm text-gray-400 hover:text-gray-600 transition flex items-center gap-1 mb-6"
      >
        ← Voltar para turmas
      </button>
      <h1 class="text-3xl font-bold text-green-700">Membros da Turma</h1>
      <p v-if="turma" class="text-gray-500 mt-2">{{ turma.nome }}</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando...</span>
    </div>

    <div v-else-if="!turma" class="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
      <p class="text-4xl mb-4">📚</p>
      <p class="text-gray-500 font-medium">Turma não encontrada.</p>
    </div>

    <div v-else class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <!-- Cabeçalho -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0zM3 17a3 3 0 110-6 3 3 0 010 6z" />
            </svg>
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-800 leading-tight">Membros da turma</h2>
            <p class="text-xs text-gray-400 mt-0.5">Professor(a) e estudantes matriculados.</p>
          </div>
        </div>
        <span class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium flex-shrink-0">
          {{ totalAlunos }} estudante(s)
        </span>
      </div>

      <!-- Grid de cards -->
      <div class="p-6">
        <div class="membros-grid">

          <!-- ── Card do professor ── -->
          <div v-if="professorInfo" class="membro-card membro-card--professor">
            <div class="flex justify-end mb-3">
              <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                Professor(a)
              </span>
            </div>

            <div class="flex flex-col items-center mb-4">
              <div
                v-if="professorInfo.avatar_url && !professorInfo.avatar_url.includes('/')"
                class="w-20 h-20 rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center text-4xl select-none"
              >
                {{ professorInfo.avatar_url }}
              </div>
              <div
                v-else-if="professorInfo.avatar_url && professorInfo.avatar_url.includes('/') && meuNivel >= 2 && professorInfo.nivel >= 2"
                class="membro-foto-wrap membro-foto-wrap--nivel2"
              >
                <img v-if="professorInfo.signedUrl" :src="professorInfo.signedUrl" :alt="professorInfo.nome" class="membro-foto" />
                <div v-else class="membro-foto bg-blue-50 flex items-center justify-center">
                  <svg class="w-10 h-10 text-blue-200" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" />
                  </svg>
                </div>
              </div>
              <div v-else class="flex flex-col items-center gap-2">
                <div class="w-20 h-20 rounded-full bg-indigo-50 border-2 border-gray-200 flex items-center justify-center">
                  <svg class="w-10 h-10 text-indigo-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" />
                  </svg>
                </div>
                <button
                  v-if="professorInfo.avatar_url && professorInfo.avatar_url.includes('/') && professorInfo.nivel >= 2 && meuNivel < 2"
                  class="flex items-center gap-1 text-[11px] text-gray-400 hover:text-green-600 transition"
                  @click="modalBloqueadoTipo = 'foto'"
                >
                  <svg class="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 10V8a6 6 0 1112 0v2M5 10h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z" />
                  </svg>
                  Foto bloqueada
                </button>
              </div>
            </div>

            <h3 class="text-sm font-semibold text-gray-800 text-center mb-1 leading-tight">
              {{ professorInfo.nome }}
            </h3>

            <template v-if="meuNivel >= 1">
              <div class="flex flex-col gap-1 mt-3 w-full">
                <div v-if="professorInfo.curso && campoVisivel(professorInfo, CAMPOS.curso)" class="flex items-center gap-1.5 text-xs text-gray-500">
                  <svg class="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0 0H9m3 0h3" />
                  </svg>
                  <span class="truncate">{{ professorInfo.curso }}</span>
                </div>
                <div v-if="professorInfo.data_nascimento && campoVisivel(professorInfo, CAMPOS.idade)" class="flex items-center gap-1.5 text-xs text-gray-500">
                  <svg class="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{{ calcularIdade(professorInfo.data_nascimento) }} anos</span>
                </div>
              </div>
              <div v-if="interesses(professorInfo).length && campoVisivel(professorInfo, CAMPOS.interesses)" class="mt-3 w-full">
                <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                  </svg>
                  Interesses
                </p>
                <div class="flex flex-wrap gap-1">
                  <span v-for="(item, i) in interesses(professorInfo)" :key="i" class="text-[11px] px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-full">{{ item }}</span>
                </div>
              </div>
              <div v-if="professorInfo.motivacoes && campoVisivel(professorInfo, CAMPOS.motivacao)" class="mt-3 w-full">
                <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Motivações
                </p>
                <p class="text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed line-clamp-3">{{ professorInfo.motivacoes }}</p>
              </div>
            </template>
            <template v-else>
              <button
                class="mt-3 w-full text-center text-xs text-gray-400 hover:text-green-600 transition leading-relaxed px-1 py-1"
                @click="modalBloqueadoTipo = 'infos'"
              >
                <svg class="w-3.5 h-3.5 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M6 10V8a6 6 0 1112 0v2M5 10h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z" />
                </svg>
                Aumente seu nível para ver as informações
              </button>
            </template>
          </div>

          <!-- ── Cards dos estudantes ── -->
          <div
            v-for="aluno in alunosAtivos"
            :key="aluno.id"
            class="membro-card"
            :class="aluno.nivel >= 2 ? 'membro-card--nivel2' : ''"
          >
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

            <div class="flex flex-col items-center mb-4">
              <div
                v-if="aluno.avatar_url && !aluno.avatar_url.includes('/')"
                class="w-20 h-20 rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center text-4xl select-none"
              >
                {{ aluno.avatar_url }}
              </div>
              <div
                v-else-if="aluno.avatar_url && aluno.avatar_url.includes('/') && meuNivel >= 2 && aluno.nivel >= 2"
                class="membro-foto-wrap membro-foto-wrap--nivel2"
              >
                <img v-if="aluno.signedUrl" :src="aluno.signedUrl" :alt="aluno.nome" class="membro-foto" />
                <div v-else class="membro-foto bg-blue-50 flex items-center justify-center">
                  <svg class="w-10 h-10 text-blue-200" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" />
                  </svg>
                </div>
              </div>
              <div v-else class="flex flex-col items-center gap-2">
                <div class="w-20 h-20 rounded-full bg-green-50 border-2 border-gray-200 flex items-center justify-center">
                  <svg class="w-10 h-10 text-green-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" />
                  </svg>
                </div>
                <button
                  v-if="aluno.avatar_url && aluno.avatar_url.includes('/') && aluno.nivel >= 2 && meuNivel < 2"
                  class="flex items-center gap-1 text-[11px] text-gray-400 hover:text-green-600 transition"
                  @click="modalBloqueadoTipo = 'foto'"
                >
                  <svg class="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 10V8a6 6 0 1112 0v2M5 10h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z" />
                  </svg>
                  Foto bloqueada
                </button>
              </div>
            </div>

            <h3 class="text-sm font-semibold text-gray-800 text-center mb-1 leading-tight">
              {{ aluno.nome }}
            </h3>

            <template v-if="meuNivel >= 1">
              <div class="flex flex-col gap-1 mt-3 w-full">
                <div v-if="aluno.curso && campoVisivel(aluno, CAMPOS.curso)" class="flex items-center gap-1.5 text-xs text-gray-500">
                  <svg class="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0 0H9m3 0h3" />
                  </svg>
                  <span class="truncate">{{ aluno.curso }}</span>
                </div>
                <div v-if="aluno.data_nascimento && campoVisivel(aluno, CAMPOS.idade)" class="flex items-center gap-1.5 text-xs text-gray-500">
                  <svg class="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{{ calcularIdade(aluno.data_nascimento) }} anos</span>
                </div>
              </div>
              <div v-if="interesses(aluno).length && campoVisivel(aluno, CAMPOS.interesses)" class="mt-3 w-full">
                <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                  </svg>
                  Interesses
                </p>
                <div class="flex flex-wrap gap-1">
                  <span v-for="(item, i) in interesses(aluno)" :key="i" class="text-[11px] px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-full">{{ item }}</span>
                </div>
              </div>
              <div v-if="aluno.motivacoes && campoVisivel(aluno, CAMPOS.motivacao)" class="mt-3 w-full">
                <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Motivações
                </p>
                <p class="text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed line-clamp-3">{{ aluno.motivacoes }}</p>
              </div>
            </template>
            <template v-else>
              <button
                class="mt-3 w-full text-center text-xs text-gray-400 hover:text-green-600 transition leading-relaxed px-1 py-1"
                @click="modalBloqueadoTipo = 'infos'"
              >
                <svg class="w-3.5 h-3.5 inline mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M6 10V8a6 6 0 1112 0v2M5 10h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z" />
                </svg>
                Aumente seu nível para ver as informações
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
        <div v-if="modalBloqueadoTipo" class="modal-overlay" @click.self="modalBloqueadoTipo = null">
          <div class="modal-card" role="dialog" aria-modal="true">
            <div class="modal-body">
              <div class="flex flex-col items-center text-center py-2">
                <div class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg class="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <path d="M6 10V8a6 6 0 1112 0v2M5 10h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
                <h3 class="text-base font-semibold text-gray-800 mb-1">Funcionalidade bloqueada</h3>
                <p class="text-sm text-gray-500 leading-relaxed mb-5">
                  {{
                    modalBloqueadoTipo === 'foto'
                      ? 'Ver a foto dos membros está disponível a partir do'
                      : 'Ver as informações dos membros está disponível a partir do'
                  }}
                  <strong class="text-gray-700">{{ modalBloqueadoTipo === 'foto' ? 'Nível 2 de perfil' : 'Nível 1 de perfil' }}</strong>. Complete seu perfil para desbloquear.
                </p>
                <NuxtLink
                  :to="`/profile/${userId}`"
                  @click="modalBloqueadoTipo = null"
                  class="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition text-center"
                >
                  Completar perfil agora
                </NuxtLink>
                <button @click="modalBloqueadoTipo = null" class="mt-3 text-sm text-gray-400 hover:text-gray-600 transition">
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { supabase } from '~/utils/supabase'

definePageMeta({ middleware: 'professor' })

const { user } = useAuth()
const route = useRoute()

const loading = ref(true)
const turma = ref(null)
const professorInfo = ref(null)
const todosAlunos = ref([])
const meuNivel = ref(0)
const modalBloqueadoTipo = ref(null)

const userId = computed(() => user.value?.id)

const CAMPOS = Object.freeze({ nome: 1, email: 2, curso: 4, idade: 8, interesses: 16, motivacao: 32 })

function campoVisivel(pessoa, bit) {
  return ((pessoa.campos_visiveis ?? 63) & bit) > 0
}

function calcularIdade(dataNasc) {
  if (!dataNasc) return null
  const hoje = new Date()
  const nasc = new Date(dataNasc)
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

function interesses(pessoa) {
  if (!pessoa.interesses) return []
  if (Array.isArray(pessoa.interesses)) return pessoa.interesses.filter(Boolean)
  return String(pessoa.interesses).split(',').map(s => s.trim()).filter(Boolean)
}

const alunosAtivos = computed(() =>
  todosAlunos.value.filter(a => a.ativo).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
)
const inativos = computed(() => todosAlunos.value.filter(a => !a.ativo))
const totalAlunos = computed(() => alunosAtivos.value.length)

onMounted(async () => {
  const turmaId = Number(route.params.id)
  if (!turmaId) { loading.value = false; return }

  const uid = user.value?.id

  const [{ data: turmaData }, { data: meuPerfil }] = await Promise.all([
    supabase.from('turma').select('id, nome, sala, professor_id').eq('id', turmaId).single(),
    uid ? supabase.from('usuarios').select('nivel_perfil').eq('id', uid).single() : Promise.resolve({ data: null }),
  ])

  if (!turmaData) { loading.value = false; return }
  turma.value = turmaData
  meuNivel.value = meuPerfil?.nivel_perfil ?? 0

  const professorId = turmaData.professor_id

  const [{ data: professorData }, { data: vinculosData }] = await Promise.all([
    supabase.from('usuarios').select('id, nome, nivel_perfil, avatar_url, curso, data_nascimento, interesses, motivacao_ingles, campos_visiveis').eq('id', professorId).single(),
    supabase.from('turma_aluno').select('aluno_id, usuarios(id, nome, ativo, nivel_perfil, avatar_url, curso, data_nascimento, interesses, motivacao_ingles, campos_visiveis)').eq('turma_id', turmaId),
  ])

  if (professorData) {
    professorInfo.value = {
      id: professorId,
      nome: professorData.nome ?? '—',
      nivel: professorData.nivel_perfil ?? 0,
      avatar_url: professorData.avatar_url ?? null,
      signedUrl: null,
      curso: professorData.curso ?? null,
      data_nascimento: professorData.data_nascimento ?? null,
      interesses: professorData.interesses ?? null,
      motivacoes: professorData.motivacao_ingles ?? null,
      campos_visiveis: professorData.campos_visiveis ?? 63,
    }
  }

  todosAlunos.value = (vinculosData || []).map(v => ({
    id: v.aluno_id,
    nome: v.usuarios?.nome ?? '',
    ativo: v.usuarios?.ativo ?? true,
    nivel: v.usuarios?.nivel_perfil ?? 0,
    avatar_url: v.usuarios?.avatar_url ?? null,
    signedUrl: null,
    curso: v.usuarios?.curso ?? null,
    data_nascimento: v.usuarios?.data_nascimento ?? null,
    interesses: v.usuarios?.interesses ?? null,
    motivacoes: v.usuarios?.motivacao_ingles ?? null,
    campos_visiveis: v.usuarios?.campos_visiveis ?? 63,
  }))

  // Busca signed URLs se meuNivel >= 2
  if (meuNivel.value >= 2) {
    const ids = todosAlunos.value
      .filter(a => a.ativo && a.nivel >= 2 && a.avatar_url?.includes('/'))
      .map(a => a.id)

    if (professorInfo.value?.nivel >= 2 && professorInfo.value?.avatar_url?.includes('/')) {
      ids.push(professorInfo.value.id)
    }

    if (ids.length > 0) {
      const paths = ids.map(id => `${id}/avatar.jpg`)
      const { data: signedData } = await supabase.storage.from('avatares').createSignedUrls(paths, 3600)
      if (signedData) {
        const urlMap = Object.fromEntries(signedData.map(s => [s.path.split('/')[0], s.signedUrl]))
        todosAlunos.value = todosAlunos.value.map(a => ({ ...a, signedUrl: urlMap[a.id] ?? null }))
        if (professorInfo.value && urlMap[professorInfo.value.id]) {
          professorInfo.value = { ...professorInfo.value, signedUrl: urlMap[professorInfo.value.id] }
        }
      }
    }
  }

  loading.value = false
})
</script>

<style scoped>
.membros-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 900px) {
  .membros-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 560px) {
  .membros-grid { grid-template-columns: 1fr; }
}

.membro-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  transition: box-shadow 0.15s;
}
.membro-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.membro-card--nivel2 { border-color: #bfdbfe; }
.membro-card--professor { border-color: #e0e7ff; }

.membro-foto-wrap {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 2px solid #bbf7d0;
  overflow: hidden;
  flex-shrink: 0;
}
.membro-foto-wrap--nivel2 {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px #eff6ff;
}
.membro-foto {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
</style>

<style>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.modal-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  width: 100%;
  max-width: 440px;
  overflow: hidden;
}
.modal-body {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal-card, .modal-leave-active .modal-card { transition: transform 0.2s ease, opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-card, .modal-leave-to .modal-card { transform: scale(0.95) translateY(8px); opacity: 0; }
</style>
