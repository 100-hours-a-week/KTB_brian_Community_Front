// 이메일/닉네임 중복 확인 (디바운스 + Abort + 409 처리)
import { USER_AVAILABILITY_URL } from './config.js';

function makeAvailabilityChecker(paramKey) {
  let timer = null;
  let controller = null;
  return (value, cb) => {
    clearTimeout(timer);
    if (controller) controller.abort();
    if (!value) { cb({ ok:false, duplicate:false, reason:'empty' }); return; }

    timer = setTimeout(async () => {
      try {
        controller = new AbortController();
        const url = `${USER_AVAILABILITY_URL}?${paramKey}=` + encodeURIComponent(value);
        const res = await fetch(url, { signal: controller.signal });

        if (res.status === 409) { cb({ ok:true, duplicate:true, status:409 }); return; }

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const available = typeof data.available === 'boolean' ? data.available : true;
          cb({ ok:true, duplicate: available === false, status:res.status });
          return;
        }

        cb({ ok:false, duplicate:false, status:res.status, reason:'http' });
      } catch (e) {
        if (e.name === 'AbortError') return;
        cb({ ok:false, duplicate:false, reason:'network' });
      }
    }, 300);
  };
}

export const checkEmailDup = makeAvailabilityChecker('email');
export const checkNickDup  = makeAvailabilityChecker('nickname');
