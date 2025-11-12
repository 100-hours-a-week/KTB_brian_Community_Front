import { USER_ME_URL } from './config.js';
import { authHeaders } from '../../login/js/api.js';

export function fetchCurrentUser() {
  return fetch(USER_ME_URL, {
    headers: authHeaders({ Accept: 'application/json' }),
    credentials: 'include',
  });
}

export function fetchUserImage(imageUrl) {
  if (!imageUrl) throw new Error('imageUrl is required');
  return fetch(imageUrl, {
    headers: authHeaders(),
    credentials: 'include',
  });
}

export function updateUserProfile(formData) {
  return fetch(USER_ME_URL, {
    method: 'PATCH',
    body: formData,
    headers: authHeaders({ Accept: 'application/json' }),
    credentials: 'include',
  });
}

export function deleteCurrentUser() {
  return fetch(USER_ME_URL, {
    method: 'DELETE',
    headers: authHeaders({ Accept: 'application/json' }),
    credentials: 'include',
  });
}
