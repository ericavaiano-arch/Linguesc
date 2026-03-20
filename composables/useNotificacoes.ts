// composables/useNotificacoes.ts
import { supabase } from '~/utils/supabase'

export const useNotificacoes = () => {
  const notificacoes = useState<any[]>('notificacoes', () => [])
  const count = computed(() => notificacoes.value.filter(n => !n.lida).length)

  async function carregar(alunoId: string) {
    const { data } = await supabase
      .from('notificacao_risco')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('dt_inclusao', { ascending: false })
      .limit(10)

    notificacoes.value = data || []
  }

  async function marcarLidas(alunoId: string) {
    await supabase
      .from('notificacao_risco')
      .update({ lida: true })
      .eq('aluno_id', alunoId)
      .eq('lida', false)

    notificacoes.value = notificacoes.value.map(n => ({ ...n, lida: true }))
  }

  return { notificacoes, count, carregar, marcarLidas }
}