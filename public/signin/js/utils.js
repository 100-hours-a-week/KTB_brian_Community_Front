// 순수 유틸 + 정규식
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PW_RE    = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,20}$/;

export const hasWhitespace = (s) => /\s/.test(s || '');
export const withinLen     = (s, max) => (s || '').length <= max;

// 공통 FormData 빌더
export function buildFormData({ email, password, nickname, file }) {
  const fd = new FormData();
  fd.append('email', email.trim());
  fd.append('password', password);
  fd.append('nickname', nickname.trim());
  if (file) fd.append('file', file, file.name);
  return fd;
}
