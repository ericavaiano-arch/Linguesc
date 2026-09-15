import { supabase } from '~/utils/supabase'
import { templateFrequencia } from "~/server/utils/email-templates";
 
export async function verificarENotificarRisco({ turmaId, turmaNome, professorId, metaFrequencia }) {
  // Busca todos os alunos vinculados à turma
  const { data: vinculos } = await supabase
    .from('turma_aluno')
    .select('aluno_id, usuarios(nome)')
    .eq('turma_id', turmaId)
    .eq('usuarios.ativo', true)
 
  if (!vinculos?.length) return
 
  const alunosIds = vinculos.map(v => v.aluno_id)
 
  // Busca e-mails via RPC (mesma abordagem do código original, contorna RLS)
  const { data: todosAlunos } = await supabase.rpc('get_alunos_ativos')
  const emailMap = Object.fromEntries((todosAlunos || []).map(a => [a.id, a.email]))
 
  // Busca estrelas direto em public.usuarios (sem e-mail, evita bloqueio de RLS)
  const { data: dadosEstrelas } = await supabase
    .from('usuarios')
    .select('id, estrelas')
    .in('id', alunosIds)
 
  const dadosMap = Object.fromEntries(
    (dadosEstrelas || []).map(a => [a.id, { email: emailMap[a.id], estrelas: a.estrelas ?? 0 }])
  )
 
  // Busca aulas realizadas da turma
  const { data: aulas } = await supabase
    .from('aula')
    .select('id')
    .eq('turma_id', turmaId)
    .eq('status', 'REALIZADA')
 
  if (!aulas?.length) return
 
  const aulasIds = aulas.map(a => a.id)
 
  // Busca presenças e justificativas aceitas em paralelo
  const [{ data: presencas }, { data: justificativas }] = await Promise.all([
    supabase.from('presenca').select('aluno_id, aula_id')
      .in('aluno_id', alunosIds)
      .in('aula_id', aulasIds),
    supabase.from('justificativa_falta').select('aluno_id, aula_id')
      .in('aluno_id', alunosIds)
      .in('aula_id', aulasIds)
      .eq('status', 'ACEITA'),
  ])
 
  const totalAulas = aulasIds.length
 
  // Calcula frequência de cada aluno e monta objeto completo
  const alunosCalculados = vinculos.map(v => {
    const presencasCount = (presencas || [])
      .filter(p => p.aluno_id === v.aluno_id).length
 
    const justCount = (justificativas || [])
      .filter(j =>
        j.aluno_id === v.aluno_id &&
        !(presencas || []).some(p => p.aluno_id === v.aluno_id && p.aula_id === j.aula_id)
      ).length
 
    const frequencia = Math.round(((presencasCount + justCount) / totalAulas) * 100)
    const faltasAtuais = totalAulas - presencasCount - justCount
    const maxFaltas = Math.floor(totalAulas * (1 - metaFrequencia / 100))
    const faltasDisponiveis = Math.max(0, maxFaltas - faltasAtuais)
    const dados = dadosMap[v.aluno_id] || {}
 
    return {
      alunoId: v.aluno_id,
      nome: v.usuarios?.nome,
      email: dados.email,
      estrelas: dados.estrelas,
      frequencia,
      faltasDisponiveis,
    }
  })
 
  // Filtra quem tem e-mail para não falhar silenciosamente
  const alunosParaNotificar = alunosCalculados.filter(a => !!a.email)
 
  if (!alunosParaNotificar.length) return
 
  // Verifica notificações já enviadas hoje para não duplicar
  const hoje = new Date().toISOString().split('T')[0]
  const { data: jaNotificados } = await supabase
    .from('notificacao_risco')
    .select('aluno_id')
    .eq('turma_id', turmaId)
    .gte('dt_inclusao', hoje + 'T00:00:00')
 
  const jaNotificadosIds = new Set((jaNotificados || []).map(n => n.aluno_id))
 
  const novos = alunosParaNotificar.filter(a => !jaNotificadosIds.has(a.alunoId))
 
  if (!novos.length) return
 
  // Insere registro de notificação para todos os alunos novos
  await supabase.from('notificacao_risco').insert(
    novos.map(a => ({
      aluno_id: a.alunoId,
      professor_id: professorId,
      turma_id: turmaId,
      mensagem: `Frequência atual na turma ${turmaNome}: ${a.frequencia}%.`,
    }))
  )
 
  // Envia e-mail para cada aluno
  for (const aluno of novos) {
    await $fetch('/api/send-email', {
      method: 'POST',
      body: {
        to: aluno.email,
        subject: `Frequência ${aluno.frequencia}% — ${turmaNome}`,
        html: templateFrequencia(
          aluno.nome,
          turmaNome,
          aluno.frequencia,
          metaFrequencia,
          'https://linguesc.vercel.app',
          aluno.faltasDisponiveis,
          aluno.estrelas,
        ),
      },
    })
  }
}
