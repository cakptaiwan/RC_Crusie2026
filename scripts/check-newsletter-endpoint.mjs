// 對本機 wrangler pages dev（或任何已啟動的建置產物）驗證 /api/newsletter/。
// 只送「無效 email」，端點會在呼叫 Resend 前回應，不會寄信。
//   node scripts/check-newsletter-endpoint.mjs [BASE_URL]   預設 http://127.0.0.1:4412
const base = (process.argv[2] ?? 'http://127.0.0.1:4412').replace(/\/$/, '');
const url = `${base}/api/newsletter/`;
const origin = new URL(base).origin;
const INVALID = '請輸入有效的 Email';
const BAD_FORMAT = '送出格式不正確，請重新整理後再試。';

async function post(label, init) {
  const res = await fetch(url, { method: 'POST', ...init, headers: { Origin: origin, ...init.headers } });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* 非 JSON */ }
  return { label, status: res.status, json, text };
}

function multipart(email) {
  const fd = new FormData();
  fd.append('email', email);
  return { body: fd };
}

const cases = [
  { run: () => post('JSON 無效 email', { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'not-an-email' }) }), status: 400, error: INVALID },
  { run: () => post('JSON 缺 email 欄位', { headers: { 'Content-Type': 'application/json' }, body: '{}' }), status: 400, error: INVALID },
  { run: () => post('JSON email 不是字串', { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 123 }) }), status: 400, error: INVALID },
  { run: () => post('JSON 內容是 null', { headers: { 'Content-Type': 'application/json' }, body: 'null' }), status: 400, error: INVALID },
  { run: () => post('JSON 壞掉', { headers: { 'Content-Type': 'application/json' }, body: '{oops' }), status: 400, error: BAD_FORMAT },
  { run: () => post('FormData 無效 email', multipart('not-an-email')), status: 400, error: INVALID },
  { run: () => post('FormData 缺 email 欄位', { body: new FormData() }), status: 400, error: INVALID },
  { run: () => post('無效 Content-Type（text/plain）', { headers: { 'Content-Type': 'text/plain' }, body: 'email=x' }), status: [400, 403] },
];

let failed = 0;
for (const c of cases) {
  const r = await c.run();
  const okStatus = Array.isArray(c.status) ? c.status.includes(r.status) : r.status === c.status;
  const okError = c.error ? r.json?.error === c.error : true;
  const pass = okStatus && okError;
  if (!pass) failed += 1;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${r.label} -> ${r.status} ${r.json ? 'JSON' : 'TEXT'} ${r.json?.error ?? r.text.slice(0, 60)}`);
}
console.log(failed === 0 ? '\nALL PASSED' : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
