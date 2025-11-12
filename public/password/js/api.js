import { USER_PASSWORD_URL } from './config.js';
import { authHeaders } from '../../login/js/api.js';

export function updatePassword(formData) {
  return fetch(USER_PASSWORD_URL, {
    method: 'PATCH',
    body: formData,
    headers: authHeaders({ Accept: 'application/json' }),
    credentials: 'include',
  });
}
