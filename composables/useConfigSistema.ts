import { useState } from '#app'
import { supabase } from '@/utils/supabase'

export function useConfigSistema() {
  const metaFrequencia = useState<number>('meta_frequencia', () => 70)
  const carregando = useState<boolean>('config_carregando', () => false)
  const carregado = useState<boolean>('config_carregado', () => false)

  async function carregarConfig() {
    if (carregado.value || carregando.value) return

    carregando.value = true
    const { data, error } = await supabase
      .from('config_sistema')
      .select('meta_frequencia_padrao')
      .single()

    if (!error && data) {
      metaFrequencia.value = data.meta_frequencia_padrao
    }

    carregado.value = true
    carregando.value = false
  }

  async function atualizarMeta(novaMeta: number) {
    const { error } = await supabase
      .from('config_sistema')
      .update({
        meta_frequencia_padrao: novaMeta,
        dtAtualizacao: new Date().toISOString()
      })
      .eq('id', 1)

    if (!error) {
      metaFrequencia.value = novaMeta
      return true
    }
    return false
  }

  return { metaFrequencia, carregarConfig, atualizarMeta }
}