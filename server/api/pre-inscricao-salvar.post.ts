import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const { usuario_id, nivel_preferido, turma_selecionada_id, motivo_turma_diferente } = await readBody(event)
  const turmaId = turma_selecionada_id ? Number(turma_selecionada_id) : null

  if (!usuario_id || !nivel_preferido) {
    throw createError({ statusCode: 400, message: 'Campos obrigatórios ausentes.' })
  }

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error } = await supabaseAdmin.from('pre_inscricao').upsert(
    {
      usuario_id,
      nivel_preferido,
      turma_selecionada_id: turmaId,
      motivo_turma_diferente: motivo_turma_diferente || null,
    },
    { onConflict: 'usuario_id' }
  )

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { success: true }
})
