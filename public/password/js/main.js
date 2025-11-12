import { DOM } from './dom.js';
import { updateSubmitState, showToast } from './ui.js';
import { validatePassword, validatePasswordConfirm } from './validators.js';
import { updatePassword, fetchImageWithAuth } from './api.js';
import { initAvatarSync } from '../../shared/avatar-sync.js';
import { fetchCurrentUser } from '../../mypage/js/api.js';

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
    const res = await updatePassword({ password: DOM.passwordInput.value.trim() });
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

const state = {
  avatarController: null,
};

function initBackButton() {
  DOM.backBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (document.referrer) history.back();
    else window.location.href = '../mypage/index.html';
  });
}

async function hydrateUser() {
  if (!state.avatarController) return;
  try {
    const res = await fetchCurrentUser();
    if (res.status === 401) {
      window.location.href = '../login/index.html';
      return;
    }
    if (!res.ok) throw new Error(`사용자 정보 요청 실패 (${res.status})`);
    const payload = await res.json();
    const user = payload?.data ?? payload ?? {};
    if (user.imageUrl) {
      try {
        const resImg = await fetchImageWithAuth(user.imageUrl);
        if (!resImg.ok) throw new Error('이미지 응답 오류');
        const blob = await resImg.blob();
        const url = URL.createObjectURL(blob);
        state.avatarController.setAvatar(url, { track: 'external' });
      } catch (err) {
        console.warn('헤더 아바타 로드 실패', err);
      }
    } else {
      state.avatarController.setAvatar(null);
    }
  } catch (err) {
    console.warn('사용자 정보를 불러오지 못했습니다.', err);
  }
}

function init() {
  bindFieldEvents();
  DOM.form?.addEventListener('submit', handleSubmit);
  initBackButton();
  state.avatarController = initAvatarSync({
    previewSelector: '[data-avatar-preview]',
    targetSelectors: ['[data-avatar-menu]'],
  });
  hydrateUser();
  updateSubmitState(isAllValid);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
