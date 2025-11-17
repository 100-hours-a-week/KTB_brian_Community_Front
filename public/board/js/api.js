import { POSTS_URL } from '../../shared/config/config.js';
import { authHeaders } from '../../login/js/api.js';

export function fetchPosts({ page = 0, size = 10 } = {}) {
  const url = new URL(POSTS_URL);
  if (page !== undefined && page !== null) url.searchParams.set('page', page);
  if (size !== undefined && size !== null) url.searchParams.set('size', size);

  return fetch(url.toString(), {
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
