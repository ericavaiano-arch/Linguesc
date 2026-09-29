import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const [{ data: inscricoes, error }, { data: authData }] = await Promise.all([
    supabaseAdmin
      .from('pre_inscricao')
      .select(`
        id,
        usuario_id,
        nivel_preferido,
        turma_selecionada_id,
        motivo_turma_diferente,
        created_at,
        usuario:usuarios!usuario_id(nome, documento_federal, ativo),
        turma:turma!turma_selecionada_id(id, nome)
      `)
      .order('created_at', { ascending: false }),
    supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])

  if (error) throw createError({ statusCode: 500, message: error.message })

  const emailMap = Object.fromEntries(
    (authData?.users ?? []).map((u: any) => [u.id, u.email])
  )

  return (inscricoes ?? []).map((r: any) => ({
    id: r.id,
    usuario_id: r.usuario_id,
    nome: r.usuario?.nome ?? '—',
    email: emailMap[r.usuario_id] ?? '—',
    cpf: r.usuario?.documento_federal ?? '—',
    ativo: r.usuario?.ativo ?? false,
    nivel_preferido: r.nivel_preferido,
    turma_id: r.turma?.id ?? r.turma_selecionada_id ?? null,
    turma_nome: r.turma?.nome ?? null,
    motivo: r.motivo_turma_diferente ?? null,
    created_at: r.created_at,
  }))
})
