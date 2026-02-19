import { supabase } from '@/utils/supabase'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, senha } = body

  if (!email || !senha) {
    return { error: 'Email e senha obrigatórios' }
  }

  // Busca usuário
  const { data: user, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !user) {
    return { error: 'Usuário não encontrado' }
  }

  // Compara senha
  const senhaValida = await bcrypt.compare(senha, user.senha)

  if (!senhaValida) {
    return { error: 'Senha inválida' }
  }

  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    tipoUsuario: user.tipoUsuario
  }
})
