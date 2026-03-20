// composables/usePresenca.ts
import { supabase } from '~/utils/supabase'

export interface PresencaAluno {
  alunoId: string
  presencas: number
  justificativasAceitas: number
  totalValidas: number // presencas + justificativas aceitas
  aulasRealizadas: number
  frequencia: number
}

/**
 * Dado um conjunto de aulas realizadas e seus IDs,
 * calcula frequência de cada aluno considerando justificativas aceitas.
 */
export async function calcularFrequencias(
  alunoIds: string[],
  aulasIds: number[]
): Promise<Record<string, PresencaAluno>> {
  if (alunoIds.length === 0 || aulasIds.length === 0) return {}

  const [{ data: presencasData }, { data: justificativasData }] = await Promise.all([
    supabase
      .from('presenca')
      .select('aluno_id, aula_id')
      .in('aluno_id', alunoIds)
      .in('aula_id', aulasIds),

    supabase
      .from('justificativa_falta')
      .select('aluno_id, aula_id, status')
      .in('aluno_id', alunoIds)
      .in('aula_id', aulasIds)
      .eq('status', 'ACEITA'),
  ])

  const resultado: Record<string, PresencaAluno> = {}

  alunoIds.forEach(alunoId => {
    const presencas = (presencasData || []).filter(p => p.aluno_id === alunoId).length
    const justificativasAceitas = (justificativasData || []).filter(j => j.aluno_id === alunoId).length
    const totalValidas = presencas + justificativasAceitas
    const frequencia = aulasIds.length > 0
      ? Math.round((totalValidas / aulasIds.length) * 100)
      : 0

    resultado[alunoId] = {
      alunoId,
      presencas,
      justificativasAceitas,
      totalValidas,
      aulasRealizadas: aulasIds.length,
      frequencia,
    }
  })

  return resultado
}

/**
 * Versão síncrona — quando presencas e justificativas já foram carregadas.
 * Útil para computeds que não podem ser async.
 */
export function calcularFrequenciaSync(
  alunoId: string,
  aulasIds: number[],
  presencas: { aluno_id: string; aula_id: number }[],
  justificativasAceitas: { aluno_id: string; aula_id: number }[]
): PresencaAluno {
  if (aulasIds.length === 0) {
    return { alunoId, presencas: 0, justificativasAceitas: 0, totalValidas: 0, aulasRealizadas: 0, frequencia: 0 }
  }

  const idsSet = new Set(aulasIds)
  const p = presencas.filter(x => x.aluno_id === alunoId && idsSet.has(x.aula_id)).length
  const j = justificativasAceitas.filter(x => x.aluno_id === alunoId && idsSet.has(x.aula_id)).length
  const totalValidas = p + j

  return {
    alunoId,
    presencas: p,
    justificativasAceitas: j,
    totalValidas,
    aulasRealizadas: aulasIds.length,
    frequencia: Math.round((totalValidas / aulasIds.length) * 100),
  }
}