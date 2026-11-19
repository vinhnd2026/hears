// Fixed bottom bars (cookie consent, language hint) must never hide page content or each other: visible bars are stacked
// (consent nearest the bottom edge) and, while any is visible, the page gets extra bottom padding equal to the whole stack
// (measured, so it follows text wrapping at any width). Everything is removed again with the bars.
const SELECTOR = '.consent, .langbar';
const GAP = 8;
let ro = null;
export function reserveSpace() {
  const bars = [...document.querySelectorAll(SELECTOR)].filter((b) => !b.hidden && b.isConnected && getComputedStyle(b).display !== 'none')
    .sort((a, b) => (a.classList.contains('consent') ? 0 : 1) - (b.classList.contains('consent') ? 0 : 1));
  const root = document.documentElement;
  if (!bars.length) { document.body.classList.remove('has-overlay'); root.style.removeProperty('--overlay-h'); return; }
  let offset = 0;
  for (const b of bars) { b.style.setProperty('--stack', `${offset}px`); offset += Math.ceil(b.getBoundingClientRect().height) + GAP; }
  root.style.setProperty('--overlay-h', `${offset - GAP}px`);
  document.body.classList.add('has-overlay');
}
export function watchBar(bar) {
  if (typeof ResizeObserver === 'function') { ro = ro || new ResizeObserver(() => reserveSpace()); ro.observe(bar); }
  reserveSpace();
}
export function releaseBar(bar) { if (ro) ro.unobserve(bar); bar.remove(); reserveSpace(); }
window.addEventListener('resize', () => reserveSpace(), { passive: true });
