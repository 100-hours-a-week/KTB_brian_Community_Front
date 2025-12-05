# 프레임 로그 커뮤니티 프론트엔드

> 프레임 로그 커뮤니티 서비스를 위한 정적 프론트엔드 프로젝트입니다.  
> 로그인·회원가입·게시판·게시글 상세·마이페이지 등 핵심 화면을 순수 HTML/CSS/Vanilla JS로 구성하고, 재사용 가능한 유틸/검증/라우팅 모듈을 통해 페이지마다 동일한 인터랙션과 UX를 제공합니다.

## 주요 기능
- **인증 흐름**: 로그인, 회원가입, 비밀번호 변경, 로그아웃까지 API 연동 및 정교한 폼 검증/중복 체크 지원.
- **게시판/게시글**: 목록, 상세, 작성, 수정, 삭제, 좋아요, 조회수, 댓글 CRUD를 지원하며 실시간 수치와 상태 UI를 제공.
- **프로필/아바타 관리**: `initAvatarSync` 모듈로 여러 화면에서 동일한 프로필 업로드/미리보기 경험과 인증된 이미지 로딩을 구현.
- **공유 모듈**: `public/shared` 디렉터리에 API 클라이언트, 검증기, 라우트 링크, 공통 상수 등을 모아 유지보수성을 높임.
- **접근성 고려**: 시맨틱 마크업, aria 속성, 키보드 포커스 가능한 컴포넌트(모달, 메뉴 등)를 반영해 기본적인 접근성을 확보.

## 기술 스택
- HTML5 & CSS3
- Vanilla JavaScript (ES Modules)

## 프로젝트 구조 (요약)
```
public/
  board/           # 게시판 목록
  post_create/     # 게시글 작성
  post_edit/       # 게시글 수정
  post_detail/     # 게시글 상세 + 댓글
  login/           # 로그인 화면
  signin/          # 회원가입
  password/        # 비밀번호 변경
  mypage/          # 마이페이지(닉네임/아바타)
  shared/          # 공용 JS 모듈 (api, config, validators, utils 등)
  styles.css       # 전역 스타일 토큰 및 컴포넌트 스타일
README.md
package.json
package-lock.json
```
