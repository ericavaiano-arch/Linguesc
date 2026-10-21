import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const { aluno_id, turma_origem_id, turma_destino_id } = await readBody(event)

  if (!aluno_id || !turma_origem_id || !turma_destino_id) {
    throw createError({ statusCode: 400, message: 'Parâmetros obrigatórios faltando.' })
  }

  if (turma_origem_id === turma_destino_id) {
    throw createError({ statusCode: 400, message: 'Turma de destino igual à turma de origem.' })
  }

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 1. Aulas realizadas na turma de origem (ordem cronológica)
  const { data: aulasOrigem } = await supabaseAdmin
    .from('aula')
    .select('id')
    .eq('turma_id', turma_origem_id)
    .eq('status', 'REALIZADA')
    .order('data', { ascending: true })

  const aulasOrigemIds = (aulasOrigem || []).map((a: any) => a.id)

  // 2. Posições (índices) em que o aluno estava presente na origem
  let indicesPresentes: number[] = []
  if (aulasOrigemIds.length > 0) {
    const { data: presencas } = await supabaseAdmin
      .from('presenca')
      .select('aula_id')
      .eq('aluno_id', aluno_id)
      .in('aula_id', aulasOrigemIds)

    const presencasSet = new Set((presencas || []).map((p: any) => p.aula_id))
    indicesPresentes = aulasOrigemIds
      .map((id: string, idx: number) => (presencasSet.has(id) ? idx : -1))
      .filter((idx: number) => idx !== -1)
  }

  // 3. Aulas realizadas na turma de destino (ordem cronológica)
  const { data: aulasDestino } = await supabaseAdmin
    .from('aula')
    .select('id')
    .eq('turma_id', turma_destino_id)
    .eq('status', 'REALIZADA')
    .order('data', { ascending: true })

  const aulasDestinoArr = aulasDestino || []

  // 4. Criar presenças na turma destino para as posições equivalentes
  let presencasTransferidas = 0
  if (indicesPresentes.length > 0 && aulasDestinoArr.length > 0) {
    const novasPresencas = indicesPresentes
      .filter((idx: number) => idx < aulasDestinoArr.length)
      .map((idx: number) => ({ aluno_id, aula_id: (aulasDestinoArr as any[])[idx].id }))

    if (novasPresencas.length > 0) {
      await supabaseAdmin
        .from('presenca')
        .upsert(novasPresencas, { onConflict: 'aula_id,aluno_id', ignoreDuplicates: true })
      presencasTransferidas = novasPresencas.length
    }
  }

  // 5. Remove da turma origem
  await supabaseAdmin
    .from('turma_aluno')
    .delete()
    .eq('aluno_id', aluno_id)
    .eq('turma_id', turma_origem_id)

  // 6. Adiciona na turma destino
  await supabaseAdmin
    .from('turma_aluno')
    .upsert({ aluno_id, turma_id: turma_destino_id }, { onConflict: 'turma_id,aluno_id' })

  // 7. Cria entradas de atividade_aluno para missões publicadas na turma destino
  const { data: missoesDestino } = await supabaseAdmin
    .from('atividade')
    .select('id')
    .eq('turma_id', turma_destino_id)
    .eq('status', 'PUBLICADA')

  if (missoesDestino && missoesDestino.length > 0) {
    await supabaseAdmin
      .from('atividade_aluno')
      .upsert(
        (missoesDestino as any[]).map((m: any) => ({
          atividade_id: m.id,
          aluno_id,
          feito: false,
          nota: null,
        })),
        { onConflict: 'atividade_id,aluno_id', ignoreDuplicates: true }
      )
  }

  return {
    success: true,
    presencasTransferidas,
  }
})
