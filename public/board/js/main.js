import {
  fetchPosts,
  fetchMyPosts,
  fetchLikedPosts,
  fetchImageWithAuth,
} from '../../shared/api/post.js';
import { DOM } from './dom.js';
import { renderPosts, toggleEmptyState } from './ui.js';
import { normalizePostsResponse } from './utils.js';
import { fetchCurrentUser } from '../../shared/api/user.js';
import { redirectToLogin } from '../../shared/utils/navigation.js';
import { initAvatarSync } from '../../shared/avatar-sync.js';
import { MSG, ERR } from '../../shared/constants/messages.js';

const FETCHERS = {
  all: fetchPosts,
  mine: fetchMyPosts,
  liked: fetchLikedPosts,
};

const state = {
  page: 0,
  size: 5,
  isLoading: false,
  hasMore: true,
  observer: null,
  filter: 'all', // all | mine | liked
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
      if (!res.ok) throw new Error(`${ERR.POST_IMAGE_RESPONSE} (${res.status})`);
      return res.blob();
    })
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      avatarCache.set(imageUrl, objectUrl);
      apply(objectUrl);
    })
    .catch((err) => {
      console.warn(ERR.AUTHOR_IMAGE_RESPONSE, err);
    });
}

function getFetcher() {
  return FETCHERS[state.filter] || FETCHERS.all;
}

function resetPostList() {
  state.page = 0;
  state.hasMore = true;
  toggleEmptyState(false);
  if (DOM.postList) DOM.postList.replaceChildren();
}

async function loadPosts({ reset = false } = {}) {
  if (reset) {
    resetPostList();
  }
  if (state.isLoading || !state.hasMore) return;

  state.isLoading = true;
  const currentPage = state.page;
  const fetcher = getFetcher();

  try {
    const res = await fetcher({ page: currentPage, size: state.size });
    if (res.status === 401) return redirectToLogin();
    if (!res.ok) {
      throw new Error(`${ERR.POST_RESPONSE} (${res.status})`);
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
    console.error(ERR.POST_LIST_FETCH_FAIL, err);
    alert(ERR.POST_LIST_FETCH_FAIL);
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

function setActiveTab(tab) {
  if (!DOM.tabs || DOM.tabs.length === 0) return;
  Array.from(DOM.tabs).forEach((btn) => {
    const isActive = btn === tab;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
    btn.tabIndex = isActive ? 0 : -1;
  });
}

function handleTabClick(tab) {
  if (!tab || tab.dataset.tab === state.filter) return;
  state.filter = tab.dataset.tab || 'all';
  setActiveTab(tab);
  loadPosts({ reset: true });
}

function initTabs() {
  if (!DOM.tabs || DOM.tabs.length === 0) return;
  const initialActive =
    Array.from(DOM.tabs).find((tab) => tab.classList.contains('is-active')) ||
    DOM.tabs[0];
  setActiveTab(initialActive);
  DOM.tabs.forEach((tab) => {
    tab.addEventListener('click', () => handleTabClick(tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTabClick(tab);
      }
    });
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
    if (res.status === 401) return redirectToLogin();
    if (!res.ok) throw new Error(`${ERR.USER_FETCH} (${res.status})`);

    const payload = await res.json();
    const user = payload?.data ?? payload ?? {};

    if (user.imageUrl) {
      try {
        const resImg = await fetchImageWithAuth(user.imageUrl);
        if (!resImg.ok) throw new Error(`${ERR.IMAGE_RESPONSE} (${resImg.status})`);
        const blob = await resImg.blob();
        const objectUrl = URL.createObjectURL(blob);
        headerAvatarController.setAvatar(objectUrl, { track: 'external' });
      } catch (imgErr) {
        console.warn(ERR.AVATAR_IMAGE_RESPONSE, imgErr);
      }
    } else {
      headerAvatarController.setAvatar(null);
    }
  } catch (err) {
    console.warn(ERR.USER_FETCH, err);
  }
}

function init() {
  initNewPostButton();
  initTabs();
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
