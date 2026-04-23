<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <!-- Cabeçalho -->
    <div class="mb-10 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold text-green-700">Acessos</h1>
        <p class="text-gray-500 mt-2">
          Histórico de logins e atividade dos usuários.
        </p>
        <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
      </div>
    </div>

    <!-- Cards de resumo -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p
          class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1"
        >
          Total de usuários
        </p>
        <p class="text-3xl font-bold text-gray-800">{{ stats.total }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p
          class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1"
        >
          Total de logins
        </p>
        <p class="text-3xl font-bold text-green-700">
          {{ stats.logins.toLocaleString("pt-BR") }}
        </p>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p
          class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1"
        >
          Alunos cadastrados
        </p>
        <p class="text-3xl font-bold text-blue-600">{{ stats.alunos }}</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <p
          class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1"
        >
          Professores cadastrados
        </p>
        <p class="text-3xl font-bold text-purple-600">
          {{ stats.professores }}
        </p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex gap-3 mb-6 flex-wrap items-center">
      <input
        v-model="filtro"
        type="text"
        placeholder="Buscar por nome ou e-mail..."
        class="flex-1 min-w-48 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
      />
      <select
        v-model="filtroTipo"
        class="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
      >
        <option value="">Todos os perfis</option>
        <option value="ADMIN">Admin</option>
        <option value="PROFESSOR">Professor</option>
        <option value="ALUNO">Aluno</option>
      </select>
      <select
        v-model="filtroAtivo"
        class="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
      >
        <option value="">Todos os status</option>
        <option value="true">Ativos</option>
        <option value="false">Inativos</option>
      </select>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-500 whitespace-nowrap"
          >Último acesso de</label
        >
        <input
          v-model="filtroDataDe"
          type="date"
          class="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        />
        <span class="text-sm text-gray-400">até</span>
        <input
          v-model="filtroDataAte"
          type="date"
          class="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        />
      </div>
      <button
        v-if="
          filtro || filtroTipo || filtroAtivo || filtroDataDe || filtroDataAte
        "
        @click="limparFiltros"
        class="text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition"
      >
        Limpar filtros
      </button>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex items-center gap-3 text-green-700 py-10 justify-center"
    >
      <div
        class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"
      ></div>
      <span>Carregando dados...</span>
    </div>

    <!-- Tabela -->
    <div
      v-else
      class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
    >
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100">
            <th
              v-for="col in colunas"
              :key="col.key"
              class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 transition select-none whitespace-nowrap"
              :class="col.align === 'center' ? 'text-center' : 'text-left'"
              @click="setOrdem(col.key)"
            >
              {{ col.label }}
              <span v-if="ordemCol === col.key" class="ml-1">
                {{ ordemDir === "asc" ? "↑" : "↓" }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="registrosFiltrados.length === 0">
            <td colspan="8" class="text-center py-10 text-sm text-gray-400">
              Nenhum usuário encontrado.
            </td>
          </tr>
          <tr
            v-for="u in registrosFiltrados"
            :key="u.id"
            class="hover:bg-gray-50 transition"
          >
            <td class="px-6 py-4 font-medium text-gray-800">{{ u.nome }}</td>
            <td class="px-6 py-4 text-gray-500">{{ u.email }}</td>
            <td class="px-6 py-4 text-center">
              <div class="flex flex-wrap gap-1 justify-center">
                <template v-if="u.papeis && u.papeis.length">
                  <span
                    v-for="papel in u.papeis"
                    :key="papel"
                    class="text-xs font-semibold px-2.5 py-1 rounded-full"
                    :class="{
                      'bg-purple-100 text-purple-700': papel === 'ADMIN',
                      'bg-blue-100 text-blue-700': papel === 'PROFESSOR',
                      'bg-green-100 text-green-700': papel === 'ALUNO',
                    }"
                  >
                    {{ papel }}
                  </span>
                </template>
                <span v-else class="text-xs text-gray-400">—</span>
              </div>
            </td>
            <td class="px-6 py-4 text-center">
              <span
                class="text-xs font-semibold px-2.5 py-1 rounded-full"
                :class="
                  u.ativo
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-600'
                "
              >
                {{ u.ativo ? "Ativo" : "Inativo" }}
              </span>
            </td>
            <td class="px-6 py-4 text-center">
              <span
                class="text-sm font-bold"
                :class="{
                  'text-green-600': u.total_logins >= 20,
                  'text-blue-600': u.total_logins >= 5 && u.total_logins < 20,
                  'text-gray-400': u.total_logins < 5,
                }"
              >
                {{ u.total_logins ?? 0 }}
              </span>
            </td>
            <td class="px-6 py-4 text-center text-gray-500">
              {{ fmt(u.primeiro_login) }}
            </td>
            <td class="px-6 py-4 text-center text-gray-500">
              {{ fmt(u.ultimo_login) }}
            </td>
            <td class="px-6 py-4 text-center text-gray-500">
              {{ fmt(u.dt_inclusao) }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Rodapé da tabela -->
      <div
        v-if="registrosFiltrados.length > 0"
        class="px-6 py-3 border-t border-gray-100 text-xs text-gray-400"
      >
        {{ registrosFiltrados.length }} usuário{{
          registrosFiltrados.length !== 1 ? "s" : ""
        }}
        exibido{{ registrosFiltrados.length !== 1 ? "s" : "" }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { supabase } from "~/utils/supabase";

definePageMeta({ middleware: "admin" });

const { $toast } = useNuxtApp();

// ── Estado ────────────────────────────────────────────────────────
const loading = ref(true);
const registros = ref([]);

const filtro = ref("");
const filtroTipo = ref("");
const filtroAtivo = ref("");
const filtroDataDe = ref("");
const filtroDataAte = ref("");

const ordemCol = ref("total_logins");
const ordemDir = ref("desc");

// ── Colunas ───────────────────────────────────────────────────────
const colunas = [
  { key: "nome", label: "Nome", align: "left" },
  { key: "email", label: "E-mail", align: "left" },
  { key: "tipo_usuario", label: "Perfil", align: "center" },
  { key: "ativo", label: "Status", align: "center" },
  { key: "total_logins", label: "Logins", align: "center" },
  { key: "primeiro_login", label: "Primeiro acesso", align: "center" },
  { key: "ultimo_login", label: "Último acesso", align: "center" },
  { key: "dt_inclusao", label: "Cadastrado em", align: "center" },
];

// ── Computed: stats ───────────────────────────────────────────────
const stats = computed(() => ({
  total: registros.value.length,
  logins: registros.value.reduce((s, r) => s + (r.total_logins ?? 0), 0),
  alunos: registros.value.filter((r) => (r.papeis ?? []).includes("ALUNO"))
    .length,
  professores: registros.value.filter((r) =>
    (r.papeis ?? []).includes("PROFESSOR"),
  ).length,
}));

// ── Computed: filtros + ordenação ─────────────────────────────────
const registrosFiltrados = computed(() => {
  let lista = registros.value.filter((u) => {
    const termo = filtro.value.trim().toLowerCase();
    const matchTexto =
      !termo ||
      (u.nome ?? "").toLowerCase().includes(termo) ||
      (u.email ?? "").toLowerCase().includes(termo);

    const matchTipo =
      !filtroTipo.value || (u.papeis ?? []).includes(filtroTipo.value);

    const matchAtivo =
      filtroAtivo.value === "" || String(u.ativo) === filtroAtivo.value;

    const dtUltimo = u.ultimo_login ? u.ultimo_login.slice(0, 10) : null;
    const matchDe =
      !filtroDataDe.value || (dtUltimo && dtUltimo >= filtroDataDe.value);
    const matchAte =
      !filtroDataAte.value || (dtUltimo && dtUltimo <= filtroDataAte.value);

    return matchTexto && matchTipo && matchAtivo && matchDe && matchAte;
  });

  lista = [...lista].sort((a, b) => {
    let va = a[ordemCol.value];
    let vb = b[ordemCol.value];

    // nulos vão pro fim
    if (va == null) return 1;
    if (vb == null) return -1;

    if (typeof va === "number") {
      return ordemDir.value === "asc" ? va - vb : vb - va;
    }

    va = String(va).toLowerCase();
    vb = String(vb).toLowerCase();
    if (va < vb) return ordemDir.value === "asc" ? -1 : 1;
    if (va > vb) return ordemDir.value === "asc" ? 1 : -1;
    return 0;
  });

  return lista;
});

// ── Helpers ───────────────────────────────────────────────────────
function fmt(dtStr) {
  if (!dtStr) return "—";
  return new Date(dtStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function setOrdem(col) {
  if (ordemCol.value === col) {
    ordemDir.value = ordemDir.value === "asc" ? "desc" : "asc";
  } else {
    ordemCol.value = col;
    ordemDir.value = col === "total_logins" ? "desc" : "asc";
  }
}

function limparFiltros() {
  filtro.value = "";
  filtroTipo.value = "";
  filtroAtivo.value = "";
  filtroDataDe.value = "";
  filtroDataAte.value = "";
}

// ── Dados ─────────────────────────────────────────────────────────
async function carregarDados() {
  loading.value = true;
  const { data, error } = await supabase
    .from("vw_usuarios_acessos")
    .select("*");

  if (error) {
    $toast.error("Erro ao carregar dados de acessos.");
    console.error(error);
  } else {
    registros.value = data ?? [];
  }
  loading.value = false;
}

onMounted(carregarDados);
</script>
