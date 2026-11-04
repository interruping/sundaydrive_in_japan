# 교통규칙 출처와 검토 범위

확인일: 2026-11-04. 일반 승용차로 일본을 여행하는 한국 운전자를 대상으로 한다. 퀴즈 통과는 운전면허 취득이나 운전 자격 인증이 아니다.

각 문항의 `source`는 `dist/questions.js`의 `SOURCES`에 연결되어 해설 화면에서 공식 원문을 열 수 있다. 다른 사이트의 문제 문구나 삽화를 복사하지 않고 상황을 직접 작성했다.

| 범위 | 근거 |
| --- | --- |
| 적색·황색·점멸·녹색 방향 화살표·전차용 황색 화살표 | [NPA 신호 안내](https://www.npa.go.jp/english/bureau/traffic/traffic-light_english.pdf) |
| 좌우회전 위치·유도선·교차로 정체·긴급차 양보 | [NPA 교통 교칙](https://www.npa.go.jp/bureau/traffic/20241101kyousoku.pdf), 특히 44–45, 55–56쪽 |
| 우회전 우선순위·차로별 진행 방향 | [NPA 2026 안전운전 안내](https://www.npa.go.jp/bureau/traffic/anzen/poster/r8_leaflet_japan_anzenunten_jp.pdf) |
| 일시정지 | [가나가와 경찰 안내](https://www.police.pref.kanagawa.jp/assets/entry/pdf/83136_02.pdf) |
| 보행자·횡단보도 앞 정지 차량·접근 속도 | [NPA 보행자 우선](https://www.npa.go.jp/bureau/traffic/oudanhodou/info.html) |
| 건널목 정지·신호 예외·차단기·출구 공간 | [JAF 건널목 안내](https://jaf.or.jp/common/kuruma-qa/category-accident/subcategory-rule/faq118) |
| 같은 방향 차로 사이 황색 실선 | [JAF 차로 변경 안내](https://jaf-training.jp/column/raw/shasen_change/) |
| 추월차로·고속도로 제한속도 | [JAF 고속도로 규칙](https://jaf.or.jp/common/kuruma-qa/category-drive/subcategory-safety/faq102) |
| 합류 | [JAF 가속차로 안내](https://jaf.or.jp/common/kuruma-qa/category-drive/subcategory-technique/faq130) |
| 출구를 놓쳤을 때 | [JAF 다음 IC 안내](https://jaf.or.jp/common/kuruma-qa/category-trouble/subcategory-highway/faq111) |
| ETC 진입 속도·정지 시 대처 | [JAF ETC 안내](https://jaf.or.jp/common/kuruma-qa/category-trouble/subcategory-highway/faq105) |
| 좌측통행·벨트·카시트·휴대전화·음주 | [JAF 기본 교통규칙](https://english.jaf.or.jp/safe-driving/traffic-rules-in-japan) |
| 2026 생활도로 기본 제한속도 | [NPA 생활도로 개정 안내](https://www.npa.go.jp/bureau/traffic/seikatsudouro/seikatsudoro.html) |

## 오해하기 쉬운 부분

- 2026-09-01부터 중앙선·차로 구분·방향 분리 시설이 없는 생활도로는 표지가 없다면 기본 최고속도 30km/h다. 오래된 영어 안내의 일반도로 60km/h를 이 상황에 적용하지 않는다. 지정 속도 표지가 있으면 표지가 우선한다.
- 화살표가 없는 적신호에는 임의 좌·우회전을 허용하지 않는다. 녹색 방향 화살표가 있으면 표시 방향에 한해 진행할 수 있다. 황색 화살표는 전차용이다.
- 황색 신호의 안전한 정지가 불가능한 경우와 건널목을 제어하는 도로 신호기의 예외를 별도 문제로 다룬다.
- 황색 중앙선과 같은 방향 차로 사이의 황색 실선은 의미가 다르다. 차로 변경 문제는 후자를 명확히 표시한다.
- 우회전 대기를 위해 적신호에 정지선을 새로 넘는 상황을, 초록에 이미 교차로에 들어온 상황과 섞지 않는다.
- 일시정지 시간을 일률적으로 몇 초라고 가르치지 않는다. 완전 정지와 안전 확인이 기준이다.

## 갱신

교통규칙 변경 시 해당 문항·해설·그림을 함께 검토하고 `BANK_VERSION`을 올린다. 버전이 다른 저장 시험은 복구하지 않는다. 이 앱의 점수는 학습을 위한 자체 기준이다.
