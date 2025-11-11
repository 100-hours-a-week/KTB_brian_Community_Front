export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PW_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,20}$/;

export function validateEmailValue(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) return { valid: false, reason: 'required' };
  if (!EMAIL_RE.test(trimmed)) return { valid: false, reason: 'pattern' };
  return { valid: true, value: trimmed };
}

export function validatePasswordValue(
  value,
  { minLength = 8, maxLength, pattern } = {},
) {
  const raw = value || '';
  if (!raw) return { valid: false, reason: 'required' };
  if (minLength && raw.length < minLength)
    return { valid: false, reason: 'min', limit: minLength };
  if (maxLength && raw.length > maxLength)
    return { valid: false, reason: 'max', limit: maxLength };
  if (pattern && !pattern.test(raw))
    return { valid: false, reason: 'pattern' };
  return { valid: true, value: raw };
}

export function hasWhitespace(value) {
  return /\s/.test(value || '');
}

export function withinLen(value, max) {
  return (value || '').length <= max;
}
