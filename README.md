# Aprimore Landing Page

Landing page de captura de leads integrada com Resend pela rota serverless `/api/send-lead`.

## Variaveis de ambiente

Configure estas variaveis no ambiente de deploy:

```env
RESEND_API_KEY=re_sua_chave
LEAD_TO_EMAIL=destino@seudominio.com
RESEND_FROM_EMAIL=Aprimore <leads@seudominio.com>
```

Use um remetente de dominio verificado na Resend para producao.

## Deploy

A estrutura esta pronta para Vercel:

- `index.html`, `styles.css`, `script.js` e `assets/` servem a landing page.
- `api/send-lead.js` recebe o formulario e envia o email pela Resend.

Depois de publicar, teste o formulario pela URL final do site.
