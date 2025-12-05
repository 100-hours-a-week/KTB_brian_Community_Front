import { LOGIN_URL } from '../config/config.js';

// 단순 쿠키 읽기 헬퍼 (document.cookie 기반)
function getCookie(name) {
  const m = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

// Authorization 헤더를 쿠키 기반으로 주입
export function authHeaders(base = {}) {
  const token = getCookie('accessToken');
  const type = getCookie('tokenType') || 'Bearer';
  return token ? { ...base, Authorization: `${type} ${token}` } : base;
}

// 로그인 요청
export function loginRequest({ email, password }) {
  return fetch(LOGIN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: (email || '').trim(), password }),
    credentials: 'include',
  });
}
