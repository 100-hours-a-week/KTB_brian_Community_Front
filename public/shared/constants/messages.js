export const MSG = {
  // 공통 성공/라벨
  PROCESSING: '처리 중...',
  PROCESSING_UPDATE: '수정 중...',
  POST_PROCESSING: '등록 중...',
  POST_SUBMIT_LABEL: '완료',
  SUBMIT_UPDATE: '수정하기',
  COMMENT_SUBMIT_LABEL: '댓글 등록',
  COMMENT_UPDATE_LABEL: '댓글 수정',
  COMMENT_SUBMITTING: '등록 중...',
  COMMENT_UPDATING: '수정 중...',

  // 성공 메시지
  SIGNUP_SUCCESS: '회원가입이 완료되었습니다!',
  POST_CREATE_SUCCESS: '게시글이 등록되었습니다!',
  POST_UPDATE_SUCCESS: '게시글이 수정되었습니다!',
  POST_DELETE_SUCCESS: '게시글이 삭제되었습니다.',
  DELETE_SUCCESS: '회원 탈퇴가 완료되었습니다.',

  // 안내/상태
  PROFILE_NO_CHANGES: '변경된 내용이 없습니다.',
};

// 에러/실패 메시지
export const ERR = {
  // 공통
  NETWORK: '네트워크 오류가 발생했습니다.',
  REQUEST_RETRY: '요청 처리에 실패했습니다. 잠시 후 다시 시도해주세요.',
  INVALID_ACCESS: '잘못된 접근입니다.',

  // 인증/계정
  INVALID_CREDENTIALS: '*아이디 또는 비밀번호를 확인해주세요.',

  // 중복/가입
  DUP_INFO_DEFAULT: '*중복된 정보가 있습니다.',
  DUP_EMAIL: '*중복된 이메일입니다.',
  DUP_NICK: '*중복된 닉네임입니다.',
  DUP_EMAIL_FAIL: '이메일 중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.',
  DUP_NICK_FAIL: '닉네임 중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.',

  // 프로필/마이페이지
  PROFILE_IMG_FAIL: '프로필 이미지를 불러오지 못했습니다.',
  USER_FETCH: '사용자 정보를 불러오지 못했습니다.',
  UPDATE_FAIL: '수정에  실패했습니다. 잠시 후 다시 시도해주세요.',
  UPDATE_ERROR: '수정 중 오류가 발생했습니다.',
  NICK_DUP_FAIL: '닉네임 중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.',
  DELETE_FAIL: '회원 탈퇴에 실패했습니다.',
  DELETE_ERROR: '회원 탈퇴 중 오류가 발생했습니다.',

  // 비밀번호
  PW_UPDATE_FAIL: '비밀번호 수정에 실패했습니다.',
  PW_UPDATE_ERROR: '비밀번호 수정 중 오류가 발생했습니다.',
  AVATAR_LOAD_FAIL: '헤더 아바타 로드 실패.',

  // 게시글/이미지
  POST_NOT_FOUND: '존재하지 않는 게시글입니다.',
  POST_FETCH_FAIL: '게시글 정보를 불러올 수 없습니다.',
  POST_LIST_FETCH_FAIL: '게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
  POST_CREATE_FAIL: '게시글 등록에 실패했습니다.',
  POST_UPDATE_FAIL: '게시글 수정에 실패했습니다.',
  POST_DELETE_ERROR: '게시글 삭제 중 오류가 발생했습니다.',
  IMAGE_REQUIRED: 'image url is required',
  USER_IMAGE_REQUIRED: 'imageUrl is required',
  IMAGE_RESPONSE: '이미지 응답 오류',
  POST_IMAGE_RESPONSE: '게시글 이미지를 불러오지 못했습니다.',
  AUTHOR_IMAGE_RESPONSE: '작성자 이미지를 불러오지 못했습니다.',
  AVATAR_IMAGE_RESPONSE: '아바타 이미지를 불러오지 못했습니다.',

  // 댓글/좋아요
  LIKE_STATUS_FAIL: '좋아요 상태를 불러오지 못했습니다.',
  LIKE_PROCESS: '좋아요 처리 실패',
  LIKE_TOGGLE_FAIL: '좋아요 처리 중 오류가 발생했습니다.',
  COMMENT_FETCH_FAIL: '댓글 정보를 불러오지 못했습니다.',
  COMMENT_FETCH: '댓글 정보를 불러오지 못했습니다.',
  COMMENT_CREATE_FAIL: '댓글 등록에 실패했습니다.',
  COMMENT_CREATE_ERROR: '댓글 등록 중 오류가 발생했습니다.',
  COMMENT_UPDATE_FAIL: '댓글 수정에 실패했습니다.',
  COMMENT_UPDATE_ERROR: '댓글 수정 중 오류가 발생했습니다.',
  COMMENT_DELETE_ERROR: '댓글 삭제 중 오류가 발생했습니다.',
  COMMENT_DELETE: '댓글 삭제 실패',
  POST_DELETE: '게시글 삭제 실패',
};
