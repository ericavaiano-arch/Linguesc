// composables/useAuth.ts
import { supabase } from '~/utils/supabase'

export interface AuthUser {
  id: string
  nome: string
  email: string
  tipoUsuario: 'ALUNO' | 'PROFESSOR' | 'ADMIN'
  ativo: boolean
}

export const useAuth = () => {
  const user = useState<AuthUser | null>('auth_user', () => null)

  // Carrega o usuário da sessão ativa do Supabase
  async function reidratar() {
    if (user.value) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: perfil } = await supabase
      .from('usuarios')
      .select('id, nome, tipo_usuario, ativo')
      .eq('id', session.user.id)
      .single()

    if (perfil) {
      user.value = {
        id: perfil.id,
        nome: perfil.nome,
        email: session.user.email ?? '',
        tipoUsuario: perfil.tipo_usuario, 
        ativo: perfil.ativo,
      }
    }
  }

  async function login(email: string, senha: string): Promise<string | null> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error || !data.session) return error?.message ?? 'Erro ao fazer login'

    const { data: perfil } = await supabase
      .from('usuarios')
      .select('id, nome, tipo_usuario, ativo')
      .eq('id', data.user.id)
      .single()

    if (!perfil) return 'Usuário não encontrado'
    if (!perfil.ativo) return 'Usuário inativo'

    user.value = {
      id: perfil.id,
      nome: perfil.nome,
      email: data.user.email ?? '',
      tipoUsuario: perfil.tipo_usuario, 
      ativo: perfil.ativo,
    }

    return null // null = sucesso
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    navigateTo('/')
  }

  const isLoggedIn = computed(() => !!user.value)
  const isProfessor = computed(() => user.value?.tipoUsuario === 'PROFESSOR')
  const isAluno = computed(() => user.value?.tipoUsuario === 'ALUNO')
  const isAdmin = computed(() => user.value?.tipoUsuario === 'ADMIN')

  return {
    user,
    isLoggedIn,
    isProfessor,
    isAluno,
    isAdmin,
    login,
    logout,
    reidratar,
  }
}