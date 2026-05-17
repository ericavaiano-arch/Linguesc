<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-green-700">Minha Turma</h1>
      <p class="text-gray-500 mt-2">Acompanhe sua turma.</p>
      <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-green-700">
      <div
        class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"
      ></div>
      <span>Carregando...</span>
    </div>

    <div
      v-else-if="!turma"
      class="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center"
    >
      <p class="text-4xl mb-4">📚</p>
      <p class="text-gray-500 font-medium">
        Você ainda não está matriculado em nenhuma turma.
      </p>
    </div>

    <div v-else class="space-y-6">
      <!-- Voltar (só exibe se veio do seletor) -->
      <button
        v-if="temMultiplasTurmas"
        @click="$router.push('/aluno/turmas?destino=minha-turma')"
        class="text-sm text-gray-400 hover:text-gray-600 transition flex items-center gap-1"
      >
        ← Trocar turma
      </button>

      <!-- ── CARD DA TURMA ── -->
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-base font-medium text-gray-800">
              {{ turma.nome }}
            </h2>
            <p class="text-sm text-gray-500 mt-1">{{ nomeProfessor }}</p>
            <p v-if="turma.sala" class="text-sm text-gray-500 mt-0.5">
              Sala {{ turma.sala }}
            </p>
          </div>
          <span
            class="text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5"
            :class="
              turma.status === 'ATIVA'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            "
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="turma.status === 'ATIVA' ? 'bg-green-600' : 'bg-gray-400'"
            ></span>
            {{ turma.status === "ATIVA" ? "Ativa" : "Finalizada" }}
          </span>
        </div>

        <div class="h-px bg-gray-100 my-4"></div>

        <div class="flex items-stretch gap-6">
          <div class="flex flex-col gap-0.5">
            <span class="text-[11px] text-gray-400">Estudantes</span>
            <span class="text-sm font-medium text-gray-800">{{
              totalAlunos
            }}</span>
          </div>
          <div class="w-px bg-gray-100"></div>
          <div class="flex flex-col gap-0.5">
            <span class="text-[11px] text-gray-400">Meta de frequência</span>
            <span class="text-sm font-medium text-gray-800"
              >{{ metaFrequencia }}%</span
            >
          </div>
          <div class="w-px bg-gray-100"></div>
          <div class="flex flex-col gap-0.5">
            <span class="text-[11px] text-gray-400">Próxima aula</span>
            <span class="text-sm font-medium text-gray-800">
              {{ proximaAula ? formatarDataCurta(proximaAula.data) : "—" }}
            </span>
          </div>
        </div>
      </div>

      <!-- ── SUA POSIÇÃO ── -->
      <!-- <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <p class="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-5">Sua posição na turma</p>

        <div class="flex items-center gap-4">
          <div
            class="flex items-center justify-center w-16 h-16 rounded-2xl text-2xl flex-shrink-0"
            :class="minhaPosicao.cor === 'green' ? 'bg-green-50' : minhaPosicao.cor === 'yellow' ? 'bg-yellow-50' : 'bg-red-50'"
          >
            {{ minhaPosicao.emoji }}
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-lg font-bold text-gray-800">{{ minhaPosicao.posicao }}º de {{ rankingAtivos.length }}</p>
            <p
              class="text-sm mt-0.5 font-medium leading-snug"
              :class="minhaPosicao.cor === 'green' ? 'text-green-600' : minhaPosicao.cor === 'yellow' ? 'text-yellow-600' : 'text-red-500'"
            >
              {{ minhaPosicao.mensagem }}
            </p>
          </div>

          <div class="w-px h-12 bg-gray-100 flex-shrink-0"></div>

          <div class="text-center flex-shrink-0">
            <p
              class="text-3xl font-bold"
              :class="minhaPosicao.cor === 'green' ? 'text-green-600' : minhaPosicao.cor === 'yellow' ? 'text-yellow-600' : 'text-red-500'"
            >
              {{ minhaFrequencia }}%
            </p>
            <p class="text-xs text-gray-400 mt-0.5">minha frequência</p>
          </div>

          <div class="w-px h-12 bg-gray-100 flex-shrink-0"></div>

          <div class="text-center flex-shrink-0">
            <p class="text-3xl font-bold text-gray-300">{{ mediaFrequenciaTurma }}%</p>
            <p class="text-xs text-gray-400 mt-0.5">média da turma</p>
          </div>
        </div>
      </div> -->

      <!-- ── RANKING DA TURMA ── -->
      <!-- <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-800">🏆 Ranking de frequência da turma</h2>
          <span class="text-xs text-gray-400">{{ aulasRealizadas }} aula(s) realizadas</span>
        </div>

        <div v-if="aulasRealizadas === 0" class="text-center py-12 text-sm text-gray-400">
          Nenhuma aula realizada ainda. O ranking aparecerá assim que houver chamadas registradas.
        </div>

        <ul v-else class="divide-y divide-gray-50">
          <li
            v-for="(aluno, index) in rankingAtivos"
            :key="aluno.id"
            class="flex items-center gap-4 px-6 py-4 transition"
            :class="aluno.isVoce ? 'bg-green-50' : 'hover:bg-gray-50'"
          >
            <div class="w-8 text-center flex-shrink-0">
              <span v-if="index === 0" class="text-xl">🥇</span>
              <span v-else-if="index === 1" class="text-xl">🥈</span>
              <span v-else-if="index === 2" class="text-xl">🥉</span>
              <span v-else class="text-sm font-bold text-gray-400">{{ index + 1 }}º</span>
            </div>

            <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">👤</div>

            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-800 truncate">
                {{ aluno.isVoce ? 'Você' : aluno.nomeAnonimo }}
                <span v-if="aluno.isVoce" class="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">você</span>
              </p>
              <div class="flex items-center gap-2 mt-1.5">
                <div class="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div
                    class="h-1.5 rounded-full transition-all duration-500"
                    :class="aluno.frequencia >= metaFrequencia ? 'bg-green-500' : aluno.frequencia >= 50 ? 'bg-yellow-400' : 'bg-red-400'"
                    :style="{ width: aluno.frequencia + '%' }"
                  ></div>
                </div>
              </div>
            </div>

            <div class="text-right flex-shrink-0">
              <span
                class="text-sm font-bold"
                :class="aluno.frequencia >= metaFrequencia ? 'text-green-600' : aluno.frequencia >= 50 ? 'text-yellow-600' : 'text-red-500'"
              >
                {{ aluno.frequencia }}%
              </span>
              <p class="text-xs text-gray-400">{{ aluno.presencas }}/{{ aulasRealizadas }}</p>
            </div>
          </li>
        </ul>

        <div v-if="inativos.length > 0" class="px-6 py-3 border-t border-gray-100">
          <p class="text-xs text-gray-400">+ {{ inativos.length }} aluno(s) inativo(s) não exibido(s) no ranking</p>
        </div>
      </div> -->

      <!-- ── PRÓXIMAS AULAS ── -->
      <div
        v-if="proximasAulas.length > 0"
        class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
      >
        <div
          class="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
        >
          <h2 class="text-base font-semibold text-gray-800">
            📅 Próximas aulas
          </h2>
          <span
            class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium"
          >
            {{ proximasAulas.length }} agendada(s)
          </span>
        </div>

        <div class="flex gap-3 px-6 py-4 overflow-x-auto">
          <div
            v-for="aula in proximasAulas"
            :key="aula.id"
            class="flex-shrink-0 flex flex-col items-center w-20 rounded-2xl border border-gray-200 overflow-hidden"
          >
            <!-- Cabeçalho com mês -->
            <div
              class="w-full bg-green-600 py-1 flex items-center justify-center"
            >
              <span
                class="text-[11px] font-bold text-white uppercase tracking-wide"
              >
                {{ mes(aula.data) }}
              </span>
            </div>
            <!-- Corpo com dia e semana -->
            <div
              class="flex flex-col items-center justify-center gap-0.5 py-3 bg-white w-full"
            >
              <span class="text-2xl font-bold text-gray-800 leading-none">
                {{ dia(aula.data) }}
              </span>
              <span
                class="text-[10px] font-medium text-gray-400 uppercase tracking-wide"
              >
                {{ diaSemana(aula.data) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── ALUNOS DA TURMA ── -->
      <div
        class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
      >
        <div
          class="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
        >
          <h2 class="text-base font-semibold text-gray-800">
            👥 Estudantes da turma
          </h2>
          <span
            class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium"
          >
            {{ totalAlunos }} aluno(s)
          </span>
        </div>

        <ul class="divide-y divide-gray-50">
          <li
            v-for="aluno in alunosAtivos"
            :key="aluno.id"
            class="flex items-center gap-3 px-6 py-3"
          >
            <div
              class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm flex-shrink-0"
            >
              👤
            </div>
            <span class="text-sm text-gray-700">{{ aluno.nome }}</span>
          </li>
        </ul>

        <div
          v-if="inativos.length > 0"
          class="px-6 py-3 border-t border-gray-100"
        >
          <p class="text-xs text-gray-400">
            + {{ inativos.length }} aluno(s) inativo(s) não exibido(s)
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { supabase } from "~/utils/supabase";

definePageMeta({ middleware: "auth" });

const { user } = useAuth();
const route = useRoute();
const router = useRouter();
const { metaFrequencia } = useConfigSistema();

const loading = ref(true);
const turma = ref(null);
const nomeProfessor = ref("—");
const todosAlunos = ref([]);
const todasPresencas = ref([]);
const totalAulas = ref(0);
const proximaAula = ref(null);
const todasJustificativas = ref([]);
const temMultiplasTurmas = ref(false);
const aulas = ref([]);

const alunosAtivos = computed(() =>
  todosAlunos.value
    .filter((a) => a.ativo)
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
);

const proximasAulas = computed(() => {
  const hoje = new Date().toISOString().split("T")[0];
  return aulas.value.filter((a) => a.status === "AGENDADA" && a.data >= hoje);
});

function diaSemana(dataStr) {
  const d = new Date(dataStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
}

function dia(dataStr) {
  return new Date(dataStr + "T12:00:00").getDate();
}

function mes(dataStr) {
  const d = new Date(dataStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
}

onMounted(async () => {
  const alunoId = user.value?.id;
  if (!alunoId) {
    loading.value = false;
    return;
  }

  const turmaId = route.query.turma_id ? Number(route.query.turma_id) : null;

  const { data: vinculos } = await supabase
    .from("turma_aluno")
    .select(
      "turma_id, turma(id, nome, status, meta_frequencia, professor_id, sala)",
    )
    .eq("aluno_id", alunoId);

  if (!vinculos || vinculos.length === 0) {
    loading.value = false;
    return;
  }

  temMultiplasTurmas.value = vinculos.length > 1;

  let vinculo;
  if (turmaId) {
    vinculo = vinculos.find((v) => v.turma_id === turmaId);
  } else if (vinculos.length === 1) {
    vinculo = vinculos[0];
  } else {
    router.replace("/aluno/turmas?destino=minha-turma");
    return;
  }

  if (!vinculo) {
    loading.value = false;
    return;
  }
  turma.value = vinculo.turma;

  const tId = turma.value.id;
  const professorId = turma.value.professor_id;

  const [{ data: professorData }, { data: vinculosData }, { data: aulasData }] =
    await Promise.all([
      supabase.from("usuarios").select("nome").eq("id", professorId).single(),
      supabase
        .from("turma_aluno")
        .select("aluno_id, usuarios(id, nome, ativo)")
        .eq("turma_id", tId),
      supabase
        .from("aula")
        .select("id, data, status")
        .eq("turma_id", tId)
        .order("data", { ascending: true }),
    ]);

  nomeProfessor.value = professorData?.nome ?? "—";
  aulas.value = aulasData || [];

  todosAlunos.value = (vinculosData || []).map((v) => ({
    id: v.aluno_id,
    nome: v.usuarios?.nome ?? "",
    ativo: v.usuarios?.ativo ?? true,
  }));

  const aulasRealizadasIds = (aulasData || [])
    .filter((a) => a.status === "REALIZADA")
    .map((a) => a.id);
  totalAulas.value = aulasRealizadasIds.length;

  const hoje = new Date().toISOString().split("T")[0];
  proximaAula.value =
    (aulasData || [])
      .filter((a) => a.status === "AGENDADA" && a.data >= hoje)
      .sort((a, b) => a.data.localeCompare(b.data))[0] ?? null;

  const alunosIds = todosAlunos.value.map((a) => a.id);

  if (alunosIds.length > 0 && aulasRealizadasIds.length > 0) {
    const [{ data: presencasData }, { data: justData }] = await Promise.all([
      supabase
        .from("presenca")
        .select("aluno_id, aula_id")
        .in("aluno_id", alunosIds)
        .in("aula_id", aulasRealizadasIds),
      supabase
        .from("justificativa_falta")
        .select("aluno_id, aula_id, status")
        .in("aluno_id", alunosIds)
        .in("aula_id", aulasRealizadasIds)
        .eq("status", "ACEITA"),
    ]);
    todasPresencas.value = presencasData || [];
    todasJustificativas.value = justData || [];
  }

  loading.value = false;
});

// ── Computeds ────────────────────────────────────────────────────

const aulasRealizadas = computed(() => totalAulas.value);
const totalAlunos = computed(
  () => todosAlunos.value.filter((a) => a.ativo).length,
);
const inativos = computed(() => todosAlunos.value.filter((a) => !a.ativo));

const mediaFrequenciaTurma = computed(() => {
  if (rankingAtivos.value.length === 0) return 0;
  const soma = rankingAtivos.value.reduce((acc, a) => acc + a.frequencia, 0);
  return Math.round(soma / rankingAtivos.value.length);
});

const rankingAtivos = computed(() => {
  const meuId = user.value?.id;
  const lista = todosAlunos.value
    .filter((a) => a.ativo)
    .map((aluno) => {
      const presencas = todasPresencas.value.filter(
        (p) => p.aluno_id === aluno.id,
      ).length;
      const justAceitas = todasJustificativas.value.filter(
        (j) =>
          j.aluno_id === aluno.id &&
          !todasPresencas.value.some(
            (p) => p.aluno_id === aluno.id && p.aula_id === j.aula_id,
          ),
      ).length;
      const totalValidas = presencas + justAceitas;
      const frequencia =
        aulasRealizadas.value > 0
          ? Math.round((totalValidas / aulasRealizadas.value) * 100)
          : 0;
      return {
        id: aluno.id,
        isVoce: aluno.id === meuId,
        presencas: totalValidas,
        frequencia,
      };
    })
    .sort((a, b) => b.frequencia - a.frequencia);

  let contador = 1;
  return lista.map((aluno) => ({
    ...aluno,
    nomeAnonimo: aluno.isVoce ? "Você" : `Colega ${contador++}`,
  }));
});

const minhaFrequencia = computed(
  () => rankingAtivos.value.find((a) => a.isVoce)?.frequencia ?? 0,
);

const minhaPosicao = computed(() => {
  const pos = rankingAtivos.value.findIndex((a) => a.isVoce) + 1;
  const total = rankingAtivos.value.length;
  const freq = minhaFrequencia.value;
  const meta = turma.value?.meta_frequencia ?? 75;

  let emoji = "📊";
  if (pos === 1) emoji = "🥇";
  else if (pos === 2) emoji = "🥈";
  else if (pos === 3) emoji = "🥉";

  let cor = "green";
  let mensagem = "Ótimo trabalho! Continue assim.";
  if (freq < meta) {
    cor = "red";
    mensagem = "Sua frequência está abaixo da meta. Tente não faltar!";
  } else if (pos > Math.ceil(total / 2)) {
    cor = "yellow";
    mensagem = "Você está na metade inferior da turma. Dá pra melhorar!";
  }

  return { posicao: pos, emoji, cor, mensagem };
});

function formatarDataCurta(dataStr) {
  const d = new Date(dataStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}
</script>
