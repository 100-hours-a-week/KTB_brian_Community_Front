import { DOM } from '../mypage/js/dom.js';
import { setFieldHelper } from '../mypage/js/ui.js';

export function validateNickname({ showMsg = false } = {}) {
  const value = (DOM.nicknameInput?.value || '').trim();
  if (!value) {
    if (showMsg) {
      setFieldHelper(
        DOM.nicknameField,
        DOM.nicknameHelper,
        '*닉네임을 입력해주세요.',
        'error',
      );
    }
    return false;
  }
  if (/\s/.test(value)) {
    if (showMsg) {
      setFieldHelper(
        DOM.nicknameField,
        DOM.nicknameHelper,
        '*띄어쓰기를 없애주세요.',
        'error',
      );
    }
    return false;
  }
  if (value.length > 10) {
    if (showMsg) {
      setFieldHelper(
        DOM.nicknameField,
        DOM.nicknameHelper,
        '*닉네임은 최대 10자까지 작성 가능합니다.',
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
