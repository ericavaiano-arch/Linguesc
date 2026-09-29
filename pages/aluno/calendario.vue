<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div class="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Carregando calendário...</span>
    </div>
    <div v-else-if="!turmaId" class="text-center p-8">
      <p class="text-4xl mb-3">📅</p>
      <p class="text-gray-600 font-medium">Você não está matriculado em nenhuma turma ativa.</p>
    </div>
  </div>
</template>

<script setup>
import { supabase } from '~/utils/supabase'

definePageMeta({ middleware: 'auth' })

const { user } = useAuth()
const loading = ref(true)
const turmaId = ref(null)

onMounted(async () => {
  if (!user.value?.id) return
  const { data } = await supabase
    .from('turma_aluno')
    .select('turma_id, turma:turma_id(id, status)')
    .eq('aluno_id', user.value.id)
    .limit(10)

  const ativa = (data ?? []).find(m => m.turma?.status === 'ATIVA')
  const turma = ativa ?? data?.[0]
  if (turma?.turma_id) {
    turmaId.value = turma.turma_id
    navigateTo(`/aluno/minha-turma`)
  } else {
    loading.value = false
  }
})
</script>
