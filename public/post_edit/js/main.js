import { DOM } from './dom.js';
import { updateSubmitState, setFieldHelper } from './ui.js';
import { makeTitleValidator, makeBodyValidator } from '../../shared/validators.js';
import { fetchPost, updatePost, fetchImageWithAuth } from '../../shared/api/post.js';
import { initAvatarSync } from '../../shared/avatar-sync.js';
import { fetchCurrentUser } from '../../shared/api/user.js';
import { redirectToLogin } from '../../shared/utils/navigation.js';

const state = {
  avatarController: null,
  postId: null,
  existingImageUrl: null,
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

function setSubmitting(isSubmitting, label = '수정하기') {
  if (!DOM.submitBtn) return;
  const text = isSubmitting ? '수정 중...' : label;
  DOM.submitBtn.textContent = text;
  DOM.submitBtn.disabled = isSubmitting || !isAllValid();
}

async function handleSubmit(e) {
  e.preventDefault();
  if (!DOM.submitBtn || !state.postId) return;

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
    const res = await updatePost(state.postId, fd);
    if (res.status === 401) return redirectToLogin();
    if (!res.ok) {
      let message = '게시글 수정에 실패했습니다.';
      try {
        const data = await res.json();
        if (data && typeof data.message === 'string') message = data.message;
      } catch (_) {}
      alert(message);
      return;
    }

    alert('게시글이 수정되었습니다!');
    window.location.href = `../post_detail/index.html?postId=${encodeURIComponent(
      state.postId,
    )}`;
  } catch (err) {
    console.error('게시글 수정 오류', err);
    alert('네트워크 오류가 발생했습니다.');
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

async function hydratePost() {
  try {
    const res = await fetchPost(state.postId);
    if (res.status === 404) {
      alert('존재하지 않는 게시글입니다.');
      window.location.href = '../board/index.html';
      return;
    }
    if (!res.ok) throw new Error(`게시글 정보를 불러오지 못했습니다. (${res.status})`);
    const json = await res.json();
    const payload = json?.data ?? json ?? {};
    const post = payload.post ?? payload ?? {};

    DOM.titleInput.value = post.title || '';
    DOM.bodyInput.value = post.body || '';
    if (DOM.imageHelper) {
      DOM.imageHelper.textContent = post.image
        ? '* 기존 이미지가 있습니다. 새 파일을 선택하면 교체됩니다.'
        : '';
    }
    state.existingImageUrl = post.image || null;
    updateSubmitState(DOM.submitBtn, isAllValid);
  } catch (err) {
    console.error(err);
    alert('게시글 정보를 불러오지 못했습니다.');
    window.location.href = '../board/index.html';
  }
}

function init() {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('postId');
  if (!postId) {
    alert('잘못된 접근입니다.');
    window.location.href = '../board/index.html';
    return;
  }
  state.postId = postId;

  bindFieldEvents();
  DOM.form?.addEventListener('submit', handleSubmit);
  initBackButton();
  initAvatar();
  hydratePost();
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
