// composables/useAuth.ts
import { supabase } from '~/utils/supabase'

export type Papel = 'ALUNO' | 'PROFESSOR' | 'ADMIN'

export interface AuthUser {
  id: string
  nome: string
  email: string
  ativo: boolean
  termoAceite: boolean | null
  nivelPerfil: number
  avatarUrl: string | null
  estrelas: number
}

// Estado global fora do composable
const user = ref<AuthUser | null>(null)
const papelAtivo = ref<Papel | null>(null)
const papeis = ref<Papel[]>([])
const bonusLoginPendente = ref(false)

async function carregarPapeis(userId: string): Promise<Papel[]> {
  const { data } = await supabase
    .from('usuario_papel')
    .select('papel')
    .eq('usuario_id', userId)
    .eq('ativo', true)

  return (data ?? []).map(p => p.papel as Papel)
}

function resolverPapelInicial(lista: Papel[]): Papel | null {
  if (lista.includes('ADMIN')) return 'ADMIN'
  if (lista.length === 1) return lista[0]
  return null
}

async function gerarAvatarUrl(path: string | null): Promise<string | null> {
  if (!path) return null
  // Emojis são salvos como string curta sem "/" — retorna direto, sem ir ao Storage
  if (!path.includes('/')) return path
  const { data } = await supabase.storage
    .from('avatares')
    .createSignedUrl(path, 3600)
  return data?.signedUrl ?? null
}

export const useAuth = () => {
  async function reidratar() {
    if (user.value) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: perfil } = await supabase
      .from('usuarios')
      .select('id, nome, ativo, termo_aceite, nivel_perfil, avatar_url, estrelas')
      .eq('id', session.user.id)
      .single()

    if (!perfil) return

    user.value = {
      id: perfil.id,
      nome: perfil.nome,
      email: session.user.email ?? '',
      ativo: perfil.ativo,
      termoAceite: perfil.termo_aceite,
      nivelPerfil: perfil.nivel_perfil ?? 0,
      avatarUrl: await gerarAvatarUrl(perfil.avatar_url),
      estrelas: perfil.estrelas ?? 0,
    }

    papeis.value = await carregarPapeis(perfil.id)
    papelAtivo.value = resolverPapelInicial(papeis.value)
  }

  async function login(email: string, senha: string): Promise<string | null> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error || !data.session) return error?.message ?? 'Erro ao fazer login'

    const { data: perfil } = await supabase
      .from('usuarios')
      .select('id, nome, ativo, termo_aceite, nivel_perfil, avatar_url, estrelas, ultimo_bonus_login_semana')
      .eq('id', data.user.id)
      .single()

    if (!perfil) return 'Usuário não encontrado'
    if (!perfil.ativo) return 'Usuário inativo'

    const estrelasFinais = await verificarBonusLoginSemanal(
      perfil.id,
      perfil.estrelas ?? 0,
      perfil.ultimo_bonus_login_semana ?? null
    )

    const bonusRecebido = estrelasFinais > (perfil.estrelas ?? 0)

    user.value = {
      id: perfil.id,
      nome: perfil.nome,
      email: data.user.email ?? '',
      ativo: perfil.ativo,
      termoAceite: perfil.termo_aceite,
      nivelPerfil: perfil.nivel_perfil ?? 0,
      avatarUrl: await gerarAvatarUrl(perfil.avatar_url),
      estrelas: estrelasFinais,
    }

    papeis.value = await carregarPapeis(perfil.id)
    papelAtivo.value = resolverPapelInicial(papeis.value)

    if (bonusRecebido) {
      bonusLoginPendente.value = true
    }

    return null
  }

  async function verificarBonusLoginSemanal(
    userId: string,
    estrelasAtuais: number,
    ultimoBonusSemana: string | null
  ): Promise<number> {
    const semanaAtual = getSemanaISO()

    if (ultimoBonusSemana === semanaAtual) return estrelasAtuais

    const novasEstrelas = estrelasAtuais + 5

    await supabase
      .from('usuarios')
      .update({
        estrelas: novasEstrelas,
        ultimo_bonus_login_semana: semanaAtual,
      })
      .eq('id', userId)

    return novasEstrelas
  }

  function getSemanaISO(data: Date = new Date()): string {
    const d = new Date(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()))
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
    const ano = d.getUTCFullYear()
    const inicioAno = new Date(Date.UTC(ano, 0, 1))
    const semana = Math.ceil(((d.getTime() - inicioAno.getTime()) / 86400000 + 1) / 7)
    return `${ano}-W${String(semana).padStart(2, '0')}`
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    papelAtivo.value = null
    papeis.value = []
    navigateTo('/')
  }

  function selecionarPapel(papel: Papel) {
    papelAtivo.value = papel
  }

  async function alterarSenha(senhaAtual: string, novaSenha: string): Promise<string | null> {
    const { error: reAuthError } = await supabase.auth.signInWithPassword({
      email: user.value!.email,
      password: senhaAtual,
    })

    if (reAuthError) return 'Senha atual incorreta'

    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    if (error) return 'Erro ao atualizar senha'

    return null
  }

  async function aceitarTermoConsciencia(): Promise<string | null> {
    if (!user.value) return 'Usuário não autenticado'

    const { error } = await supabase
      .from('usuarios')
      .update({ termo_aceite: true })
      .eq('id', user.value.id)

    if (error) return 'Erro ao registrar aceite do termo'

    user.value = { ...user.value, termoAceite: true }
    return null
  }

  // Usado por telas como a de perfil para refletir mudanças (nome, nível,
  // avatar) imediatamente em todos os componentes que leem `user`, sem
  // precisar refazer a consulta ao banco.
  function atualizarPerfilLocal(dados: Partial<Pick<AuthUser, 'nome' | 'nivelPerfil' | 'avatarUrl'>>) {
    if (!user.value) return
    user.value = { ...user.value, ...dados }
  }

  // Atualiza o saldo de estrelas localmente após uma premiação.
  // O incremento real no banco deve ser feito pela lógica de negócio
  // (chamada de presença, missão, etc.) antes de chamar esta função.
  function atualizarEstrelasLocal(novoTotal: number) {
    if (!user.value) return
    user.value = { ...user.value, estrelas: novoTotal }
  }

  const isLoggedIn = computed(() => !!user.value)
  const isProfessor = computed(() => papelAtivo.value === 'PROFESSOR')
  const isAluno = computed(() => papelAtivo.value === 'ALUNO')
  const isAdmin = computed(() => papelAtivo.value === 'ADMIN')
  const precisaSelecionarPapel = computed(() =>
    !!user.value && !papelAtivo.value && papeis.value.length > 1
  )

  return {
    user,
    papeis,
    papelAtivo,
    isLoggedIn,
    isProfessor,
    isAluno,
    isAdmin,
    precisaSelecionarPapel,
    bonusLoginPendente,
    login,
    logout,
    reidratar,
    selecionarPapel,
    alterarSenha,
    aceitarTermoConsciencia,
    atualizarPerfilLocal,
    atualizarEstrelasLocal,
  }
}