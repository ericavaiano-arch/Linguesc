<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
    <h1 class="text-2xl font-bold mb-8">Presença da Turma</h1>

    <div class="bg-white p-6 rounded shadow-lg flex flex-col items-center">
      <p class="mb-4">QR Code da Turma: {{ turmaId }}</p>

      <qrcode-vue
        :value="qrData"
        :size="200"
        level="H"
      />

      <p class="mt-4 text-gray-600 text-sm">Peça aos alunos que escaneiem este QR code para marcar presença.</p>
    </div>
  </div>
</template>

<script>
import QrcodeVue from 'qrcode.vue'

export default {
  props: ['id'], // pega o :id da rota
  components: { QrcodeVue },
  data() {
    return {
      turmaId: this.id || 1
    }
  },
  computed: {
    qrData() {
      return JSON.stringify({
        turmaId: this.turmaId,
        timestamp: new Date().toISOString(),
      })
    }
  }
}
</script>