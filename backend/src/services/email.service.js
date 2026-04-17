const nodemailer = require("nodemailer");

let transporterPromise = null;

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM || user;
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;

  if (!host || !port || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    from,
  };
}

async function getTransporter() {
  const smtpConfig = getSmtpConfig();

  if (!smtpConfig) {
    return null;
  }

  if (!transporterPromise) {
    transporterPromise = (async () => {
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: smtpConfig.auth,
      });

      await transporter.verify();
      return transporter;
    })().catch((error) => {
      transporterPromise = null;
      throw error;
    });
  }

  return transporterPromise;
}

function buildPasswordResetEmail({ resetUrl, expiresInMinutes }) {
  return {
    subject: "BudgetFit - Dat lai mat khau",
    text: [
      "Ban da yeu cau dat lai mat khau cho tai khoan BudgetFit.",
      "",
      `Mo lien ket sau de dat lai mat khau: ${resetUrl}`,
      "",
      `Lien ket nay se het han sau ${expiresInMinutes} phut.`,
      "Neu ban khong yeu cau dat lai mat khau, hay bo qua email nay.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 16px">Dat lai mat khau BudgetFit</h2>
        <p style="margin:0 0 16px">Ban da yeu cau dat lai mat khau cho tai khoan BudgetFit.</p>
        <p style="margin:0 0 24px">
          <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#16a34a;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600">
            Dat lai mat khau
          </a>
        </p>
        <p style="margin:0 0 8px">Hoac mo truc tiep lien ket nay:</p>
        <p style="margin:0 0 24px;word-break:break-all">
          <a href="${resetUrl}" style="color:#2563eb">${resetUrl}</a>
        </p>
        <p style="margin:0 0 8px">Lien ket nay se het han sau ${expiresInMinutes} phut.</p>
        <p style="margin:0">Neu ban khong yeu cau dat lai mat khau, hay bo qua email nay.</p>
      </div>
    `,
  };
}

async function sendPasswordResetEmail({ to, resetUrl, expiresInMinutes }) {
  const smtpConfig = getSmtpConfig();
  const transporter = await getTransporter();

  if (!smtpConfig || !transporter) {
    const error = new Error("SMTP is not configured");
    error.code = "SMTP_NOT_CONFIGURED";
    throw error;
  }

  const message = buildPasswordResetEmail({ resetUrl, expiresInMinutes });

  await transporter.sendMail({
    from: smtpConfig.from,
    to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
}

module.exports = {
  getSmtpConfig,
  sendPasswordResetEmail,
};
