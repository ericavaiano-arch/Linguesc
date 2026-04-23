<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-green-700">Minha Presença</h1>
      <p class="text-gray-500 mt-2">
        Acompanhe sua frequência ao longo do curso.
      </p>
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
      <!-- ── TOPO FIXO: status rápido ── -->
      <div class="bg-white border rounded-2xl px-6 py-5 shadow-sm" :class="corBorda">

        <!-- Header -->
        <div class="flex items-start justify-between mb-5">
          <div>
            <p class="text-sm font-medium text-gray-800">{{ turma.nome }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ turma.periodo }} · meta de {{ metaFrequencia }}%</p>
          </div>
          <span
            class="text-xs font-medium px-3 py-1 rounded-full"
            :class="freq.frequencia >= metaFrequencia
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'"
          >
            {{ freq.frequencia >= metaFrequencia ? 'Meta atingida' : 'Abaixo da meta' }}
          </span>
        </div>

        <!-- Frequência + barra -->
        <div class="flex gap-8 items-start mb-5">
          <div>
            <p
              class="text-4xl font-medium leading-none"
              :class="freq.frequencia >= metaFrequencia ? 'text-green-700' : 'text-red-500'"
            >
              {{ freq.frequencia }}%
            </p>
            <p class="text-xs text-gray-400 mt-1">frequência atual</p>
          </div>
          <div class="flex-1">
            <p class="text-xs text-gray-400 mb-1.5">progresso até a meta</p>
            <div class="relative w-full bg-gray-100 rounded-full h-1.5">
              <div
                class="h-1.5 rounded-full transition-all duration-500"
                :class="freq.frequencia >= metaFrequencia ? 'bg-green-500' : 'bg-red-400'"
                :style="{ width: Math.min(freq.frequencia, 100) + '%' }"
              ></div>
              <div
                class="absolute -top-1 h-3.5 w-px bg-gray-400 rounded"
                :style="{ left: metaFrequencia + '%' }"
              ></div>
            </div>
            <div class="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>0%</span>
              <span>{{ metaFrequencia }}% meta</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div class="h-px bg-gray-100 mb-5"></div>

        <!-- Stats + Histórico -->
        <div class="flex gap-10 mb-5">
          <div class="space-y-2.5">
            <div class="flex items-baseline gap-2">
              <span class="text-xl font-medium text-gray-700">{{ aulasRealizadas.length }}</span>
              <span class="text-sm text-gray-400">aulas realizadas</span>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-xl font-medium text-green-700">{{ freq.totalValidas }}</span>
              <span class="text-sm text-gray-400">presenças</span>
              <span v-if="freq.justificativasAceitas > 0" class="text-xs text-blue-600">
                ({{ freq.justificativasAceitas }} justificada{{ freq.justificativasAceitas > 1 ? 's' : '' }})
              </span>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-xl font-medium text-red-500">{{ totalFaltas }}</span>
              <span class="text-sm text-gray-400">falta{{ totalFaltas !== 1 ? 's' : '' }}</span>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div
          class="rounded-xl px-4 py-3 text-sm font-medium flex items-start gap-2"
          :class="statusMeta.classe"
        >
          <svg class="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
            <circle v-if="!statusOk" cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.2"/>
            <path v-if="!statusOk" d="M8 4.5v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            <circle v-if="!statusOk" cx="8" cy="11" r="0.8" fill="currentColor"/>
            <path v-if="statusOk" d="M3 8l3.5 3.5L13 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ statusMeta.mensagem }}
        </div>

      </div>

      <!-- ── TABS ── -->
      <div
        class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
      >
        <!-- Cabeçalho das tabs -->
        <div class="flex border-b border-gray-100">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="tabAtiva = tab.id"
            class="flex-1 px-4 py-4 text-sm font-semibold transition-all"
            :class="
              tabAtiva === tab.id
                ? 'text-green-700 border-b-2 border-green-600 bg-green-50/50'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            "
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- ── TAB: Histórico ── -->
        <div v-if="tabAtiva === 'historico'" class="p-0">
          <div
            v-if="aulasRealizadas.length === 0"
            class="text-center py-12 text-sm text-gray-400"
          >
            Nenhuma aula realizada ainda.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th
                    class="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide"
                  >
                    Aluno
                  </th>
                  <th
                    v-for="aula in aulasRealizadas"
                    :key="aula.id"
                    class="text-center px-3 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap"
                  >
                    {{ formatarDataCurta(aula.data) }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="hover:bg-gray-50 transition">
                  <td
                    class="px-6 py-4 font-medium text-gray-800 whitespace-nowrap"
                  >
                    {{ user?.nome }}
                  </td>
                  <td
                    v-for="aula in aulasRealizadas"
                    :key="aula.id"
                    class="text-center px-3 py-4"
                  >
                    <span
                      v-if="presencasAluno.has(aula.id)"
                      class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-green-100 text-green-700"
                      >✓</span
                    >
                    <span
                      v-else-if="justificativaStatus(aula.id) === 'ACEITA'"
                      class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-blue-100 text-blue-700"
                      title="Falta justificada e aceita"
                      >J</span
                    >
                    <span
                      v-else-if="justificativaStatus(aula.id) === 'PENDENTE'"
                      class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700"
                      title="Pendente Justificativa"
                      >⏳</span
                    >
                    <button
                      v-else-if="justificativaStatus(aula.id) === 'REJEITADA'"
                      @click="abrirJustificativa(aula)"
                      class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-red-100 text-red-600 hover:bg-red-200 transition"
                      title="Rejeitada — clique para reenviar"
                    >
                      ✗
                    </button>
                    <button
                      v-else
                      @click="abrirJustificativa(aula)"
                      class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-red-100 text-red-600 hover:bg-red-200 transition"
                      title="Falta — clique para justificar"
                    >
                      ✗
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Legenda -->
          <div
            class="px-6 py-3 border-t border-gray-50 flex items-center flex-wrap gap-4 text-xs text-gray-400"
          >
            <span class="flex items-center gap-1.5">
              <span
                class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 font-bold text-xs"
                >✓</span
              >
              Presente
            </span>
            <span class="flex items-center gap-1.5">
              <span
                class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs"
                >J</span
              >
              Justificada
            </span>
            <span class="flex items-center gap-1.5">
              <span
                class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 font-bold text-xs"
                >⏳</span
              >
              Pendente Justificativa
            </span>
            <span class="flex items-center gap-1.5">
              <span
                class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 font-bold text-xs"
                >✗</span
              >
              Falta (clique para justificar)
            </span>
          </div>
        </div>

        <!-- ── TAB: Projeção ── -->
        <div v-if="tabAtiva === 'projecao'" class="p-6 space-y-5">
          <div
            v-if="proximasAulas.length === 0"
            class="text-sm text-gray-400 text-center py-6"
          >
            Nenhuma aula agendada para simular.
          </div>

          <div v-else class="space-y-5">
            <p class="text-sm text-gray-400">
              Toque em cada aula para simular presença ou falta.
            </p>

            <div v-if="aulasRealizadas.length > 0" class="space-y-2 mb-4">
              <p
                class="text-xs font-medium text-gray-400 uppercase tracking-wide"
              >
                Aulas realizadas
              </p>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div
                  v-for="aula in aulasRealizadas"
                  :key="aula.id"
                  class="flex flex-col items-center px-3 py-3 rounded-xl border text-sm font-medium cursor-default"
                  :class="presencasAluno.has(aula.id) || justificativaStatus(aula.id) === 'ACEITA'
                    ? 'border-green-100 bg-green-50/50 text-green-400'
                    : 'border-red-100 bg-red-50/50 text-red-400'"
                  "
                >
                  <span class="text-lg mb-1">{{
                    presencasAluno.has(aula.id) ? "✓" : "✗"
                  }}</span>
                  <span class="text-xs font-semibold">{{
                    formatarDataCurta(aula.data)
                  }}</span>
                  <span class="text-xs mt-0.5 opacity-70">
                    {{ presencasAluno.has(aula.id) 
                        ? 'Presente' 
                        : justificativaStatus(aula.id) === 'ACEITA' 
                          ? 'Justificada' 
                          : 'Falta' 
                    }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Aulas futuras clicáveis -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                v-for="aula in proximasAulas"
                :key="aula.id"
                @click="toggleAulaSimulada(aula.id)"
                class="flex flex-col items-center px-3 py-3 rounded-xl border text-sm font-medium transition-all"
                :class="
                  aulasSimuladasFalta.has(aula.id)
                    ? 'border-red-300 bg-red-50 text-red-600'
                    : 'border-green-300 bg-green-50 text-green-700'
                "
              >
                <span class="text-lg mb-1">{{
                  aulasSimuladasFalta.has(aula.id) ? "✗" : "✓"
                }}</span>
                <span class="text-xs font-semibold">{{
                  formatarDataCurta(aula.data)
                }}</span>
                <span class="text-xs mt-0.5 opacity-70">
                  {{ aulasSimuladasFalta.has(aula.id) ? "Falta" : "Presente" }}
                </span>
              </button>
            </div>

            <!-- Resultado -->
            <div
              class="rounded-xl px-5 py-4 border transition-all"
              :class="
                projecao.frequencia >= (turma?.meta_frequencia ?? 70)
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              "
            >
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-gray-600"
                  >Frequência projetada</span
                >
                <span
                  class="text-2xl font-bold"
                  :class="
                    projecao.frequencia >= (turma?.meta_frequencia ?? 70)
                      ? 'text-green-700'
                      : 'text-red-600'
                  "
                >
                  {{ projecao.frequencia }}%
                </span>
              </div>

              <div class="relative w-full bg-gray-100 rounded-full h-2 mb-3">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="
                    projecao.frequencia >= (turma?.meta_frequencia ?? 70)
                      ? 'bg-green-500'
                      : 'bg-red-400'
                  "
                  :style="{ width: Math.min(projecao.frequencia, 100) + '%' }"
                ></div>
                <div
                  class="absolute top-0 h-2 w-0.5 bg-gray-400"
                  :style="{ left: (turma?.meta_frequencia ?? 70) + '%' }"
                ></div>
              </div>

              <p
                class="text-sm font-medium"
                :class="
                  projecao.frequencia >= (turma?.meta_frequencia ?? 70)
                    ? 'text-green-700'
                    : 'text-red-600'
                "
              >
                {{ projecao.mensagem }}
              </p>
            </div>

            <!-- Info adicional -->
            <div class="grid grid-cols-3 gap-3 text-center">
              <div class="bg-gray-50 rounded-xl p-3">
                <p class="text-xs text-gray-400 mb-1">Aulas futuras</p>
                <p class="font-bold text-gray-700">
                  {{ proximasAulas.length }}
                </p>
              </div>
              <div class="bg-gray-50 rounded-xl p-3">
                <p class="text-xs text-gray-400 mb-1">Faltas simuladas</p>
                <p class="font-bold text-red-500">
                  {{ aulasSimuladasFalta.size }}
                </p>
              </div>
              <div class="bg-gray-50 rounded-xl p-3">
                <p class="text-xs text-gray-400 mb-1">Pode ainda faltar</p>
                <p
                  class="font-bold"
                  :class="
                    projecao.faltasRestantes > 0
                      ? 'text-green-600'
                      : 'text-red-500'
                  "
                >
                  {{ projecao.faltasRestantes }}
                </p>
              </div>
            </div>

            <button
              v-if="aulasSimuladasFalta.size > 0"
              @click="aulasSimuladasFalta = new Set()"
              class="text-xs text-gray-400 hover:text-gray-600 transition underline"
            >
              Resetar simulação
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal justificativa -->
    <Transition name="fade">
      <div
        v-if="modalAberto"
        class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      >
        <div class="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md">
          <h3 class="text-lg font-semibold text-gray-800 mb-1">
            📝 Justificar Falta
          </h3>
          <p class="text-sm text-gray-400 mb-4">
            Aula de
            {{
              aulaSelecionada ? formatarDataCompleta(aulaSelecionada.data) : ""
            }}
          </p>

          <div
            v-if="
              justificativaExistente?.status === 'REJEITADA' &&
              justificativaExistente?.resposta
            "
            class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4"
          >
            <p class="text-xs font-semibold text-red-600 mb-1">
              Motivo da rejeição:
            </p>
            <p class="text-sm text-red-700">
              {{ justificativaExistente.resposta }}
            </p>
          </div>

          <textarea
            v-model="textoJustificativa"
            rows="4"
            placeholder="Descreva o motivo da sua falta..."
            class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
          ></textarea>
          <p class="text-xs text-gray-400 mt-1 text-right">
            {{ textoJustificativa.length }}/500
          </p>

          <div class="flex gap-3 mt-4">
            <button
              @click="fecharModal"
              class="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              @click="enviarJustificativa"
              :disabled="enviando || !textoJustificativa.trim()"
              class="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              <div
                v-if="enviando"
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></div>
              {{ enviando ? "Enviando..." : "Enviar" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { supabase } from "~/utils/supabase";
import { calcularFrequenciaSync } from "~/composables/usePresenca";

definePageMeta({ middleware: "auth" });

const { user } = useAuth();
const { $toast } = useNuxtApp();
const { metaFrequencia, carregarConfig } = useConfigSistema();

// ── Tabs ─────────────────────────────────────────────────────────
const tabs = [
  { id: "historico", label: "📋 Histórico de aulas" },
  { id: "projecao", label: "🔮 Projeção" },
];
const tabAtiva = ref("historico");

// ── Estado ───────────────────────────────────────────────────────
const loading = ref(true);
const turma = ref(null);
const aulas = ref([]);
const presencasAluno = ref(new Set());
const justificativas = ref([]);

// Modal
const modalAberto = ref(false);
const aulaSelecionada = ref(null);
const textoJustificativa = ref("");
const enviando = ref(false);

// Projeção
const aulasSimuladasFalta = ref(new Set());

onMounted(async () => {
  const alunoId = user.value?.id;
  if (!alunoId) {
    loading.value = false;
    return;
  }

  const { data: vinculo } = await supabase
    .from("turma_aluno")
    .select("turma_id, turma(id, nome, meta_frequencia)")
    .eq("aluno_id", alunoId)
    .single();

  if (!vinculo) {
    loading.value = false;
    return;
  }
  turma.value = vinculo.turma;

  const { data: aulasData } = await supabase
    .from("aula")
    .select("id, data, status")
    .eq("turma_id", turma.value.id)
    .order("data", { ascending: true });

  aulas.value = aulasData || [];

  const [{ data: presencasData }, { data: justificativasData }] =
    await Promise.all([
      supabase.from("presenca").select("aula_id").eq("aluno_id", alunoId),
      supabase
        .from("justificativa_falta")
        .select("aula_id, status, resposta, texto")
        .eq("aluno_id", alunoId),
    ]);

  presencasAluno.value = new Set((presencasData || []).map((p) => p.aula_id));
  justificativas.value = justificativasData || [];
  loading.value = false;
});

// ── Computeds ────────────────────────────────────────────────────

const aulasRealizadas = computed(() =>
  aulas.value.filter((a) => a.status === "REALIZADA"),
);

const proximasAulas = computed(() => {
  const hoje = new Date().toISOString().split("T")[0];
  return aulas.value.filter((a) => a.status === "AGENDADA" && a.data >= hoje);
});

const freq = computed(() => {
  const aulasIds = aulasRealizadas.value.map((a) => a.id);
  const alunoId = user.value?.id ?? "";
  const presencasArr = [...presencasAluno.value].map((aula_id) => ({
    aluno_id: alunoId,
    aula_id,
  }));
  const justAceitas = justificativas.value
    .filter((j) => j.status === "ACEITA")
    .map((j) => ({ aluno_id: alunoId, aula_id: j.aula_id }));
  return calcularFrequenciaSync(alunoId, aulasIds, presencasArr, justAceitas);
});

const totalFaltas = computed(
  () =>
    aulasRealizadas.value.filter(
      (a) =>
        !presencasAluno.value.has(a.id) &&
        justificativaStatus(a.id) !== "ACEITA",
    ).length,
);

const statusMeta = computed(() => {
  const meta = metaFrequencia.value ?? 70;
  const total = aulasRealizadas.value.length;
  const frequencia = freq.value.frequencia;

  if (total === 0)
    return {
      classe: "bg-green-50 text-green-700",
      mensagem: "Nenhuma aula realizada ainda. 🎉",
    };

  if (frequencia >= meta) {
    const maxFaltas = Math.floor(total * (1 - meta / 100));
    const faltasRestantes = maxFaltas - totalFaltas.value;
    if (faltasRestantes <= 0)
      return {
        classe: "bg-yellow-50 text-yellow-700",
        mensagem:
          "Você atingiu a meta, mas não pode mais faltar para mantê-la. ⚠️",
      };
    return {
      classe: "bg-green-50 text-green-700",
      mensagem: `Você está acima da meta! Pode faltar até mais ${faltasRestantes} aula(s) e ainda manter os ${meta}%. 🎉`,
    };
  }

  const presencasNecessarias =
    Math.ceil((meta / 100) * total) - freq.value.totalValidas;
  return {
    classe: "bg-red-50 text-red-700",
    mensagem: `Frequência abaixo da meta de ${meta}%. Você precisaria ter comparecido em mais ${presencasNecessarias} aula(s) das já realizadas.`,
  };
});

const corBorda = computed(() => {
  if (statusMeta.value.classe.includes("green")) return "border-green-200";
  if (statusMeta.value.classe.includes("yellow")) return "border-yellow-200";
  return "border-red-200";
});

// ── Projeção ─────────────────────────────────────────────────────

function toggleAulaSimulada(aulaId) {
  const s = new Set(aulasSimuladasFalta.value);
  s.has(aulaId) ? s.delete(aulaId) : s.add(aulaId);
  aulasSimuladasFalta.value = s;
}

const projecao = computed(() => {
  const meta = metaFrequencia.value ?? 70;
  const faltasSimuladas = aulasSimuladasFalta.value.size;
  const presencasFuturas = proximasAulas.value.length - faltasSimuladas;
  const totalAulasComFuturas =
    aulasRealizadas.value.length + proximasAulas.value.length;
  const totalValidas = freq.value.totalValidas + presencasFuturas;

  if (totalAulasComFuturas === 0)
    return { frequencia: 0, mensagem: "", faltasRestantes: 0 };

  const frequenciaProjetada = Math.round(
    (totalValidas / totalAulasComFuturas) * 100,
  );
  const maxFaltasPermitidas = Math.floor(
    totalAulasComFuturas * (1 - meta / 100),
  );
  const faltasJaTidas = totalAulasComFuturas - totalValidas;
  const faltasRestantes = Math.max(0, maxFaltasPermitidas - faltasJaTidas);

  let mensagem;
  if (frequenciaProjetada >= meta) {
    mensagem =
      faltasRestantes === 0
        ? `Acima da meta. Não pode mais faltar.`
        : `Acima da meta. Pode faltar mais ${faltasRestantes} aula(s) e manter os ${meta}%.`;
  } else {
    const presencasNecessarias =
      Math.ceil((meta / 100) * totalAulasComFuturas) - totalValidas;
    mensagem =
      presencasNecessarias <= 0
        ? `Frequência abaixo da meta de ${meta}% mesmo comparecendo a todas as aulas restantes.`
        : `Abaixo da meta de ${meta}%. Precisa comparecer em pelo menos ${presencasNecessarias} das aulas restantes.`;
  }

  return {
    frequencia: Math.max(0, frequenciaProjetada),
    mensagem,
    faltasRestantes,
  };
});

// ── Justificativas ───────────────────────────────────────────────

function justificativaStatus(aulaId) {
  return justificativas.value.find((j) => j.aula_id === aulaId)?.status ?? null;
}

const justificativaExistente = computed(
  () =>
    justificativas.value.find((j) => j.aula_id === aulaSelecionada.value?.id) ??
    null,
);

function abrirJustificativa(aula) {
  aulaSelecionada.value = aula;
  const existente = justificativas.value.find((j) => j.aula_id === aula.id);
  textoJustificativa.value =
    existente?.status === "REJEITADA" ? existente.texto : "";
  modalAberto.value = true;
}

function fecharModal() {
  modalAberto.value = false;
  aulaSelecionada.value = null;
  textoJustificativa.value = "";
}

async function enviarJustificativa() {
  if (!textoJustificativa.value.trim()) return;
  enviando.value = true;

  const alunoId = user.value?.id;
  const aulaId = aulaSelecionada.value.id;
  const existente = justificativaExistente.value;

  try {
    if (existente) {
      const { error } = await supabase
        .from("justificativa_falta")
        .update({
          texto: textoJustificativa.value.trim(),
          status: "PENDENTE",
          resposta: null,
          dt_resposta: null,
        })
        .eq("aluno_id", alunoId)
        .eq("aula_id", aulaId);
      if (error) throw error;
      justificativas.value = justificativas.value.map((j) =>
        j.aula_id === aulaId
          ? {
              ...j,
              texto: textoJustificativa.value.trim(),
              status: "PENDENTE",
              resposta: null,
            }
          : j,
      );
    } else {
      const { error } = await supabase.from("justificativa_falta").insert({
        aluno_id: alunoId,
        aula_id: aulaId,
        texto: textoJustificativa.value.trim(),
      });
      if (error) throw error;
      justificativas.value.push({
        aula_id: aulaId,
        status: "PENDENTE",
        resposta: null,
        texto: textoJustificativa.value.trim(),
      });
    }

    $toast.success("Justificativa enviada!");
    fecharModal();
  } catch (err) {
    console.error(err);
    $toast.error("Erro ao enviar justificativa.");
  } finally {
    enviando.value = false;
  }
}

// ── Formatação ───────────────────────────────────────────────────

function formatarDataCurta(dataStr) {
  const d = new Date(dataStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatarDataCompleta(dataStr) {
  const d = new Date(dataStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
