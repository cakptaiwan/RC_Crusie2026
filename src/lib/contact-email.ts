export interface ContactFormPayload {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

export function buildContactEmailHtml(payload: ContactFormPayload): string {
  const { name, phone, email, subject, message } = payload;
  const submittedAt = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <title>皇家旅人聯絡表單</title>
</head>
<body style="margin:0;padding:24px;background:#F8FAFC;font-family:'Segoe UI',system-ui,sans-serif;color:#1E2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(6,21,86,0.08);">
    <tr>
      <td style="padding:24px 28px;background:#061556;color:#FFFFFF;">
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.75;">Royal Cruiser</p>
        <h1 style="margin:0;font-size:22px;font-weight:600;">新的聯絡表單訊息</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:28px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:15px;line-height:1.7;">
          <tr><td style="padding:8px 0;color:#64748B;width:96px;vertical-align:top;">姓名</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:8px 0;color:#64748B;vertical-align:top;">聯絡電話</td><td style="padding:8px 0;">${escapeHtml(phone)}</td></tr>
          <tr><td style="padding:8px 0;color:#64748B;vertical-align:top;">電子郵件</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#0073BB;text-decoration:none;">${escapeHtml(email)}</a></td></tr>
          <tr><td style="padding:8px 0;color:#64748B;vertical-align:top;">主題</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(subject)}</td></tr>
          <tr><td style="padding:8px 0;color:#64748B;vertical-align:top;">送出時間</td><td style="padding:8px 0;">${escapeHtml(submittedAt)}</td></tr>
        </table>
        <div style="margin-top:20px;padding:18px 20px;border-radius:12px;background:#F8FAFC;border:1px solid #E8EEF4;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#061556;">留言內容</p>
          <p style="margin:0;white-space:pre-wrap;font-size:15px;line-height:1.8;color:#334155;">${escapeHtml(message)}</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
