// UI 헬퍼: 필드 헬퍼/클래스, 프로필 헬퍼, 버튼 상태
import { DOM } from './dom.js';

export function setFieldHelper(fieldEl, helpEl, msg, level = 'error') {
  fieldEl.classList.remove('field--error', 'field--warn', 'field--info');
  helpEl.textContent = '';
  if (level && msg) {
    fieldEl.classList.add(`field--${level}`);
    helpEl.textContent = msg;
  }
}

export function setProfileHelper(visible, msg='*프로필 사진을 추가해주세요.') {
  DOM.profileHelper.style.visibility = visible ? 'visible' : 'hidden';
  DOM.profileHelper.textContent = visible ? msg : '';
}

export function hasAnyFieldError() {
  return Boolean(document.querySelector('.field.field--error')) ||
         DOM.profileHelper.style.visibility === 'visible';
}

export function updateSubmitState(isAllValidFn) {
  const enabled = isAllValidFn();
  DOM.btn.disabled = !enabled;
  DOM.btn.classList.toggle('is-active', enabled);
}
