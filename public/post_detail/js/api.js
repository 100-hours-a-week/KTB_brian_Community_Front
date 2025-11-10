import {
  POSTS_URL,
  postCommentsUrl,
  postDetailUrl,
  postLikeUrl,
} from './config.js';
import { authHeaders } from '../../login/js/api.js';

const DEFAULT_JSON_HEADERS = {
  Accept: 'application/json',
};

export function fetchPost(postId) {
  return fetch(postDetailUrl(postId), {
    headers: authHeaders(DEFAULT_JSON_HEADERS),
    credentials: 'include',
  });
}

export function fetchPostComments(postId, { page = 0, size = 10 } = {}) {
  const url = new URL(postCommentsUrl(postId));
  url.searchParams.set('page', page);
  url.searchParams.set('size', size);
  return fetch(url.toString(), {
    headers: authHeaders(DEFAULT_JSON_HEADERS),
    credentials: 'include',
  });
}

export function createComment(postId, content) {
  return fetch(postCommentsUrl(postId), {
    method: 'POST',
    headers: authHeaders({
      ...DEFAULT_JSON_HEADERS,
      'Content-Type': 'application/json',
    }),
    credentials: 'include',
    body: JSON.stringify({ body: content }),
  });
}

export function updateComment(postId, commentId, content) {
  return fetch(`${postCommentsUrl(postId)}/${commentId}`, {
    method: 'PUT',
    headers: authHeaders({
      ...DEFAULT_JSON_HEADERS,
      'Content-Type': 'application/json',
    }),
    credentials: 'include',
    body: JSON.stringify({ content }),
  });
}

export function deleteComment(postId, commentId) {
  return fetch(`${postCommentsUrl(postId)}/${commentId}`, {
    method: 'DELETE',
    headers: authHeaders(DEFAULT_JSON_HEADERS),
    credentials: 'include',
  });
}

export function fetchPostLikeStatus(postId) {
  return fetch(postLikeUrl(postId), {
    headers: authHeaders(DEFAULT_JSON_HEADERS),
    credentials: 'include',
  });
}

export function togglePostLike(postId) {
  return fetch(postLikeUrl(postId), {
    method: 'POST',
    headers: authHeaders(DEFAULT_JSON_HEADERS),
    credentials: 'include',
  });
}

export function fetchImageWithAuth(url) {
  if (!url) throw new Error('image url is required');
  return fetch(url, {
    headers: authHeaders(),
    credentials: 'include',
  });
}

export function deletePost(postId) {
  return fetch(postDetailUrl(postId), {
    method: 'DELETE',
    headers: authHeaders(DEFAULT_JSON_HEADERS),
    credentials: 'include',
  });
}
