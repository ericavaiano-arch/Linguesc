<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <div class="mb-12">
      <h1 class="text-3xl font-bold text-green-700">👋 Bem-vindo ao Linguesc</h1>
      <p class="text-gray-500 mt-2 text-lg">Acesse rapidamente os recursos da plataforma.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

      <!-- ALUNO -->
      <div v-if="tipoUsuario === 'ALUNO'" @click="irPara('/presencaAluno')" class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">📅 Minha Presença</h2>
          <span class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">Acompanhamento</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">Visualize sua frequência nas aulas e acompanhe seu percentual de presença.</p>
        <div class="mt-6 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">Acessar →</div>
      </div>

      <!-- <div v-if="tipoUsuario === 'ALUNO'" @click="irPara('/registroPresenca')" class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">📷 Marcar Presença</h2>
          <span class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">QR Code</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">Registre sua presença na aula de hoje escaneando o QR Code do professor.</p>
        <div class="mt-6 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">Acessar →</div>
      </div> -->

      <!-- PROFESSOR -->
      <div v-if="tipoUsuario === 'PROFESSOR'" @click="irPara('/dashboard')" class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">📊 Dashboard</h2>
          <span class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Visão geral</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">Veja a frequência média de todas as turmas, alertas e próximas aulas.</p>
        <div class="mt-6 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">Acessar →</div>
      </div>

      <div v-if="tipoUsuario === 'PROFESSOR'" @click="irPara('/turmas')" class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">📚 Minhas Turmas</h2>
          <span class="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">Gestão</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">Crie turmas, adicione alunos e gerencie as datas de aula do semestre.</p>
        <div class="mt-6 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">Acessar →</div>
      </div>

      <!-- <div v-if="tipoUsuario === 'PROFESSOR'" @click="irPara('/qrCodeTurmas')" class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">🧾 Chamada por QR Code</h2>
          <span class="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">Controle</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">Gere e exiba o QR Code da aula para registrar a presença dos alunos.</p>
        <div class="mt-6 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">Acessar →</div>
      </div> -->

      <div v-if="tipoUsuario === 'PROFESSOR'" @click="irPara('/chamada-manual')" class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">✅ Chamada</h2>
          <span class="text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full">Controle</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">Selecione os alunos presentes diretamente pelo painel.</p>
        <div class="mt-6 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">Acessar →</div>
      </div>

      <!-- TODOS -->
      <div @click="irPara(`/profile/${user?.id}`)" class="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-500 transition-all duration-300 cursor-pointer">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition">👤 Meu Perfil</h2>
          <span class="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">Conta</span>
        </div>
        <p class="text-gray-500 text-sm leading-relaxed">Atualize seus dados pessoais, e-mail e informações da conta.</p>
        <div class="mt-6 text-green-600 font-medium text-sm group-hover:translate-x-1 transition">Acessar →</div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)
const tipoUsuario = computed(() => user.value?.tipoUsuario || null)
function irPara(rota) { router.push(rota) }

onMounted(() => {
  const stored = localStorage.getItem('user')
  if (stored) user.value = JSON.parse(stored)
})
</script>