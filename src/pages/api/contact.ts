import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { getSecret, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } from 'astro:env/server';
import { buildContactEmailHtml } from '../../lib/contact-email';

export const prerender = false;

interface ContactRequestBody {
  name?: string;
  phone?: string;
  email?: string;
  subject?: string;
  message?: string;
  website?: string;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function normalizeField(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = getSecret('RESEND_API_KEY');
  const toEmail = CONTACT_TO_EMAIL;
  const fromEmail = CONTACT_FROM_EMAIL ?? 'Royal Cruiser <onboarding@resend.dev>';

  if (!apiKey || !toEmail) {
    console.error('[contact] Missing env:', {
      hasApiKey: !!apiKey,
      hasToEmail: !!toEmail,
    });
    return jsonResponse(
      { ok: false, error: '聯絡表單服務尚未完成設定，請稍後再試。' },
      503
    );
  }

  let body: ContactRequestBody;
  try {
    body = (await request.json()) as ContactRequestBody;
  } catch {
    return jsonResponse({ ok: false, error: '送出格式不正確，請重新整理後再試。' }, 400);
  }

  if (body.website) {
    return jsonResponse({ ok: true, message: '訊息已送出，感謝你的聯絡！' });
  }

  const name = normalizeField(body.name, 80);
  const phone = normalizeField(body.phone, 40);
  const email = normalizeField(body.email, 120);
  const subject = normalizeField(body.subject, 120);
  const message = normalizeField(body.message, 5000);

  if (!name || !phone || !email || !subject || !message) {
    return jsonResponse({ ok: false, error: '請完整填寫所有欄位。' }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ ok: false, error: '請輸入有效的電子郵件地址。' }, 400);
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: `[皇家旅人聯絡表單] ${subject}`,
      html: buildContactEmailHtml({ name, phone, email, subject, message }),
    });

    if (error) {
      console.error('[contact] Resend error:', error);
      return jsonResponse(
        { ok: false, error: '訊息送出失敗，請稍後再試或直接寄信聯絡我們。' },
        502
      );
    }

    return jsonResponse({ ok: true, message: '訊息已送出，感謝你的聯絡！我們會盡快回覆。' });
  } catch (err) {
    console.error('[contact] Unexpected error:', err);
    return jsonResponse(
      { ok: false, error: '系統暫時無法處理，請稍後再試。' },
      500
    );
  }
};
