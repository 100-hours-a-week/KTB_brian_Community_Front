import { USER_AVAILABILITY_NICKNAME_URL } from '../../shared/config/config.js';

const DEBOUNCE_DELAY_MS = 300;

function makeAvailabilityChecker({ endpoint, paramKey }) {
  let timer = null;
  let controller = null;
  return (value, cb) => {
    clearTimeout(timer);
    if (controller) controller.abort();
    if (!value) {
      cb({ ok: false, duplicate: false, reason: 'empty' });
      return;
    }

    timer = setTimeout(async () => {
      try {
        controller = new AbortController();
        const url = `${endpoint}?${paramKey}=` + encodeURIComponent(value);
        const res = await fetch(url, { signal: controller.signal });

        if (res.status === 409) {
          cb({ ok: true, duplicate: true, status: 409 });
          return;
        }

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const available = typeof data.available === 'boolean' ? data.available : true;
          cb({ ok: true, duplicate: available === false, status: res.status });
          return;
        }

        cb({ ok: false, duplicate: false, status: res.status, reason: 'http' });
      } catch (e) {
        if (e.name === 'AbortError') return;
        cb({ ok: false, duplicate: false, reason: 'network' });
      }
    }, DEBOUNCE_DELAY_MS);
  };
}

export const checkNickDup = makeAvailabilityChecker({
  endpoint: USER_AVAILABILITY_NICKNAME_URL,
  paramKey: 'nickname',
});
