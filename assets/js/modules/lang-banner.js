import { watchBar, releaseBar } from './overlay.js';
// A polite hint (never a redirect) when the browser language differs from the page language.
const pageLang = document.documentElement.lang === 'vi' ? 'vi' : 'en';
const prefers = (navigator.language || '').toLowerCase().startsWith('vi') ? 'vi' : 'en';
const KEY = 'hears-lang-hint';
const dismissed = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };
const twin = document.querySelector('.lang-switch a[hreflang]');
if (pageLang !== prefers && twin && !dismissed()) {
  const T = { vi: { text: 'This page is also available in English.', go: 'Switch to English', close: 'Close' }, en: { text: 'Trang này có bản tiếng Việt.', go: 'Chuyển sang tiếng Việt', close: 'Đóng' } }[pageLang];
  const bar = document.createElement('div'); bar.className = 'langbar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Language');
  bar.innerHTML = `<p lang="${prefers}">${T.text}</p><a class="btn btn--light" href="${twin.getAttribute('href')}" hreflang="${prefers}">${T.go}</a><button class="btn btn--outline-light" type="button">${T.close}</button>`;
  bar.querySelector('button').addEventListener('click', () => { try { localStorage.setItem(KEY, '1'); } catch { /* ignore */ } releaseBar(bar); });
  document.body.appendChild(bar); watchBar(bar);
}
