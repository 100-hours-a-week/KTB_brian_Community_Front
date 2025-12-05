// 공용 API 엔드포인트 및 URL 빌더
export const API_BASE = 'http://localhost:8080';

// 인증/사용자
export const LOGIN_URL = `${API_BASE}/auth/login`;
export const USER_DOMAIN_URL = `${API_BASE}/users`;
export const USER_AVAILABILITY_URL = `${USER_DOMAIN_URL}/availability`;
export const USER_AVAILABILITY_EMAIL_URL = `${USER_AVAILABILITY_URL}/email`;
export const USER_AVAILABILITY_NICKNAME_URL = `${USER_AVAILABILITY_URL}/nickname`;
export const USER_ME_URL = `${USER_DOMAIN_URL}/me`;
export const USER_PASSWORD_URL = `${USER_ME_URL}/password`;

// 게시글
export const POSTS_URL = `${API_BASE}/posts`;
export const postDetailUrl = (postId) => `${POSTS_URL}/${postId}`;
export const postCommentsUrl = (postId) => `${postDetailUrl(postId)}/comments`;
export const postLikeUrl = (postId) => `${postDetailUrl(postId)}/like`;
