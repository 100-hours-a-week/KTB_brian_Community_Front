import { DOM } from './dom.js';
import { updateSubmitState, showToast } from './ui.js';
import { validatePassword, validatePasswordConfirm } from './validators.js';
import { updatePassword } from './api.js';

function isAllValid() {
  const okPass = validatePassword({ showMsg: false });
  const okConfirm = validatePasswordConfirm({ showMsg: false });
  return okPass && okConfirm;
}

function bindFieldEvents() {
  DOM.passwordInput?.addEventListener('input', () => {
    validatePassword({ showMsg: false });
    validatePasswordConfirm({ showMsg: false });
    updateSubmitState(isAllValid);
  });
  DOM.passwordInput?.addEventListener('blur', () => {
    validatePassword({ showMsg: true });
    validatePasswordConfirm({ showMsg: true });
    updateSubmitState(isAllValid);
  });

  DOM.confirmInput?.addEventListener('input', () => {
    validatePasswordConfirm({ showMsg: false });
    updateSubmitState(isAllValid);
  });
  DOM.confirmInput?.addEventListener('blur', () => {
    validatePasswordConfirm({ showMsg: true });
    updateSubmitState(isAllValid);
  });
}

async function handleSubmit(e) {
  e.preventDefault();
  if (!DOM.submitBtn) return;

  const okPass = validatePassword({ showMsg: true });
  const okConfirm = validatePasswordConfirm({ showMsg: true });
  updateSubmitState(isAllValid);
  if (!okPass || !okConfirm) return;

  const fd = new FormData();
  fd.append('password', DOM.passwordInput.value.trim());

  const originalText = DOM.submitBtn.textContent;
  DOM.submitBtn.disabled = true;
  DOM.submitBtn.textContent = '수정 중...';

  try {
    const res = await updatePassword(fd);
    if (res.status === 401) {
      window.location.href = '../login/index.html';
      return;
    }
    if (!res.ok) {
      let message = '비밀번호 수정에 실패했습니다.';
      try {
        const data = await res.json();
        if (data && typeof data.message === 'string') message = data.message;
      } catch {}
      alert(message);
      return;
    }

    DOM.passwordInput.value = '';
    DOM.confirmInput.value = '';
    showToast();
  } catch (err) {
    console.error('비밀번호 수정 오류', err);
    alert('비밀번호 수정 중 오류가 발생했습니다.');
  } finally {
    DOM.submitBtn.textContent = originalText;
    updateSubmitState(isAllValid);
  }
}

function initBackButton() {
  DOM.backBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (document.referrer) history.back();
    else window.location.href = '../mypage/index.html';
  });
}

function init() {
  bindFieldEvents();
  DOM.form?.addEventListener('submit', handleSubmit);
  initBackButton();
  updateSubmitState(isAllValid);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
