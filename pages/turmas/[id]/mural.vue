<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <!-- Header -->
    <div class="mb-8">
      <button
        @click="$router.back()"
        class="text-sm text-gray-400 hover:text-gray-600 transition mb-4 flex items-center gap-1"
      >
        ← Voltar
      </button>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-green-700">
            📌 Mural — {{ turma?.nome }}
          </h1>
          <p class="text-gray-400 mt-2 text-sm">Links úteis, conteúdos recomendados e recados da turma.</p>
          <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
        </div>
        <button
          v-if="isProfessor || isAdmin"
          @click="abrirNovaPublicacao"
          class="mt-8 sm:mt-0 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl transition active:scale-95 flex items-center gap-2 flex-shrink-0 self-start"
        >
          ✏️ Nova publicação
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center gap-3 text-green-700 py-8 justify-center">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando...</span>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="publicacoes.length === 0"
      class="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center"
    >
      <p class="text-4xl mb-3">📭</p>
      <p class="text-gray-500 font-medium">Nenhuma publicação ainda.</p>
      <button
        v-if="isProfessor || isAdmin"
        @click="abrirNovaPublicacao"
        class="mt-3 text-green-600 font-semibold hover:underline text-sm"
      >
        Criar primeira publicação →
      </button>
    </div>

    <!-- Feed de mensagens -->
    <div v-else class="max-w-2xl mx-auto space-y-4">
      <div
        v-for="pub in publicacoes"
        :key="pub.id"
        class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
      >
        <!-- Cabeçalho da mensagem -->
        <div class="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">
              {{ (pub.professor_nome || 'P').charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-800 truncate">{{ pub.professor_nome || 'Professor' }}</p>
              <p class="text-xs text-gray-400">{{ formatarDataHora(pub.criado_em) }}</p>
            </div>
          </div>
          <button
            v-if="isProfessor || isAdmin"
            @click="confirmarExclusao(pub)"
            class="text-gray-300 hover:text-red-500 transition flex-shrink-0 text-lg leading-none"
            title="Excluir publicação"
          >
            ×
          </button>
        </div>

        <!-- Corpo da mensagem -->
        <div class="px-5 py-4">
          <h3 class="text-base font-bold text-gray-800 mb-2">{{ pub.titulo }}</h3>
          <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{{ pub.conteudo }}</p>
        </div>
      </div>
    </div>

    <!-- ── MODAL NOVA PUBLICAÇÃO ── -->
    <Transition name="fade">
      <div
        v-if="modalAberto"
        class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
        @click.self="fecharModal"
      >
        <div class="bg-white rounded-2xl p-6 shadow-xl w-full max-w-lg">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-semibold text-gray-800">✏️ Nova publicação</h3>
            <button
              @click="fecharModal"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition text-xl"
            >
              ×
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1.5 block">Título</label>
              <input
                v-model="novoTitulo"
                type="text"
                placeholder="Ex: Material da aula de hoje, Link útil..."
                class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1.5 block">Conteúdo</label>
              <textarea
                v-model="novoConteudo"
                placeholder="Escreva o conteúdo, links, dicas ou recados para a turma..."
                rows="5"
                class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
              />
            </div>
          </div>

          <div class="flex gap-3 mt-5">
            <button
              @click="fecharModal"
              class="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              @click="publicar"
              :disabled="publicando || !novoTitulo.trim() || !novoConteudo.trim()"
              class="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              <div v-if="publicando" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {{ publicando ? 'Publicando...' : '📌 Publicar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── MODAL DE EXCLUSÃO ── -->
    <Transition name="fade">
      <div
        v-if="modalExclusao"
        class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      >
        <div class="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Excluir publicação?</h3>
          <p class="text-sm text-gray-500 mb-6">
            A publicação "<strong>{{ pubParaExcluir?.titulo }}</strong>" será removida permanentemente.
          </p>
          <div class="flex gap-3">
            <button
              @click="modalExclusao = false"
              class="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              @click="excluir"
              :disabled="excluindo"
              class="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              <div v-if="excluindo" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {{ excluindo ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { supabase } from '~/utils/supabase'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { $toast } = useNuxtApp()
const { user, isProfessor, isAdmin } = useAuth()

const turmaId = computed(() => Number(route.params.id))
const turma = ref(null)
const publicacoes = ref([])
const loading = ref(true)

const modalAberto = ref(false)
const novoTitulo = ref('')
const novoConteudo = ref('')
const publicando = ref(false)

const modalExclusao = ref(false)
const pubParaExcluir = ref(null)
const excluindo = ref(false)

onMounted(async () => {
  await Promise.all([carregarTurma(), carregarPublicacoes()])
  loading.value = false
})

async function carregarTurma() {
  const { data } = await supabase
    .from('turma')
    .select('id, nome')
    .eq('id', turmaId.value)
    .single()
  turma.value = data
}

async function carregarPublicacoes() {
  const { data, error } = await supabase
    .from('turma_mural')
    .select('id, titulo, conteudo, criado_em, professor_id')
    .eq('turma_id', turmaId.value)
    .order('criado_em', { ascending: false })

  if (error) {
    console.error(error.message)
    return
  }

  // Buscar nomes dos professores
  const professorIds = [...new Set((data || []).map(p => p.professor_id))]
  let mapaNoomes = {}
  if (professorIds.length > 0) {
    const { data: usuariosData } = await supabase
      .from('usuarios')
      .select('id, nome')
      .in('id', professorIds)
    mapaNoomes = Object.fromEntries((usuariosData || []).map(u => [u.id, u.nome]))
  }

  publicacoes.value = (data || []).map(p => ({
    ...p,
    professor_nome: mapaNoomes[p.professor_id] || 'Professor'
  }))
}

function abrirNovaPublicacao() {
  novoTitulo.value = ''
  novoConteudo.value = ''
  modalAberto.value = true
}

function fecharModal() {
  modalAberto.value = false
}

async function publicar() {
  if (!novoTitulo.value.trim() || !novoConteudo.value.trim()) return
  publicando.value = true

  const { error } = await supabase.from('turma_mural').insert({
    turma_id: turmaId.value,
    professor_id: user.value?.id,
    titulo: novoTitulo.value.trim(),
    conteudo: novoConteudo.value.trim()
  })

  if (error) {
    $toast.error('Erro ao publicar.')
    console.error(error.message)
  } else {
    $toast.success('Publicado com sucesso!')
    fecharModal()
    await carregarPublicacoes()
  }
  publicando.value = false
}

function confirmarExclusao(pub) {
  pubParaExcluir.value = pub
  modalExclusao.value = true
}

async function excluir() {
  excluindo.value = true
  const { error } = await supabase
    .from('turma_mural')
    .delete()
    .eq('id', pubParaExcluir.value.id)

  if (error) {
    $toast.error('Erro ao excluir.')
  } else {
    $toast.success('Publicação removida.')
    modalExclusao.value = false
    pubParaExcluir.value = null
    await carregarPublicacoes()
  }
  excluindo.value = false
}

function formatarDataHora(isoStr) {
  const d = new Date(isoStr)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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
