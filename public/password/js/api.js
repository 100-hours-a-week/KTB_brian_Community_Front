import { USER_PASSWORD_URL } from '../../shared/config/config.js';
import { authHeaders } from '../../login/js/api.js';

export function updatePassword({ password }) {
  return fetch(USER_PASSWORD_URL, {
    method: 'PATCH',
    headers: authHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({ password }),
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
