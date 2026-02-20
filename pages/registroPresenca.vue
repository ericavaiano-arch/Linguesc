<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
    
    <div class="bg-white p-8 rounded shadow-lg w-full max-w-md text-center">

      <!-- 🔵 TELA DE LEITURA -->
      <div v-if="!leituraFinalizada">
        <h1 class="text-2xl font-bold mb-6">Marcar Presença</h1>

        <div id="qr-reader" class="w-full"></div>

        <p class="mt-4 text-gray-600 text-sm">
          Aponte a câmera para o QR code do professor.
        </p>
      </div>

      <!-- 🟢 TELA DE SUCESSO -->
      <div v-else>
        <div class="text-green-600 text-6xl mb-4">✔</div>
        <h2 class="text-2xl font-bold text-green-600">
          Presença registrada!
        </h2>
        <p class="mt-2 text-gray-500">
          Sua presença foi registrada com sucesso.
        </p>
      </div>

      <!-- 🔴 Mensagem de erro -->
      <p v-if="mensagem && !leituraFinalizada"
         :class="{'text-green-500': sucesso, 'text-red-500': !sucesso}"
         class="mt-4">
        {{ mensagem }}
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { supabase } from '@/utils/supabase'

const mensagem = ref('')
const sucesso = ref(false)
const leituraFinalizada = ref(false)
const processando = ref(false)

const storedUser = localStorage.getItem('user')
const aluno = storedUser ? JSON.parse(storedUser) : null
const alunoId = aluno?.id

let html5QrCode = null

let ultimaLeitura = 0
let ultimoCodigoLido = null
const INTERVALO_MINIMO = 5000

onMounted(() => {
  import('html5-qrcode').then((module) => {
    const { Html5Qrcode } = module
    html5QrCode = new Html5Qrcode("qr-reader")

    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      async (decodedText) => {

        const agora = Date.now()

        if (processando.value) return

        if (
          decodedText === ultimoCodigoLido &&
          agora - ultimaLeitura < INTERVALO_MINIMO
        ) {
          return
        }

        processando.value = true
        ultimaLeitura = agora
        ultimoCodigoLido = decodedText

        try {
          const qrData = JSON.parse(decodedText)

          const { error } = await supabase
            .from('presenca')
            .insert([{
              aluno_id: alunoId,
              dtPresenca: new Date().toISOString(),
              status: 'PRESENTE'
            }])

          if (error) {
            if (error.code === '23505') {
              mensagem.value = 'Você já registrou presença hoje.'
            } else {
              mensagem.value = 'Erro ao registrar presença.'
            }
            sucesso.value = false
          } else {
            sucesso.value = true
            leituraFinalizada.value = true

            // 🛑 Para scanner
            await html5QrCode.stop()

            // 🔥 Remove conteúdo da câmera
            document.getElementById("qr-reader").innerHTML = ""
          }

        } catch (err) {
          mensagem.value = 'QR code inválido!'
          sucesso.value = false
        }

        setTimeout(() => {
          processando.value = false
        }, INTERVALO_MINIMO)
      }
    )
  })
})

onBeforeUnmount(() => {
  if (html5QrCode) {
    html5QrCode.stop().catch(() => {})
  }
})
</script>

<style scoped>
#qr-reader {
  width: 100%;
  height: 300px;
}
</style>