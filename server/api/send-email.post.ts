import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

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
    to: body.to,
    subject: body.subject,
    html: body.html,
    })

  return { success: true }
})