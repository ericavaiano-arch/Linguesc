import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
  const { aluno_id, recompensa } = await readBody(event)

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Aluno — nome da tabela usuarios, email do auth
  const [{ data: aluno }, { data: authUserData }] = await Promise.all([
    supabaseAdmin.from('usuarios').select('nome').eq('id', aluno_id).single(),
    supabaseAdmin.auth.admin.getUserById(aluno_id),
  ])
  const alunoEmail = authUserData?.user?.email ?? '—'

  // Turma(s) ativas — tenta aluno primeiro, depois professor
  const { data: matriculas } = await supabaseAdmin
    .from('turma_aluno')
    .select('turma:turma_id(id, nome, professor_id, status)')
    .eq('aluno_id', aluno_id)

  let turmas = (matriculas ?? [])
    .map((m: any) => m.turma)
    .filter((t: any) => t && t.status === 'ATIVA')

  // Se não for aluno de nenhuma turma ativa, verifica se é professor
  if (turmas.length === 0) {
    const { data: turmasProf } = await supabaseAdmin
      .from('turma')
      .select('id, nome, professor_id, status')
      .eq('professor_id', aluno_id)
      .eq('status', 'ATIVA')
      .order('dt_inclusao', { ascending: false })
    if (turmasProf && turmasProf.length > 0) turmas = turmasProf
  }

  let professorNome = '—'
  if (turmas.length > 0 && turmas[0]?.professor_id) {
    const { data: prof } = await supabaseAdmin
      .from('usuarios')
      .select('nome')
      .eq('id', turmas[0].professor_id)
      .single()
    if (prof) professorNome = prof.nome
  }

  const turmaNomes = turmas.map((t: any) => t.nome).join(', ') || '—'
  const dataFormatada = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
      user: process.env.BREVO_SMTP_USER!,
      pass: process.env.BREVO_SMTP_PASS!,
    },
  })

  const turmaId = turmas.length > 0 ? turmas[0].id : null

  // Registrar requisição no banco (ignora se já existir para a mesma turma)
  await supabaseAdmin
    .from('recompensa_requisicao')
    .upsert(
      { usuario_id: aluno_id, nivel: recompensa.nivel, turma_id: turmaId },
      { onConflict: 'usuario_id,nivel,turma_id', ignoreDuplicates: true }
    )

  await transporter.sendMail({
    from: `"Linguesc" <${process.env.BREVO_SENDER_EMAIL}>`,
    to: 'eric.cvsilveira@gmail.com',
    subject: `[Linguesc] Requisição de recompensa — ${recompensa.nome}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #166534; margin-bottom: 4px;">Requisição de Recompensa</h2>
        <p style="color: #6b7280; font-size: 14px; margin-top: 0;">Recebida em ${dataFormatada}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
        <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 130px;">Aluno</td>
            <td style="padding: 8px 0; font-weight: 600; color: #111827;">${aluno?.nome ?? '—'} (${alunoEmail})</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Turma(s)</td>
            <td style="padding: 8px 0; font-weight: 600; color: #111827;">${turmaNomes}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Professor</td>
            <td style="padding: 8px 0; font-weight: 600; color: #111827;">${professorNome}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Recompensa</td>
            <td style="padding: 8px 0; font-weight: 600; color: #111827;">${recompensa.emoji} ${recompensa.nome} — ${recompensa.nivel} (${recompensa.limiar} ⭐)</td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
        <p style="font-size: 13px; color: #9ca3af;">Esta mensagem foi enviada automaticamente pelo sistema Linguesc.</p>
      </div>
    `,
  })

  return { success: true }
})
