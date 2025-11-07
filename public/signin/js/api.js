import { USER_DOMAIN_URL } from './config.js';

// 회원가입 전송 (FormData)
export async function submitSignIn(fd) {
  const res = await fetch(USER_DOMAIN_URL, {
    method: 'POST',
    body: fd,
    headers: { 'Accept': 'application/json' }
  });
  return res;
}
