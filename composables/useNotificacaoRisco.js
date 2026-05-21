import { supabase } from '~/utils/supabase'
import { templateAlertaFrequencia  } from "~/server/utils/email-templates";

export async function verificarENotificarRisco({ turmaId, turmaNome, professorId, metaFrequencia }) {
  // Busca todos os alunos ativos da turma
  const { data: vinculos } = await supabase
    .from('turma_aluno')
    .select('aluno_id, usuarios(nome)')
    .eq('turma_id', turmaId)
    .eq('usuarios.ativo', true)

  if (!vinculos?.length) return

  const alunosIds = vinculos.map(v => v.aluno_id)

  const { data: todosAlunos } = await supabase.rpc('get_alunos_ativos')
  const emailMap = Object.fromEntries((todosAlunos || []).map(a => [a.id, a.email]))

  // Busca aulas realizadas
  const { data: aulas } = await supabase
    .from('aula')
    .select('id')
    .eq('turma_id', turmaId)
    .eq('status', 'REALIZADA')

  if (!aulas?.length) return

  const aulasIds = aulas.map(a => a.id)

  // Busca presenças + justificativas aceitas
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

  // Calcula frequência de cada aluno
  const alunosEmRisco = vinculos
    .map(v => {
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

      return { alunoId: v.aluno_id, nome: v.usuarios?.nome, frequencia, faltasDisponiveis }
    })
    .filter(a => a.frequencia < metaFrequencia)

  if (!alunosEmRisco.length) return

  // Busca notificações já enviadas hoje para não duplicar
  const hoje = new Date().toISOString().split('T')[0]
  const { data: jaNotificados } = await supabase
    .from('notificacao_risco')
    .select('aluno_id')
    .eq('turma_id', turmaId)
    .gte('dt_inclusao', hoje + 'T00:00:00')

  const jaNotificadosIds = new Set((jaNotificados || []).map(n => n.aluno_id))

  const novos = alunosEmRisco.filter(a => !jaNotificadosIds.has(a.alunoId))

  if (!novos.length) return

  // Insere notificações
  await supabase.from('notificacao_risco').insert(
    novos.map(a => ({
      aluno_id: a.alunoId,
      professor_id: professorId,
      turma_id: turmaId,
      mensagem: `Sua frequência na turma está em ${a.frequencia}%, abaixo da meta de ${metaFrequencia}%. Procure comparecer às próximas aulas para evitar reprovação por falta.`,
    }))
  )

  // Envia e-mail para cada aluno novo
  for (const aluno of novos) {
    const email = emailMap[aluno.alunoId]
    if (!email) continue

    await $fetch('/api/send-email', {
      method: 'POST',
      body: {
        to: email,
        subject: `⚠ Frequência abaixo do mínimo — ${turmaNome}`,
        html: templateAlertaFrequencia(
          aluno.nome,
          turmaNome,
          aluno.frequencia,
          metaFrequencia,
          'https://linguesc.vercel.app',
          aluno.faltasDisponiveis
        ),
      },
    })
  }
}