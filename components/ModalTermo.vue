<template>
  <div class="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center px-4 py-8">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
      <div class="px-8 pt-8 pb-6 border-b border-gray-100">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-2xl">📜</span>
          <h2 class="text-xl font-bold text-gray-900">Termo de Consciência do Projeto</h2>
        </div>
        <p class="text-sm text-gray-500">
          Leia atentamente antes de continuar.
        </p>
      </div>

      <div class="px-8 py-6 max-h-[45vh] overflow-y-auto text-sm text-gray-700 leading-relaxed space-y-4">
        <p>
          O Linguesc é um projeto de extensão vinculado à Universidade do Estado de Santa Catarina
          (UDESC), conduzido por professores, bolsistas e voluntários, com o objetivo de oferecer
          ensino de línguas estrangeiras à comunidade. Ao utilizar esta plataforma, você reconhece
          que integra um ambiente educacional e de pesquisa, sujeito às normas éticas e
          institucionais que regem esse tipo de atividade.
        </p>
        <p>
          Dados de frequência, desempenho e participação registrados nesta plataforma poderão ser
          utilizados, de forma anonimizada, em estudos e pesquisas acadêmicas vinculadas ao
          projeto, incluindo trabalhos de conclusão de curso, dissertações e publicações
          científicas, sempre em conformidade com a Lei Geral de Proteção de Dados
          (Lei nº 13.709/2018).
        </p>
        <p>
          É de responsabilidade de cada usuário manter a confidencialidade de suas credenciais de
          acesso, utilizar o sistema de forma ética e reportar imediatamente qualquer uso indevido,
          falha de segurança ou conduta inadequada observada dentro da plataforma.
        </p>
        <p>
          O não cumprimento das diretrizes institucionais do projeto poderá resultar em restrição
          de acesso à plataforma, sem prejuízo de outras medidas cabíveis previstas nas normas da
          instituição.
        </p>
        <p class="text-gray-400 text-xs">
          Este texto é provisório e será substituído pela versão oficial do termo de consciência
          do projeto.
        </p>
      </div>

      <div class="px-8 pb-8 pt-2">
        <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div
            class="h-full bg-green-600 rounded-full"
            :style="{
              width: progresso + '%',
              transition: `width ${DURACAO_MS}ms linear`,
            }"
          ></div>
        </div>

        <button
          :disabled="!liberado"
          @click="$emit('aceitar')"
          class="w-full py-3 rounded-xl font-semibold text-sm transition"
          :class="
            liberado
              ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          "
        >
          {{ liberado ? 'Concordo' : 'Aguarde a leitura completa...' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const DURACAO_MS = 15000

const liberado = ref(false)
const progresso = ref(0)

defineEmits(['aceitar'])

let timeoutId = null

onMounted(() => {
  document.body.style.overflow = 'hidden'

  requestAnimationFrame(() => {
    progresso.value = 100
  })

  timeoutId = setTimeout(() => {
    liberado.value = true
  }, DURACAO_MS)
})

onUnmounted(() => {
  document.body.style.overflow = ''
  if (timeoutId) clearTimeout(timeoutId)
})
</script>5