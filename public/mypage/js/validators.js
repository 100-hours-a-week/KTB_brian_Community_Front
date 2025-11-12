import { DOM } from './dom.js';
import { setFieldHelper } from './ui.js';
import {
  hasWhitespace,
  withinLen,
  validateNicknameValue,
} from '../../shared/validators.js';

export function validateNickname({ showMsg = false } = {}) {
  const value = DOM.nicknameInput?.value || '';
  const result = validateNicknameValue(value, { maxLength: 10 });

  if (!result.valid) {
    if (showMsg) {
      let msg = '*닉네임을 입력해주세요';
      if (result.reason === 'whitespace') msg = '*띄어쓰기를 없애주세요';
      if (result.reason === 'length') msg = '*닉네임은 최대 10자까지 작성 가능합니다';
      setFieldHelper(DOM.nicknameField, DOM.nicknameHelper, msg, 'error');
    }
    return false;
  }

  if (showMsg) {
    setFieldHelper(DOM.nicknameField, DOM.nicknameHelper, null, null);
  }
  return true;
}
