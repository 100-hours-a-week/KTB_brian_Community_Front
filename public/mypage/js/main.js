import { initAvatarSync } from '../../shared/avatar-sync.js';
import { fetchCurrentUser, fetchUserImage, updateUserProfile, deleteCurrentUser } from './api.js';
import { DOM } from './dom.js';
import { setFieldHelper } from './ui.js';
import { validateNickname } from './validators.js';

const state = {
  originalNickname: '',
  avatarController: null,
};

async function loadRemoteAvatar(imageUrl) {
  if (!imageUrl || !state.avatarController) return;
  try {
    const res = await fetchUserImage(imageUrl);
    if (!res.ok) throw new Error(`이미지 응답 오류 (${res.status})`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    state.avatarController.setAvatar(objectUrl, { track: 'external' });
  } catch (err) {
    console.warn('프로필 이미지를 불러오지 못했습니다.', err);
  }
}

async function hydrateUser() {
  try {
    const res = await fetchCurrentUser();
    if (res.status === 401) {
      window.location.href = '../login/index.html';
      return;
    }
    if (!res.ok) throw new Error(`사용자 정보 요청 실패 (status: ${res.status})`);

    const payload = await res.json();
    const user = payload?.data ?? payload ?? {};

    if (DOM.emailInput && user.email) {
      DOM.emailInput.value = user.email;
    }
    if (DOM.nicknameInput && user.nickname) {
      DOM.nicknameInput.value = user.nickname;
      state.originalNickname = user.nickname.trim();
    }
    if (user.imageUrl) {
      await loadRemoteAvatar(user.imageUrl);
    }
  } catch (err) {
    console.error('사용자 정보를 불러오지 못했습니다.', err);
    alert('사용자 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
  }
}

function hasProfileFile() {
  return Boolean(DOM.fileInput && DOM.fileInput.files && DOM.fileInput.files[0]);
}

async function handleSubmit(e) {
  e.preventDefault();
  if (!DOM.nicknameInput || !DOM.submitBtn) return;

  const nicknameNext = DOM.nicknameInput.value.trim();
  const nicknameChanged = nicknameNext !== state.originalNickname;
  const fileSelected = hasProfileFile();

  if (!nicknameChanged && !fileSelected) {
    alert('변경된 내용이 없습니다.');
    return;
  }

  if (nicknameChanged && !validateNickname({ showMsg: true })) {
    return;
  }

  const fd = new FormData();
  if (nicknameChanged) fd.append('nickname', nicknameNext);
  if (fileSelected) {
    const file = DOM.fileInput.files[0];
    fd.append('file', file, file.name);
  }

  const originalText = DOM.submitBtn.textContent;
  DOM.submitBtn.disabled = true;
  DOM.submitBtn.textContent = '수정 중...';

  try {
    const res = await updateUserProfile(fd);
    if (res.status === 401) {
      window.location.href = '../login/index.html';
      return;
    }
    if (!res.ok) {
      let message = '수정에 실패했습니다. 잠시 후 다시 시도해주세요.';
      try {
        const body = await res.json();
        if (body && typeof body.message === 'string') message = body.message;
      } catch (_) {}
      alert(message);
      return;
    }

    const payload = await res.json().catch(() => null);
    const updated = payload?.data ?? payload ?? {};

    if (updated.nickname) {
      DOM.nicknameInput.value = updated.nickname;
      state.originalNickname = updated.nickname.trim();
    } else if (nicknameChanged) {
      state.originalNickname = nicknameNext;
    }

    if (updated.imageUrl) {
      await loadRemoteAvatar(updated.imageUrl);
    }

    if (fileSelected && DOM.fileInput) {
      DOM.fileInput.value = '';
    }

    setFieldHelper(DOM.nicknameField, DOM.nicknameHelper, null, null);
    showToast();
  } catch (err) {
    console.error('프로필 수정 오류', err);
    alert('프로필 수정 중 오류가 발생했습니다.');
  } finally {
    DOM.submitBtn.disabled = false;
    DOM.submitBtn.textContent = originalText;
  }
}

function bindEvents() {
  if (DOM.form) DOM.form.addEventListener('submit', handleSubmit);
  if (DOM.nicknameInput) {
    DOM.nicknameInput.addEventListener('blur', () =>
      validateNickname({ showMsg: true }),
    );
    DOM.nicknameInput.addEventListener('input', () =>
      validateNickname({ showMsg: false }),
    );
  }
  DOM.deleteConfirmBtn?.addEventListener('click', handleDeleteAccount);
}

function bootMypage() {
  state.avatarController = initAvatarSync({
    previewSelector: '[data-avatar-preview]',
    targetSelectors: ['[data-avatar-menu]'],
    fileInputSelector: '#profile-file-input',
    triggerSelector: '.profile__change',
  });

  bindEvents();
  hydrateUser();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootMypage, { once: true });
} else {
  bootMypage();
}

function showToast() {
  const toast = document.getElementById('update-toast');
  if (!toast) return;
  toast.classList.add('is-visible');
  setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2500);
}

async function handleDeleteAccount() {
  try {
    const res = await deleteCurrentUser();
    if (res.status === 401) {
      window.location.href = '../login/index.html';
      return;
    }
    if (!res.ok && res.status !== 204) {
      let msg = '회원 탈퇴에 실패했습니다.';
      try {
        const body = await res.json();
        if (body && typeof body.message === 'string') msg = body.message;
      } catch (_) {}
      alert(msg);
      return;
    }
    alert('회원 탈퇴가 완료되었습니다.');
    window.location.href = '../login/index.html';
  } catch (err) {
    console.error('회원 탈퇴 오류', err);
    alert('회원 탈퇴 중 오류가 발생했습니다.');
  }
}
