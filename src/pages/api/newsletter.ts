import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { readRuntimeEnv } from '../../lib/runtime-env';

export const prerender = false;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = readRuntimeEnv('RESEND_API_KEY');
  const toEmail = readRuntimeEnv('CONTACT_TO_EMAIL');
  const fromEmail =
    readRuntimeEnv('CONTACT_FROM_EMAIL') ?? 'Royal Cruiser <onboarding@resend.dev>';

  if (!apiKey || !toEmail) {
    console.error('[newsletter] Missing env:', {
      hasApiKey: !!apiKey,
      hasToEmail: !!toEmail,
    });
    return jsonResponse({ ok: false, error: '訂閱服務尚未完成設定，請稍後再試。' }, 503);
  }

  let email: string;
  try {
    const formData = await request.formData();
    email = formData.get('email')?.toString().trim() ?? '';
  } catch {
    return jsonResponse({ ok: false, error: '送出格式不正確，請重新整理後再試。' }, 400);
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ ok: false, error: '請輸入有效的 Email' }, 400);
  }

  const subscribedAt = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: `📧 新訂閱者：${email}`,
      html: `<p>新訂閱者 Email：<strong>${email}</strong></p><p>時間：${subscribedAt}</p>`,
    });

    if (error) {
      console.error('[newsletter] Resend error:', error);
      return jsonResponse({ ok: false, error: '寄送失敗，請稍後再試' }, 502);
    }

    return jsonResponse({ ok: true, message: '訂閱成功！感謝你的支持。' });
  } catch (err) {
    console.error('[newsletter] Unexpected error:', err);
    return jsonResponse({ ok: false, error: '系統暫時無法處理，請稍後再試。' }, 500);
  }
};
