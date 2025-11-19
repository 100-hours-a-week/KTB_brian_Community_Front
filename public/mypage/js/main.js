import { initAvatarSync } from '../../shared/avatar-sync.js';
import { fetchCurrentUser, fetchUserImage, updateUserProfile, deleteCurrentUser } from '../../shared/api/user.js';
import { DOM } from './dom.js';
import { setFieldHelper } from './ui.js';
import { makeNicknameValidator } from '../../shared/validators.js';
import { checkNickDup } from './availability.js';
import { redirectToLogin } from '../../shared/utils/navigation.js';
import { MSG, ERR } from '../../shared/constants/messages.js';

const state = {
  originalNickname: '',
  avatarController: null,
};

const TOAST_DURATION_MS = 2500;

const validateNickname = makeNicknameValidator({
  inputEl: DOM.nicknameInput,
  fieldEl: DOM.nicknameField,
  helpEl: DOM.nicknameHelper,
  setHelper: setFieldHelper,
});

function validateNicknameAsyncDup(onDone) {
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
        ERR.NICK_DUP_FAIL,
        'warn',
      );
      onDone?.();
      return;
    }
    if (res.duplicate) {
      setFieldHelper(
        DOM.nicknameField,
        DOM.nicknameHelper,
        ERR.DUP_NICK,
        'error',
      );
    } else {
      setFieldHelper(DOM.nicknameField, DOM.nicknameHelper, null, null);
    }
    onDone?.();
  });
}

async function loadRemoteAvatar(imageUrl) {
  if (!imageUrl || !state.avatarController) return;
  try {
    const res = await fetchUserImage(imageUrl);
    if (!res.ok) throw new Error(`${ERR.IMAGE_RESPONSE} (${res.status})`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    state.avatarController.setAvatar(objectUrl, { track: 'external' });
  } catch (err) {
    console.warn(ERR.PROFILE_IMG_FAIL, err);
  }
}

async function hydrateUser() {
  try {
    const res = await fetchCurrentUser();
    if (res.status === 401) return redirectToLogin();
    if (!res.ok) throw new Error(`${ERR.USER_FETCH} (${res.status})`);

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
    console.error(ERR.USER_FETCH, err);
    alert(ERR.USER_FETCH);
  }
}

function hasProfileFile() {
  return Boolean(DOM.fileInput && DOM.fileInput.files && DOM.fileInput.files[0]);
}

function syncProfilePreviewState() {
  if (!DOM.profileUpload || !DOM.profilePreview) return;
  const hasImage = Boolean(DOM.profilePreview.getAttribute('src'));
  DOM.profileUpload.classList.toggle('has-image', hasImage);
}

function bindProfilePreviewState() {
  if (!DOM.profilePreview) return;
  ['load', 'error'].forEach((evt) => {
    DOM.profilePreview.addEventListener(evt, () => {
      syncProfilePreviewState();
    });
  });
  syncProfilePreviewState();
}

async function handleSubmit(e) {
  e.preventDefault();
  if (!DOM.nicknameInput || !DOM.submitBtn) return;

  const nicknameNext = DOM.nicknameInput.value.trim();
  const nicknameChanged = nicknameNext !== state.originalNickname;
  const fileSelected = hasProfileFile();

  if (!nicknameChanged && !fileSelected) {
    alert(MSG.PROFILE_NO_CHANGES);
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
  DOM.submitBtn.textContent = MSG.PROCESSING_UPDATE;

  try {
    const res = await updateUserProfile(fd);
    if (res.status === 401) return redirectToLogin();
    if (!res.ok) {
      let message = ERR.UPDATE_FAIL;
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
    console.error(ERR.UPDATE_ERROR, err);
    alert(ERR.UPDATE_ERROR);
  } finally {
    DOM.submitBtn.disabled = false;
    DOM.submitBtn.textContent = originalText;
  }
}

function bindEvents() {
  if (DOM.form) DOM.form.addEventListener('submit', handleSubmit);
  if (DOM.nicknameInput) {
    DOM.nicknameInput.addEventListener('blur', () => {
      if (validateNickname({ showMsg: true })) {
        validateNicknameAsyncDup(() => {});
      }
    });
    DOM.nicknameInput.addEventListener('input', () => {
      if (validateNickname({ showMsg: false })) {
        validateNicknameAsyncDup(() => {});
      }
    });
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
  bindProfilePreviewState();

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
  }, TOAST_DURATION_MS);
}

async function handleDeleteAccount() {
  try {
    const res = await deleteCurrentUser();
    if (res.status === 401) return redirectToLogin();
    if (!res.ok && res.status !== 204) {
      let msg = ERR.DELETE_FAIL;
      try {
        const body = await res.json();
        if (body && typeof body.message === 'string') msg = body.message;
      } catch (_) {}
      alert(msg);
      return;
    }
    alert(MSG.DELETE_SUCCESS);
    window.location.href = '../login/index.html';
  } catch (err) {
    console.error(ERR.DELETE_ERROR, err);
    alert(ERR.DELETE_ERROR);
  }
}
