// middleware/admin.ts
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const { user, reidratar } = useAuth()
  await reidratar()

  if (!user.value) {
    return navigateTo('/')
  }

  if (user.value.tipoUsuario !== 'ADMIN') {
    return navigateTo('/hub')
  }
})