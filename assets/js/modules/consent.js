// Cookie consent: a small bar, the choice stored in localStorage (try/catch), reopened from the footer. Fires "hears:consent".
import { watchBar, releaseBar } from './overlay.js';
const lang = document.documentElement.lang === 'vi' ? 'vi' : 'en';
const T = {
  en: { text: 'We use cookies for anonymous visit statistics only if you agree. Strictly necessary storage keeps the site working.', accept: 'Accept', decline: 'Decline', more: 'Cookie policy' },
  vi: { text: 'Chúng tôi chỉ dùng cookie thống kê lượt truy cập ẩn danh khi Quý khách đồng ý. Lưu trữ cần thiết giúp website hoạt động.', accept: 'Đồng ý', decline: 'Từ chối', more: 'Chính sách cookie' },
}[lang];
const KEY = 'hears-consent';
const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const write = (v) => { try { localStorage.setItem(KEY, v); } catch { /* storage blocked */ } };
const emit = (v) => document.dispatchEvent(new CustomEvent('hears:consent', { detail: v }));
function show() {
  const old = document.querySelector('.consent'); if (old) releaseBar(old);
  const link = document.querySelector('[data-cookie-link]');
  const bar = document.createElement('div'); bar.className = 'consent'; bar.setAttribute('role', 'dialog'); bar.setAttribute('aria-label', T.more);
  bar.innerHTML = `<p>${T.text} ${link ? `<a href="${link.getAttribute('href')}">${T.more}</a>` : ''}</p><button class="btn btn--light" type="button" data-choice="granted">${T.accept}</button><button class="btn btn--outline-light" type="button" data-choice="denied">${T.decline}</button>`;
  bar.addEventListener('click', (e) => { const b = e.target.closest('[data-choice]'); if (!b) return; write(b.dataset.choice); emit(b.dataset.choice); releaseBar(bar); });
  document.body.appendChild(bar); watchBar(bar);
}
const stored = read();
if (stored) emit(stored); else show();
document.querySelectorAll('[data-consent-open]').forEach((b) => b.addEventListener('click', show));
