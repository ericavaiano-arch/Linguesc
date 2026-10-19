import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await supabaseAdmin
    .from('config_sistema')
    .select('inscricoes_abertas')
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { inscricoes_abertas: data?.inscricoes_abertas ?? true }
})
