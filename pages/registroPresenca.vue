<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center px-4 pt-6 pb-10">
    <div class="text-center mb-6">
      <h1 class="text-3xl font-bold text-green-700">Marcar Presença</h1>
      <p class="text-gray-500 mt-2">Aponte a câmera para o QR code do professor</p>
    </div>

    <div v-if="!leituraFinalizada" class="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-200 p-4">
      <div id="qr-reader" class="w-full rounded-xl overflow-hidden"></div>
      <div v-if="mensagem" :class="sucesso ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'" class="mt-4 text-sm p-3 rounded-xl border text-center transition" role="alert">
        {{ mensagem }}
      </div>
    </div>

    <div v-else class="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-200 p-6 text-center mt-4">
      <div class="text-green-600 text-5xl mb-4">✔</div>
      <h2 class="text-xl font-bold text-green-600">Presença registrada!</h2>
      <p class="text-gray-500 text-sm mt-2">Sua presença foi confirmada com sucesso.</p>
      <button @click="$router.push('/hub')" class="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition active:scale-95">
        Voltar ao Início
      </button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

import { supabase } from '@/utils/supabase'

const { user } = useAuth()
const mensagem = ref('')
const sucesso = ref(false)
const leituraFinalizada = ref(false)
const processando = ref(false)

let html5QrCode = null
let ultimaLeitura = 0
let ultimoCodigoLido = null
const INTERVALO_MINIMO = 5000

onMounted(() => {
  const alunoId = user.value?.id

  import('html5-qrcode').then((module) => {
    const { Html5Qrcode } = module
    html5QrCode = new Html5Qrcode('qr-reader')

    html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      async (decodedText) => {
        const agora = Date.now()
        if (processando.value) return
        if (decodedText === ultimoCodigoLido && agora - ultimaLeitura < INTERVALO_MINIMO) return

        processando.value = true
        ultimaLeitura = agora
        ultimoCodigoLido = decodedText

        try {
          const qrData = JSON.parse(decodedText)

          const { error } = await supabase.from('presenca').insert([{
            aluno_id: alunoId,
            dtPresenca: new Date().toISOString(),
            status: 'PRESENTE'
          }])

          if (error) {
            mensagem.value = error.code === '23505' ? 'Você já registrou presença hoje.' : 'Erro ao registrar presença.'
            sucesso.value = false
          } else {
            sucesso.value = true
            leituraFinalizada.value = true
            await html5QrCode.stop()
            document.getElementById('qr-reader').innerHTML = ''
          }
        } catch (err) {
          mensagem.value = 'QR code inválido!'
          sucesso.value = false
        }

        setTimeout(() => { processando.value = false }, INTERVALO_MINIMO)
      }
    )
  })
})

onBeforeUnmount(() => {
  if (html5QrCode) html5QrCode.stop().catch(() => {})
})
</script>

<style scoped>
#qr-reader { width: 100%; height: 300px; }
</style>