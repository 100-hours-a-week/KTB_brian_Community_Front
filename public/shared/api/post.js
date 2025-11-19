import {
  POSTS_URL,
  postCommentsUrl,
  postDetailUrl,
  postLikeUrl,
} from '../config/config.js';

import { setPageParams } from "./set-page-param.js";
import { authHeaders } from './auth.js';

const JSON_HEADERS = { Accept: 'application/json' };

// 게시글 단일 CRUD
export function createPost(formData) {
    return fetch(POSTS_URL, {
        method: 'POST',
        body: formData,
        headers: authHeaders(JSON_HEADERS),
        credentials: 'include',
    });
}

export function fetchPost(postId) {
    return fetch(postDetailUrl(postId), {
        headers: authHeaders(JSON_HEADERS),
        credentials: 'include',
    });
}

export function updatePost(postId, formData) {
    return fetch(`${POSTS_URL}/${postId}`, {
        method: 'PUT',
        body: formData,
        headers: authHeaders(JSON_HEADERS),
        credentials: 'include',
    });
}

export function deletePost(postId) {
    return fetch(postDetailUrl(postId), {
        method: 'DELETE',
        headers: authHeaders(JSON_HEADERS),
        credentials: 'include',
    });
}

// 게시글 보조 API
export function fetchPosts({ page = 0, size = 10 } = {}) {
  const url = setPageParams(POSTS_URL, page, size);

  return fetch(url, {
    headers: authHeaders(JSON_HEADERS),
    credentials: 'include',
  });
}

export function fetchMyPosts({ page = 0, size = 10 } = {}) {
  const url = setPageParams(`${POSTS_URL}/me`, page, size);

  return fetch(url, {
    headers: authHeaders(JSON_HEADERS),
    credentials: 'include',
  });
}

export function fetchLikedPosts({ page = 0, size = 10 } = {}) {
  const url = setPageParams(`${POSTS_URL}/like`, page, size);

  return fetch(url, {
    headers: authHeaders(JSON_HEADERS),
    credentials: 'include',
  });
}

// 댓글 CRUD API
export function createComment(postId, content) {
  return fetch(postCommentsUrl(postId), {
    method: 'POST',
    headers: authHeaders({
      ...JSON_HEADERS,
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
      ...JSON_HEADERS,
      'Content-Type': 'application/json',
    }),
    credentials: 'include',
    body: JSON.stringify({ body: content }),
  });
}

export function deleteComment(postId, commentId) {
  return fetch(`${postCommentsUrl(postId)}/${commentId}`, {
    method: 'DELETE',
    headers: authHeaders(JSON_HEADERS),
    credentials: 'include',
  });
}

export function fetchPostComments(postId, { page = 0, size = 10 } = {}) {
    const url = setPageParams(postCommentsUrl(postId), page, size);

    return fetch(url, {
        headers: authHeaders(JSON_HEADERS),
        credentials: 'include',
    });
}

// 좋아요
export function fetchPostLikeStatus(postId) {
  return fetch(postLikeUrl(postId), {
    headers: authHeaders(JSON_HEADERS),
    credentials: 'include',
  });
}

export function togglePostLike(postId) {
  return fetch(postLikeUrl(postId), {
    method: 'POST',
    headers: authHeaders(JSON_HEADERS),
    credentials: 'include',
  });
}

// 이미지 파일
import { ERR } from '../constants/messages.js';

export function fetchImageWithAuth(url) {
  if (!url) throw new Error(ERR.IMAGE_REQUIRED);
  return fetch(url, {
    headers: authHeaders(),
    credentials: 'include',
  });
}
