import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const { nome, email, senha, data_nascimento, documento_federal, genero } = await readBody(event)

  if (!nome || !email || !senha || !data_nascimento || !documento_federal || !genero) {
    throw createError({ statusCode: 400, message: 'Todos os campos são obrigatórios.' })
  }
  if (senha.length < 8) {
    throw createError({ statusCode: 400, message: 'A senha deve ter pelo menos 8 caracteres.' })
  }

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim(),
    password: senha,
    email_confirm: true,
  })

  if (authError) {
    const msg = authError.message ?? ''
    if (msg.includes('already been registered') || msg.includes('already exists') || msg.includes('duplicate')) {
      throw createError({ statusCode: 409, message: 'Este e-mail já está cadastrado. Use a opção "Já tenho conta".' })
    }
    throw createError({ statusCode: 400, message: msg || 'Erro ao criar conta.' })
  }

  const userId = authData.user.id

  const { error: userError } = await supabaseAdmin.from('usuarios').insert({
    id: userId,
    nome: nome.trim(),
    ativo: false,
    data_nascimento,
    documento_federal: documento_federal.trim(),
    genero: genero.trim() || null,
    nivel_perfil: 0,
    estrelas: 0,
    bonus_sequencia_semestre: false,
  })

  if (userError) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {})
    throw createError({ statusCode: 500, message: userError.message })
  }

  const { error: papelError } = await supabaseAdmin.from('usuario_papel').insert({
    usuario_id: userId,
    papel: 'ALUNO',
    ativo: true,
  })

  if (papelError) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {})
    throw createError({ statusCode: 500, message: papelError.message })
  }

  return { success: true }
})
