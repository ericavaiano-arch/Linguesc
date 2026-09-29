import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.replace('Bearer ', '') ?? ''

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Verificar que é admin
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
  }

  const { data: papeis } = await supabaseAdmin
    .from('usuario_papel')
    .select('papel')
    .eq('usuario_id', user.id)
    .eq('ativo', true)

  const isAdmin = (papeis ?? []).some((p: any) => p.papel === 'ADMIN')
  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }

  // Buscar IDs dos admins (ficam ativos)
  const { data: adminPapeis } = await supabaseAdmin
    .from('usuario_papel')
    .select('usuario_id')
    .eq('papel', 'ADMIN')
    .eq('ativo', true)

  const adminIds: string[] = (adminPapeis ?? []).map((p: any) => p.usuario_id)

  // Passo 1: Inativar todos os usuários que não são admin
  let errorUsuarios = null
  if (adminIds.length > 0) {
    const { error } = await supabaseAdmin
      .from('usuarios')
      .update({ ativo: false })
      .not('id', 'in', `(${adminIds.join(',')})`)
    errorUsuarios = error
  } else {
    const { error } = await supabaseAdmin
      .from('usuarios')
      .update({ ativo: false })
      .not('id', 'is', null)
    errorUsuarios = error
  }
  if (errorUsuarios) {
    return { success: false, error: errorUsuarios.message, step: 'usuarios' }
  }

  // Passo 2: Finalizar todas as turmas ativas
  const { error: errorTurmas } = await supabaseAdmin
    .from('turma')
    .update({ status: 'FINALIZADA' })
    .eq('status', 'ATIVA')
  if (errorTurmas) {
    return { success: false, error: errorTurmas.message, step: 'turmas' }
  }

  // Passo 3: Zerar gamificação e resetar perfil de todos os usuários
  const { error: errorGamificacao } = await supabaseAdmin
    .from('usuarios')
    .update({
      estrelas: 0,
      nivel_perfil: 0,
      bonus_sequencia_semestre: false,
      ultimo_bonus_login_semana: null,
      avatar_bonus_concedido: false,
      perfil_bonus_concedido: false,
      termo_aceite: false,
      interesses: null,
      motivacao_ingles: null,
      curso: null,
      avatar_url: null,
    })
    .not('id', 'is', null)
  if (errorGamificacao) {
    return { success: false, error: errorGamificacao.message, step: 'gamificacao' }
  }

  return { success: true }
})
