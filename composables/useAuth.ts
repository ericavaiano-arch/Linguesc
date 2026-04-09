// composables/useAuth.ts
import { supabase } from '~/utils/supabase'

export type Papel = 'ALUNO' | 'PROFESSOR' | 'ADMIN'

export interface AuthUser {
  id: string
  nome: string
  email: string
  ativo: boolean
}

// Estado global fora do composable
const user = ref<AuthUser | null>(null)
const papelAtivo = ref<Papel | null>(null)
const papeis = ref<Papel[]>([])

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
  return null // múltiplos papéis → aguarda seleção
}

export const useAuth = () => {
  async function reidratar() {
    if (user.value) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: perfil } = await supabase
      .from('usuarios')
      .select('id, nome, ativo')
      .eq('id', session.user.id)
      .single()

    if (!perfil) return

    user.value = {
      id: perfil.id,
      nome: perfil.nome,
      email: session.user.email ?? '',
      ativo: perfil.ativo,
    }

    papeis.value = await carregarPapeis(perfil.id)
    papelAtivo.value = resolverPapelInicial(papeis.value)
  }

  async function login(email: string, senha: string): Promise<string | null> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error || !data.session) return error?.message ?? 'Erro ao fazer login'

    const { data: perfil } = await supabase
      .from('usuarios')
      .select('id, nome, ativo')
      .eq('id', data.user.id)
      .single()

    if (!perfil) return 'Usuário não encontrado'
    if (!perfil.ativo) return 'Usuário inativo'

    user.value = {
      id: perfil.id,
      nome: perfil.nome,
      email: data.user.email ?? '',
      ativo: perfil.ativo,
    }

    papeis.value = await carregarPapeis(perfil.id)
    papelAtivo.value = resolverPapelInicial(papeis.value)

    return null
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
    login,
    logout,
    reidratar,
    selecionarPapel,
  }
}