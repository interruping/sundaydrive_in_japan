# 시나리오와 법규 검토

확인일: 2026-11-04. 일반 승용차로 일본을 운전하는 한국 운전자 대상. 점수는 학습 기준이며 운전 자격 인증이 아니다.

## 문제 구성

기본 상식 암기 문제를 제외하고, 여러 시각 조건을 함께 판단하는 60개 상황으로 구성했다.

| 범주 | 문제 은행 | 한 시험 |
| --- | ---: | ---: |
| 복합 화살표·내비·표지와 신호 | 12 | 4 |
| 차로별 정지선·교차로 안 우회전 대기 | 12 | 4 |
| 중앙선·시설 진출입·횡단금지·인도 | 12 | 4 |
| 차로별 방향·내비 충돌·합류·출구 | 8 | 3 |
| 건널목 경보등·차량 신호·별도 교차로 | 8 | 3 |
| 우선도로·가려진 횡단보도·노선버스·회전교차로 | 8 | 2 |

복합 화살표 2개, 차로별 정지선, 내부 대기 표시, 황색 중앙선의 시설 진입, 횡단금지, 차로별 방향, 차량 신호가 있는/없는 건널목은 시험마다 포함한다.

## 확인한 근거

각 문제의 `sources`가 해설의 원문 링크로 연결된다. `dist/questions.js`의 `SOURCES`에 URL을 관리한다.

- 신호·방향 화살표·진입금지·유턴금지: [NPA 신호 및 도로표지](https://www.npa.go.jp/english/bureau/traffic/traffic-light_english.pdf)
- 시설 출입·인도·노선버스·회전·교차로: [NPA 교칙](https://www.npa.go.jp/bureau/traffic/20241113kyousoku.pdf)
- 차로별 진행 방향: [NPA 안전운전 안내](https://www.npa.go.jp/bureau/traffic/anzen/poster/r8_leaflet_japan_anzenunten_jp.pdf)
- 중앙선 의미: [JAF 중앙선 구분](https://jaf.or.jp/common/kuruma-qa/category-accident/subcategory-rule/faq175)
- 시설 진출입과 우선관계: [도로교통법](https://laws.e-gov.go.jp/law/335AC0000000105), 25조·25조의2·36조
- 차량 횡단금지: [NPA 규제 기준](https://www.npa.go.jp/laws/notification/koutuu/kisei/kisei20240726_5.pdf), 제38
- 같은 방향 차로 사이 황색선: [NPA 차로 변경 금지](https://www.npa.go.jp/bureau/traffic/seibi2/kisei/mokuteki/shinnrohennkoukinnshi/shinnrohennkoukinnshi.html)
- 신호에 따른 정지 위치: [홋카이도 경찰](https://www.police.pref.hokkaido.lg.jp/info/koutuu/rule-gaikokujin/rule-japan.html). 이 자료의 오래된 기본속도 문구는 사용하지 않는다.
- 실선 정지선과 안내선: [나가사키 경찰](https://www.police.pref.nagasaki.jp/police/kotsu-anzen/kotsu-kisei/site/teisisen/)
- 교차로 내부 대기 안내선: [오사카 경찰](https://www.police.pref.osaka.lg.jp/material/files/group/2/r0602_kisiwada.pdf#page=4)
- 흰 바탕·파란 왼쪽 화살표의 좌회전 허용: [JAF Mate](https://jafmate.jp/safety/traffic_rules_quiz_20240724.html)
- 건널목 정지와 차량 신호 예외: [JAF](https://jaf.or.jp/common/kuruma-qa/category-accident/subcategory-rule/faq118)
- 가려진 횡단보도: [NPA 보행자 보호](https://www.npa.go.jp/bureau/traffic/oudanhodou/info.html)
- 회전교차로: [히로시마 경찰](https://www.pref.hiroshima.lg.jp/site/police/kanzyoukousaten.html)
- 합류·출구: [JAF 합류](https://jaf.or.jp/common/kuruma-qa/category-drive/subcategory-technique/faq130), [JAF 출구를 놓친 경우](https://jaf.or.jp/common/kuruma-qa/category-trouble/subcategory-highway/faq111)

## 그림과 해설이 일치해야 하는 조건

- 황색 중앙선은 추월을 위한 반대쪽 침범 금지다. 도로 밖 오른쪽 시설 진입은 다른 금지 표지와 정상 교통 방해 여부를 별도로 판단한다. 같은 방향 차로 사이 황색선과 혼동하지 않는다.
- 시설 진입을 허용하는 기본 그림에는 인도·접근 차량·횡단금지 표지를 그리지 않는다. 이 조건이 바뀌는 문항에는 해당 도형을 실제로 추가한다.
- 차로별 A/B 실선 정지선 문제는 각 선이 신호 정지선인 가상 교차로를 명확히 그린다. 우회전은 언제나 앞쪽 선까지 진입해도 된다는 일반 규칙으로 해설하지 않는다.
- 교차로 내부 대기 표시는 신호 정지선과 위치·모양을 분리한다. 이미 진입한 차와 진입 전 차의 실제 위치를 바꾼다.
- 내비 경로와 내 차로 화살표는 별개다. 우회전 화살표가 있는 차로 문제에는 실제 회전할 수 있는 교차로가 있어야 한다.
- 차로 2개가 함께 우회전하면 출구에도 두 차로와 서로 교차하지 않는 유도선을 그린다.
- 건널목의 빨간 2등 경보등과 3색 차량 신호등을 각각 표시한다. 별도 교차로의 신호에는 실제 별도 교차로와 자체 정지선을 그린다.
- 모든 차량에 역할 라벨을 연결한다. 색상만으로 내 차를 구별하게 하지 않는다.

## 그림 산출물과 검수

`dist/scenes/<id>.svg`, `<id>.mobile.svg`는 각 문제에 대응하는 독립 파일이다. 공통 도형은 제작 도구로 재사용하지만, 앱은 문항별 완성 그림을 로드한다. 도로 구조·표지·차량 위치·신호 상태를 문항별로 구성한다.

`npm run build:scenes`로 산출물을 만들고 `node tests/visual-audit.mjs`로 60개 그림·질문·선택지를 한꺼번에 대조할 검토 이미지를 만든다. 코드를 검사하는 것만으로 의미 일치를 검증했다고 보지 않는다. 변경한 그림은 모바일 크기에서도 직접 확인한다.

문제 의미가 바뀌면 `BANK_VERSION`을 올린다. 이전 버전 저장 시험은 복구하지 않는다.
