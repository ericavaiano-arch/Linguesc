<template>
    <div class="min-h-screen bg-gray-50 p-8">
        <!-- Cabeçalho -->
        <div class="mb-10">
            <h1 class="text-3xl font-bold text-green-700">Cadastro em Lote</h1>
            <p class="text-gray-500 mt-2">Importe um arquivo CSV para cadastrar múltiplos usuários de uma vez.</p>
            <div class="w-20 h-1 bg-green-600 mt-4 rounded"></div>
        </div>

        <!-- Etapa 1: Configuração -->
        <div v-if="etapa === 'config'" class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 max-w-2xl">
            <h2 class="text-base font-semibold text-gray-700 mb-6 flex items-center gap-2">
                <span
                    class="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                Configurar importação
            </h2>

            <!-- Papel -->
            <div class="mb-6">
                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Papel dos
                    usuários</label>
                <div class="flex gap-3 flex-wrap">
                    <label v-for="p in papeis" :key="p.value"
                        class="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition select-none"
                        :class="papelSelecionado === p.value
                            ? 'border-green-600 bg-green-50 text-green-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'">
                        <input type="radio" :value="p.value" v-model="papelSelecionado" class="hidden" />
                        <span>{{ p.icon }}</span>
                        <span class="text-sm font-medium">{{ p.label }}</span>
                    </label>
                </div>
            </div>

            <!-- Upload CSV -->
            <div class="mb-6">
                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Arquivo
                    CSV</label>
                <div class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition" :class="isDragging
                    ? 'border-green-500 bg-green-50'
                    : csvFile
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'" @dragover.prevent="isDragging = true"
                    @dragleave="isDragging = false" @drop.prevent="onDrop" @click="$refs.fileInput.click()">
                    <input ref="fileInput" type="file" accept=".csv" class="hidden" @change="onFileChange" />
                    <div class="text-3xl mb-2">{{ csvFile ? '✅' : '📂' }}</div>
                    <template v-if="!csvFile">
                        <p class="text-sm text-gray-600">Arraste o CSV aqui ou <span
                                class="text-green-600 underline">clique para selecionar</span></p>
                        <p class="text-xs text-gray-400 mt-1">O arquivo deve ter as colunas <code
                                class="bg-gray-100 px-1 rounded">nome</code> e <code
                                class="bg-gray-100 px-1 rounded">email</code></p>
                    </template>
                    <template v-else>
                        <p class="text-sm font-semibold text-gray-700">{{ csvFile.name }}</p>
                        <p class="text-xs text-gray-400 mt-1">{{ linhasValidas.length }} usuários encontrados · Clique
                            para trocar</p>
                    </template>
                </div>
            </div>

            <!-- Erro leitura -->
            <div v-if="erroLeitura"
                class="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {{ erroLeitura }}
            </div>

            <!-- Aviso linhas ignoradas -->
            <div v-if="linhasIgnoradas.length > 0"
                class="mb-4 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
                ⚠️ {{ linhasIgnoradas.length }} linha(s) ignoradas por estarem incompletas ou duplicadas no arquivo.
            </div>

            <!-- Hint formato -->
            <details class="mb-6 text-xs text-gray-400">
                <summary class="cursor-pointer font-medium hover:text-gray-600 transition">Ver formato esperado do CSV
                </summary>
                <pre class="mt-2 bg-gray-100 rounded-xl px-4 py-3 text-gray-600 leading-relaxed">nome,email
        João da Silva,joao@email.com
        Maria Oliveira,maria@email.com</pre>
            </details>

            <div class="flex justify-end">
                <button class="px-5 py-2.5 rounded-xl text-sm font-semibold transition" :class="!csvFile || linhasValidas.length === 0 || !papelSelecionado
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'"
                    :disabled="!csvFile || linhasValidas.length === 0 || !papelSelecionado" @click="etapa = 'preview'">
                    Ver prévia ({{ linhasValidas.length }})
                </button>
            </div>
        </div>

        <!-- Etapa 2: Preview -->
        <div v-else-if="etapa === 'preview'" class="max-w-2xl">
            <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <h2 class="text-base font-semibold text-gray-700 mb-6 flex items-center gap-2">
                    <span
                        class="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                    Confirmar cadastro
                </h2>

                <!-- Chips de resumo -->
                <div class="grid grid-cols-3 gap-3 mb-5">
                    <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Papel</p>
                        <p class="text-2xl font-bold text-gray-800">{{ papelLabel }}</p>
                    </div>
                    <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Usuários</p>
                        <p class="text-2xl font-bold text-green-700">{{ linhasValidas.length }}</p>
                    </div>
                    <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Senha padrão</p>
                        <p class="text-2xl font-bold text-gray-800">senha123</p>
                    </div>
                </div>

                <!-- Tabela preview -->
                <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="bg-gray-50 border-b border-gray-100">
                                <th
                                    class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left w-10">
                                    #</th>
                                <th
                                    class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
                                    Nome
                                </th>
                                <th
                                    class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
                                    Email</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            <tr v-for="(u, i) in linhasValidas" :key="i" class="hover:bg-gray-50 transition">
                                <td class="px-5 py-3 text-gray-400">{{ i + 1 }}</td>
                                <td class="px-5 py-3 font-medium text-gray-800">{{ u.nome }}</td>
                                <td class="px-5 py-3 text-gray-500 font-mono text-xs">{{ u.email }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="flex justify-between">
                    <button
                        class="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                        @click="etapa = 'config'">
                        ← Voltar
                    </button>
                    <button class="px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                        :class="processando ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'"
                        :disabled="processando" @click="cadastrarLote">
                        <span v-if="!processando">Cadastrar {{ linhasValidas.length }} usuários</span>
                        <span v-else class="flex items-center gap-2">
                            <span
                                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Cadastrando...
                        </span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Etapa 3: Resultado -->
        <div v-else-if="etapa === 'resultado'" class="max-w-2xl">
            <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <h2 class="text-base font-semibold text-gray-700 mb-6 flex items-center gap-2">
                    <span
                        class="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                    Resultado do cadastro
                </h2>

                <!-- Cards de resultado -->
                <div class="grid grid-cols-2 gap-3 mb-6 max-w-xs">
                    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Cadastrados</p>
                        <p class="text-3xl font-bold text-green-700">{{ resultadoSucesso }}</p>
                    </div>
                    <div v-if="resultadoErro > 0" class="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Com erro</p>
                        <p class="text-3xl font-bold text-red-500">{{ resultadoErro }}</p>
                    </div>
                </div>

                <!-- Tabela resultado -->
                <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="bg-gray-50 border-b border-gray-100">
                                <th
                                    class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
                                    Nome
                                </th>
                                <th
                                    class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
                                    Email</th>
                                <th
                                    class="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">
                                    Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            <tr v-for="(r, i) in resultados" :key="i" class="hover:bg-gray-50 transition">
                                <td class="px-5 py-4 font-medium text-gray-800">{{ r.nome }}</td>
                                <td class="px-5 py-4 text-gray-500 font-mono text-xs">{{ r.email }}</td>
                                <td class="px-5 py-4 text-center">
                                    <span class="text-xs font-semibold px-2.5 py-1 rounded-full"
                                        :class="r.status === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'">
                                        {{ r.status === 'ok' ? '✓ Cadastrado' : '✗ ' + r.mensagem }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="flex justify-start">
                    <button
                        class="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                        @click="reiniciar">
                        Novo cadastro em lote
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { supabase } from "~/utils/supabase";

definePageMeta({ middleware: "admin" });


const etapa = ref('config')
const papelSelecionado = ref('ALUNO')
const csvFile = ref(null)
const isDragging = ref(false)
const erroLeitura = ref('')
const processando = ref(false)
const resultados = ref([])
const linhasValidas = ref([])
const linhasIgnoradas = ref([])

const papeis = [
    { value: 'ALUNO', label: 'Aluno', icon: '🎓' },
    { value: 'PROFESSOR', label: 'Professor', icon: '👨‍🏫' },
    { value: 'ADMIN', label: 'Admin', icon: '🔑' },
]

const papelLabel = computed(
    () => papeis.find(p => p.value === papelSelecionado.value)?.label ?? papelSelecionado.value
)

const resultadoSucesso = computed(() => resultados.value.filter(r => r.status === 'ok').length)
const resultadoErro = computed(() => resultados.value.filter(r => r.status === 'erro').length)

function onDrop(e) {
    isDragging.value = false
    const file = e.dataTransfer.files[0]
    if (file) processarArquivo(file)
}

function onFileChange(e) {
    const file = e.target.files[0]
    if (file) processarArquivo(file)
}

function processarArquivo(file) {
    erroLeitura.value = ''
    if (!file.name.endsWith('.csv')) {
        erroLeitura.value = 'O arquivo deve ser um .csv'
        return
    }
    csvFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => parsearCSV(e.target.result)
    reader.readAsText(file, 'UTF-8')
}

function parsearCSV(text) {
    linhasValidas.value = []
    linhasIgnoradas.value = []

    const linhas = text.trim().split('\n').map(l => l.trim()).filter(Boolean)
    if (linhas.length < 2) {
        erroLeitura.value = 'O arquivo está vazio ou não tem dados além do cabeçalho.'
        return
    }

    const sep = linhas[0].includes(';') ? ';' : ','
    const header = linhas[0].split(sep).map(h => h.toLowerCase().trim())
    const idxNome = header.findIndex(h => h === 'nome')
    const idxEmail = header.findIndex(h => h === 'email')

    if (idxNome === -1 || idxEmail === -1) {
        erroLeitura.value = 'O CSV precisa ter as colunas "nome" e "email".'
        return
    }

    const emailsVistos = new Set()

    for (let i = 1; i < linhas.length; i++) {
        const cols = linhas[i].split(sep).map(c => c.trim().replace(/^"|"$/g, ''))
        const nome = cols[idxNome] || ''
        const email = (cols[idxEmail] || '').toLowerCase()

        if (!nome || !email || !email.includes('@') || emailsVistos.has(email)) {
            linhasIgnoradas.value.push({ linha: i + 1, nome, email })
            continue
        }

        emailsVistos.add(email)
        linhasValidas.value.push({ nome, email })
    }
}

async function cadastrarLote() {
    processando.value = true
    try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token

        const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cadastro-lote`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    usuarios: linhasValidas.value,
                    papel: papelSelecionado.value,
                }),
            }
        )

        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Erro desconhecido')

        resultados.value = json.resultados
        etapa.value = 'resultado'
    } catch (e) {
        alert(`Erro ao cadastrar: ${e.message}`)
    } finally {
        processando.value = false
    }
}

function reiniciar() {
    etapa.value = 'config'
    csvFile.value = null
    linhasValidas.value = []
    linhasIgnoradas.value = []
    resultados.value = []
    erroLeitura.value = ''
}
</script>