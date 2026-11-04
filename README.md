# Sunday Drive · 선데이 드라이브

한국 운전자를 위한 일본 운전 상황 퀴즈. 모든 문제에 그림이 있고, 두 행동 중 하나를 고릅니다. 결과에서 틀린 문제를 다시 풀거나 맞은 문제의 그림·정답·해설을 다시 볼 수 있습니다.

[사이트 열기](https://interruping.github.io/sundaydrive_in_japan/)

## GitHub Pages 배포

`main`에 푸시하면 [배포 워크플로](.github/workflows/pages.yml)가 문제 그림을 생성하고 JavaScript 문법·출제·채점·저장·그림 검사를 실행합니다. 검사가 통과하면 `dist/`만 GitHub Pages에 배포합니다. 별도 배포 토큰은 필요하지 않습니다.

배포 상태와 수동 재실행은 저장소의 **Actions → Deploy GitHub Pages**에서 확인할 수 있습니다. Pages의 게시 소스는 **GitHub Actions**입니다.

## 실행

Node.js 22 이상. 앱 실행에 외부 패키지 설치나 빌드가 필요하지 않습니다.

```sh
npm run dev
```

http://localhost:4173 에서 열 수 있습니다. `PORT=3000 npm run dev`로 포트를 바꿀 수 있습니다.

## 구성

- `dist/`: 바로 호스팅할 수 있는 HTML, CSS, JavaScript
- `dist/scenes/`: 문제별 독립 SVG 60개와 모바일 그림 60개
- `scripts/scene-parts/`: 시설 진출입·차로·우선순위 그림 제작 코드
- `scripts/`: 정적 개발 서버와 문법 검사
- `tests/`: 문제 은행, 출제·채점·저장 검증
- `docs/`: 디자인 방향과 교통법규 출처

## 검증

```sh
npm run check
npm test
```

실제 브라우저 검증은 개발 서버를 켠 상태에서 실행합니다. Chrome이 설치되어 있어야 합니다.

```sh
npm install
npm run test:browser
npm run test:icons
```

모바일·PC 화면, 90점 통과·85점 재도전, 오답 복습, 맞은 문제 다시 보기, 새 시험, 진행 저장 및 모든 문제의 SVG를 검사합니다. 맞은 문제 다시 보기는 원래 시험 순서와 점수를 보존하고 확인 중인 위치도 저장합니다. 원형 화살표는 9가지 크기로 렌더해 머리와 곡선의 연결을 검사합니다. 스크린샷은 `test-results/`에 생성됩니다. 서버 주소는 `BASE_URL`, 브라우저 채널은 `BROWSER_CHANNEL`로 지정할 수 있습니다.

그림을 수정했다면 `npm run build:scenes`로 문제별 SVG를 갱신합니다. `node tests/visual-audit.mjs`는 모든 문항을 그림·질문·선택지와 함께 렌더해 직접 대조할 검토 이미지를 만듭니다.

복합 신호, 우회전 정지 위치, 중앙선과 시설 진입, 차로와 내비, 건널목 신호, 교차로 우선순위의 60개 상황 중 20문제를 출제하며 90점 이상이면 통과합니다. 주요 혼동 유형은 매 시험에 포함됩니다. 각 문제의 해설에서 공식 자료를 확인할 수 있습니다. 문제와 채점은 브라우저에서 실행되고 진행 상황은 사용 중인 브라우저에 저장됩니다.
