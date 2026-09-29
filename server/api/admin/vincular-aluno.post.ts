import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const { usuario_id, turma_id } = await readBody(event)

  if (!usuario_id || !turma_id) {
    throw createError({ statusCode: 400, message: 'usuario_id e turma_id são obrigatórios.' })
  }

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error: ativoErr } = await supabaseAdmin
    .from('usuarios')
    .update({ ativo: true })
    .eq('id', usuario_id)

  if (ativoErr) throw createError({ statusCode: 500, message: ativoErr.message })

  const { error: turmaErr } = await supabaseAdmin
    .from('turma_aluno')
    .upsert({ turma_id: Number(turma_id), aluno_id: usuario_id }, { onConflict: 'turma_id,aluno_id' })

  if (turmaErr) throw createError({ statusCode: 500, message: turmaErr.message })

  return { success: true }
})
