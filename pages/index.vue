<template>
  <div
    class="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-white flex items-center justify-center px-4 py-10"
  >
    <div
      class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
    >
      <div class="text-center mb-8">
        <div class="flex justify-center items-center gap-5 mb-5">
          <img
            src="~/assets/images/logo_linguesc.png"
            alt="Linguesc"
            class="h-16 w-auto"
          />
          <div class="w-px h-10 bg-gray-200 rounded-full"></div>
          <img
            src="~/assets/images/logo_udesc.png"
            alt="UDESC Joinville"
            class="h-12 w-auto"
          />
        </div>
        <h1 class="text-xl font-extrabold text-gray-900 tracking-tight leading-snug">
          Sistema de Acompanhamento Educacional
        </h1>
      </div>

      <form @submit.prevent="verificarUsuario" class="space-y-5">
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 mb-1"
            >E-mail</label
          >
          <input
            v-model="email"
            id="email"
            type="email"
            autocomplete="email"
            placeholder="seuemail@exemplo.com"
            required
            class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Senha</label
          >
          <input
            v-model="senha"
            id="password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            required
            class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
        </div>

        <button
          :disabled="!email || !senha || carregando"
          class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
          type="submit"
        >
          <div
            v-if="carregando"
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></div>
          {{ carregando ? "Entrando..." : "Entrar" }}
        </button>

        <div class="text-center">
          <button
            type="button"
            @click="mostrarModalEsqueciSenha = true"
            class="text-sm text-gray-400 hover:text-green-600 transition"
          >
            Esqueci minha senha
          </button>
        </div>
      </form>

      <!-- <div class="mt-8 text-center text-sm">
        <p class="text-gray-600">Ainda não tem cadastro?</p>
        <button
          @click="$router.push('/register')"
          class="mt-2 text-green-600 font-semibold hover:underline"
          type="button"
        >
          Criar conta
        </button>
      </div> -->

      <!-- Modal: Esqueci a senha -->
      <div
        v-if="mostrarModalEsqueciSenha"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
        @click.self="fecharModalEsqueciSenha"
      >
        <div class="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 class="text-lg font-bold text-gray-800 mb-1">Redefinir senha</h2>

          <div v-if="!emailEnviado">
            <p class="text-sm text-gray-500 mb-4 leading-relaxed">
              Informe o e-mail da sua conta. Enviaremos um link para criar uma nova senha.
            </p>
            <input
              v-model="emailReset"
              type="email"
              placeholder="seuemail@exemplo.com"
              class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition mb-3"
            />
            <button
              @click="enviarLinkReset"
              :disabled="!emailReset || enviandoReset"
              class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              <div v-if="enviandoReset" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {{ enviandoReset ? 'Enviando...' : 'Enviar link' }}
            </button>
          </div>

          <div v-else class="text-center py-4">
            <div class="text-3xl mb-3">📬</div>
            <p class="text-sm text-gray-700 font-semibold mb-1">E-mail enviado!</p>
            <p class="text-xs text-gray-500 leading-relaxed">
              Se o e-mail estiver cadastrado, você receberá o link em instantes.
              Verifique também a caixa de spam.
            </p>
            <button
              @click="fecharModalEsqueciSenha"
              class="mt-4 text-sm font-semibold text-green-600 hover:underline"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: "auth" });

const { precisaSelecionarPapel, bonusLoginPendente, login } = useAuth();
const { $toast } = useNuxtApp();

const email = ref("");
const senha = ref("");
const carregando = ref(false);

const mostrarModalEsqueciSenha = ref(false);
const emailReset = ref("");
const enviandoReset = ref(false);
const emailEnviado = ref(false);

function fecharModalEsqueciSenha() {
  mostrarModalEsqueciSenha.value = false;
  emailReset.value = "";
  emailEnviado.value = false;
}

async function enviarLinkReset() {
  if (!emailReset.value) return;
  enviandoReset.value = true;
  try {
    await $fetch("/api/forgot-password", {
      method: "POST",
      body: { email: emailReset.value },
    });
    emailEnviado.value = true;
  } catch {
    $toast.error("Não foi possível enviar o e-mail. Tente novamente.");
  } finally {
    enviandoReset.value = false;
  }
}

onMounted(() => {
  if (typeof window === 'undefined') return
  const hash = window.location.hash
  // Supabase redireciona para a raiz quando a redirect URL não está na allowlist
  // ou quando o token é inválido. Encaminha para /reset-password em ambos os casos.
  if (hash.includes('type=recovery') || hash.includes('error=')) {
    navigateTo('/reset-password' + hash)
  }
})

async function verificarUsuario() {
  if (!email.value || !senha.value) {
    $toast.warning("Email e senha obrigatórios.");
    return;
  }

  carregando.value = true;
  try {
    const erro = await login(email.value, senha.value);

    if (erro) {
      $toast.error(erro);
      return;
    }

    if (bonusLoginPendente.value) {
      $toast.success('Bom ter você aqui! +5 ⭐ por fazer login esta semana')
      bonusLoginPendente.value = false
    }

    navigateTo(precisaSelecionarPapel.value ? "/selecionar-papel" : "/hub");
  } finally {
    carregando.value = false;
  }
}

function goToProfile() {
  navigateTo("/register");
}
</script>