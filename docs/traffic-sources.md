# 시나리오와 법규 검토

확인일: 2026-11-05. 일반 승용차로 일본을 운전하는 한국 운전자 대상. 점수는 학습 기준이며 운전 자격 인증이 아니다.

## 문제 구성

도로의 시각 조건을 판단하는 상황을 중심으로 74문항을 구성했다. 참고 블로그와 비교해 보완한 14문항의 근거는 [추가 검토 기록](blog-gap-review.md)에 정리했다.

| 범주 | 문제 은행 | 한 시험 |
| --- | ---: | ---: |
| 복합 화살표·내비·표지와 신호 | 14 | 5 |
| 실제 사례의 깊은 우회전 대기 위치 | 12 | 4 |
| 중앙선·시설 진출입·횡단금지·인도 | 12 | 4 |
| 차로별 방향·내비 충돌·합류·출구 | 10 | 3 |
| 건널목 경보등·차량 신호·별도 교차로 | 8 | 3 |
| 우선도로·일시정지·보행자·노선버스·회전교차로 | 10 | 3 |
| 정차 규제·사고 대응·출발 전 조작 확인 | 8 | 3 |

복합 화살표 2개, 깊은 우회전 대기 위치로 진입하는 초록불 상황과 진입 전 멈추는 적신호 상황, 황색 중앙선 너머 시설 진입이 가능한 기본 문제(entry-01), 횡단금지, 차로별 방향, 차량 신호가 있는/없는 건널목은 시험마다 포함한다.

## 확인한 근거

각 문제의 `sources`가 해설의 원문 링크로 연결된다. `dist/questions.js`의 `SOURCES`에 URL을 관리한다.

- 신호·방향 화살표·진입금지·유턴금지: [NPA 신호 및 도로표지](https://www.npa.go.jp/english/bureau/traffic/traffic-light_english.pdf)
- 시설 출입·인도·노선버스·회전·교차로: [NPA 교칙](https://www.npa.go.jp/bureau/traffic/20241113kyousoku.pdf)
- 차로별 진행 방향: [NPA 안전운전 안내](https://www.npa.go.jp/bureau/traffic/anzen/poster/r8_leaflet_japan_anzenunten_jp.pdf)
- 중앙선 의미: [JAF 중앙선 구분](https://jaf.or.jp/common/kuruma-qa/category-accident/subcategory-rule/faq175)
- 시설 진출입과 우선관계: [도로교통법](https://laws.e-gov.go.jp/law/335AC0000000105), 25조·25조의2·36조
- 양보한 차의 옆을 지나오는 이륜차: [JAF Mate 실제 위험 사례와 분석](https://jafmate.jp/safety/kantei_20261016.html). 교차로 사례의 위험 요소를 가게 진입 상황으로 재구성한 독립 그림이다.
- 차량 횡단금지: [후쿠시마현 경찰 규제 기준](https://www.police.pref.fukushima.jp/03.tetuduki/-jyouhoukoukai/reiki_int/reiki_honbun/u244RG00002609.html), 제38
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
- 깊은 우회전 대기 위치는 국토교통성의 실제 조사 사진과 도면을 확인해 재구성한다. A는 진입 전 신호 정지선, B는 교차로 내부 대기 유도 위치다. 자세한 근거와 재구성 범위는 `docs/deep-turn-case.md`에 기록한다.
- 교차로 내부 대기 표시는 신호 정지선과 위치·모양을 분리한다. 이미 진입한 차와 진입 전 차의 실제 위치를 바꾼다.
- 내비 경로와 내 차로 화살표는 별개다. 우회전 화살표가 있는 차로 문제에는 실제 회전할 수 있는 교차로가 있어야 한다.
- 차로 2개가 함께 우회전하면 출구에도 두 차로와 서로 교차하지 않는 유도선을 그린다.
- 건널목의 빨간 2등 경보등과 3색 차량 신호등을 각각 표시한다. 별도 교차로의 신호에는 실제 별도 교차로와 자체 정지선을 그린다.
- 모든 차량에 역할 라벨을 연결한다. 색상만으로 내 차를 구별하게 하지 않는다.

## 그림 산출물과 검수

`dist/scenes/<id>.svg`, `<id>.mobile.svg`는 각 문제에 대응하는 독립 파일이다. 공통 도형은 제작 도구로 재사용하지만, 앱은 문항별 완성 그림을 로드한다. 도로 구조·표지·차량 위치·신호 상태를 문항별로 구성한다.

차량 횡단금지(312)·유턴 금지(313) 표지는 [일본 경찰청 신호·도로표지 안내 PDF 5쪽](https://www.npa.go.jp/english/bureau/traffic/traffic-light_english.pdf#page=5)에 실린 원본 이미지를 사용한다. `dist/traffic-signs.js`는 PDF의 이미지 객체 29·30을 수정 없이 추출해 포함하며, 각 문제 SVG에 직접 내장하므로 외부 이미지 요청에 의존하지 않는다. 원형 표시 영역으로 흰 사각 모서리만 가리고 표지 내부는 다시 그리지 않는다. 기존의 잘못된 사선 방향, 횡단금지 화살표의 누락된 왼쪽 가로줄, 사선이 화살표를 덮는 오류를 함께 바로잡았다. 원본 PNG 해시를 검사해 동일한 도안이 출제 중·이전 기록용 그림 모두에 적용되는지 확인한다.

`npm run build:scenes`로 산출물을 만들고 `node tests/visual-audit.mjs`로 모든 그림·질문·선택지를 대조할 검토 이미지를 만든다. `QUESTION_IDS`에 쉼표로 구분한 ID를 지정하면 변경 문항만 검토할 수 있다. 코드를 검사하는 것만으로 의미 일치를 검증했다고 보지 않는다. 변경한 그림은 모바일 크기에서도 직접 확인한다.

문제 의미나 은행 구성이 바뀌면 `BANK_VERSION`을 올린다. ID·정답 인덱스를 유지한 문항 추가나 명확화는 `COMPATIBLE_BANK_VERSIONS`로 기존 시험과 복습을 복구한다. 기존 정답이 바뀌는 개정은 이전 저장을 호환 목록에서 제외한다.

## 문항 교체와 기존 답안 보존

`entry-04`는 왼쪽 입구 진입과 횡단금지 표지의 연결이 약하고 오답이 인위적이어서 새 시험에서 제외했다. 대신 `entry-13`에서 ‘맞은편 차의 양보’와 ‘그 차 옆으로 접근하는 오토바이’를 함께 보고 우회전 진입 여부를 판단한다. 그림에는 목적지 입구, 정차한 맞은편 차량, 직진 중인 오토바이, 내 차와 예정 진입 경로를 각각 표시한다. 새 문항의 정답은 오토바이를 먼저 보내는 것이다.

의미가 다른 문항으로 바뀌므로 ID를 재사용하지 않는다. `RETIRED_QUESTIONS`와 기존 SVG는 답한 기록을 그대로 복습하기 위해 유지하고 새 시험 추첨에는 포함하지 않는다. `QUESTION_REPLACEMENTS`는 아직 답하지 않은 시험 자리만 새 문항으로 교체한다. 이미 답한 자리, 완료 시험, 오답 복습은 원문과 정답 인덱스를 보존한다. 교체 문항이 이미 시험에 있으면 같은 범주의 미출제 문항을 골라 중복을 막는다. 출제 은행은 74개, 시험은 25문항을 유지한다.
