import { DOM } from './dom.js';
import { updateSubmitState, showToast, setFieldHelper } from './ui.js';
import { makePasswordValidator, makePasswordConfirmValidator } from '../../shared/validators.js';
import { updatePassword } from '../../shared/api/user.js';
import { fetchImageWithAuth } from '../../shared/api/post.js';
import { initAvatarSync } from '../../shared/avatar-sync.js';
import { fetchCurrentUser } from '../../shared/api/user.js';
import { MSG } from '../../shared/constants/messages.js';
import { redirectToLogin } from '../../shared/utils/navigation.js';

const validatePassword = makePasswordValidator({
  inputEl: DOM.passwordInput,
  fieldEl: DOM.passwordField,
  helpEl: DOM.passwordHelper,
  setHelper: setFieldHelper,
});
const validatePasswordConfirm = makePasswordConfirmValidator({
  passwordInputEl: DOM.passwordInput,
  confirmInputEl: DOM.confirmInput,
  fieldEl: DOM.confirmField,
  helpEl: DOM.confirmHelper,
  setHelper: setFieldHelper,
});

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
  DOM.submitBtn.textContent = MSG.PROCESSING_UPDATE;

  try {
    const res = await updatePassword({ password: DOM.passwordInput.value.trim() });
    if (res.status === 401) return redirectToLogin();
    if (!res.ok) {
      let message = MSG.PW_UPDATE_FAIL;
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
    alert(MSG.PW_UPDATE_ERROR);
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
    if (res.status === 401) return redirectToLogin();
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
        console.warn(MSG.AVATAR_LOAD_FAIL, err);
      }
    } else {
      state.avatarController.setAvatar(null);
    }
  } catch (err) {
    console.warn(MSG.USER_FETCH_FAIL, err);
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
