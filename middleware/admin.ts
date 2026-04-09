// middleware/admin.ts
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const { user, reidratar, isAdmin, precisaSelecionarPapel } = useAuth()
  await reidratar()

  if (!user.value) return navigateTo('/')
  if (precisaSelecionarPapel.value) return navigateTo('/selecionar-papel')
  if (!isAdmin.value) return navigateTo('/hub')
})