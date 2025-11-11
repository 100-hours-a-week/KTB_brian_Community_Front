export {
  EMAIL_RE,
  PW_RE,
  hasWhitespace,
  withinLen,
} from '../../shared/validators.js';

// 공통 FormData 빌더
export function buildFormData({ email, password, nickname, file }) {
  const fd = new FormData();
  fd.append('email', email.trim());
  fd.append('password', password);
  fd.append('nickname', nickname.trim());
  if (file) fd.append('file', file, file.name);
  return fd;
}
