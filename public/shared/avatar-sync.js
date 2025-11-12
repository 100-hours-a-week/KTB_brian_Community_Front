const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><g fill="none" fill-rule="evenodd"><circle cx="48" cy="48" r="48" fill="%23E2E2E2"/><circle cx="48" cy="38" r="18" fill="%23BDBDBD"/><path d="M16 82c6.4-15.333 18.4-23 36-23s29.6 7.667 36 23" fill="%23BDBDBD"/></g></svg>';

function applyAvatarVisual(el, src) {
  if (!el) return;
  if (el.tagName === 'IMG') {
    if (el.src !== src) el.src = src;
    if (!el.alt) el.alt = '사용자 프로필 이미지';
  } else {
    el.style.backgroundImage = `url("${src}")`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.style.backgroundRepeat = 'no-repeat';
  }
}

/**
 * Shared avatar controller that keeps multiple avatar targets in sync.
 * @param {object} options selectors & hooks for this page
 */
export function initAvatarSync({
  previewSelector = '[data-avatar-preview]',
  targetSelectors = [],
  fileInputSelector,
  triggerSelector,
  initialSrc,
  fallbackSrc = DEFAULT_AVATAR,
} = {}) {
  const previewEl = document.querySelector(previewSelector);
  const targets = Array.from(
    new Set(
      targetSelectors
        .map((sel) => Array.from(document.querySelectorAll(sel)))
        .flat()
        .filter(Boolean),
    ),
  );

  const state = { fileObjectUrl: null, externalObjectUrl: null, currentSrc: null };

  function trackObjectUrl(kind, value) {
    if (kind !== 'file' && kind !== 'external') return;
    const key = kind === 'file' ? 'fileObjectUrl' : 'externalObjectUrl';
    if (state[key]) URL.revokeObjectURL(state[key]);
    state[key] = value;
  }

  function setAvatar(src, { track } = {}) {
    const nextSrc =
      src ||
      previewEl?.dataset.avatarSrc ||
      previewEl?.getAttribute?.('src') ||
      fallbackSrc;

    if (previewEl && previewEl.tagName === 'IMG') {
      previewEl.src = nextSrc;
    }
    targets.forEach((el) => applyAvatarVisual(el, nextSrc));
    if (track) trackObjectUrl(track, nextSrc);
    state.currentSrc = nextSrc;
    return nextSrc;
  }

  function revokeAllObjectUrls() {
    ['fileObjectUrl', 'externalObjectUrl'].forEach((key) => {
      if (state[key]) {
        URL.revokeObjectURL(state[key]);
        state[key] = null;
      }
    });
  }

  function handleFileChange(ev) {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const next = URL.createObjectURL(file);
    setAvatar(next, { track: 'file' });
  }

  const resolved = setAvatar(initialSrc);

  const fileInput = fileInputSelector
    ? document.querySelector(fileInputSelector)
    : null;

  if (fileInput) {
    fileInput.addEventListener('change', handleFileChange);
  }

  if (triggerSelector && fileInput) {
    document.querySelectorAll(triggerSelector).forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
      });
    });
  }

  const controller = {
    currentSrc: resolved,
    setAvatar(src, opts) {
      const next = setAvatar(src, opts);
      controller.currentSrc = next;
      return next;
    },
    destroy() {
      revokeAllObjectUrls();
      if (fileInput) fileInput.removeEventListener('change', handleFileChange);
    },
  };

  return controller;
}
