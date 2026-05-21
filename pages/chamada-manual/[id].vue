<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8">
    <!-- Header -->
    <div class="mb-8 flex items-start justify-between">
      <div>
        <button
          @click="$router.back()"
          class="text-sm text-gray-400 hover:text-gray-600 transition mb-4 flex items-center gap-1"
        >
          ← Voltar
        </button>
        <h1 class="text-3xl font-bold text-green-700">
          Chamada — {{ turma?.nome }}
        </h1>
        <p class="text-gray-500 mt-2">
          Selecione a aula e registre as presenças.
        </p>
        <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
      </div>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div
        class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"
      ></div>
      <span class="text-sm">Carregando...</span>
    </div>

    <div
      v-else
      class="flex flex-col sm:grid gap-4"
      style="grid-template-columns: 260px 1fr; align-items: start"
    >
      <!-- Lista de aulas -->
      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div class="px-3.5 py-2.5 border-b border-gray-100">
          <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Aulas
          </p>
        </div>
        <div
          v-if="aulas.length === 0"
          class="px-4 py-6 text-xs text-gray-400 text-center"
        >
          Nenhuma aula cadastrada.
        </div>
        <button
          v-for="aula in aulasOrdenadas"
          :key="aula.id"
          @click="!isBloqueada(aula) && escolherAula(aula)"
          class="w-full flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 last:border-0 text-left gap-2 transition"
          :class="
            isBloqueada(aula)
              ? 'opacity-40 cursor-not-allowed'
              : aulaSelecionada?.id === aula.id
                ? 'bg-green-50'
                : 'hover:bg-gray-50 cursor-pointer'
          "
        >
          <div class="min-w-0">
            <p class="text-xs font-medium text-gray-800 truncate">
              {{ formatarData(aula.data) }}
            </p>
            <p class="text-xs text-gray-400 mt-0.5">
              {{
                isFutura(aula)
                  ? "Aula futura"
                  : aula.status === "CANCELADA"
                    ? "Cancelada"
                    : aula.status === "REALIZADA"
                      ? "Chamada feita"
                      : "Disponível"
              }}
            </p>
          </div>
          <span
            class="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
            :class="{
              'bg-green-100 text-green-700': aula.status === 'REALIZADA',
              'bg-yellow-100 text-yellow-700':
                aula.status === 'AGENDADA' && !isFutura(aula),
              'bg-red-100 text-red-500': aula.status === 'CANCELADA',
              'bg-gray-100 text-gray-400': isFutura(aula),
            }"
          >
            {{ isFutura(aula) ? "futura" : aula.status.toLowerCase() }}
          </span>
        </button>
      </div>

      <!-- Painel de chamada -->
      <div
        v-if="aulaSelecionada"
        class="bg-white border border-gray-200 rounded-2xl overflow-hidden"
      >
        <!-- Cabeçalho -->
        <div
          class="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100"
        >
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-semibold text-gray-800">Estudantes</h2>
            <div
              v-if="loadingPresencas"
              class="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"
            ></div>
            <span
              v-else-if="modoEdicao"
              class="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full"
              >editando</span
            >
            <span
              v-else
              class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
              >nova chamada</span
            >
          </div>
          <span
            class="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-medium"
          >
            {{ presentesCount }}/{{ alunos.length }}
          </span>
        </div>

        <!-- Ações rápidas -->
        <div class="flex gap-2 px-3.5 py-2.5 border-b border-gray-100">
          <button
            @click="marcarTodos"
            class="text-xs px-3 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition"
          >
            marcar todos
          </button>
          <button
            @click="desmarcarTodos"
            class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
          >
            desmarcar todos
          </button>
        </div>

        <!-- Lista de alunos -->
        <ul class="divide-y divide-gray-100 px-3.5 py-2">
          <li
            v-for="aluno in alunosOrdenados"
            :key="aluno.id"
            @click="aluno.ativo ? togglePresenca(aluno.id) : null"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl border my-1 transition-all duration-100 select-none"
            :class="
              !aluno.ativo
                ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                : presentes.has(aluno.id)
                  ? 'border-green-300 bg-green-50 cursor-pointer'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
            "
          >
            <div
              class="w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 transition-all"
              :class="
                presentes.has(aluno.id)
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300'
              "
            >
              <svg
                v-if="presentes.has(aluno.id)"
                class="w-2.5 h-2.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="3.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span
              class="text-sm truncate"
              :class="
                presentes.has(aluno.id)
                  ? 'text-green-800 font-medium'
                  : 'text-gray-700'
              "
            >
              {{ aluno.nome }}
            </span>
          </li>
        </ul>

        <!-- Rodapé -->
        <div
          class="flex items-center gap-2 px-3.5 py-3 border-t border-gray-100 flex-wrap"
        >
          <button
            @click="registrarAulaCancelada"
            class="text-xs px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition"
          >
            aula cancelada
          </button>
          <button
            @click="registrarAulaVazia"
            class="text-xs px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
          >
            ninguém presente
          </button>
          <div class="flex-1"></div>
          <button
            @click="salvarChamada"
            :disabled="salvando || nenhumAlunoMarcado"
            class="text-sm font-semibold px-5 py-2 rounded-xl transition active:scale-95 flex items-center gap-2"
            :class="
              salvando || nenhumAlunoMarcado
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
            "
          >
            <div
              v-if="salvando"
              class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></div>
            {{
              salvando
                ? "Salvando..."
                : "Salvar chamada"
            }}
          </button>
        </div>
      </div>

      <!-- Estado vazio -->
      <div
        v-else
        class="bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center py-16 text-center"
      >
        <p class="text-2xl mb-2">📋</p>
        <p class="text-sm text-gray-400">
          Selecione uma aula para iniciar a chamada.
        </p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "@/utils/supabase";
import { verificarENotificarRisco } from "~/composables/useNotificacaoRisco";
const { metaFrequencia, carregarConfig } = useConfigSistema();
const { user } = useAuth();

definePageMeta({ middleware: "professor" });

const route = useRoute();
const router = useRouter();
const { $toast } = useNuxtApp();

const turmaId = route.params.id;
const turma = ref(null);
const aulas = ref([]);
const alunos = ref([]);
const loading = ref(true);
const loadingPresencas = ref(false);
const salvando = ref(false);
const nenhumAlunoMarcado = computed(() => presentesCount.value === 0);

const aulaSelecionada = ref(null);
const presentes = ref(new Set());
const presentesOriginais = ref(new Set());
const presencaIds = ref({});
const modoEdicao = ref(false);

const dropdownAberto = ref(false);

const alunosOrdenados = computed(() =>
  [...alunos.value].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
);

async function escolherAula(aula) {
  dropdownAberto.value = false;
  await selecionarAula(aula);
}

const dropdownRef = ref(null);
onMounted(async () => {
  await Promise.all([carregarTurma(), carregarAulas(), carregarAlunos()]);
  loading.value = false;

  document.addEventListener("click", (e) => {
    if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
      dropdownAberto.value = false;
    }
  });
});

const presentesCount = computed(() => presentes.value.size);
const aulasOrdenadas = computed(() =>
  [...aulas.value].sort((a, b) => new Date(a.data) - new Date(b.data)),
);

function isFutura(aula) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataAula = new Date(aula.data);
  dataAula.setHours(0, 0, 0, 0);
  return dataAula > hoje;
}

function isBloqueada(aula) {
  return isFutura(aula) || aula.status === "CANCELADA";
}

function formatarData(dataStr) {
  const d = new Date(dataStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

async function carregarTurma() {
  const { data } = await supabase
    .from("turma")
    .select("*")
    .eq("id", turmaId)
    .single();
  turma.value = data;
}

async function carregarAulas() {
  const { data, error } = await supabase
    .from("aula")
    .select("*")
    .eq("turma_id", turmaId);
  if (!error) aulas.value = data;
}

async function carregarAlunos() {
  const { data, error } = await supabase
    .from("turma_aluno")
    .select("aluno_id, usuarios(id, nome, ativo)")
    .eq("turma_id", turmaId);

  if (!error) {
    alunos.value = data.map((item) => ({
      id: item.aluno_id,
      nome: item.usuarios?.nome || "Estudante",
      ativo: item.usuarios?.ativo ?? true,
    }));
  }
}

async function selecionarAula(aula) {
  aulaSelecionada.value = aula;
  loadingPresencas.value = true;
  presencaIds.value = {};

  const { data, error } = await supabase
    .from("presenca")
    .select("id, aluno_id")
    .eq("aula_id", aula.id);

  if (error) {
    console.error(error);
    loadingPresencas.value = false;
    return;
  }

  const novosPresentes = new Set();
  data.forEach((p) => {
    novosPresentes.add(p.aluno_id);
    presencaIds.value[p.aluno_id] = p.id;
  });

  presentes.value = novosPresentes;
  presentesOriginais.value = new Set(novosPresentes);
  modoEdicao.value = novosPresentes.size > 0;
  loadingPresencas.value = false;
}

function togglePresenca(alunoId) {
  const s = new Set(presentes.value);
  s.has(alunoId) ? s.delete(alunoId) : s.add(alunoId);
  presentes.value = s;
}

function marcarTodos() {
  presentes.value = new Set(
    alunos.value.filter((a) => a.ativo).map((a) => a.id),
  );
}
function desmarcarTodos() {
  presentes.value = new Set();
}

async function salvarChamada() {
  salvando.value = true;
  try {
    const aInserir = [...presentes.value].filter(
      (id) => !presentesOriginais.value.has(id),
    );
    const aRemover = [...presentesOriginais.value].filter(
      (id) => !presentes.value.has(id),
    );

    const promessas = [];

    if (aInserir.length > 0) {
      promessas.push(
        supabase.from("presenca").insert(
          aInserir.map((aluno_id) => ({
            aluno_id,
            aula_id: aulaSelecionada.value.id,
            status: "PRESENTE",
          })),
        ),
      );
    }

    if (aRemover.length > 0) {
      const ids = aRemover.map((id) => presencaIds.value[id]).filter(Boolean);
      if (ids.length > 0)
        promessas.push(supabase.from("presenca").delete().in("id", ids));
    }

    if (promessas.length === 0) {
      $toast.warning("Nenhuma alteração detectada.");
      salvando.value = false;
      return;
    }

    const resultados = await Promise.all(promessas);
    const erros = resultados.filter((r) => r.error);

    if (erros.length > 0) throw erros[0].error;

    // Marcar aula como REALIZADA
    await supabase
      .from("aula")
      .update({ status: "REALIZADA" })
      .eq("id", aulaSelecionada.value.id);

    const msg = modoEdicao.value ? `Chamada atualizada!` : `Chamada salva!`;

    $toast.success(msg);

    await verificarENotificarRisco({
      turmaId: aulaSelecionada.value.turma_id,
      turmaNome: turma?.value.nome,
      professorId: user.value?.id ?? "",
      metaFrequencia: metaFrequencia.value,
    }).catch((err) => console.error("Erro ao verificar risco:", err));

    await verificarNotificacaoProfessor().catch((err) =>
      console.error("Erro ao emitir notificação:", err),
    );

    router.push("/turmas");
  } catch (err) {
    console.error(err);
    $toast.error("Erro ao salvar chamada.");
  } finally {
    salvando.value = false;
  }
}

async function verificarNotificacaoProfessor() {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - 7);
  const dataLimiteFormatada = dataLimite.toISOString().slice(0, 10);

  if (aulaSelecionada.value.data >= dataLimiteFormatada) return;

  const { data: admins } = await supabase
    .from("usuario_papel")
    .select("usuario_id")
    .eq("papel", "ADMIN")
    .eq("ativo", true);

  const notificacoesAdmin = (admins || []).map((a) => ({
    aluno_id: a.usuario_id,
    professor_id: user.value?.id ?? "",
    turma_id: aulaSelecionada.value.turma_id,
    mensagem: `O professor ${user.value?.nome} alterou a chamada da aula do dia ${aulaSelecionada.value.data}, após o prazo de 7 dias.`,
  }));

  if (notificacoesAdmin.length) {
    await supabase.from("notificacao_risco").insert(notificacoesAdmin);
  }
}

async function registrarAulaVazia() {
  salvando.value = true;
  try {
    await supabase
      .from("presenca")
      .delete()
      .eq("aula_id", aulaSelecionada.value.id);

    await supabase
      .from("aula")
      .update({ status: "REALIZADA" })
      .eq("id", aulaSelecionada.value.id);

    $toast.success("Aula registrada sem presenças.");

    await verificarENotificarRisco({
      turmaId: aulaSelecionada.value.turma_id,
      turmaNome: turma?.value.nome,
      professorId: user.value?.id ?? "",
      metaFrequencia: metaFrequencia.value,
    }).catch((err) => console.error("Erro ao verificar risco:", err));

    router.push("/turmas");
  } catch (err) {
    console.error(err);
    $toast.error("Erro ao registrar aula.");
  } finally {
    salvando.value = false;
  }
}

async function registrarAulaCancelada() {
  salvando.value = true;
  try {
    await supabase
      .from("presenca")
      .delete()
      .eq("aula_id", aulaSelecionada.value.id);

    await supabase
      .from("aula")
      .update({ status: "CANCELADA" })
      .eq("id", aulaSelecionada.value.id);

    $toast.success("Aula registrada como cancelada.");

    router.push("/turmas");
  } catch (err) {
    console.error(err);
    $toast.error("Erro ao registrar aula.");
  } finally {
    salvando.value = false;
  }
}

onMounted(async () => {
  await Promise.all([carregarTurma(), carregarAulas(), carregarAlunos()]);
  loading.value = false;
});
</script>
