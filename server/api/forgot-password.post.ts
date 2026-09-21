import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)

  if (!email) {
    throw createError({ statusCode: 400, message: 'Email obrigatório' })
  }

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const appUrl = process.env.VITE_APP_URL || 'http://localhost:3000'

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${appUrl}/reset-password` },
  })

  // Sempre retorna sucesso para não revelar se o e-mail existe
  if (error || !data?.properties?.action_link) {
    return { success: true }
  }

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
    to: email,
    subject: 'Redefinição de senha — Linguesc',
    html: montarEmailReset(data.properties.action_link),
  })

  return { success: true }
})

function montarEmailReset(link: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1a202c">
      <h2 style="margin:0 0 8px">Redefinição de senha</h2>
      <p style="color:#4a5568;margin:0 0 24px;line-height:1.6">
        Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Linguesc</strong>.
        Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.
      </p>
      <a href="${link}"
         style="display:inline-block;background:#16a34a;color:#fff;font-weight:600;
                padding:12px 28px;border-radius:12px;text-decoration:none;margin-bottom:24px">
        Redefinir minha senha
      </a>
      <p style="color:#718096;font-size:13px;margin:0;line-height:1.6">
        Se você não solicitou a redefinição de senha, pode ignorar este e-mail com segurança.<br>
        Dúvidas? Entre em contato com o professor ou coordenador do curso.
      </p>
    </div>
  `
}
