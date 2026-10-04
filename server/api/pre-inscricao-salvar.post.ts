import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
  const { usuario_id, nivel_preferido, turma_selecionada_id, motivo_turma_diferente } = await readBody(event)
  const turmaId = turma_selecionada_id ? Number(turma_selecionada_id) : null

  if (!usuario_id || !nivel_preferido) {
    throw createError({ statusCode: 400, message: 'Campos obrigatórios ausentes.' })
  }

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error } = await supabaseAdmin.from('pre_inscricao').upsert(
    {
      usuario_id,
      nivel_preferido,
      turma_selecionada_id: turmaId,
      motivo_turma_diferente: motivo_turma_diferente || null,
    },
    { onConflict: 'usuario_id' }
  )

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  // Buscar dados para o e-mail
  try {
    const [{ data: usuarioData }, { data: authUserData }, { data: turmaData }] = await Promise.all([
      supabaseAdmin.from('usuarios').select('nome').eq('id', usuario_id).maybeSingle(),
      supabaseAdmin.auth.admin.getUserById(usuario_id),
      turmaId
        ? supabaseAdmin.from('turma').select('nome').eq('id', turmaId).maybeSingle()
        : Promise.resolve({ data: null }),
    ])

    const nomeAluno = usuarioData?.nome ?? 'Estudante'
    const emailAluno = (authUserData as any)?.user?.email

    const NIVEL_MAP: Record<string, string> = {
      INICIANTE: 'Iniciante',
      BASICO: 'Básico',
      INTERMEDIARIO: 'Intermediário',
      CONVERSACAO: 'Conversação',
    }
    const nomeNivel = NIVEL_MAP[nivel_preferido] ?? nivel_preferido
    const nomeTurma = turmaData?.nome ?? null

    if (emailAluno) {
      const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        auth: {
          user: process.env.BREVO_SMTP_USER!,
          pass: process.env.BREVO_SMTP_PASS!,
        },
      })

      await transporter.sendMail({
        from: `"Linguesc" <${process.env.BREVO_SENDER_EMAIL}>`,
        to: emailAluno,
        subject: 'Pré-inscrição recebida — Linguesc / UDESC',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #333;">
            <div style="background-color: #16a34a; padding: 24px 32px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 22px;">Pré-inscrição recebida!</h1>
            </div>
            <div style="background: #fff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 16px;">Olá, <strong>${nomeAluno}</strong>!</p>
              <p style="margin: 0 0 24px; color: #555;">Sua pré-inscrição no <strong>Linguesc</strong> foi recebida com sucesso. Confira os detalhes abaixo:</p>

              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px 20px; margin-bottom: 16px;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280;">Nível selecionado</p>
                <p style="margin: 0; font-weight: bold; color: #15803d;">${nomeNivel}</p>
              </div>

              ${nomeTurma ? `
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280;">Turma de interesse</p>
                <p style="margin: 0; font-weight: bold; color: #111827;">${nomeTurma}</p>
              </div>
              ` : ''}

              <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>⚠️ Atenção:</strong> A pré-inscrição <strong>não garante vaga</strong>. A confirmação da sua matrícula será realizada pela equipe Linguesc, que entrará em contato em breve.
                </p>
              </div>

              <p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">Dúvidas? Entre em contato:</p>
              <p style="margin: 0; font-size: 13px;"><a href="mailto:linguesc.cct@udesc.br" style="color: #16a34a;">linguesc.cct@udesc.br</a></p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0 16px;" />
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">Linguesc — Centro de Idiomas · UDESC Joinville</p>
            </div>
          </div>
        `,
      })
    }
  } catch {
    // Falha no e-mail não bloqueia a inscrição
  }

  return { success: true }
})
