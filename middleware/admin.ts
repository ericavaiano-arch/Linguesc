// middleware/admin.ts
// Verifica se o usuário é ADMIN
// Redireciona para /hub se logado sem permissão, para / se não logado

export default defineNuxtRouteMiddleware(() => {
  const { user, reidratar } = useAuth()
  reidratar()

  if (!user.value) {
    return navigateTo('/')
  }

  if (user.value.tipoUsuario !== 'ADMIN') {
    return navigateTo('/hub')
  }
})