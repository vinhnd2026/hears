// Project filters: the chips are hidden until this script runs, so without JavaScript all cards simply show.
const list = document.querySelector('[data-projects]');
const bar = document.querySelector('.filters');
if (list && bar) {
  bar.hidden = false;
  const cards = [...list.querySelectorAll('.project')];
  const state = { province: 'all', type: 'all', band: 'all' };
  const params = new URLSearchParams(location.search);
  for (const k of Object.keys(state)) if (params.has(k)) state[k] = params.get(k);
  const apply = () => {
    let n = 0;
    for (const c of cards) { const ok = (state.province === 'all' || c.dataset.province === state.province) && (state.type === 'all' || c.dataset.type === state.type) && (state.band === 'all' || c.dataset.band === state.band); c.hidden = !ok; if (ok) n++; }
    const out = bar.querySelector('[data-count]'); if (out) out.textContent = String(n);
    bar.querySelectorAll('[data-filter]').forEach((g) => g.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === state[g.dataset.filter]))));
    const q = new URLSearchParams(Object.entries(state).filter(([, v]) => v !== 'all')).toString();
    try { history.replaceState(null, '', q ? `?${q}` : location.pathname); } catch { /* ignore */ }
  };
  bar.addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (!b) return; state[b.closest('[data-filter]').dataset.filter] = b.dataset.value; apply(); });
  apply();
}
