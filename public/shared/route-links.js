import { ROUTES } from './paths.js';

function applyRouteLinks() {
  document.querySelectorAll('[data-route]').forEach((el) => {
    const key = el.getAttribute('data-route');
    if (!key) return;
    const href = ROUTES[key];
    if (href) {
      el.setAttribute('href', href);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyRouteLinks, { once: true });
} else {
  applyRouteLinks();
}
