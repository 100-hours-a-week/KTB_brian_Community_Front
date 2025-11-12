import { POSTS_URL } from './config.js';
import { authHeaders } from '../../login/js/api.js';

export function fetchPost(postId) {
  return fetch(`${POSTS_URL}/${postId}`, {
    headers: authHeaders({ Accept: 'application/json' }),
    credentials: 'include',
  });
}

export function updatePost(postId, formData) {
  return fetch(`${POSTS_URL}/${postId}`, {
    method: 'PUT',
    body: formData,
    headers: authHeaders({ Accept: 'application/json' }),
    credentials: 'include',
  });
}

export function fetchImageWithAuth(imageUrl) {
  if (!imageUrl) throw new Error('imageUrl is required');
  return fetch(imageUrl, {
    headers: authHeaders(),
    credentials: 'include',
  });
}
