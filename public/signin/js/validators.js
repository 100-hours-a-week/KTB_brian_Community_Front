// 동기 검증 + 비동기 중복검사 트리거
import { DOM } from './dom.js';
import { EMAIL_RE, PW_RE, hasWhitespace, withinLen } from './utils.js';
import { setFieldHelper, setProfileHelper } from './ui.js';
import { checkEmailDup, checkNickDup } from './availability.js';

// 프로필
export function validateProfile({ showMsg=false } = {}) {
  const ok = DOM.profileWrap.classList.contains('has-image');
  if (!ok && showMsg) setProfileHelper(true);
  if (ok) setProfileHelper(false);
  return ok;
}

// 이메일
export function validateEmailSync({ showMsg=false } = {}) {
  const v = (DOM.inputEmail.value || '').trim();
  if (!v) { if (showMsg) setFieldHelper(DOM.fieldEmail, DOM.helpEmail, '*이메일을 입력해주세요.', 'error'); return false; }
  if (v.length < 5 || !EMAIL_RE.test(v)) {
    if (showMsg) setFieldHelper(DOM.fieldEmail, DOM.helpEmail, '*올바른 이메일 주소 형식을 입력해주세요.(예: example@example.com)', 'error');
    return false;
  }
  if (showMsg) setFieldHelper(DOM.fieldEmail, DOM.helpEmail, null, null);
  return true;
}
export function validateEmailAsyncDup(onDone) {
  const v = (DOM.inputEmail.value || '').trim();
  checkEmailDup(v, (res) => {
    if (!res.ok) { setFieldHelper(DOM.fieldEmail, DOM.helpEmail, '이메일 중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.', 'warn'); onDone?.(); return; }
    if (res.duplicate) setFieldHelper(DOM.fieldEmail, DOM.helpEmail, '*중복된 이메일입니다.', 'error');
    else               setFieldHelper(DOM.fieldEmail, DOM.helpEmail, null, null);
    onDone?.();
  });
}

// 비밀번호
export function validatePasswordSync({ showMsg=false } = {}) {
  const v = DOM.inputPw.value || '';
  if (!v) { if (showMsg) setFieldHelper(DOM.fieldPw, DOM.helpPw, '*비밀번호를 입력해주세요', 'error'); return false; }
  if (!PW_RE.test(v)) {
    if (showMsg) setFieldHelper(DOM.fieldPw, DOM.helpPw, '*8~20자, 대문자·소문자·숫자·특수문자 각각 1개 이상 포함해야 합니다.', 'error');
    return false;
  }
  if (showMsg) setFieldHelper(DOM.fieldPw, DOM.helpPw, null, null);
  return true;
}

// 비밀번호 확인
export function validatePassword2Sync({ showMsg=false } = {}) {
  const v2 = DOM.inputPw2.value || '';
  const v1 = DOM.inputPw.value  || '';
  if (!v2) { if (showMsg) setFieldHelper(DOM.fieldPw2, DOM.helpPw2, '*비밀번호를 한 번 더 입력해주세요', 'error'); return false; }
  if (v2 !== v1) { if (showMsg) setFieldHelper(DOM.fieldPw2, DOM.helpPw2, '*비밀번호가 다릅니다', 'error'); return false; }
  if (showMsg) setFieldHelper(DOM.fieldPw2, DOM.helpPw2, null, null);
  return true;
}

// 닉네임
export function validateNicknameSync({ showMsg=false } = {}) {
  const v = DOM.inputNick.value || '';
  if (!v.trim())         { if (showMsg) setFieldHelper(DOM.fieldNick, DOM.helpNick, '*닉네임을 입력해주세요', 'error'); return false; }
  if (hasWhitespace(v))  { if (showMsg) setFieldHelper(DOM.fieldNick, DOM.helpNick, '*띄어쓰기를 없애주세요', 'error'); return false; }
  if (!withinLen(v, 10)) { if (showMsg) setFieldHelper(DOM.fieldNick, DOM.helpNick, '*닉네임은 최대 10자까지 작성 가능합니다', 'error'); return false; }
  if (showMsg) setFieldHelper(DOM.fieldNick, DOM.helpNick, null, null);
  return true;
}
export function validateNicknameAsyncDup(onDone) {
  const v = DOM.inputNick.value || '';
  checkNickDup(v, (res) => {
    if (!res.ok) { setFieldHelper(DOM.fieldNick, DOM.helpNick, '닉네임 중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.', 'warn'); onDone?.(); return; }
    if (res.duplicate) setFieldHelper(DOM.fieldNick, DOM.helpNick, '*중복된 닉네임입니다.', 'error');
    else               setFieldHelper(DOM.fieldNick, DOM.helpNick, null, null);
    onDone?.();
  });
}
