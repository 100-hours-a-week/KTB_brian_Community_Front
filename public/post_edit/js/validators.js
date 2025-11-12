import { DOM } from './dom.js';
import { setFieldHelper } from './ui.js';

export function validateTitle({ showMsg = false } = {}) {
  const value = (DOM.titleInput?.value || '').trim();
  if (!value) {
    if (showMsg) {
      setFieldHelper(
        DOM.titleField,
        DOM.titleHelper,
        '*제목을 입력해주세요.',
        'error',
      );
    }
    return false;
  }
  if (value.length > 26) {
    if (showMsg) {
      setFieldHelper(
        DOM.titleField,
        DOM.titleHelper,
        '*제목은 최대 26자까지 가능합니다.',
        'error',
      );
    }
    return false;
  }
  if (showMsg) {
    setFieldHelper(DOM.titleField, DOM.titleHelper, null, null);
  }
  return true;
}

export function validateBody({ showMsg = false } = {}) {
  const value = (DOM.bodyInput?.value || '').trim();
  if (!value) {
    if (showMsg) {
      setFieldHelper(
        DOM.bodyField,
        DOM.bodyHelper,
        '*내용을 입력해주세요.',
        'error',
      );
    }
    return false;
  }
  if (showMsg) {
    setFieldHelper(DOM.bodyField, DOM.bodyHelper, null, null);
  }
  return true;
}
