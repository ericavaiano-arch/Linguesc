import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data } = await supabaseAdmin
    .from('recompensa_requisicao')
    .select('usuario_id')

  const counts: Record<string, number> = {}
  ;(data || []).forEach((r: any) => {
    counts[r.usuario_id] = (counts[r.usuario_id] || 0) + 1
  })

  return counts
})
