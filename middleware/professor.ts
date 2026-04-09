// middleware/professor.ts
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const { user, reidratar, isProfessor, isAdmin, precisaSelecionarPapel } = useAuth()
  await reidratar()

  if (!user.value) return navigateTo('/')
  if (precisaSelecionarPapel.value) return navigateTo('/selecionar-papel')
  if (!isProfessor.value && !isAdmin.value) return navigateTo('/hub')
})