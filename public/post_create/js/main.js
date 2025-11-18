import { DOM } from './dom.js';
import { updateSubmitState, setFieldHelper } from './ui.js';
import { makeTitleValidator, makeBodyValidator } from '../../shared/validators.js';
import { redirectToLogin } from '../../shared/utils/navigation.js';
import { createPost, fetchImageWithAuth } from '../../shared/api/post.js';
import { initAvatarSync } from '../../shared/avatar-sync.js';
import { fetchCurrentUser } from '../../shared/api/user.js';
import { MSG } from '../../shared/constants/messages.js';

const state = {
  avatarController: null,
};

const validateTitle = makeTitleValidator({
  inputEl: DOM.titleInput,
  fieldEl: DOM.titleField,
  helpEl: DOM.titleHelper,
  setHelper: setFieldHelper,
});
const validateBody = makeBodyValidator({
  inputEl: DOM.bodyInput,
  fieldEl: DOM.bodyField,
  helpEl: DOM.bodyHelper,
  setHelper: setFieldHelper,
});

function isAllValid() {
  const okTitle = validateTitle({ showMsg: false });
  const okBody = validateBody({ showMsg: false });
  return okTitle && okBody;
}

function bindFieldEvents() {
  DOM.titleInput?.addEventListener('input', () => {
    validateTitle({ showMsg: false });
    updateSubmitState(DOM.submitBtn, isAllValid);
  });
  DOM.titleInput?.addEventListener('blur', () => {
    validateTitle({ showMsg: true });
    updateSubmitState(DOM.submitBtn, isAllValid);
  });

  DOM.bodyInput?.addEventListener('input', () => {
    validateBody({ showMsg: false });
    updateSubmitState(DOM.submitBtn, isAllValid);
  });
  DOM.bodyInput?.addEventListener('blur', () => {
    validateBody({ showMsg: true });
    updateSubmitState(DOM.submitBtn, isAllValid);
  });
}

function setSubmitting(isSubmitting, label = MSG.POST_SUBMIT_LABEL) {
  if (!DOM.submitBtn) return;
  const text = isSubmitting ? MSG.POST_PROCESSING : label;
  DOM.submitBtn.textContent = text;
  DOM.submitBtn.disabled = isSubmitting || !isAllValid();
}

async function handleSubmit(e) {
  e.preventDefault();
  if (!DOM.submitBtn) return;

  const okTitle = validateTitle({ showMsg: true });
  const okBody = validateBody({ showMsg: true });
  updateSubmitState(DOM.submitBtn, isAllValid);
  if (!okTitle || !okBody) return;

  const fd = new FormData();
  fd.append('title', DOM.titleInput.value.trim());
  fd.append('body', DOM.bodyInput.value.trim());
  const file = DOM.imageInput?.files?.[0];
  if (file) fd.append('file', file, file.name);

  const originalText = DOM.submitBtn.textContent;
  setSubmitting(true);

  try {
    const res = await createPost(fd);
    if (res.status === 401) return redirectToLogin();
    if (!res.ok) {
      let message = MSG.POST_CREATE_FAIL;
      try {
        const data = await res.json();
        if (data && typeof data.message === 'string') message = data.message;
      } catch (_) {}
      alert(message);
      return;
    }

    alert(MSG.POST_CREATE_SUCCESS);
    window.location.href = '../board/index.html';
  } catch (err) {
    console.error('게시글 등록 오류', err);
    alert(MSG.NETWORK_ERROR);
  } finally {
    DOM.submitBtn.textContent = originalText;
    updateSubmitState(DOM.submitBtn, isAllValid);
  }
}

function initBackButton() {
  DOM.backBtn?.addEventListener('click', (ev) => {
    ev.preventDefault();
    if (document.referrer) {
      window.history.back();
    } else {
      window.location.href = '../board/index.html';
    }
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
      } catch (imgErr) {
        console.warn('헤더 아바타 로드 실패', imgErr);
      }
    } else {
      state.avatarController.setAvatar(null);
    }
  } catch (err) {
    console.warn('사용자 정보를 불러오지 못했습니다.', err);
  }
}

function initAvatar() {
  state.avatarController = initAvatarSync({
    previewSelector: '[data-avatar-preview]',
    targetSelectors: ['[data-avatar-menu]'],
  });
  hydrateUser();
}

function init() {
  bindFieldEvents();
  DOM.form?.addEventListener('submit', handleSubmit);
  initBackButton();
  initAvatar();
  updateSubmitState(DOM.submitBtn, isAllValid);
  window.addEventListener(
    'beforeunload',
    () => state.avatarController?.destroy?.(),
    { once: true },
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
