import {
  USER_DOMAIN_URL,
  USER_ME_URL,
  USER_PASSWORD_URL,
} from '../config/config.js';
import { authHeaders } from './auth.js';

// 회원가입
export function submitSignIn(fd) {
  return fetch(USER_DOMAIN_URL, {
    method: 'POST',
    body: fd,
    headers: { Accept: 'application/json' },
  });
}

// 현재 유저 정보 조회
export function fetchCurrentUser() {
  return fetch(USER_ME_URL, {
    headers: authHeaders({ Accept: 'application/json' }),
    credentials: 'include',
  });
}

// 유저 업데이트
export function updateUserProfile(formData) {
  return fetch(USER_ME_URL, {
    method: 'PATCH',
    body: formData,
    headers: authHeaders({ Accept: 'application/json' }),
    credentials: 'include',
  });
}

// 유저 삭제
export function deleteCurrentUser() {
  return fetch(USER_ME_URL, {
    method: 'DELETE',
    headers: authHeaders({ Accept: 'application/json' }),
    credentials: 'include',
  });
}

// 유저 비밀번호 정보 수정
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

// 유저 이미지 정보 수정
export function fetchUserImage(imageUrl) {
  if (!imageUrl) throw new Error('imageUrl is required');
  return fetch(imageUrl, {
    headers: authHeaders(),
    credentials: 'include',
  });
}
