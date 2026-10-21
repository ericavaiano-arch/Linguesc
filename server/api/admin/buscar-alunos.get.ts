import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = ((query.q as string) || '').trim()

  if (!q || q.length < 2) return []

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Busca por nome e CPF na tabela usuarios
  const [{ data: porNome }, { data: porCpf }] = await Promise.all([
    supabaseAdmin.from('usuarios').select('id, nome, documento_federal').ilike('nome', `%${q}%`).limit(20),
    supabaseAdmin.from('usuarios').select('id, nome, documento_federal').ilike('documento_federal', `%${q}%`).limit(10),
  ])

  // Busca por email nos usuários do auth
  const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  const authUsers = authData?.users || []
  const emailMatches = authUsers
    .filter(u => u.email?.toLowerCase().includes(q.toLowerCase()))
    .map(u => u.id)

  let porEmail: any[] = []
  if (emailMatches.length > 0) {
    const { data } = await supabaseAdmin
      .from('usuarios')
      .select('id, nome, documento_federal')
      .in('id', emailMatches.slice(0, 20))
    porEmail = data || []
  }

  // Mapa único de usuários encontrados
  const allMap = new Map<string, any>()
  ;[...(porNome || []), ...(porCpf || []), ...porEmail].forEach(u => allMap.set(u.id, u))

  const uniqueIds = [...allMap.keys()]
  if (uniqueIds.length === 0) return []

  // Filtra apenas ALUNO
  const { data: papeis } = await supabaseAdmin
    .from('usuario_papel')
    .select('usuario_id')
    .in('usuario_id', uniqueIds)
    .eq('papel', 'ALUNO')
    .eq('ativo', true)

  const alunosIds = new Set((papeis || []).map((p: any) => p.usuario_id))
  const alunosFiltrados = uniqueIds.filter(id => alunosIds.has(id))
  if (alunosFiltrados.length === 0) return []

  // Turmas ativas de cada aluno
  const { data: vinculos } = await supabaseAdmin
    .from('turma_aluno')
    .select('aluno_id, turma:turma_id(id, nome, status, is_teste)')
    .in('aluno_id', alunosFiltrados)

  const turmasPorAluno: Record<string, any[]> = {}
  ;(vinculos || []).forEach((v: any) => {
    if (!turmasPorAluno[v.aluno_id]) turmasPorAluno[v.aluno_id] = []
    if (v.turma) turmasPorAluno[v.aluno_id].push(v.turma)
  })

  const emailMap: Record<string, string> = {}
  authUsers.forEach(u => { emailMap[u.id] = u.email || '' })

  return alunosFiltrados.map(id => {
    const u = allMap.get(id)
    return {
      id,
      nome: u.nome || '',
      email: emailMap[id] || '',
      documento_federal: u.documento_federal || '',
      turmas: (turmasPorAluno[id] || []).filter((t: any) => t.status === 'ATIVA'),
    }
  }).filter(a => a.turmas.length > 0)
})
