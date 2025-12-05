import { DOM } from './dom.js';
import {
  renderPost,
  setPostImage,
  setCounts,
  setLikeState,
  renderComments,
  appendComments,
  setCommentEmptyState,
  setAuthorAvatar,
} from './ui.js';
import {
  fetchPost,
  fetchPostComments,
  createComment,
  updateComment,
  deleteComment,
  deletePost,
  fetchPostLikeStatus,
  togglePostLike,
  fetchImageWithAuth,
} from '../../shared/api/post.js';
import {
  getQueryParam,
  normalizeCommentsResponse,
  normalizePostResponse,
} from './utils.js';
import { initAvatarSync } from '../../shared/avatar-sync.js';
import { fetchCurrentUser } from '../../shared/api/user.js';
import { redirectToLogin } from '../../shared/utils/navigation.js';
import { MSG, ERR } from '../../shared/constants/messages.js';

const state = {
  postId: null,
  post: null,
  likeLiked: false,
  commentsPage: 0,
  hasMoreComments: true,
  isLoadingComments: false,
  headerAvatarController: null,
  postImageUrl: null,
  authorAvatarUrl: null,
  commentToDelete: null,
  editingCommentId: null,
};

function openModal(modal) {
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.documentElement.style.overflow = 'hidden';
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  if (!document.querySelector('.modal.is-open')) {
    document.documentElement.style.overflow = '';
  }
}

function bindModalDismiss(modal, onClose) {
  modal?.addEventListener('click', (e) => {
    if (e.target.matches('[data-close], .modal__backdrop')) {
      closeModal(modal);
      onClose?.();
    }
  });
}

function redirectToBoard() {
  window.location.href = '../board/index.html';
}

function bindBackButton() {
  DOM.backBtn?.addEventListener('click', () => {
    if (document.referrer) history.back();
    else redirectToBoard();
  });
}

async function loadPost() {
  try {
    const res = await fetchPost(state.postId);
    if (res.status === 404) {
      alert(ERR.POST_NOT_FOUND);
      redirectToBoard();
      return;
    }
    if (!res.ok) throw new Error(`${ERR.POST_FETCH} (${res.status})`);
    const json = await res.json();
    const data = normalizePostResponse(json);
    state.post = data.post ?? data ?? {};
    renderPost({ post: state.post, author: data.author ?? {} });
    if (state.post.image) {
      await hydratePostImage(state.post.image);
    } else {
      setPostImage(null);
    }
    if (data.author?.imageUrl) {
      await hydrateAuthorAvatar(data.author.imageUrl);
    } else {
      setAuthorAvatar(null);
    }
  } catch (err) {
    console.error(err);
    alert(ERR.POST_FETCH_FAIL);
    redirectToBoard();
  }
}

async function hydratePostImage(imageUrl) {
  revokeObjectUrl('postImageUrl');
  if (!imageUrl) {
    setPostImage(null);
    return;
  }
  try {
    const res = await fetchImageWithAuth(imageUrl);
    if (!res.ok) throw new Error(ERR.POST_IMAGE_RESPONSE);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    state.postImageUrl = url;
    setPostImage(url);
  } catch (err) {
    console.warn(ERR.POST_IMAGE_RESPONSE, err);
    setPostImage(imageUrl);
  }
}

async function hydrateAuthorAvatar(imageUrl) {
  revokeObjectUrl('authorAvatarUrl');
  if (!imageUrl) {
    setAuthorAvatar(null);
    return;
  }
  try {
    const res = await fetchImageWithAuth(imageUrl);
    if (!res.ok) throw new Error(ERR.AUTHOR_IMAGE_RESPONSE);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    state.authorAvatarUrl = url;
    setAuthorAvatar(url);
  } catch (err) {
    console.warn(ERR.AUTHOR_IMAGE_RESPONSE, err);
    setAuthorAvatar(imageUrl);
  }
}

async function loadComments({ reset = true } = {}) {
  if (!state.postId || state.isLoadingComments) return;
  if (reset) {
    state.commentsPage = 0;
    state.hasMoreComments = true;
  }
  if (!state.hasMoreComments && !reset) return;

  state.isLoadingComments = true;
  try {
    const res = await fetchPostComments(state.postId, {
      page: state.commentsPage,
      size: 20,
    });
      if (!res.ok) throw new Error(`${ERR.COMMENT_FETCH} (${res.status})`);
    const json = await res.json();
    const { list, meta } = normalizeCommentsResponse(json);
    if (state.commentsPage === 0) renderComments(list);
    else appendComments(list);
    setCommentEmptyState(state.commentsPage === 0 && list.length === 0);

    if (meta.totalElements != null) {
      if (state.post) state.post.commentCount = meta.totalElements;
      setCounts({
        likes: state.post?.likeCount ?? 0,
        views: state.post?.viewCount ?? 0,
        comments: meta.totalElements,
      });
    }

    state.commentsPage += 1;
    if (meta.last === true || list.length === 0) {
      state.hasMoreComments = false;
    }
  } catch (err) {
    console.error(err);
    if (state.commentsPage === 0) {
      renderComments([]);
      setCommentEmptyState(true);
    }
  } finally {
    state.isLoadingComments = false;
  }
}

async function hydrateLikeState() {
  try {
    const res = await fetchPostLikeStatus(state.postId);
    if (!res.ok) return;
    const json = await res.json();
    const payload = json?.data ?? json ?? {};
    const liked =
      typeof payload.liked === 'boolean'
        ? payload.liked
        : Boolean(payload.isLiked);
    state.likeLiked = liked;
    setLikeState(liked);
  } catch (err) {
    console.warn(ERR.LIKE_STATUS_FAIL, err);
  }
}

function bindLikeButton() {
  DOM.likeBtn?.addEventListener('click', async () => {
    if (!state.postId) return;
    try {
      const res = await togglePostLike(state.postId);
      if (res.status === 401) return redirectToLogin();
      if (!res.ok) throw new Error(`${ERR.LIKE_PROCESS} (${res.status})`);
      state.likeLiked = !state.likeLiked;
      setLikeState(state.likeLiked);
      if (state.post) {
        const delta = state.likeLiked ? 1 : -1;
        state.post.likeCount = Math.max(0, (state.post.likeCount ?? 0) + delta);
        setCounts({
          likes: state.post.likeCount,
          views: state.post.viewCount ?? 0,
          comments: state.post.commentCount ?? 0,
        });
      }
    } catch (err) {
      console.error(err);
      alert(ERR.LIKE_TOGGLE_FAIL);
    }
  });
}

function bindCommentForm() {
  const toggleState = () => {
    const hasText = Boolean(DOM.commentInput?.value.trim());
    if (DOM.commentSubmit) DOM.commentSubmit.disabled = !hasText;
  };
  DOM.commentInput?.addEventListener('input', toggleState);
  DOM.commentSubmit?.addEventListener('click', () => {
    if (state.editingCommentId) {
      handleCommentUpdate(state.editingCommentId);
    } else {
      handleCommentSubmit();
    }
  });
}

async function handleCommentSubmit() {
  if (!state.postId || !DOM.commentInput?.value.trim()) return;
  const content = DOM.commentInput.value.trim();
  DOM.commentSubmit.disabled = true;
  DOM.commentSubmit.textContent = MSG.COMMENT_SUBMITTING;
  try {
    const res = await createComment(state.postId, content);
    if (res.status === 401) return redirectToLogin();
    if (!res.ok) {
      let message = ERR.COMMENT_CREATE_FAIL;
      try {
        const data = await res.json();
        if (data && typeof data.message === 'string') message = data.message;
      } catch (_) {}
      alert(message);
      return;
    }
    DOM.commentInput.value = '';
    await loadComments({ reset: true });
  } catch (err) {
    console.error(err);
    alert(ERR.COMMENT_CREATE_ERROR);
  } finally {
    DOM.commentSubmit.textContent = MSG.COMMENT_SUBMIT_LABEL;
    DOM.commentSubmit.disabled = true;
  }
}

async function handleCommentUpdate(commentId) {
  const content = DOM.commentInput?.value.trim();
  if (!state.postId || !commentId || !content) return;
  DOM.commentSubmit.disabled = true;
  DOM.commentSubmit.textContent = MSG.COMMENT_UPDATING;
  try {
    const res = await updateComment(state.postId, commentId, content);
    if (res.status === 401) return redirectToLogin();
    if (!res.ok) {
      alert(ERR.COMMENT_UPDATE_FAIL);
      return;
    }
    DOM.commentInput.value = '';
    state.editingCommentId = null;
    DOM.commentSubmit.textContent = MSG.COMMENT_SUBMIT_LABEL;
    await loadComments({ reset: true });
  } catch (err) {
    console.error(err);
    alert(ERR.COMMENT_UPDATE_ERROR);
  } finally {
    DOM.commentSubmit.textContent = MSG.COMMENT_SUBMIT_LABEL;
    DOM.commentSubmit.disabled = true;
  }
}

function bindCommentActions() {
  DOM.commentList?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const commentEl = btn.closest('.comment');
    if (!commentEl) return;
    const commentId = commentEl.dataset.commentId;
    if (!commentId) return;

    if (btn.dataset.action === 'edit') {
      startCommentEdit(commentEl, btn);
    } else if (btn.dataset.action === 'cancel-edit') {
      cancelCommentEdit(commentEl, btn);
    } else if (btn.dataset.action === 'delete') {
      state.commentToDelete = { id: commentId, node: commentEl };
      openModal(DOM.commentDeleteModal);
    }
  });
}

function startCommentEdit(commentEl, btn) {
  const bodyEl = commentEl.querySelector('.comment__body');
  if (!bodyEl || !DOM.commentInput || !DOM.commentSubmit) return;
  state.editingCommentId = commentEl.dataset.commentId || null;
  DOM.commentInput.value = bodyEl.textContent || '';
  DOM.commentSubmit.textContent = MSG.COMMENT_UPDATE_LABEL;
  DOM.commentSubmit.disabled = false;
  commentEl.classList.add('is-editing');
  DOM.commentInput.focus();
  btn.textContent = '수정 취소';
  btn.dataset.action = 'cancel-edit';
}

function cancelCommentEdit(commentEl, btn) {
  state.editingCommentId = null;
  if (DOM.commentInput) DOM.commentInput.value = '';
  if (DOM.commentSubmit) {
    DOM.commentSubmit.textContent = MSG.COMMENT_SUBMIT_LABEL;
    DOM.commentSubmit.disabled = true;
  }
  commentEl.classList.remove('is-editing');
  btn.textContent = '수정';
  btn.dataset.action = 'edit';
}

function bindCommentDeleteModal() {
  bindModalDismiss(DOM.commentDeleteModal, () => {
    state.commentToDelete = null;
  });
  DOM.commentDeleteConfirm?.addEventListener(
    'click',
    handleCommentDeleteConfirm,
  );
}

async function handleCommentDeleteConfirm() {
  if (!state.commentToDelete) {
    closeModal(DOM.commentDeleteModal);
    return;
  }
  const { id, node } = state.commentToDelete;
  try {
    const res = await deleteComment(state.postId, id);
    if (res.status === 401) return redirectToLogin();
    if (!res.ok && res.status !== 204)
      throw new Error(`${ERR.COMMENT_DELETE} (${res.status})`);
    node?.remove();
    if (state.post) {
      state.post.commentCount = Math.max(
        0,
        (state.post.commentCount ?? 1) - 1,
      );
      setCounts({
        likes: state.post.likeCount ?? 0,
        views: state.post.viewCount ?? 0,
        comments: state.post.commentCount,
      });
    }
    const hasComments =
      DOM.commentList && DOM.commentList.children.length > 0;
    setCommentEmptyState(!hasComments);
  } catch (err) {
    console.error(err);
    alert(ERR.COMMENT_DELETE_ERROR);
  } finally {
    state.commentToDelete = null;
    closeModal(DOM.commentDeleteModal);
  }
}

function bindPostActions() {
  DOM.editBtn?.addEventListener('click', () => {
    if (!state.postId) return;
    window.location.href = `../post_edit/index.html?postId=${encodeURIComponent(
      state.postId,
    )}`;
  });
  if (DOM.deleteBtn) {
    DOM.deleteBtn.addEventListener('click', () => openModal(DOM.postDeleteModal));
  }
  bindModalDismiss(DOM.postDeleteModal);
  DOM.postDeleteConfirm?.addEventListener('click', handlePostDeleteConfirm);
}

async function handlePostDeleteConfirm() {
  if (!state.postId) return;
  try {
    const res = await deletePost(state.postId);
    if (res.status === 401) return redirectToLogin();
    if (!res.ok && res.status !== 204)
      throw new Error(`${ERR.POST_DELETE} (${res.status})`);
    alert(MSG.POST_DELETE_SUCCESS);
    redirectToBoard();
  } catch (err) {
    console.error(err);
    alert(ERR.POST_DELETE_ERROR);
  } finally {
    closeModal(DOM.postDeleteModal);
  }
}

function revokeObjectUrl(key) {
  const prop = key;
  if (state[prop]) {
    URL.revokeObjectURL(state[prop]);
    state[prop] = null;
  }
}

async function hydrateHeaderAvatar() {
  if (!state.headerAvatarController) return;
  try {
    const res = await fetchCurrentUser();
    if (res.status === 401) return redirectToLogin();
    if (!res.ok) throw new Error(`${ERR.USER_FETCH} (${res.status})`);
    const payload = await res.json();
    const user = payload?.data ?? payload ?? {};
    if (user.imageUrl) {
      try {
        const resImg = await fetchImageWithAuth(user.imageUrl);
        if (!resImg.ok) throw new Error(ERR.AVATAR_IMAGE_RESPONSE);
        const blob = await resImg.blob();
        const url = URL.createObjectURL(blob);
        state.headerAvatarController.setAvatar(url, { track: 'external' });
      } catch (imgErr) {
        console.warn(ERR.AVATAR_LOAD_FAIL, imgErr);
      }
    } else {
      state.headerAvatarController.setAvatar(null);
    }
  } catch (err) {
    console.warn(err);
  }
}

function initHeaderAvatar() {
  state.headerAvatarController = initAvatarSync({
    previewSelector: '[data-avatar-preview]',
    targetSelectors: ['[data-avatar-menu]'],
  });
  hydrateHeaderAvatar();
}

async function initPage() {
  bindBackButton();
  bindPostActions();
  bindCommentForm();
  bindCommentActions();
  bindCommentDeleteModal();
  bindLikeButton();
  initHeaderAvatar();

  const postId = getQueryParam('postId');
  if (!postId) {
    alert(ERR.INVALID_ACCESS);
    redirectToBoard();
    return;
  }
  state.postId = postId;

  await loadPost();
  await Promise.all([loadComments({ reset: true }), hydrateLikeState()]);

  window.addEventListener('beforeunload', () => {
    revokeObjectUrl('postImageUrl');
    revokeObjectUrl('authorAvatarUrl');
    state.headerAvatarController?.destroy?.();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage, { once: true });
} else {
  initPage();
}
