<template>
  <div class="min-h-screen bg-gray-50 p-8">
    
    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-green-700">
        Presença da Turma
      </h1>
      <p class="text-gray-500 mt-2">
        Compartilhe o QR Code para que os alunos registrem presença.
      </p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center text-green-700">
      Carregando informações da turma...
    </div>

    <!-- Conteúdo -->
    <div v-else class="flex justify-center">
      <div class="w-full max-w-md">
        
        <div
          class="group bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:border-green-500 transition-all duration-300"
        >
          
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">
              {{ turma.nome }}
            </h2>

            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>

          <p class="text-sm text-gray-400">
            Código da turma
          </p>

          <p class="text-sm font-medium text-gray-600 mt-1">
            #{{ turmaId }}
          </p>

          <p class="text-sm text-gray-400 mt-4">
            Total de alunos
          </p>

          <p class="text-sm font-medium text-gray-600 mt-1 mb-6">
            {{ totalAlunos }} aluno(s)
          </p>

          <div class="flex justify-center py-6 border-t border-b border-gray-100">
            <qrcode-vue
              :value="qrData"
              :size="200"
              level="H"
            />
          </div>

          <p class="mt-6 text-sm text-gray-500 text-center">
            Peça aos alunos que escaneiem este QR Code para marcar presença.
          </p>

        </div>

      </div>
    </div>

  </div>
</template>

<script>
import { supabase } from '@/utils/supabase'
import QrcodeVue from 'qrcode.vue'

export default {
  components: { QrcodeVue },
  data() {
    return {
      turmaId: null,
      turma: {},
      totalAlunos: 0,
      loading: true
    }
  },
  computed: {
    qrData() {
      return JSON.stringify({
        turmaId: this.turmaId,
        timestamp: new Date().toISOString(),
      })
    }
  },
  async mounted() {
    this.turmaId = this.$route.params.id
    await this.carregarTurma()
  },
  methods: {
    async carregarTurma() {
      if (!this.turmaId) {
        console.error('ID da turma não encontrado')
        this.loading = false
        return
      }

      const { data, error } = await supabase
        .from('turma')
        .select(`
          id,
          nome,
          turma_aluno ( id )
        `)
        .eq('id', this.turmaId)
        .single()

      if (error) {
        console.error('Erro ao buscar turma:', error.message)
      } else {
        this.turma = data
        this.totalAlunos = data.turma_aluno?.length || 0
      }

      this.loading = false
    }
  }
}
</script>