const RESEND_ENDPOINT = "https://api.resend.com/emails";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getBody(req) {
  if (typeof req.body === "object" && req.body !== null) {
    return req.body;
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return {};
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Metodo nao permitido." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_TO_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    return res.status(500).json({
      message: "Configuracao de email incompleta.",
    });
  }

  const body = getBody(req);
  const nome = String(body.nome || "").trim();
  const whatsapp = String(body.whatsapp || "").trim();
  const email = String(body.email || "").trim();
  const area = String(body.area || "").trim();
  const empresa = String(body.empresa || "").trim();

  if (empresa) {
    return res.status(200).json({ message: "Lead recebido." });
  }

  if (!nome || !whatsapp || !email || !area) {
    return res.status(400).json({
      message: "Preencha todos os campos obrigatorios.",
    });
  }

  const submittedAt = new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });

  const html = `
    <div style="font-family:Arial,sans-serif;color:#10252a;line-height:1.5">
      <h1 style="font-size:22px;margin:0 0 16px">Novo lead - Aprimore</h1>
      <p style="margin:0 0 18px">Um novo contato solicitou informacoes pela landing page.</p>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:560px">
        <tr><td style="padding:10px;border:1px solid #dde7e5"><strong>Nome</strong></td><td style="padding:10px;border:1px solid #dde7e5">${escapeHtml(nome)}</td></tr>
        <tr><td style="padding:10px;border:1px solid #dde7e5"><strong>WhatsApp</strong></td><td style="padding:10px;border:1px solid #dde7e5">${escapeHtml(whatsapp)}</td></tr>
        <tr><td style="padding:10px;border:1px solid #dde7e5"><strong>E-mail</strong></td><td style="padding:10px;border:1px solid #dde7e5">${escapeHtml(email)}</td></tr>
        <tr><td style="padding:10px;border:1px solid #dde7e5"><strong>Area de interesse</strong></td><td style="padding:10px;border:1px solid #dde7e5">${escapeHtml(area)}</td></tr>
        <tr><td style="padding:10px;border:1px solid #dde7e5"><strong>Enviado em</strong></td><td style="padding:10px;border:1px solid #dde7e5">${escapeHtml(submittedAt)}</td></tr>
      </table>
    </div>
  `;

  const text = [
    "Novo lead - Aprimore",
    "",
    `Nome: ${nome}`,
    `WhatsApp: ${whatsapp}`,
    `E-mail: ${email}`,
    `Area de interesse: ${area}`,
    `Enviado em: ${submittedAt}`,
  ].join("\n");

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: email,
        subject: `Novo lead Aprimore: ${nome}`,
        html,
        text,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(502).json({
        message: "Nao foi possivel enviar o lead.",
        details: result,
      });
    }

    return res.status(200).json({
      message: "Lead enviado com sucesso.",
      id: result.id,
    });
  } catch {
    return res.status(500).json({
      message: "Erro inesperado ao enviar o lead.",
    });
  }
};
