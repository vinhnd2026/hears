// HearS site script (no dependencies): menu, solutions dropdown, quote forms. Modules add consent, analytics, language hint and project filters.
import './modules/consent.js';
import './modules/analytics.js';
import './modules/lang-banner.js';
import './modules/projects.js';

const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });
}
const subs = [...document.querySelectorAll('.sub-toggle')];
const closeSubs = (except) => subs.forEach((b) => { if (b !== except) b.setAttribute('aria-expanded', 'false'); });
subs.forEach((b) => b.addEventListener('click', () => { const open = b.getAttribute('aria-expanded') === 'true'; closeSubs(b); b.setAttribute('aria-expanded', String(!open)); }));
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const open = subs.find((b) => b.getAttribute('aria-expanded') === 'true');
  closeSubs(); if (open) open.focus();
  if (toggle && nav && nav.classList.contains('is-open')) { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
});
document.addEventListener('click', (e) => { if (!e.target.closest('.has-sub')) closeSubs(); });

const API = '/api/inquiry';
document.querySelectorAll('form.quote-form').forEach((form) => {
  const started = Date.now();
  const status = form.querySelector('.form-status');
  const q = new URLSearchParams(location.search);
  for (const k of ['division', 'type']) { const sel = form.querySelector(`select[name="${k}"]`); const v = q.get(k); if (sel && v && [...sel.options].some((o) => o.value === v)) sel.value = v; }
  const divSel = form.querySelector('select[name="division"]');
  // parts shown only for one division (farm fields, the Dak Lak branch note)
  const syncFarm = () => { if (!divSel) return; form.querySelectorAll('[data-division]').forEach((part) => { const on = divSel.value === part.dataset.division; part.hidden = !on; part.querySelectorAll('input, select').forEach((el) => { el.disabled = !on; }); }); };
  if (divSel) { divSel.addEventListener('change', syncFarm); syncFarm(); }
  const say = (msg, ok) => { if (status) { status.textContent = msg; status.dataset.state = ok ? 'ok' : 'error'; } };
  const mailto = (data) => {
    const body = Object.entries(data).filter(([k, v]) => v !== '' && !['website', 'ts', 'elapsed_ms'].includes(k)).map(([k, v]) => `${k}: ${v}`).join('\n');
    let routes = {}; try { routes = JSON.parse(form.dataset.routes || '{}'); } catch (e) { routes = {}; }
    const to = routes[data.division] || form.dataset.mailto; // agriculture -> Dak Lak branch inbox
    const url = `mailto:${to}?subject=${encodeURIComponent('HearS enquiry' + (data.division ? ' – ' + data.division : ''))}&body=${encodeURIComponent(body)}`;
    document.dispatchEvent(new CustomEvent('hears:mailto', { detail: { url } }));
    window.location.href = url;
  };
  const done = (data, button) => { document.dispatchEvent(new CustomEvent('hears:event', { detail: { name: data.type === 'project' ? 'project_submit' : data.type === 'consultation' ? 'consult_submit' : 'rfq_submit' } })); form.reset(); syncFarm(); say(form.dataset.ok || 'OK', true); if (form.dataset.thanks) window.location.href = form.dataset.thanks; if (button) button.disabled = false; };
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.website) return; // honeypot: bots fill it
    if (!form.checkValidity()) { form.reportValidity(); return; }
    data.consent = form.querySelector('[name="consent"]')?.checked ? 'yes' : '';
    data.elapsed_ms = String(Date.now() - started);
    data.page = location.pathname; data.lang = document.documentElement.lang;
    const button = form.querySelector('button[type="submit"]'); if (button) button.disabled = true;
    // Static hosting (GitHub Pages preview): no /api/inquiry. POST to a configured endpoint (Apps Script web app, opaque no-cors
    // request), otherwise open the visitor's email app with every field filled in.
    if (form.dataset.mode === 'static') {
      if (form.dataset.endpoint) {
        try { await fetch(form.dataset.endpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) }); done(data, button); return; } catch (e) { /* fall back to email */ }
      }
      mailto(data); say(form.dataset.mailtoNote || '', true); if (button) button.disabled = false; return;
    }
    try {
      const res = await fetch(form.dataset.endpoint || API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.ok) { done(data, button); return; }
      if (res.status === 400 && out.errors) { say(Object.values(out.errors).join(' '), false); if (button) button.disabled = false; return; }
      mailto(data);
    } catch (e) { mailto(data); }
    if (button) button.disabled = false;
  });
});
document.querySelectorAll('a[href^="mailto:"]').forEach((a) => a.addEventListener('click', () => document.dispatchEvent(new CustomEvent('hears:event', { detail: { name: 'email_click' } }))));
document.querySelectorAll('.lang-switch a, .nav-lang a').forEach((a) => a.addEventListener('click', () => document.dispatchEvent(new CustomEvent('hears:event', { detail: { name: 'language_switch' } }))));
document.querySelectorAll('a[data-download]').forEach((a) => a.addEventListener('click', () => document.dispatchEvent(new CustomEvent('hears:event', { detail: { name: 'datasheet_download' } }))));
