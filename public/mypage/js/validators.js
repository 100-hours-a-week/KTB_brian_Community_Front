import { DOM } from './dom.js';
import { setFieldHelper } from './ui.js';
import {
  hasWhitespace,
  withinLen,
  validateNicknameValue,
} from '../../shared/validators.js';
import { checkNickDup } from './availability.js';

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

export function validateNicknameAsyncDup(onDone) {
  const value = (DOM.nicknameInput?.value || '').trim();
  if (!value) {
    onDone?.();
    return;
  }
  checkNickDup(value, (res) => {
    if (!res.ok) {
      setFieldHelper(
        DOM.nicknameField,
        DOM.nicknameHelper,
        '닉네임 중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.',
        'warn',
      );
      onDone?.();
      return;
    }
    if (res.duplicate) {
      setFieldHelper(
        DOM.nicknameField,
        DOM.nicknameHelper,
        '*중복된 닉네임입니다.',
        'error',
      );
    } else {
      setFieldHelper(DOM.nicknameField, DOM.nicknameHelper, null, null);
    }
    onDone?.();
  });
}
