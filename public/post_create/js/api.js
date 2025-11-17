import { POSTS_URL } from '../../shared/config/config.js';
import { authHeaders } from '../../login/js/api.js';

export function createPost(formData) {
  return fetch(POSTS_URL, {
    method: 'POST',
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
