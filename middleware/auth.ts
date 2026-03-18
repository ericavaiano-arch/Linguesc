// middleware/auth.ts
// Verifica se o usuário está autenticado
// Redireciona para / (login) se não estiver

export default defineNuxtRouteMiddleware(() => {
  const { user, reidratar } = useAuth()
  reidratar()

  if (!user.value) {
    return navigateTo('/')
  }
})
