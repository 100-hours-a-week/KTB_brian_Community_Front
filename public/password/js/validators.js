import { DOM } from './dom.js';
import { setFieldHelper } from './ui.js';
import {
  PW_RE,
  validatePasswordValue,
} from '../../shared/validators.js';

export function validatePassword({ showMsg = false } = {}) {
  const value = DOM.passwordInput?.value || '';
  const result = validatePasswordValue(value, {
    minLength: 8,
    maxLength: 20,
    pattern: PW_RE,
  });
  if (!result.valid) {
    if (showMsg) {
      let msg = '*비밀번호를 입력해주세요';
      if (result.reason === 'min' || result.reason === 'pattern') {
        msg = '*8~20자, 대문자·소문자·숫자·특수문자 각각 1개 이상 포함해야 합니다.';
      }
      setFieldHelper(DOM.passwordField, DOM.passwordHelper, msg, 'error');
    }
    return false;
  }
  if (showMsg) setFieldHelper(DOM.passwordField, DOM.passwordHelper, null, null);
  return true;
}

export function validatePasswordConfirm({ showMsg = false } = {}) {
  const p1 = DOM.passwordInput?.value || '';
  const p2 = DOM.confirmInput?.value || '';
  if (!p2) {
    if (showMsg) {
      setFieldHelper(
        DOM.confirmField,
        DOM.confirmHelper,
        '*비밀번호를 한 번 더 입력해주세요',
        'error',
      );
    }
    return false;
  }
  if (p1 !== p2) {
    if (showMsg) {
      setFieldHelper(DOM.confirmField, DOM.confirmHelper, '*비밀번호가 다릅니다', 'error');
    }
    return false;
  }
  if (showMsg) setFieldHelper(DOM.confirmField, DOM.confirmHelper, null, null);
  return true;
}
