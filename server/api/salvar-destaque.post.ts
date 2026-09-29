import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const { alunoIds, professorId, aulaId, turmaId } = await readBody(event)

  if (!Array.isArray(alunoIds) || alunoIds.length === 0 || !professorId || !aulaId) {
    throw createError({ statusCode: 400, message: 'Parâmetros inválidos' })
  }

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // +15 estrelas para cada aluno destaque
  const { data: alunos, error: alunosErr } = await supabaseAdmin
    .from('usuarios')
    .select('id, estrelas')
    .in('id', alunoIds)

  if (alunosErr) throw createError({ statusCode: 500, message: alunosErr.message })

  const updates = (alunos ?? []).map((a: any) =>
    supabaseAdmin
      .from('usuarios')
      .update({ estrelas: (a.estrelas ?? 0) + 15 })
      .eq('id', a.id)
  )
  const results = await Promise.all(updates)
  const updateErr = results.find((r) => r.error)
  if (updateErr?.error) throw createError({ statusCode: 500, message: updateErr.error.message })

  // Histórico para os alunos
  await supabaseAdmin.from('estrelas_historico').insert(
    alunoIds.map((aluno_id: string) => ({
      usuario_id: aluno_id,
      quantidade: 15,
      motivo: 'DESTAQUE_AULA',
      descricao: 'Aluno destaque escolhido pelo professor',
      aula_id: aulaId,
      turma_id: turmaId ?? null,
    }))
  )

  // Retorna os novos totais para atualização local
  const novosEstrelasMap: Record<string, number> = {}
  for (const a of alunos ?? []) {
    novosEstrelasMap[a.id] = (a.estrelas ?? 0) + 15
  }

  return { success: true, novosEstrelasMap }
})
