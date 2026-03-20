// composables/useJustificativasPendentes.ts
import { supabase } from '~/utils/supabase'

export const useJustificativasPendentes = () => {
  const count = useState<number>('justificativas_pendentes', () => 0)

  async function carregar(professorId: string) {
    const { data } = await supabase
      .from('justificativa_falta')
      .select('id, aula(turma(professor_id))')
      .eq('status', 'PENDENTE')

    count.value = (data || []).filter(
        j => j.aula?.[0]?.turma?.[0]?.professor_id === professorId
    ).length
  }

  return { count, carregar }
}