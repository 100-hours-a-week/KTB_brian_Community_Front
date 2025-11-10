import { DOM } from './dom.js';
import { convertNewLinesToBreaks, formatDateTime } from './utils.js';

const FALLBACK_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><g fill="none" fill-rule="evenodd"><circle cx="24" cy="24" r="24" fill="%23E2E2E2"/><circle cx="24" cy="18" r="10" fill="%23BDBDBD"/><path d="M8 40c3.556-8.5 10.222-12.75 20-12.75S44 31.5 48 40" fill="%23BDBDBD"/></g></svg>';

export function renderPost({ post = {}, author = {} }) {
  if (DOM.title) DOM.title.textContent = post.title || '(제목 없음)';
  if (DOM.body) {
    DOM.body.innerHTML = convertNewLinesToBreaks(post.body || '');
  }
  if (DOM.createdAt) {
    DOM.createdAt.dateTime = post.createdAt || '';
    const formatted = post.createdAt ? formatDateTime(post.createdAt) : '';
    DOM.createdAt.textContent = formatted
      ? `작성일 ${formatted}`
      : '작성일 정보 없음';
    if (formatted) DOM.createdAt.title = formatted;
  }
  if (DOM.authorName) DOM.authorName.textContent = author.nickname || '익명';
  setAuthorAvatar(author.imageUrl);
  setCounts({
    likes: post.likeCount ?? 0,
    views: post.viewCount ?? 0,
    comments: post.commentCount ?? 0,
  });
}

export function setPostImage(src) {
  if (!DOM.postMedia) return;
  if (!src) {
    DOM.postMedia.hidden = true;
    if (DOM.postImage) DOM.postImage.removeAttribute('src');
    return;
  }
  if (DOM.postImage) {
    DOM.postImage.src = src;
    DOM.postMedia.hidden = false;
  }
}

export function setCounts({ likes, views, comments }) {
  if (DOM.likeCount) {
    DOM.likeCount.textContent = String(likes ?? 0);
    DOM.likeCount.dataset.count = String(likes ?? 0);
  }
  if (DOM.viewCount) {
    DOM.viewCount.textContent = String(views ?? 0);
  }
  if (DOM.commentCount) {
    DOM.commentCount.textContent = String(comments ?? 0);
  }
}

export function setLikeState(liked) {
  if (!DOM.likeBtn) return;
  DOM.likeBtn.dataset.liked = String(Boolean(liked));
  DOM.likeBtn.setAttribute('aria-pressed', String(Boolean(liked)));
}

export function setAuthorAvatar(src) {
  if (!DOM.authorAvatar) return;
  const finalSrc = src || FALLBACK_AVATAR;
  DOM.authorAvatar.style.backgroundImage = `url("${finalSrc}")`;
  DOM.authorAvatar.style.backgroundSize = 'cover';
  DOM.authorAvatar.style.backgroundPosition = 'center';
}

function resolveCommentNode() {
  if (!DOM.commentTemplate) return null;
  const fragment = DOM.commentTemplate.content.cloneNode(true);
  return fragment.firstElementChild;
}

export function renderComments(comments = []) {
  if (!DOM.commentList) return;
  DOM.commentList.innerHTML = '';
  appendComments(comments);
}

export function appendComments(comments = []) {
  if (!DOM.commentList) return;
  const frag = document.createDocumentFragment();
  comments.forEach((entry) => {
    const comment = entry?.comment ?? entry ?? {};
    const author = entry?.author ?? {};
    const node = resolveCommentNode();
    if (!node) return;

    const authorNameEl = node.querySelector('.author__name');
    if (authorNameEl) authorNameEl.textContent = author.nickname || '익명';

    const avatarEl = node.querySelector('.author__avatar');
    if (avatarEl) {
      avatarEl.style.backgroundImage = author.imageUrl
        ? `url("${author.imageUrl}")`
        : `url("${FALLBACK_AVATAR}")`;
      avatarEl.style.backgroundSize = 'cover';
      avatarEl.style.backgroundPosition = 'center';
    }

    const timeEl = node.querySelector('.comment__time');
    if (timeEl) {
      timeEl.dateTime = comment.createdAt || '';
      timeEl.textContent = comment.createdAt
        ? formatDateTime(comment.createdAt)
        : '';
    }

    const bodyEl = node.querySelector('.comment__body');
    if (bodyEl) bodyEl.textContent = comment.body || comment.content || '';

    node.dataset.commentId = comment.id != null ? String(comment.id) : '';

    frag.appendChild(node);
  });

  DOM.commentList.appendChild(frag);
}

export function setCommentEmptyState(visible) {
  if (!DOM.commentEmpty) return;
  DOM.commentEmpty.hidden = !visible;
}
