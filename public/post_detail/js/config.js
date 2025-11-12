export const API_BASE = 'http://localhost:8080';
export const POSTS_URL = `${API_BASE}/posts`;

export function postDetailUrl(postId) {
  return `${POSTS_URL}/${postId}`;
}

export function postCommentsUrl(postId) {
  return `${postDetailUrl(postId)}/comments`;
}

export function postLikeUrl(postId) {
  return `${postDetailUrl(postId)}/like`;
}
