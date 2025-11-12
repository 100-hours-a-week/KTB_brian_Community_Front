// api.js
import { LOGIN_URL } from './config.js';
import { jsonFetch, getCookie } from './utils.js';

export async function loginRequest({ email, password }) {
  const res = await jsonFetch(LOGIN_URL, {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), password }),
  });
  return res;
}

/** 인증이 필요한 fetch에서 사용할 헤더 빌더 */
export function authHeaders(base = {}) {
  const token = getCookie('accessToken');
  const type  = getCookie('tokenType') || 'Bearer';
  return token ? { ...base, Authorization: `${type} ${token}` } : base;
}

/** 사용 예시
fetch('/secure/api', { headers: authHeaders({ Accept: 'application/json' }) })
*/
