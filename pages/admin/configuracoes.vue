<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <div class="mb-10">
      <h1 class="text-3xl font-bold text-green-700">Configurações</h1>
      <p class="text-gray-500 mt-2">Parâmetros globais do sistema.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando...</span>
    </div>

    <div v-else class="max-w-xl space-y-6">

      <!-- Meta padrão -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-800 mb-1">🎯 Meta de Frequência Padrão</h2>
        <p class="text-sm text-gray-400 mb-5">
          Valor padrão ao criar novas turmas. Cada turma pode ter sua própria meta após a criação.
        </p>

        <label class="text-sm font-medium text-gray-700 mb-2 block">
          Meta padrão
          <span class="text-gray-400 font-normal ml-1">({{ config.meta_frequencia_padrao }}%)</span>
        </label>
        <div class="flex items-center gap-3 mb-2">
          <input
            v-model.number="config.meta_frequencia_padrao"
            type="range"
            min="1"
            max="100"
            step="1"
            class="flex-1 accent-green-600"
          />
          <div class="flex items-center gap-1">
            <input
              v-model.number="config.meta_frequencia_padrao"
              type="number"
              min="1"
              max="100"
              class="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              @blur="config.meta_frequencia_padrao = Math.min(100, Math.max(1, config.meta_frequencia_padrao || 1))"
            />
            <span class="text-sm text-gray-500">%</span>
          </div>
        </div>
        <div class="flex justify-between text-xs text-gray-400 mb-6">
          <span>1%</span>
          <span>100%</span>
        </div>

        <button
          @click="salvarConfig"
          :disabled="salvando"
          class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
        >
          <div v-if="salvando" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {{ salvando ? 'Salvando...' : 'Salvar Configurações' }}
        </button>
      </div>

      <!-- Info -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">ℹ️ Sobre o Sistema</h2>
        <div class="space-y-3 text-sm text-gray-600">
          <div class="flex justify-between">
            <span class="text-gray-400">Sistema</span>
            <span class="font-medium">Linguesc</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Última atualização config</span>
            <span class="font-medium">{{ dataAtualizacao }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/utils/supabase'

definePageMeta({ middleware: 'admin' })

const { $toast } = useNuxtApp()
const loading = ref(true)
const salvando = ref(false)
const config = ref({ meta_frequencia_padrao: 75, dtAtualizacao: null })

const dataAtualizacao = computed(() => {
  if (!config.value.dtAtualizacao) return '—'
  return new Date(config.value.dtAtualizacao).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
})

async function carregarConfig() {
  const { data } = await supabase.from('config_sistema').select('*').eq('id', 1).single()
  if (data) config.value = data
  loading.value = false
}

async function salvarConfig() {
  salvando.value = true
  const { error } = await supabase
    .from('config_sistema')
    .update({
      meta_frequencia_padrao: config.value.meta_frequencia_padrao,
      dtAtualizacao: new Date().toISOString()
    })
    .eq('id', 1)

  if (error) {
    $toast.error('Erro ao salvar configurações.')
  } else {
    $toast.success('Configurações salvas!')
    await carregarConfig()
  }
  salvando.value = false
}

onMounted(carregarConfig)
</script>