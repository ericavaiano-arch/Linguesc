<template>
  <div class="flex flex-col gap-4 items-center justify-center min-h-screen">
    <h1 class="text-2xl font-bold text-gray-800">Como deseja entrar?</h1>
    <button
      @click="entrar('PROFESSOR')"
      class="w-64 py-4 bg-green-600 text-white rounded-2xl font-semibold text-lg"
    >
      👨‍🏫 Como Professor
    </button>
    <button
      @click="entrar('ALUNO')"
      class="w-64 py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold text-lg"
    >
      🎓 Como Aluno
    </button>
  </div>
</template>

<script setup>

definePageMeta({ layout: 'auth' })

const { selecionarPapel } = useAuth();
const router = useRouter();

function entrar(papel) {
  selecionarPapel(papel);
  router.push(papel === "PROFESSOR" ? "/hub" : "/hub");
}
</script>
