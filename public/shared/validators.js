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

export function validateNicknameValue(value, { maxLength = 10 } = {}) {
  const trimmed = (value || '').trim();
  if (!trimmed) return { valid: false, reason: 'required' };
  if (hasWhitespace(trimmed)) return { valid: false, reason: 'whitespace' };
  if (!withinLen(trimmed, maxLength))
    return { valid: false, reason: 'length', limit: maxLength };
  return { valid: true, value: trimmed };
}

// ===== 필드 단위 검증 + 헬퍼 제어 =====
export function validateEmailField({
  value,
  showMsg = false,
  fieldEl,
  helpEl,
  setHelper,
}) {
  const result = validateEmailValue(value);
  if (!result.valid) {
    if (showMsg && setHelper) {
      const msg =
        result.reason === 'pattern'
          ? '*올바른 이메일 주소 형식을 입력해주세요.'
          : '*이메일을 입력해주세요.';
      setHelper(fieldEl, helpEl, msg, 'error');
    }
    return false;
  }
  if (showMsg && setHelper) setHelper(fieldEl, helpEl, null, null);
  return true;
}

export function validatePasswordField({
  value,
  showMsg = false,
  fieldEl,
  helpEl,
  setHelper,
  minLength = 8,
  maxLength = 20,
  pattern = PW_RE,
}) {
  const result = validatePasswordValue(value, { minLength, maxLength, pattern });
  if (!result.valid) {
    if (showMsg && setHelper) {
      let msg = '*비밀번호를 입력해주세요';
      if (
        result.reason === 'min' ||
        result.reason === 'max' ||
        result.reason === 'pattern'
      ) {
        msg = '*8~20자, 대문자·소문자·숫자·특수문자 각각 1개 이상 포함해야 합니다.';
      }
      setHelper(fieldEl, helpEl, msg, 'error');
    }
    return false;
  }
  if (showMsg && setHelper) setHelper(fieldEl, helpEl, null, null);
  return true;
}

export function validatePasswordConfirmField({
  value,
  confirmValue,
  showMsg = false,
  fieldEl,
  helpEl,
  setHelper,
}) {
  if (!confirmValue) {
    if (showMsg && setHelper) {
      setHelper(fieldEl, helpEl, '*비밀번호를 한 번 더 입력해주세요', 'error');
    }
    return false;
  }
  if (value !== confirmValue) {
    if (showMsg && setHelper) {
      setHelper(fieldEl, helpEl, '*비밀번호가 다릅니다', 'error');
    }
    return false;
  }
  if (showMsg && setHelper) setHelper(fieldEl, helpEl, null, null);
  return true;
}

export function validateNicknameField({
  value,
  showMsg = false,
  fieldEl,
  helpEl,
  setHelper,
  maxLength = 10,
}) {
  const result = validateNicknameValue(value, { maxLength });
  if (!result.valid) {
    if (showMsg && setHelper) {
      let msg = '*닉네임을 입력해주세요';
      if (result.reason === 'whitespace') msg = '*띄어쓰기를 없애주세요';
      if (result.reason === 'length') msg = `*닉네임은 최대 ${maxLength}자까지 작성 가능합니다`;
      setHelper(fieldEl, helpEl, msg, 'error');
    }
    return false;
  }
  if (showMsg && setHelper) setHelper(fieldEl, helpEl, null, null);
  return true;
}

export function validateTitleField({
  value,
  showMsg = false,
  fieldEl,
  helpEl,
  setHelper,
  maxLength = 26,
}) {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    if (showMsg && setHelper) {
      setHelper(fieldEl, helpEl, '*제목을 입력해주세요.', 'error');
    }
    return false;
  }
  if (trimmed.length > maxLength) {
    if (showMsg && setHelper) {
      setHelper(fieldEl, helpEl, `*제목은 최대 ${maxLength}자까지 가능합니다.`, 'error');
    }
    return false;
  }
  if (showMsg && setHelper) setHelper(fieldEl, helpEl, null, null);
  return true;
}

export function validateBodyField({
  value,
  showMsg = false,
  fieldEl,
  helpEl,
  setHelper,
}) {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    if (showMsg && setHelper) {
      setHelper(fieldEl, helpEl, '*내용을 입력해주세요.', 'error');
    }
    return false;
  }
  if (showMsg && setHelper) setHelper(fieldEl, helpEl, null, null);
  return true;
}

export function validateProfileField({
  hasImage,
  showMsg = false,
  setProfileHelper,
}) {
  const ok = Boolean(hasImage);
  if (!ok && showMsg && setProfileHelper) setProfileHelper(true);
  if (ok && setProfileHelper) setProfileHelper(false);
  return ok;
}

// ===== Validator creator (컨텍스트 캡처) =====
export function makeEmailValidator(ctx) {
  return ({ showMsg = false } = {}) =>
    validateEmailField({ ...ctx, value: ctx.inputEl?.value, showMsg });
}

export function makePasswordValidator(ctx) {
  return ({ showMsg = false } = {}) =>
    validatePasswordField({ ...ctx, value: ctx.inputEl?.value, showMsg });
}

export function makePasswordConfirmValidator(ctx) {
  return ({ showMsg = false } = {}) =>
    validatePasswordConfirmField({
      ...ctx,
      value: ctx.passwordInputEl?.value,
      confirmValue: ctx.confirmInputEl?.value,
      showMsg,
    });
}

export function makeNicknameValidator(ctx) {
  return ({ showMsg = false } = {}) =>
    validateNicknameField({ ...ctx, value: ctx.inputEl?.value, showMsg });
}

export function makeTitleValidator(ctx) {
  return ({ showMsg = false } = {}) =>
    validateTitleField({ ...ctx, value: ctx.inputEl?.value, showMsg });
}

export function makeBodyValidator(ctx) {
  return ({ showMsg = false } = {}) =>
    validateBodyField({ ...ctx, value: ctx.inputEl?.value, showMsg });
}

export function makeProfileValidator({ hasImageFn, setProfileHelper }) {
  return ({ showMsg = false } = {}) =>
    validateProfileField({
      hasImage: hasImageFn?.(),
      showMsg,
      setProfileHelper,
    });
}
