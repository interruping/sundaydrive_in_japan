// Dedicated compositions for signs, roadside stops and incidents. These are
// original diagrams, not copies of the reference blog's photographs.
import { vehicleProhibitionSign } from '../../dist/traffic-signs.js';
const C = { ink: '#173e38', teal: '#347b69', grass: '#d6e3ce', road: '#b8c7bc', white: '#fffef7', coral: '#e67855', blue: '#bad6df', sign: '#286a9c', red: '#d95748', yellow: '#efbd4d', pavement: '#e5dcc4' };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const text = (x, y, value, size = 21, color = C.ink, anchor = 'middle') => `<text x="${x}" y="${y}" font-family="Pretendard, 'Noto Sans KR', sans-serif" font-size="${size}" font-weight="750" text-anchor="${anchor}" fill="${color}">${esc(value)}</text>`;
const path = (d, color = C.white, width = 3, extra = '') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const rect = (x, y, w, h, fill, radius = 0, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" ${extra}/>`;
const circle = (x, y, r, fill, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const box = (x, y, w, value, size = 21) => rect(x, y, w, 35, C.white, 9, 'stroke="#b9cbbb"') + text(x + w / 2, y + 25, value, size);
const arrow = (x, y, direction, color = C.white, scale = 1) => `<g transform="translate(${x} ${y}) rotate(${{ straight: 0, right: 90, left: -90, down: 180 }[direction]}) scale(${scale})">${path('M0 21V-20M-12 -7L0 -20 12 -7', color, 6)}</g>`;

function car(x, y, role = 'own', rotation = 0) {
  const fill = role === 'own' ? C.coral : C.blue;
  return `<g data-vehicle-role="${role}" data-car-x="${x}" data-car-y="${y}" transform="translate(${x} ${y}) rotate(${rotation})">${rect(-18, -31, 40, 73, '#173e3822', 13)}${path('M-21 -20v14m42 -14v14m-42 22v14m42 -14v14', C.ink, 5)}${rect(-19, -35, 38, 72, fill, 12)}<path d="M-14 -17q14 -7 28 0l-3 14h-22Z M-12 21h24l2 8q-14 4 -28 0Z" fill="#355b59"/>${path('M-15 1v14M15 1v14', '#fffef799', 2)}${path('M-13 -29h5m16 0h5', '#fff6cf', 4)}</g>`;
}

function callout(x, y, value, targetX, targetY, width = 96) {
  const endX = targetX < x ? x : x + width;
  return `<g class="vehicle-callout">${path(`M${endX} ${y + 17}L${targetX} ${targetY}`, C.ink, 2)}${circle(targetX, targetY, 3, C.ink)}${box(x, y, width, value)}</g>`;
}

function person(x, y, color = C.teal, scale = 1) {
  return `<g data-road-user="pedestrian" transform="translate(${x} ${y}) scale(${scale})">${circle(0, -13, 7, '#edc496')}${path('M-5 10l-6 14M4 10l8 14', C.ink, 4)}${path('M-11 0L0 -4 11 0', color, 6)}${rect(-6, -6, 12, 18, color, 4)}</g>`;
}

function sign(type, x, y, time = '') {
  let symbol;
  if (type === 'stop') {
    symbol = `<path d="M-42 -34H42L0 38Z" fill="${C.red}" stroke="${C.white}" stroke-width="4"/>${text(0, -8, '止まれ', 18, C.white)}${text(0, 12, 'STOP', 14, C.white)}`;
  } else if (type === 'no-parking' || type === 'no-stopping') {
    symbol = circle(0, 0, 44, C.sign, `stroke="${C.red}" stroke-width="9"`) + path('M-29 -29L29 29', C.red, 9);
    if (type === 'no-stopping') symbol += path('M-29 29L29 -29', C.red, 9);
  } else if (type === 'no-uturn') {
    symbol = vehicleProhibitionSign(type, 47);
  } else {
    symbol = circle(0, 0, 44, C.sign, `stroke="${C.white}" stroke-width="2"`);
    if (type === 'pedestrian-only') {
      symbol += circle(-10, -22, 7, C.white) + path('M-10 -10v19m0 -14 -14 15m14 -15 17 9m-17 3 -9 22m9 -22 9 22', C.white, 7);
      symbol += circle(18, -3, 5, C.white) + path('M18 6v14m0 -10 -10 -6m10 6 8 8m-8 0 -5 12m5 -12 6 12', C.white, 5);
    } else {
      symbol += arrow(0, 0, 'straight');
      if (type === 'straight-left') symbol += path('M0 18V4Q0 -4 -10 -4H-28m10 -10 -10 10 10 10', C.white, 6);
    }
  }
  const poleEnd = type === 'stop' ? 50 : time ? 115 : 95;
  return `<g data-sign="${type}" transform="translate(${x} ${y})">${path(`M0 30V${poleEnd}`, '#839c8c', 7)}${symbol}${time ? `<g data-restriction-hours="${time}">${box(-53, 55, 106, time, 24)}</g>` : ''}</g>`;
}

function signal(color, rightArrow = false) {
  return `<g data-signal-type="road" transform="translate(402 35)">${path('M65 30v107', '#839c8c', 6)}${rect(0, 0, 140, 52, C.ink, 26)}${['green', 'yellow', 'red'].map((name, i) => circle(26 + i * 44, 26, 17, name === color ? { green: '#8fd18a', yellow: C.yellow, red: C.red }[name] : '#60766a')).join('')}${rightArrow ? `<g data-arrow="right" data-lit="true">${rect(80, 62, 60, 48, C.ink, 13)}${arrow(110, 86, 'right', '#a9e797', .7)}</g>` : ''}</g>`;
}

function navigation(s) {
  const mobile = s.mobile || s.compact;
  const turn = s.route, name = { right: '우회전', straight: '직진', uturn: '유턴' }[turn];
  const drawing = turn === 'uturn'
    ? path('M45 114V53a31 31 0 0 1 62 0v51m-13 -14 13 14 13 -14', C.teal, 10)
    : turn === 'right' ? path('M55 117V76q0 -27 27 -27h43m-13 -13 13 13 -13 13', C.teal, 10)
    : path('M55 117V30m-13 14 13 -14 13 14', C.teal, 10);
  const startX = turn === 'uturn' ? 45 : 55;
  const map = `<g data-nav-route="${turn}">${rect(0, 0, 160, 140, '#e4eadc', 12)}${rect(25, 0, 110, 140, '#cdd8c9')}${turn === 'right' ? rect(80, 29, 80, 40, '#cdd8c9') : ''}${path('M80 4V136', C.white, 2, 'stroke-dasharray="5 7"')}${drawing}<path d="M${startX} 105l-9 20 9 -4 9 4Z" fill="${C.coral}" stroke="${C.white}" stroke-width="2"/></g>`;
  if (mobile) return `<g data-navigation="${turn}" data-layout="mobile">${rect(10, 450, 540, 125, C.white, 18, 'stroke="#bdcebf"')}${text(100, 495, '내비게이션', 22)}${text(100, 541, name, 30)}<g transform="translate(260 457) scale(.8)">${map}</g></g>`;
  return `<g data-navigation="${turn}" transform="translate(570 35)">${rect(0, 0, 180, 370, C.white, 20, 'stroke="#bdcebf"')}${text(90, 45, '내비게이션', 22)}<g transform="translate(10 92)">${map}</g>${text(90, 320, name, 32)}</g>`;
}

function junction(wide = false, controlled = true) {
  const left = wide ? 170 : 200, right = wide ? 390 : 360, center = 280;
  return `<g data-road-layout="two-way-intersection">${rect(left, 0, right - left, 440, C.road)}${rect(0, 150, 560, 120, C.road)}${path(`M0 150H${left}V0M${right} 0V150H560M0 270H${left}V440M${right} 440V270H560`)}${path(`M${center} 0V144M${center} 276V440`, C.white, 3, 'stroke-dasharray="14 13"')}${path(`M0 210H${left - 6}M${right + 6} 210H560`, C.white, 3, 'stroke-dasharray="14 13"')}${controlled ? path(`M${left + 9} 297H273`, C.white, 7, 'data-marking="stop-line"') : ''}</g>`;
}

function directionScene(s) {
  const straight = s.feature === 'mandatory-straight';
  let out = junction(false, !straight) + sign(straight ? 'straight-only' : 'straight-left', 100, 82);
  if (straight) out += car(320, 64, 'oncoming', 180) + callout(398, 44, '맞은편 차', 344, 64, 145);
  else out += signal('green');
  out += car(240, 370) + callout(25, 351, '내 차', 216, 370);
  return out;
}

function uturnScene(s) {
  let out = junction(true) + signal('red', true);
  if (s.feature === 'uturn-prohibited') out += sign('no-uturn', 95, 75);
  // The navigator shows intention; no U-turn arrow is painted onto the road.
  out += car(225, 371) + callout(20, 353, '내 차', 201, 371);
  return out;
}

function blindStop() {
  let out = rect(0, 100, 560, 110, C.road) + rect(210, 210, 140, 230, C.road);
  out += path('M0 100H560M0 210H210V440M350 440V210H560') + path('M0 155H560', C.white, 3, 'stroke-dasharray="14 13"') + path('M280 320V440', C.white, 3, 'stroke-dasharray="14 13"');
  out += `<g data-occlusion="buildings">${rect(14, 222, 185, 69, '#b8cabd', 4)}${rect(14, 222, 185, 13, '#6f9186')}${rect(361, 224, 183, 99, '#b8cabd', 4)}${rect(361, 224, 183, 13, '#6f9186')}</g>`;
  out += path('M218 310H274', C.white, 7, 'data-marking="stop-line"') + circle(187, 310, 16, C.white, `stroke="${C.ink}" stroke-width="2"`) + text(187, 318, 'A', 23);
  out += box(22, 298, 128, '정지선 A', 22) + path('M150 315H169', C.ink, 2);
  out += `<g data-check-position="B">${circle(245, 247, 15, C.white, `stroke="${C.teal}" stroke-width="2"`)}${text(245, 255, 'B', 22)}${path('M178 187L230 238', C.teal, 2)}${box(16, 168, 162, '시야 확인 B')}</g>`;
  out += sign('stop', 110, 384) + car(245, 379) + callout(401, 364, '내 차', 269, 379);
  return out;
}

function pedestrianRoad() {
  let out = rect(205, 0, 150, 440, C.road) + rect(205, 0, 150, 255, '#d8ccb4');
  out += path('M205 0V440M355 0V440') + path('M280 270V440', C.white, 3, 'stroke-dasharray="14 13"');
  out += `<g data-restricted-road="pedestrian">${Array.from({ length: 7 }, (_, i) => path(`M210 ${i * 36 + 20}H350`, '#c4b89f', 1.5)).join('')}${sign('pedestrian-only', 125, 196)}</g>`;
  out += car(246, 114, 'permitted') + callout(380, 89, '허가 차량', 270, 114, 145) + person(322, 182, C.teal, .9);
  out += car(245, 365) + callout(374, 347, '내 차 · 허가 없음', 269, 365, 176);
  return out;
}

function shop() {
  return `<g data-shop="true">${rect(20, 30, 135, 100, '#f1ead4', 5)}${rect(14, 35, 147, 21, C.teal)}${rect(35, 77, 35, 32, '#a9c8c1')}${rect(98, 73, 30, 57, '#72998b')}${text(88, 23, '가게', 20)}</g>`;
}

function parkingScene(s) {
  const feature = s.feature, crossing = feature === 'parking-crosswalk', timed = crossing || feature === 'parking-hours';
  const noStopping = feature === 'stopping-dropoff', dropoff = feature === 'parking-dropoff' || noStopping;
  const ownY = crossing ? 343 : 355;
  let out = `<g data-road-layout="wide-straight-road">${rect(225, 0, 195, 440, C.road)}${rect(175, 0, 50, 440, C.pavement)}${path('M225 0V440M420 0V440')}${path('M322 0V440', C.white, 3, 'stroke-dasharray="15 13"')}</g>`;
  out += crossing ? '' : shop();
  out += sign(noStopping ? 'no-stopping' : 'no-parking', 102, crossing ? 100 : 205, timed ? '8–20' : '');
  if (timed) out += `<g data-current-time="${crossing ? '21:00' : '14:00'}">${rect(436, 23, 112, 72, C.white, 12)}${text(492, 49, '현재 시각', 18)}${text(492, 80, crossing ? '21:00' : '14:00', 26)}</g>`;
  if (crossing) {
    out += `<g data-crosswalk="true">${Array.from({ length: 9 }, (_, i) => rect(231 + i * 21, 220, 12, 40, C.white)).join('')}</g>`;
    out += `<g data-crosswalk-distance-m="3">${path('M199 260V308m-7 -48h14m-14 48h14', C.ink, 2)}${text(158, 291, '3m', 24)}</g>`;
  }
  if (feature === 'parking-wait') {
    out += `<g data-passenger-state="waiting-in-shop">${person(113, 94, C.coral, .55)}${rect(351, 70, 196, 112, C.white, 14)}${text(449, 102, '친구의 메시지', 18)}${text(449, 139, '2분 뒤에 나갈게', 21)}${path('M378 182l-15 14 40 -14', C.white, 4)}</g>`;
    out += box(378, 249, 166, '운전자 탑승', 21);
  }
  out += car(254, ownY) + callout(439, ownY - 18, '내 차', 278, ownY, 98);
  if (dropoff) out += `<g data-passenger-state="immediate-dropoff">${person(201, ownY - 4, C.coral, .85)}${path(`M235 ${ownY - 7}l-12 -12v21`, C.coral, 4)}</g>`;
  return out;
}

function collisionScene(s) {
  const injury = s.feature === 'injury-collision';
  let out = rect(190, 0, 370, 440, C.road) + rect(0, 0, 190, 440, C.pavement) + path('M190 0V440');
  if (!injury) {
    out += path('M202 175V420h91V175', C.white, 3) + car(246, 286) + callout(24, 272, '내 차', 222, 286);
    out += `<g data-collision="pole">${circle(276, 245, 11, '#719184')}${circle(276, 245, 5, '#9fb4a8')}${path('M261 251l5 -4m-4 13 7 -5', C.white, 2)}${path('M267 250L367 175', C.ink, 1.5)}</g>`;
    out += `<g data-damage-detail="scratch">${rect(360, 25, 180, 160, C.white, 16)}${text(450, 57, '긁힌 자국', 21)}${rect(381, 76, 135, 85, C.coral, 19)}${path('M405 104l53 21m-45 -7 55 21', C.white, 4)}</g>`;
    out += box(18, 35, 140, '주차장', 23);
  } else {
    out += `<g data-safe-area="parking-bays">${path('M219 113V425H405V113M311 113V425', C.white, 3)}${rect(58, 91, 54, 54, C.sign, 8)}${text(85, 131, 'P', 40, C.white)}</g>`;
    out += box(18, 24, 206, '안전한 곳에 정차', 20);
    out += car(260, 344) + callout(395, 330, '내 차', 284, 344);
    out += car(354, 191, 'other', 25) + callout(418, 99, '상대 차', 376, 164, 118);
    out += `<g data-injured-person="true">${circle(112, 180, 11, '#edc496')}${path('M111 196v29l29 5 16 18M109 225l-12 23', C.ink, 8)}${path('M110 197l-16 20 15 11m3 -29 22 12', C.teal, 9)}${path('M88 182l-9 -6m8 18 -13 1m16 10 -10 7', C.red, 3)}</g>`;
    out += box(20, 272, 143, '다친 사람', 22);
  }
  return out;
}

function controlsScene() {
  const wiper = path('M-40 13L-30 -12Q0 -29 30 -12L40 13Z', C.ink, 3) + path('M0 13L-25 -9', C.ink, 5);
  const indicators = arrow(-24, 0, 'left', C.ink, .75) + arrow(24, 0, 'right', C.ink, .75);
  return `<g data-vehicle-role="own" data-gear="P" data-speed="0">${rect(20, 22, 520, 407, '#b9cebf', 30)}${rect(39, 44, 482, 105, '#dbe6dd', 20)}${path('M205 56V123h152V56', C.white, 5)}${rect(39, 147, 482, 282, '#8eac9a', 20)}${box(193, 158, 174, 'P · 0 km/h', 23)}${text(280, 34, '내 차 · 운전석 확대', 20)}${path('M210 290L125 258M350 290L435 258', C.ink, 14)}${circle(280, 325, 88, 'none', `stroke="${C.ink}" stroke-width="15"`)}${path('M198 318H362M280 322V411', C.ink, 12)}${circle(280, 325, 27, C.ink)}<g data-control="wiper" data-option="A">${rect(25, 195, 145, 105, C.white, 14)}${text(97, 223, 'A', 24)}<g transform="translate(97 267)">${wiper}</g>${path('M170 258L196 281', C.ink, 2)}</g><g data-control="turn-signal" data-option="B">${rect(390, 195, 145, 105, C.white, 14)}${text(462, 223, 'B', 24)}<g transform="translate(462 264)">${indicators}</g>${path('M390 258L364 281', C.ink, 2)}</g></g>`;
}

export function roadRuleScene(s, description) {
  let drawing;
  if (s.feature.startsWith('mandatory-')) drawing = directionScene(s);
  else if (s.feature.startsWith('uturn-')) drawing = uturnScene(s);
  else if (s.feature === 'blind-stop') drawing = blindStop();
  else if (s.feature === 'pedestrian-only') drawing = pedestrianRoad();
  else if (s.feature.startsWith('parking-') || s.feature === 'stopping-dropoff') drawing = parkingScene(s);
  else if (s.feature.endsWith('-collision')) drawing = collisionScene(s);
  else if (s.feature === 'parked-controls') drawing = controlsScene();
  else throw new Error(`Unsupported road-rule scenario: ${s.feature}`);
  const mobile = s.mobile || s.compact, width = s.nav && !mobile ? 760 : 560, height = s.nav && mobile ? 585 : 440;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="scene-title" data-scenario-feature="${s.feature}"><title id="scene-title">${esc(description)}</title>${rect(0, 0, width, height, C.grass, 18)}${drawing}${s.nav ? navigation(s) : ''}</svg>`;
}
