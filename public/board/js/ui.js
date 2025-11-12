import { DOM } from './dom.js';
import { formatDateTime, formatCount } from './utils.js';

const FALLBACK_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72"><g fill="none" fill-rule="evenodd"><circle cx="36" cy="36" r="36" fill="%23E2E2E2"/><circle cx="36" cy="28" r="14" fill="%23BDBDBD"/><path d="M12 62c5-12 14-18 24-18s19 6 24 18" fill="%23BDBDBD"/></g></svg>';

let avatarTokenSeed = 0;

function resolveTemplateRoot() {
  if (!DOM.template) return null;
  const fragment = DOM.template.content.cloneNode(true);
  return fragment.firstElementChild;
}

export function toggleEmptyState(visible) {
  if (!DOM.emptyState) return;
  DOM.emptyState.hidden = !visible;
}

export function renderPosts(posts, { requestAvatar } = {}) {
  if (!DOM.postList || !DOM.template) return;
  const frag = document.createDocumentFragment();

  posts.forEach((entry) => {
    const payload = entry?.post ? entry : { post: entry, author: entry?.author };
    const post = payload.post ?? {};
    const author = payload.author ?? {};

    const node = resolveTemplateRoot();
    if (!node) return;
    if (post.id != null) {
      node.dataset.postId = String(post.id);
      node.tabIndex = 0;
      node.setAttribute('role', 'button');
      node.setAttribute('aria-label', `${post.title || '게시글'} 상세 보기`);
    }

    const titleEl = node.querySelector('[data-post-title]');
    const timeEl = node.querySelector('[data-post-time]');
    const likesEl = node.querySelector('[data-post-likes]');
    const commentsEl = node.querySelector('[data-post-comments]');
    const viewsEl = node.querySelector('[data-post-views]');
    const authorEl = node.querySelector('[data-post-author]');
    const avatarImg = node.querySelector('[data-post-avatar-img]');

    if (titleEl) titleEl.textContent = post.title || '(제목 없음)';

    if (timeEl) {
      timeEl.dateTime = post.createdAt || '';
      timeEl.textContent = post.createdAt
        ? formatDateTime(post.createdAt)
        : '';
    }

    if (likesEl) likesEl.textContent = `좋아요 ${formatCount(post.likeCount ?? 0)}`;
    if (commentsEl) commentsEl.textContent = `댓글 ${formatCount(post.commentCount ?? 0)}`;
    if (viewsEl) viewsEl.textContent = `조회수 ${formatCount(post.viewCount ?? 0)}`;

    const authorName = author.nickname || '익명';
    if (authorEl) authorEl.textContent = authorName;

    if (avatarImg) {
      avatarImg.src = FALLBACK_AVATAR;
      avatarImg.alt = `${authorName}님의 프로필 이미지`;
      avatarImg.removeAttribute('data-avatar-token');

      if (author.imageUrl && typeof requestAvatar === 'function') {
        const token = `${++avatarTokenSeed}`;
        avatarImg.dataset.avatarToken = token;
        requestAvatar(author.imageUrl, (src) => {
          if (!src) return;
          if (avatarImg.dataset.avatarToken === token) {
            avatarImg.src = src;
          }
        });
      }
    }

    frag.appendChild(node);
  });

  DOM.postList.appendChild(frag);
}
