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
          Atividades — {{ turma?.nome }}
        </h1>
        <p class="text-gray-500 mt-2">Gerencie as atividades desta turma.</p>
        <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
      </div>
      <button
        @click="abrirCriacao"
        class="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl transition active:scale-95 flex items-center gap-2 mt-8"
      >
        + Nova Atividade
      </button>
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
      style="grid-template-columns: 280px 1fr; align-items: start"
    >
      <!-- Lista de atividades -->
      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div class="px-3.5 py-2.5 border-b border-gray-100">
          <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Atividades ({{ atividades.length }})
          </p>
        </div>
        <div
          v-if="atividades.length === 0"
          class="px-4 py-8 text-center space-y-1"
        >
          <p class="text-2xl">📋</p>
          <p class="text-xs text-gray-400">Nenhuma atividade cadastrada.</p>
          <p class="text-xs text-gray-400">
            Clique em <strong>+ Nova Atividade</strong> para começar.
          </p>
        </div>
        <button
          v-for="atividade in atividades"
          :key="atividade.id"
          @click="escolherAtividade(atividade)"
          class="w-full flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 last:border-0 text-left gap-2 transition"
          :class="
            atividadeSelecionada?.id === atividade.id
              ? 'bg-green-50'
              : 'hover:bg-gray-50 cursor-pointer'
          "
        >
          <div class="min-w-0">
            <p class="text-xs font-medium text-gray-800 truncate">
              {{ atividade.titulo }}
            </p>
            <p class="text-xs text-gray-400 mt-0.5">
              {{
                atividade.tipo === "NOTA" ? "📝 Com nota" : "✅ Participação"
              }}
            </p>
          </div>
          <span
            class="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
            :class="badgeStatus(atividade.status)"
          >
            {{ labelStatus(atividade.status) }}
          </span>
        </button>
      </div>

      <!-- Painel da atividade selecionada -->
      <div
        v-if="atividadeSelecionada"
        class="bg-white border border-gray-200 rounded-2xl overflow-hidden"
      >
        <!-- Cabeçalho -->
        <div
          class="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100"
        >
          <div class="flex items-center gap-2 min-w-0">
            <h2 class="text-sm font-semibold text-gray-800 truncate">
              {{ atividadeSelecionada.titulo }}
            </h2>
          </div>

          <div class="flex items-center gap-2 shrink-0 ml-2">
            <button
              @click="abrirEdicao(atividadeSelecionada)"
              class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
            >
              ✏️ Editar Configurações da Atividade
            </button>

            <Transition name="fade">
              <div v-if="temAlteracoes" class="flex items-center gap-2">
                <span
                  class="text-xs text-amber-600 font-medium whitespace-nowrap hidden sm:inline"
                >
                  ← salve para confirmar
                </span>
                <button
                  @click="salvarRegistros"
                  :disabled="salvando"
                  class="text-xs font-bold px-4 py-1.5 rounded-lg transition active:scale-95 flex items-center gap-1.5 ring-2 ring-offset-1"
                  :class="
                    salvando
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed ring-transparent'
                      : 'bg-green-600 text-white hover:bg-green-700 ring-green-400 animate-pulse'
                  "
                >
                  <div
                    v-if="salvando"
                    class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"
                  ></div>
                  {{ salvando ? "Salvando..." : "💾 Salvar" }}
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Info da atividade -->
        <div
          v-if="atividadeSelecionada.descricao"
          class="px-3.5 py-2.5 border-b border-gray-100 bg-gray-50"
        >
          <p class="text-sm text-gray-500 whitespace-pre-line">
            {{ atividadeSelecionada.descricao }}
          </p>
        </div>

        <!-- Dica de uso -->
        <div
          class="px-3.5 py-2 border-b border-gray-100 bg-amber-50 flex items-center gap-2"
        >
          <span class="text-amber-500 text-xs">💡</span>
          <p class="text-sm text-amber-700">
            <template v-if="atividadeSelecionada.tipo === 'NOTA'">
              Digite a nota (0–10) de cada estudante e clique em 💬 para
              adicionar feedback individual. Salve ao final.
            </template>
            <template v-else>
              Marque os estudantes que realizaram a atividade. Clique em 💬 para
              adicionar feedback individual. Salve ao final.
            </template>
          </p>
        </div>

        <!-- Ações rápidas -->
        <div
          class="flex gap-2 px-3.5 py-2.5 border-b border-gray-100 flex-wrap items-center"
        >
          <template v-if="atividadeSelecionada.tipo === 'PARTICIPACAO'">
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
          </template>
          <div class="flex-1"></div>
          <span class="text-xs text-gray-400">{{ resumoParticipacao }}</span>
        </div>

        <!-- Lista de alunos -->
        <div
          v-if="loadingAlunos"
          class="flex items-center gap-3 text-green-700 px-4 py-6"
        >
          <div
            class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"
          ></div>
          <span class="text-sm">Carregando alunos...</span>
        </div>

        <!-- Tabela compacta -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th
                  class="text-left px-4 py-2 text-xs font-medium text-gray-400 w-full"
                >
                  Estudante
                </th>
                <th
                  class="text-center px-3 py-2 text-xs font-medium text-gray-400 whitespace-nowrap"
                >
                  {{ atividadeSelecionada.tipo === "NOTA" ? "Nota" : "Feito" }}
                </th>
                <th
                  class="text-center px-3 py-2 text-xs font-medium text-gray-400"
                >
                  Feedback
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="registro in registros"
                :key="registro.aluno_id"
                class="hover:bg-gray-50 transition"
              >
                <!-- Nome -->
                <td class="px-4 py-2.5">
                  <span
                    class="text-sm font-medium"
                    :class="nomeClass(registro)"
                  >
                    {{ registro.nome }}
                  </span>
                </td>

                <!-- PARTICIPAÇÃO: checkbox -->
                <td
                  class="px-3 py-2.5 text-center"
                  v-if="atividadeSelecionada.tipo === 'PARTICIPACAO'"
                >
                  <div
                    @click="toggleFeito(registro)"
                    class="w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-all cursor-pointer mx-auto"
                    :class="
                      registro.feito
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-gray-400'
                    "
                  >
                    <svg
                      v-if="registro.feito"
                      class="w-3 h-3 text-white"
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
                </td>

                <!-- NOTA: input com máscara -->
                <td class="px-3 py-2.5 text-center" v-else>
                  <input
                    :value="notaDisplay(registro)"
                    @keydown="onNotaKeydown($event, registro)"
                    @focus="onNotaFocus(registro)"
                    inputmode="numeric"
                    placeholder="–"
                    readonly
                    class="w-16 text-center text-sm font-bold rounded-lg px-2 py-1.5 border-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-400 transition-all cursor-pointer select-none"
                    :class="notaInputClass(registro._digitos)"
                  />
                </td>

                <!-- Feedback -->
                <td class="px-3 py-2.5 text-center">
                  <button
                    @click="abrirFeedback(registro)"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition"
                    :class="
                      registro.feedback
                        ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                        : 'bg-white border-green-200 text-green-600 hover:bg-green-50'
                    "
                  >
                    💬
                    <span v-if="registro.feedback" class="hidden sm:inline"
                      >Editar</span
                    >
                    <span v-else class="hidden sm:inline">Adicionar</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Estado vazio -->
      <div
        v-else
        class="bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center py-16 text-center px-6 space-y-3"
      >
        <p class="text-3xl">📝</p>
        <p class="text-sm font-medium text-gray-600">Selecione uma atividade</p>
        <p class="text-xs text-gray-400 max-w-xs leading-relaxed">
          Clique em uma atividade à esquerda para ver e editar os registros dos
          estudantes — notas, participação e feedbacks individuais.
        </p>
        <p class="text-xs text-gray-400">
          Não tem nenhuma ainda? Clique em
          <strong class="text-green-600">+ Nova Atividade</strong> para criar.
        </p>
      </div>
    </div>

    <!-- ── MODAL FEEDBACK ── -->
    <Transition name="fade">
      <div
        v-if="modalFeedback"
        class="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-4"
      >
        <div
          class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
        >
          <!-- Header -->
          <div
            class="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100"
          >
            <div>
              <h3 class="text-base font-semibold text-gray-800">
                💬 Feedback do estudante
              </h3>
              <p class="text-sm text-gray-400 mt-0.5">
                {{ registroFeedback?.nome }}
              </p>
            </div>
            <button
              @click="modalFeedback = false"
              class="text-gray-400 hover:text-gray-600 text-2xl leading-none mt-0.5"
            >
              ×
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5">
            <textarea
              v-model="textoFeedback"
              rows="7"
              placeholder="Escreva um feedback para este estudante..."
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none text-gray-700 leading-relaxed"
            />
            <p class="text-xs text-gray-400 mt-2">
              {{ textoFeedback.length }} caracteres
            </p>
          </div>

          <!-- Footer -->
          <div class="px-6 pb-5 flex gap-3">
            <button
              v-if="registroFeedback?.feedback"
              @click="excluirFeedback"
              class="px-4 py-2.5 rounded-xl border border-red-200 text-sm font-semibold text-red-500 hover:bg-red-50 transition"
            >
              🗑 Excluir
            </button>
            <div class="flex-1"></div>
            <button
              @click="modalFeedback = false"
              class="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              @click="salvarFeedback"
              class="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition"
            >
              Salvar feedback
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── OVERLAY DRAWER ── -->
    <Transition name="fade">
      <div
        v-if="painelAberto"
        class="fixed inset-0 bg-black/40 z-[60]"
        @click="fecharPainel"
      ></div>
    </Transition>

    <!-- ── DRAWER CRIAR/EDITAR ── -->
    <Transition name="slide">
      <div
        v-if="painelAberto"
        class="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
      >
        <div class="flex items-center justify-between p-6 border-b">
          <h2 class="text-lg font-semibold text-gray-800">
            {{ modo === "criar" ? "➕ Nova Atividade" : "✏️ Editar Atividade" }}
          </h2>
          <button
            @click="fecharPainel"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition text-xl"
          >
            ×
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-5">
          <!-- Título -->
          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block"
              >Título</label
            >
            <input
              v-model="form.titulo"
              type="text"
              placeholder="Ex: Lista 1, Trabalho em grupo..."
              class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>

          <!-- Tipo -->
          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block"
              >Tipo</label
            >
            <div class="grid grid-cols-2 gap-3">
              <button
                @click="form.tipo = 'NOTA'"
                class="py-3 rounded-xl border-2 text-sm font-semibold transition"
                :class="
                  form.tipo === 'NOTA'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                "
              >
                📝 Com nota
              </button>
              <button
                @click="form.tipo = 'PARTICIPACAO'"
                class="py-3 rounded-xl border-2 text-sm font-semibold transition"
                :class="
                  form.tipo === 'PARTICIPACAO'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                "
              >
                ✅ Apenas Participação
              </button>
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block"
              >Status</label
            >
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="s in statusOpcoes"
                :key="s.value"
                @click="form.status = s.value"
                class="py-2.5 rounded-xl border-2 text-xs font-semibold transition"
                :class="
                  form.status === s.value
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                "
              >
                {{ s.label }}
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-2 leading-relaxed">
              <strong>Rascunho:</strong> invisível aos estudantes.
              <strong>Publicada:</strong> estudantes podem ver.
              <strong>Encerrada:</strong> bloqueada para edições.
            </p>
          </div>

          <!-- Informações adicionais -->
          <div>
            <label class="text-sm font-medium text-gray-700 mb-2 block">
              Informações adicionais
              <span class="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              v-model="form.descricao"
              rows="4"
              placeholder="Instruções, links de conteúdo, observações..."
              class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
            />
          </div>
        </div>

        <div class="p-6 border-t">
          <button
            @click="salvar"
            :disabled="salvandoForm || !form.titulo.trim()"
            class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
          >
            <div
              v-if="salvandoForm"
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></div>
            {{
              salvandoForm
                ? "Salvando..."
                : modo === "criar"
                  ? "✅ Criar Atividade"
                  : "💾 Salvar Alterações"
            }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { supabase } from "~/utils/supabase";

definePageMeta({ middleware: "professor" });

const { $toast } = useNuxtApp();
const route = useRoute();
const router = useRouter();
const turmaId = Number(route.params.id);

const turma = ref(null);
const atividades = ref([]);
const atividadeSelecionada = ref(null);
const registros = ref([]);
const registrosSnapshot = ref(""); // JSON dos registros ao carregar/salvar
const loading = ref(true);
const loadingAlunos = ref(false);
const salvando = ref(false);
const salvandoForm = ref(false);
const painelAberto = ref(false);
const modo = ref("criar");
const modalFeedback = ref(false);
const registroFeedback = ref(null);
const textoFeedback = ref("");

const statusOpcoes = [
  { value: "RASCUNHO", label: "📋 Rascunho" },
  { value: "PUBLICADA", label: "📢 Publicada" },
  { value: "ENCERRADA", label: "🔒 Encerrada" },
];

const form = reactive({
  titulo: "",
  tipo: "NOTA",
  status: "RASCUNHO",
  descricao: "",
});

// ── Detecção de alterações não salvas ──────────────────────────────────────
const snapshotKey = (r) =>
  JSON.stringify({
    id: r.aluno_id,
    nota: r._digitos ?? null,
    feito: r.feito,
    feedback: r.feedback,
  });

const temAlteracoes = computed(() => {
  if (!atividadeSelecionada.value || registros.value.length === 0) return false;
  return (
    JSON.stringify(registros.value.map(snapshotKey)) !== registrosSnapshot.value
  );
});

function tirarSnapshot() {
  registrosSnapshot.value = JSON.stringify(registros.value.map(snapshotKey));
}

// ── Máscara de nota (estilo caixa registradora) ────────────────────────────
// _digitos: string de até 4 dígitos, ex "975" → 9,75 | "1000" → 10,00
function notaDisplay(registro) {
  const d = registro._digitos ?? "";
  if (!d) return "";
  if (d === "1000") return "10,00";
  const padded = d.padStart(3, "0");
  const inteiro = padded.slice(0, -2).replace(/^0+/, "") || "0";
  const decimal = padded.slice(-2);
  return `${inteiro},${decimal}`;
}

function digitsToNota(d) {
  if (!d) return null;
  if (d === "1000") return 10.0;
  const padded = d.padStart(3, "0");
  return parseFloat(`${padded.slice(0, -2)}.${padded.slice(-2)}`);
}

function onNotaKeydown(e, registro) {
  const d = registro._digitos ?? "";

  if (e.key >= "0" && e.key <= "9") {
    e.preventDefault();
    const novo = (d + e.key).replace(/^0+/, "") || "0";
    // Limita: máximo 4 dígitos e valor ≤ 1000 (representa 10,00)
    if (novo.length > 4) return;
    const valorNum = digitsToNota(novo);
    if (valorNum !== null && valorNum > 10) return;
    registro._digitos = novo === "0" ? "" : novo;
    registro.nota = digitsToNota(registro._digitos);
  } else if (e.key === "Backspace") {
    e.preventDefault();
    registro._digitos = d.slice(0, -1);
    registro.nota = digitsToNota(registro._digitos);
  } else if (e.key === "Delete" || e.key === "Escape") {
    e.preventDefault();
    registro._digitos = "";
    registro.nota = null;
  }
}

function onNotaFocus(registro) {
  // Garante que _digitos está sincronizado se nota foi carregada do banco
  if (registro._digitos === undefined && registro.nota !== null) {
    const s = Number(registro.nota).toFixed(2).replace(".", "");
    registro._digitos = s.replace(/^0+/, "") || "";
  }
}

// ── Classes visuais ────────────────────────────────────────────────────────
function notaInputClass(digitos) {
  if (!digitos) return "border-gray-200 text-gray-400 bg-white";
  const n = digitsToNota(digitos);
  if (n >= 7) return "border-green-400 text-green-700 bg-green-50";
  if (n >= 5) return "border-yellow-400 text-yellow-700 bg-yellow-50";
  return "border-red-400 text-red-600 bg-red-50";
}

function nomeClass(registro) {
  if (atividadeSelecionada.value?.tipo === "PARTICIPACAO") {
    return registro.feito ? "text-green-800" : "text-gray-700";
  }
  return registro.nota !== null ? "text-gray-800" : "text-gray-700";
}

const resumoParticipacao = computed(() => {
  if (!atividadeSelecionada.value) return "";
  if (atividadeSelecionada.value.tipo === "PARTICIPACAO") {
    const feitos = registros.value.filter((r) => r.feito).length;
    return `${feitos}/${registros.value.length} realizaram`;
  }
  const comNota = registros.value.filter((r) => r.nota !== null).length;
  return `${comNota}/${registros.value.length} com nota`;
});

function badgeStatus(status) {
  return (
    {
      RASCUNHO: "bg-gray-100 text-gray-500",
      PUBLICADA: "bg-blue-100 text-blue-700",
      ENCERRADA: "bg-red-100 text-red-500",
    }[status] ?? "bg-gray-100 text-gray-500"
  );
}

function labelStatus(status) {
  return (
    { RASCUNHO: "rascunho", PUBLICADA: "publicada", ENCERRADA: "encerrada" }[
      status
    ] ?? status.toLowerCase()
  );
}

// ── Dados ──────────────────────────────────────────────────────────────────
async function carregarTurma() {
  const { data } = await supabase
    .from("turma")
    .select("*")
    .eq("id", turmaId)
    .single();
  turma.value = data;
}

async function carregarAtividades() {
  const { data, error } = await supabase
    .from("atividade")
    .select("*")
    .eq("turma_id", turmaId)
    .order("criado_em", { ascending: false });
  if (error) $toast.error("Erro ao carregar atividades.");
  else atividades.value = data || [];
}

async function escolherAtividade(atividade) {
  atividadeSelecionada.value = atividade;
  loadingAlunos.value = true;
  registros.value = [];
  registrosSnapshot.value = "";

  const { data: alunosTurma } = await supabase
    .from("turma_aluno")
    .select("aluno_id, usuarios!inner(id, nome)")
    .eq("turma_id", turmaId);

  const { data: registrosExistentes } = await supabase
    .from("atividade_aluno")
    .select("*")
    .eq("atividade_id", atividade.id);

  const mapaRegistros = Object.fromEntries(
    (registrosExistentes || []).map((r) => [r.aluno_id, r]),
  );

  registros.value = (alunosTurma || [])
    .map((v) => {
      const reg = mapaRegistros[v.aluno_id];
      const notaVal = reg?.nota ?? null;
      // Pré-computar _digitos a partir do valor do banco
      let digitos = "";
      if (notaVal !== null) {
        digitos =
          Number(notaVal).toFixed(2).replace(".", "").replace(/^0+/, "") || "";
      }
      return {
        aluno_id: v.aluno_id,
        nome: v.usuarios?.nome ?? "",
        nota: notaVal,
        _digitos: digitos,
        feito: reg?.feito ?? false,
        feedback: reg?.feedback ?? "",
        _id: reg?.id ?? null,
      };
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  loadingAlunos.value = false;
  tirarSnapshot();
}

function marcarTodos() {
  registros.value = registros.value.map((r) => ({ ...r, feito: true }));
}

function desmarcarTodos() {
  registros.value = registros.value.map((r) => ({ ...r, feito: false }));
}

function toggleFeito(registro) {
  registro.feito = !registro.feito;
}

function abrirFeedback(registro) {
  registroFeedback.value = registro;
  textoFeedback.value = registro.feedback ?? "";
  modalFeedback.value = true;
}

function salvarFeedback() {
  if (registroFeedback.value) {
    registroFeedback.value.feedback = textoFeedback.value;
  }
  modalFeedback.value = false;
}

function excluirFeedback() {
  if (registroFeedback.value) {
    registroFeedback.value.feedback = "";
    textoFeedback.value = "";
  }
  modalFeedback.value = false;
}

async function salvarRegistros() {
  salvando.value = true;
  try {
    const upserts = toRaw(registros.value).map((r) => {
      const raw = toRaw(r); // garante objeto plain JS, não Proxy
      return {
        ...(raw._id ? { id: raw._id } : {}),
        atividade_id: atividadeSelecionada.value.id,
        aluno_id: raw.aluno_id,
        nota:
          atividadeSelecionada.value.tipo === "NOTA"
            ? (raw.nota ?? null)
            : null,
        feito:
          atividadeSelecionada.value.tipo === "PARTICIPACAO"
            ? raw.feito
            : false,
        feedback: raw.feedback || null,
      };
    });

    console.log("upserts:", JSON.stringify(upserts)); // confirma no console antes de remover

    const { error } = await supabase
      .from("atividade_aluno")
      .upsert(upserts, { onConflict: "atividade_id,aluno_id" });

    if (error) throw error;
    $toast.success("Registros salvos com sucesso!");

    await escolherAtividade(atividadeSelecionada.value, { forcar: true });
  } catch (err) {
    console.error(err);
    $toast.error("Erro ao salvar registros.");
  } finally {
    salvando.value = false;
  }
}

// ── Drawer criar/editar ────────────────────────────────────────────────────
function abrirCriacao() {
  modo.value = "criar";
  form.titulo = "";
  form.tipo = "NOTA";
  form.status = "RASCUNHO";
  form.descricao = "";
  painelAberto.value = true;
}

function abrirEdicao(atividade) {
  modo.value = "editar";
  form.titulo = atividade.titulo;
  form.tipo = atividade.tipo;
  form.status = atividade.status;
  form.descricao = atividade.descricao ?? "";
  painelAberto.value = true;
}

function fecharPainel() {
  painelAberto.value = false;
}

async function salvar() {
  if (!form.titulo.trim()) return;
  salvandoForm.value = true;
  try {
    if (modo.value === "criar") {
      const { data, error } = await supabase
        .from("atividade")
        .insert([
          {
            turma_id: turmaId,
            titulo: form.titulo.trim(),
            tipo: form.tipo,
            status: form.status,
            descricao: form.descricao.trim() || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const { data: alunosTurma } = await supabase
        .from("turma_aluno")
        .select("aluno_id")
        .eq("turma_id", turmaId);

      if (alunosTurma && alunosTurma.length > 0) {
        const { error: e } = await supabase.from("atividade_aluno").insert(
          alunosTurma.map((a) => ({
            atividade_id: data.id,
            aluno_id: a.aluno_id,
            feito: false,
            nota: null,
          })),
        );
        if (e) throw e;
      }

      $toast.success("Atividade criada!");
    } else {
      const { error } = await supabase
        .from("atividade")
        .update({
          titulo: form.titulo.trim(),
          tipo: form.tipo,
          status: form.status,
          descricao: form.descricao.trim() || null,
        })
        .eq("id", atividadeSelecionada.value.id);

      if (error) throw error;
      $toast.success("Atividade atualizada!");
    }

    fecharPainel();
    await carregarAtividades();

    if (modo.value === "editar" && atividadeSelecionada.value) {
      const atualizada = atividades.value.find(
        (a) => a.id === atividadeSelecionada.value.id,
      );
      if (atualizada) {
        // Recarregar sem pedir confirmação (já salvamos)
        await escolherAtividade(atualizada, { forcar: true });
      }
    }
  } catch (err) {
    console.error(err);
    $toast.error("Erro ao salvar atividade.");
  } finally {
    salvandoForm.value = false;
  }
}

onMounted(async () => {
  await Promise.all([carregarTurma(), carregarAtividades()]);
  loading.value = false;
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* Remove setas do input number */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
