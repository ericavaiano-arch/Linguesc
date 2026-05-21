export function templateAlertaFrequencia(nome: string, turma: string, frequencia: number, meta: number, appUrl: string, faltasDisponiveis: number) {
  const mensagemFaltas = faltasDisponiveis === 0
    ? `Você não pode mais faltar nesta turma.`
    : `Você ainda pode faltar apenas <strong>${faltasDisponiveis}</strong> aula(s).`

  
  return `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee;">
    <div style="background:#15803d;padding:2rem 2.5rem 1.5rem;">
      <span style="font-size:22px;font-weight:700;color:#fff;">Linguesc<span style="color:#bbf7d0;"></span></span>
    </div>
    <div style="padding:2rem 2.5rem;">
      <p style="font-size:20px;color:#14532d;font-weight:600;margin:0 0 .75rem;">Olá, ${nome}</p>
      <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 .5rem;">Sua frequência na turma <strong>${turma}</strong> está abaixo do mínimo exigido.</p>
      <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 1.5rem;">${mensagemFaltas}</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:1.5rem;margin:0 0 1.5rem;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="90" valign="middle" style="padding-right:1.5rem;">
              <table width="88" height="88" cellpadding="0" cellspacing="0" border="0" style="border-radius:50%;border:4px solid #15803d;background:#fff;">
                <tr>
                  <td align="center" valign="middle">
                    <span style="font-size:22px;font-weight:700;color:#15803d;display:block;line-height:1.2;">${frequencia}%</span>
                    <span style="font-size:11px;color:#16a34a;display:block;">atual</span>
                  </td>
                </tr>
              </table>
            </td>
            <td valign="middle">
              <p style="margin:0;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:.5px;">Turma</p>
              <p style="margin:4px 0;font-size:16px;font-weight:600;color:#14532d;">${turma}</p>
              <p style="margin:0;font-size:13px;color:#166534;">⚠ Mínimo exigido: ${meta}%</p>
            </td>
          </tr>
        </table>
      </div>
      <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 1.5rem;">Justifique faltas, acompanhe sua turma e presença diretamente pelo sistema.</p>
      <div style="text-align:center;">
        <a href="${appUrl}" style="display:inline-block;background:#15803d;color:#fff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">Acessar o sistema →</a>
      </div>
    </div>
    <div style="border-top:1px solid #eee;padding:1.25rem 2.5rem;background:#f0fdf4;">
      <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">Este é um e-mail automático do sistema Linguesc. Por favor, não responda.<br>© 2026 Linguesc — UDESC</p>
    </div>
  </div>`
}

export function templateLembreteAula(nome: string, turma: string, sala: string, professor: string, data: string, appUrl: string) {
  return `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee;">
    <div style="background:#15803d;padding:2rem 2.5rem;">
      <span style="font-size:22px;font-weight:700;color:#fff;">Linguesc<span style="color:#bbf7d0;"> - Lembrete de aula</span></span>
    </div>
    <div style="padding:2rem 2.5rem;">
      <p style="font-size:20px;color:#14532d;font-weight:600;margin:0 0 0.75rem;">Olá, ${nome} 👋</p>
      <p style="font-size:15px;color:#555;line-height:1.7;">Você tem aula <strong>hoje</strong>! Confira os detalhes abaixo.</p>
      <div style="border:1px solid #bbf7d0;border-radius:10px;overflow:hidden;margin:1.5rem 0;">
        <div style="background:#dcfce7;padding:1rem 1.25rem;border-bottom:1px solid #bbf7d0;">
          <p style="margin:0;font-size:11px;color:#166534;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Detalhes da aula</p>
        </div>
        <div style="padding:0;">
          <div style="padding:1rem 1.25rem;border-bottom:0.5px solid #e5e7eb;"><span style="font-size:12px;color:#999;">📅 Data</span><br><span style="font-size:15px;color:#14532d;font-weight:500;">${data}</span></div>
          <div style="padding:1rem 1.25rem;border-bottom:0.5px solid #e5e7eb;"><span style="font-size:12px;color:#999;">📖 Turma</span><br><span style="font-size:15px;color:#14532d;font-weight:500;">${turma}</span></div>
          <div style="padding:1rem 1.25rem;border-bottom:0.5px solid #e5e7eb;"><span style="font-size:12px;color:#999;">🏠 Sala</span><br><span style="font-size:15px;color:#14532d;font-weight:500;">${sala}</span></div>
          <div style="padding:1rem 1.25rem;"><span style="font-size:12px;color:#999;">🎓 Professor</span><br><span style="font-size:15px;color:#14532d;font-weight:500;">${professor}</span></div>
        </div>
      </div>
      <p style="font-size:15px;color:#555;">Sua presença é muito importante. Até logo! Para mais informações, acesse o sistema.</p>
      <div style="text-align:center;margin:1.5rem 0;">
        <a href="${appUrl}" style="display:inline-block;background:#15803d;color:#fff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">Acessar o sistema →</a>
      </div>
    </div>
    <div style="border-top:1px solid #eee;padding:1.25rem 2.5rem;background:#f0fdf4;">
      <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">Este é um e-mail automático do sistema Linguesc. Por favor, não responda.<br>© 2026 Linguesc — UDESC</p>
    </div>
  </div>`
}