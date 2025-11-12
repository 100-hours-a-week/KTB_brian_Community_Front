import { DOM } from './dom.js';
import { setFieldHelper } from './ui.js';
import { hasWhitespace, withinLen } from '../../shared/validators.js';

export function validateNickname({ showMsg = false } = {}) {
  const value = (DOM.nicknameInput?.value || '').trim();

  if (!value) {
    if (showMsg) {
      setFieldHelper(
        DOM.nicknameField,
        DOM.nicknameHelper,
        '*닉네임을 입력해주세요',
        'error',
      );
    }
    return false;
  }

  if (hasWhitespace(value)) {
    if (showMsg) {
      setFieldHelper(
        DOM.nicknameField,
        DOM.nicknameHelper,
        '*띄어쓰기를 없애주세요',
        'error',
      );
    }
    return false;
  }

  if (!withinLen(value, 10)) {
    if (showMsg) {
      setFieldHelper(
        DOM.nicknameField,
        DOM.nicknameHelper,
        '*닉네임은 최대 10자까지 작성 가능합니다',
        'error',
      );
    }
    return false;
  }

  if (showMsg) {
    setFieldHelper(DOM.nicknameField, DOM.nicknameHelper, null, null);
  }
  return true;
}
