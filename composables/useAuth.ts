// composables/useAuth.ts
// Gerencia a sessão do usuário com useState (reativo + SSR-safe) + cookie (persistência)

export interface AuthUser {
  id: number
  nome: string
  email: string
  tipoUsuario: 'ALUNO' | 'PROFESSOR' | 'ADMIN'
}

const COOKIE_NAME = 'linguesc_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 dias

export const useAuth = () => {
  // useState é compartilhado entre todos os componentes (SSR-safe)
  const user = useState<AuthUser | null>('auth_user', () => null)

  // Reidrata o estado a partir do cookie (chamado nos middlewares e no app.vue)
  function reidratar() {
    if (import.meta.client) {
      const cookie = useCookie<AuthUser | null>(COOKIE_NAME)
      if (cookie.value && !user.value) {
        user.value = cookie.value
      }
    }
  }

  // Login: salva no useState e no cookie
  function login(userData: AuthUser) {
    user.value = userData
    const cookie = useCookie<AuthUser | null>(COOKIE_NAME, {
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
      path: '/',
    })
    cookie.value = userData
  }

  // Logout: limpa o useState e o cookie
  function logout() {
    user.value = null
    const cookie = useCookie<AuthUser | null>(COOKIE_NAME)
    cookie.value = null
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