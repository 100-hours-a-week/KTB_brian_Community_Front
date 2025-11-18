import { fetchPosts, fetchImageWithAuth } from '../../shared/api/post.js';
import { DOM } from './dom.js';
import { renderPosts, toggleEmptyState } from './ui.js';
import { normalizePostsResponse } from './utils.js';
import { fetchCurrentUser } from '../../shared/api/user.js';
import { initAvatarSync } from '../../shared/avatar-sync.js';

const state = {
  page: 0,
  size: 5,
  isLoading: false,
  hasMore: true,
  observer: null,
};

const avatarCache = new Map();
let headerAvatarController = null;

function disconnectObserver() {
  if (state.observer && DOM.sentinel) {
    state.observer.unobserve(DOM.sentinel);
    state.observer.disconnect();
    state.observer = null;
  }
}

function requestAuthorAvatar(imageUrl, apply) {
  if (!imageUrl || typeof apply !== 'function') return;
  if (avatarCache.has(imageUrl)) {
    apply(avatarCache.get(imageUrl));
    return;
  }

  fetchImageWithAuth(imageUrl)
    .then((res) => {
      if (!res.ok) throw new Error(`이미지를 불러오지 못했습니다. (${res.status})`);
      return res.blob();
    })
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      avatarCache.set(imageUrl, objectUrl);
      apply(objectUrl);
    })
    .catch((err) => {
      console.warn('작성자 이미지를 불러오지 못했습니다.', err);
    });
}

async function loadPosts() {
  if (state.isLoading || !state.hasMore) return;

  state.isLoading = true;
  const currentPage = state.page;

  try {
    const res = await fetchPosts({ page: currentPage, size: state.size });
    if (res.status === 401) {
      window.location.href = '../login/index.html';
      return;
    }
    if (!res.ok) {
      throw new Error(`게시글 응답 오류 (${res.status})`);
    }

    const json = await res.json();
    const { list, meta } = normalizePostsResponse(json);

    if (currentPage === 0 && list.length === 0) {
      toggleEmptyState(true);
    } else if (list.length > 0) {
      toggleEmptyState(false);
      renderPosts(list, { requestAvatar: requestAuthorAvatar });
    }

    state.page = currentPage + 1;
    const hasMore =
      meta.last === undefined ? list.length === state.size : meta.last === false;
    state.hasMore = hasMore;
    if (!state.hasMore) disconnectObserver();
  } catch (err) {
    console.error('게시글을 불러오는 중 오류가 발생했습니다.', err);
    alert('게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    state.hasMore = false;
    disconnectObserver();
  } finally {
    state.isLoading = false;
  }
}

function initInfiniteScroll() {
  if (!DOM.sentinel || state.observer) return;
  state.observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadPosts();
        }
      });
    },
    { rootMargin: '200px' },
  );
  state.observer.observe(DOM.sentinel);
}

function initNewPostButton() {
  if (!DOM.newPostBtn) return;
  DOM.newPostBtn.addEventListener('click', () => {
    window.location.href = '../post_create/index.html';
  });
}

function handlePostNavigate(target) {
  const card = target.closest('.post-card');
  if (!card || !card.dataset.postId) return;
  const postId = card.dataset.postId;
  window.location.href = `../post_detail/index.html?postId=${encodeURIComponent(
    postId,
  )}`;
}

function initPostNavigation() {
  if (!DOM.postList) return;
  DOM.postList.addEventListener('click', (e) => {
    handlePostNavigate(e.target);
  });
  DOM.postList.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handlePostNavigate(e.target);
      if (e.key === ' ') e.preventDefault();
    }
  });
}

function releaseAvatarUrls() {
  avatarCache.forEach((url) => URL.revokeObjectURL(url));
  avatarCache.clear();
  if (headerAvatarController?.destroy) {
    headerAvatarController.destroy();
  }
}

async function hydrateCurrentUser() {
  if (!headerAvatarController) return;

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
        if (!resImg.ok) throw new Error(`헤더 이미지 응답 오류 (${resImg.status})`);
        const blob = await resImg.blob();
        const objectUrl = URL.createObjectURL(blob);
        headerAvatarController.setAvatar(objectUrl, { track: 'external' });
      } catch (imgErr) {
        console.warn('헤더 아바타 이미지를 불러오지 못했습니다.', imgErr);
      }
    } else {
      headerAvatarController.setAvatar(null);
    }
  } catch (err) {
    console.warn('사용자 정보를 불러오지 못했습니다.', err);
  }
}

function init() {
  initNewPostButton();
  initPostNavigation();
  initInfiniteScroll();
  headerAvatarController = initAvatarSync({
    previewSelector: '[data-avatar-preview]',
    targetSelectors: ['[data-avatar-menu]'],
  });
  hydrateCurrentUser();
  loadPosts();
  window.addEventListener('beforeunload', releaseAvatarUrls, { once: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
