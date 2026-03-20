// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return // deixa o SSR passar, cliente assume

  const { user, reidratar } = useAuth()
  await reidratar()

  if (!user.value) {
    return navigateTo('/')
  }
})