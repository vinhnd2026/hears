// Analytics loads ONLY after consent, and only when data/site.json sets analytics.provider and analytics.id (the build adds the meta tag).
const meta = document.querySelector('meta[name="hears-analytics"]');
let loaded = false;
function load(provider, id) {
  if (loaded) return; loaded = true;
  if (provider === 'ga4') {
    const s = document.createElement('script'); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', id, { anonymize_ip: true });
  } else if (provider === 'cloudflare') {
    const s = document.createElement('script'); s.defer = true; s.src = 'https://static.cloudflareinsights.com/beacon.min.js'; s.setAttribute('data-cf-beacon', JSON.stringify({ token: id })); document.head.appendChild(s);
  }
}
if (meta) {
  const [provider, id] = meta.content.split(':');
  let granted = false;
  document.addEventListener('hears:consent', (e) => { granted = e.detail === 'granted'; if (granted) load(provider, id); });
  document.addEventListener('hears:event', (e) => { if (granted && provider === 'ga4' && window.gtag) window.gtag('event', e.detail.name, e.detail.params || {}); });
}
