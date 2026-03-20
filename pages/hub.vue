<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mb-12">
      <h1 class="text-3xl font-bold text-green-700">👋 Bem-vindo ao Linguesc</h1>
      <p class="text-gray-500 mt-2 text-lg">Acesse rapidamente os recursos da plataforma.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

      <!-- ALUNO -->
      
      <div v-if="isAluno" @click="irPara('/presencaAluno')" class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">📅 Minha Presença</h2>
          <span class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">Acompanhamento</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">Visualize sua frequência nas aulas e acompanhe sua meta.</p>
        <div class="mt-6 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">Acessar →</div>
      </div>
<!-- 
      <div v-if="isAluno" @click="irPara('/registroPresenca')" class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">📷 Marcar Presença</h2>
          <span class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">QR Code</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">Registre sua presença na aula de hoje escaneando o QR Code do professor.</p>
        <div class="mt-6 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">Acessar →</div>
      </div> -->

      <div
        v-if="isAluno"
        @click="irPara('/minhaTurma')"
        class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">
            👥 Minha Turma
          </h2>
          <span class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
            Turma
          </span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">
          Veja seu professor, colegas e sua posição no ranking de frequência.
        </p>
        <div class="mt-6 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">
          Acessar →
        </div>
      </div>

            <!-- Banner de notificações de risco -->
      <div
        v-if="isAluno && notificacoes.length > 0"
        class="mb-6"
      >
        <div
          v-for="notif in notificacoesNaoLidas"
          :key="notif.id"
          class="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-3 flex items-start justify-between gap-4"
        >
          <div class="flex items-start gap-3">
            <span class="text-xl flex-shrink-0 mt-0.5">⚠️</span>
            <div>
              <p class="text-sm font-semibold text-red-700 mb-0.5">Alerta de frequência</p>
              <p class="text-sm text-red-600">{{ notif.mensagem }}</p>
              <p class="text-xs text-red-400 mt-1">{{ formatarDataHora(notif.dt_inclusao) }}</p>
            </div>
          </div>
          <button
            @click="marcarLidas(user?.id)"
            class="text-xs text-red-400 hover:text-red-600 transition flex-shrink-0 font-medium"
          >
            Fechar
          </button>
        </div>
      </div>

      <!-- PROFESSOR -->
      <div v-if="isProfessor" @click="irPara('/dashboard')" class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">📊 Dashboard</h2>
          <span class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Visão geral</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">Frequência média, alertas e próximas aulas de todas as turmas.</p>
        <div class="mt-6 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">Acessar →</div>
      </div>

      <div v-if="isProfessor" @click="irPara('/turmas')" class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">📚 Minhas Turmas</h2>
          <span class="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">Gestão</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">Crie turmas, adicione alunos e gerencie as datas de aula.</p>
        <div class="mt-6 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">Acessar →</div>
      </div>

      <div v-if="isProfessor" @click="irPara('/qrCodeTurmas')" class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">🧾 Chamada por QR Code</h2>
          <span class="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">Controle</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">Gere e exiba o QR Code da aula para registrar a presença.</p>
        <div class="mt-6 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">Acessar →</div>
      </div>

      <div v-if="isProfessor" @click="irPara('/chamada-manual')" class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">✅ Chamada Manual</h2>
          <span class="text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full">Controle</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">Selecione os alunos presentes diretamente pelo painel.</p>
        <div class="mt-6 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">Acessar →</div>
      </div>

      <!-- JUSTIFICATIVAS - PROFESSOR -->
      <div
        v-if="isProfessor || isAdmin"
        @click="irPara('/justificativas')"
        class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">
            📝 Justificativas
          </h2>
          <span v-if="pendentes > 0" class="text-xs bg-red-500 text-white px-3 py-1 rounded-full font-semibold">
            {{ pendentes }} pendente(s)
          </span>
          <span v-else class="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
            Em dia
          </span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">
          Avalie as justificativas de falta enviadas pelos alunos.
        </p>
        <div class="mt-6 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">
          Acessar →
        </div>
      </div>

      <!-- ADMIN -->
      <div v-if="isAdmin" @click="irPara('/admin')" class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">📊 Dashboard Global</h2>
          <span class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Visão geral</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">Visão completa de todos os professores, turmas e alunos.</p>
        <div class="mt-6 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">Acessar →</div>
      </div>

      <div v-if="isAdmin" @click="irPara('/admin/usuarios')" class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">👥 Usuários</h2>
          <span class="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">Gestão</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">Crie, edite e gerencie todos os professores e alunos cadastrados.</p>
        <div class="mt-6 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">Acessar →</div>
      </div>

      <div v-if="isAdmin" @click="irPara('/admin/configuracoes')" class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">⚙️ Configurações</h2>
          <span class="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">Sistema</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">Meta padrão de frequência e parâmetros globais do sistema.</p>
        <div class="mt-6 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">Acessar →</div>
      </div>

      <!-- TODOS -->
      <!-- <div @click="irPara(`/profile/${user?.id}`)" class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">👤 Meu Perfil</h2>
          <span class="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">Conta</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">Atualize seus dados pessoais e informações da conta.</p>
        <div class="mt-6 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">Acessar →</div>
      </div> -->

    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth' })

const router = useRouter()
const { user, isAluno, isProfessor, isAdmin } = useAuth()
const { count: pendentes, carregar: carregarPendentes } = useJustificativasPendentes()

function irPara(rota) { router.push(rota) }

onMounted(() => {
  if (user.value?.tipoUsuario === 'PROFESSOR') {
    carregarPendentes(user.value.id)
  }
})

const { notificacoes, carregar: carregarNotificacoes, marcarLidas } = useNotificacoes()

const notificacoesNaoLidas = computed(() =>
  notificacoes.value.filter(n => !n.lida)
)

// Dentro do onMounted existente, adiciona:
if (user.value?.tipoUsuario === 'ALUNO') {
  carregarNotificacoes(user.value.id)
}

function formatarDataHora(dtStr) {
  if (!dtStr) return ''
  return new Date(dtStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>