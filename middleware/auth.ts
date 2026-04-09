// middleware/auth.ts
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const { user, reidratar, precisaSelecionarPapel } = useAuth()
  await reidratar()

  if (!user.value) return navigateTo('/')
  if (precisaSelecionarPapel.value) return navigateTo('/selecionar-papel')
})