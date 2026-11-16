# 김민서(나무쌤) | 청소년 교육 전문가 포트폴리오

청소년 교육 전문가 김민서(나무쌤)의 강사 경력, 교육 프로그램 및 프로젝트 아카이브 포트폴리오 웹사이트입니다.

## GitHub Pages로 바로 홈페이지 열기 (자동 배포)

이 저장소에는 GitHub Pages용 자동 빌드 및 배포 설정(`.github/workflows/deploy.yml`)이 포함되어 있습니다.

1. 이 프로젝트를 내 GitHub 저장소에 업로드(Push)합니다.
2. GitHub 저장소 상단 **Settings** → 좌측 메뉴 **Pages**로 이동합니다.
3. **Build and deployment → Source** 항목을 **`GitHub Actions`**로 선택합니다.
4. 상단 **Actions** 탭에서 `Deploy Portfolio to GitHub Pages` 워크플로우가 완료되면 `https://<깃허브아이디>.github.io/<저장소이름>/` 주소로 바로 접속해 홈페이지로 사용할 수 있습니다.

> **참고**: GitHub Pages 정적 호스팅 환경에서는 별도 백엔드 서버 없이 기본 포트폴리오 데이터가 자동 로드되며, 문의 폼 작성 시 강사 이메일(`minsee03@naver.com`) 발송 링크가 함께 제공됩니다. (Node 서버 환경에서는 `npm run dev` 또는 `npm run build && npm start`로 전체 서버형 관리자 CMS를 실행할 수 있습니다.)
