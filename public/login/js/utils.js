// utils.js
export function jsonFetch(url, options = {}) {
  return fetch(url, {
    headers: { 'Accept':'application/json', 'Content-Type':'application/json', ...(options.headers||{}) },
    ...options,
  });
}

/* === Cookie helpers === */
export function setCookie(name, value, {
  maxAge,                  // seconds
  path = '/',
  sameSite = 'Lax',
  secure = (location.protocol === 'https:') // HTTPS일 때만 Secure 사용
} = {}) {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}`;
  if (typeof maxAge === 'number') cookie += `; Max-Age=${Math.max(0, Math.floor(maxAge))}`;
  if (secure) cookie += '; Secure';
  document.cookie = cookie;
}

export function getCookie(name) {
  const m = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}
