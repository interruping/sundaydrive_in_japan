/* Original, self-contained road illustrations. The coral car is the learner. */
import { vehicleProhibitionSign } from './traffic-signs.js';
const C = { ink: '#173e38', teal: '#347b69', sage: '#e9f0e9', grass: '#d6e3ce', road: '#b8c7bc', white: '#fffef7', coral: '#e67855', blue: '#bad6df', red: '#d95748', yellow: '#efbd4d' };
const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const txt = (x, y, value, size = 18, fill = C.ink, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-family="Pretendard, 'Noto Sans KR', sans-serif" font-weight="700" ${extra}>${esc(value)}</text>`;
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;

function tree(x, y, r = 23) {
  return `<g><ellipse cx="${x + 5}" cy="${y + 17}" rx="${r * .9}" ry="${r * .38}" fill="#a9c0a8" opacity=".2"/><path d="M${x} ${y + 15}v-24" stroke="#8b9c7a" stroke-width="5" stroke-linecap="round"/><circle cx="${x}" cy="${y - 12}" r="${r}" fill="#abc6a2"/><path d="M${x} ${y - 12 - r}a${r} ${r} 0 0 1 0 ${r * 2}" fill="#96b996"/><circle cx="${x - r * .3}" cy="${y - r * .7}" r="${r * .48}" fill="#c8d9b9" opacity=".7"/></g>`;
}

function house(x, y, w = 67, d = 46, h = 66, roof = '#456669') {
  const l = [x - w, y - w * .52], r = [x + d, y - d * .52], b = [x - w + d, y - (w + d) * .52];
  return `<g>${path(`M${l[0]} ${l[1]}L${x} ${y}L${x} ${y - h}L${l[0]} ${l[1] - h}Z`, '#f6f1dd')}${path(`M${x} ${y}L${r[0]} ${r[1]}V${r[1] - h}L${x} ${y - h}Z`, '#dddcc6')}${path(`M${l[0] - 4} ${l[1] - h}L${b[0]} ${b[1] - h - 4}L${r[0] + 4} ${r[1] - h}L${x} ${y - h + 5}Z`, roof)}${path(`M${x - w + 13} ${y - w * .52 - h + 18}l17 9v20l-17 -9Z`, '#bed4cf')}${path(`M${x - 28} ${y - h + 5}l16 9v20l-16 -9Z`, '#bed4cf')}${path(`M${x + 12} ${y - h + 8}l17 -9v24l-17 9Z`, '#7b9f9c')}${path(`M${x - 26} ${y - 14}v-27l15 8v27Z`, '#8faaa1')}</g>`;
}

function car(x, y, rotation = 0, color = C.coral, scale = 1, emergency = false, role = '', annotation = {}) {
  const vehicleRole = role || (emergency ? '구급차' : color === C.coral ? '내 차' : rotation === 180 ? '맞은편 차' : '앞차');
  const semanticRole = ({ '내 차': 'own', '맞은편 차': 'oncoming', '앞차': 'ahead', '옆 차': 'adjacent', '본선 차량': 'mainline', '구급차': 'emergency', '뒤차': 'behind', '정차한 차': 'parked', '교차로 직진 차': 'crossing' })[vehicleRole] || 'ahead';
  return `<g data-vehicle-role="${semanticRole}" data-car-x="${x}" data-car-y="${y}" data-car-role="${esc(vehicleRole)}" data-car-side="${annotation.side || (vehicleRole === '내 차' ? 'left' : 'right')}" data-car-dy="${annotation.dy || 0}" transform="translate(${x} ${y}) rotate(${rotation}) scale(${scale})"><rect x="-20" y="-34" width="44" height="73" rx="14" fill="#173e38" opacity=".12"/><rect x="-22" y="-21" width="5" height="15" rx="2" fill="${C.ink}"/><rect x="17" y="-21" width="5" height="15" rx="2" fill="${C.ink}"/><rect x="-22" y="16" width="5" height="14" rx="2" fill="${C.ink}"/><rect x="17" y="16" width="5" height="14" rx="2" fill="${C.ink}"/><rect x="-19" y="-35" width="38" height="72" rx="12" fill="${color}"/><path d="M-14 -17q14 -7 28 0l-3 14h-22Z" fill="#355b59"/><path d="M-12 21h24l2 8q-14 4 -28 0Z" fill="#355b59"/><path d="M-15 1v14M15 1v14" stroke="#fffef7" stroke-opacity=".6" stroke-width="2"/><rect x="-14" y="-31" width="7" height="4" rx="2" fill="#fff6cf"/><rect x="7" y="-31" width="7" height="4" rx="2" fill="#fff6cf"/><rect x="-15" y="32" width="6" height="3" rx="1" fill="#c34e41"/><rect x="9" y="32" width="6" height="3" rx="1" fill="#c34e41"/>${emergency ? `<rect x="-14" y="3" width="28" height="7" rx="2" fill="${C.red}"/><path d="M-5 14H5M0 9v10" stroke="${C.red}" stroke-width="4"/>` : ''}</g>`;
}

function vehicleCallouts(art) {
  const seen = new Set();
  return [...art.matchAll(/data-car-x="([\d.-]+)" data-car-y="([\d.-]+)" data-car-role="([^"]+)" data-car-side="([^"]+)" data-car-dy="([\d.-]+)"/g)].map(([, rawX, rawY, role, side, rawDy]) => {
    const key = `${rawX},${rawY},${role}`;
    if (seen.has(key)) return '';
    seen.add(key);
    const x = Number(rawX), y = Number(rawY), left = side === 'left';
    const width = [...role].reduce((n, c) => n + (c === ' ' ? 8 : 22), 20);
    const boxX = left ? Math.max(7, x - 53 - width) : Math.min(553 - width, x + 52);
    const boxY = Math.max(5, Math.min(350, y - 18 + Number(rawDy)));
    const endX = left ? x - 24 : x + 24;
    const startX = left ? boxX + width : boxX;
    return `<g class="vehicle-callout"><path d="M${startX} ${boxY + 18}L${endX} ${y}" stroke="${C.ink}" stroke-width="2.5"/><circle cx="${endX}" cy="${y}" r="3" fill="${C.ink}"/><rect x="${boxX}" y="${boxY}" width="${width}" height="36" rx="8" fill="${C.white}" stroke="#bacdbd" stroke-width="1.5"/>${txt(boxX + width / 2, boxY + 26, role, 22, C.ink, 'text-anchor="middle"')}</g>`;
  }).join('');
}

function person(x, y, color = C.teal, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})"><ellipse cx="2" cy="17" rx="10" ry="4" fill="#173e38" opacity=".12"/><path d="M-4 7l-3 10M4 7l3 10" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/><path d="M-8 1l8 -6 8 6" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/><rect x="-5" y="-7" width="10" height="16" rx="4" fill="${color}"/><circle cy="-12" r="6" fill="#efc598"/></g>`;
}

function bicycle(x, y, rotation = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rotation})"><circle cy="-17" r="8" fill="none" stroke="${C.ink}" stroke-width="3"/><circle cy="18" r="8" fill="none" stroke="${C.ink}" stroke-width="3"/><path d="M0 -15v32M-10 -7h20" stroke="${C.teal}" stroke-width="4"/><ellipse cy="1" rx="9" ry="12" fill="${C.teal}"/><circle cy="-6" r="7" fill="#efc598"/></g>`;
}

function arrow(x, y, direction = 'straight', color = C.teal, scale = 1) {
  const rotations = { straight: 0, right: 90, left: -90 };
  return `<g transform="translate(${x} ${y}) rotate(${rotations[direction] || 0}) scale(${scale})"><path d="M0 17v-32M-13 -3L0 -16 13 -3" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}

function sign(type, x = 105, y = 85, scale = 1) {
  let symbol = '';
  if (type === 'stop' || type === 'slow') {
    symbol = `<path d="M-42 -28H42L0 43Z" fill="${type === 'stop' ? C.red : C.white}" stroke="${C.red}" stroke-width="8" stroke-linejoin="round"/>${txt(0, -1, type === 'stop' ? '止まれ' : '徐行', 19, type === 'stop' ? C.white : C.ink, 'text-anchor="middle"')}`;
  } else if (['30', '40', '50', '80', '100'].includes(type)) {
    symbol = `<circle r="38" fill="${C.white}" stroke="${C.red}" stroke-width="9"/>${txt(0, 12, type, 34, '#38577b', 'text-anchor="middle"')}`;
  } else if (type === 'no-entry') {
    symbol = `<circle r="38" fill="${C.red}"/><rect x="-26" y="-7" width="52" height="14" rx="2" fill="${C.white}"/>`;
  } else if (type === 'one-way') {
    symbol = `<rect x="-26" y="-50" width="52" height="100" rx="3" fill="#4e85ab"/><path d="M-7 33V-7h-12L0 -33 19 -7H7v40Z" fill="${C.white}"/>`;
  } else if (type === 'one-way-left') {
    symbol = `<rect x="-53" y="-29" width="106" height="58" rx="3" fill="#3975a6"/><path d="M34 -7H-8v-13L-36 0l28 20V7h42Z" fill="${C.white}"/>`;
  } else if (type === 'left-allowed') {
    symbol = `<rect x="-53" y="-29" width="106" height="58" rx="2" fill="${C.white}" stroke="#768e86" stroke-width="2"/><path d="M34 -7H-8v-13L-36 0l28 20V7h42Z" fill="#3975a6"/>`;
  } else if (type === 'no-parking' || type === 'no-stopping') {
    symbol = `<circle r="38" fill="#4e85ab" stroke="${C.red}" stroke-width="9"/><path d="M-27 -27l54 54${type === 'no-stopping' ? 'M27 -27l-54 54' : ''}" stroke="${C.red}" stroke-width="8"/>`;
  } else if (type === 'no-uturn') {
    symbol = vehicleProhibitionSign(type, 42.5);
  } else if (type === 'etc') {
    symbol = `<rect x="-53" y="-29" width="106" height="58" rx="6" fill="#756490"/>${txt(0, 8, 'ETC', 30, C.white, 'text-anchor="middle"')}`;
  }
  return symbol ? `<g data-sign="${type}" transform="translate(${x} ${y}) scale(${scale})"><path d="M0 30v56" stroke="#94a79b" stroke-width="7"/>${symbol}</g>` : '';
}

function trafficLight(s, x = 378, y = 54) {
  const names = ['green', 'yellow', 'red'];
  const colors = ['#82cf83', C.yellow, C.red];
  const directions = s.amberArrow ? [] : (s.arrowSlots || s.arrows || []);
  const arrowCount = directions.length + (s.amberArrow ? 1 : 0);
  const lamp = (name, i) => `<circle cx="${27 + i * 47}" cy="27" r="18" fill="${s.signal === name || s.signal === `flash-${name}` ? colors[i] : '#6b7d70'}"/>${s.signal === `flash-${name}` ? `<g stroke="${colors[i]}" stroke-width="3" stroke-linecap="round"><path d="M${27 + i * 47} -14v-6M${12 + i * 47} -10l-4 -5M${42 + i * 47} -10l4 -5"/></g>` : ''}`;
  return `<g data-signal-type="road" transform="translate(${x} ${y})"><path d="M73 48v55" stroke="#819b88" stroke-width="7"/><rect width="148" height="54" rx="27" fill="${C.ink}"/>${names.map(lamp).join('')}${arrowCount ? `<rect x="${73 - arrowCount * 21}" y="63" width="${arrowCount * 42}" height="39" rx="12" fill="${C.ink}"/>${directions.map((d, i) => `<g data-arrow="${d}" data-lit="${Boolean(s.arrows?.includes(d))}">${arrow(73 - arrowCount * 21 + 21 + i * 42, 83, d, s.arrows?.includes(d) ? '#a5e593' : '#53695d', .5)}</g>`).join('')}${s.amberArrow ? `<g data-arrow="right" data-lit="true" data-arrow-color="amber">${arrow(73, 83, 'right', C.yellow, .5)}</g>` : ''}` : ''}</g>`;
}

function zebra(x = 211, y = 263, width = 138, height = 28) {
  return `<g fill="${C.white}">${Array.from({ length: Math.floor(width / 18) }, (_, i) => `<rect x="${x + i * 18}" y="${y}" width="10" height="${height}"/>`).join('')}</g>`;
}

function markingBadge(letter, x, y) {
  return `<circle cx="${x}" cy="${y}" r="16" fill="${C.white}" stroke="${C.ink}" stroke-width="2"/>${txt(x, y + 7, letter, 22, C.ink, 'text-anchor="middle"')}`;
}

function waitingJunction(s) {
  const inside = s.feature === 'right-turn-wait';
  let out = `<rect y="132" width="560" height="126" fill="${C.road}"/><rect x="202" width="156" height="390" fill="${C.road}"/><path d="M0 136h202V0M358 0v136h202M0 254h202v136M358 390V254h202" stroke="${C.white}" stroke-width="3" fill="none"/><path d="M280 0v126M280 265v125M0 195h194M366 195h194" stroke="${C.white}" stroke-width="3" stroke-dasharray="14 13"/><path data-marking="stop-line" data-line-id="A" d="M209 284h64" stroke="${C.white}" stroke-width="8"/>${markingBadge('A', 187, 284)}<path data-marking="waiting-guide" data-line-id="B" d="M232 193h44" stroke="${C.white}" stroke-width="5" stroke-dasharray="8 6"/><path d="M257 189q0 -25 29 -25h65" stroke="${C.white}" stroke-width="2.5" stroke-dasharray="7 7" fill="none"/>${markingBadge('B', 218, 193)}`;
  if (!inside) out += `<rect x="10" y="211" width="178" height="52" rx="9" fill="${C.white}"/>${txt(99, 233, '교차로 안', 20, C.ink, 'text-anchor="middle"')}${txt(99, 255, '대기 표시 B', 20, C.ink, 'text-anchor="middle"')}<path d="M188 226l47 -31" stroke="${C.ink}" stroke-width="2" fill="none"/>`;
  out += car(inside ? 256 : 239, inside ? 232 : 349);
  if (s.oncoming || s.otherRoute) {
    out += car(320, 62, 180, C.blue, 1, false, '맞은편 차', { side: 'left', dy: -24 });
    if (s.otherRoute === 'left') out += `<g data-other-route="left"><path d="M320 105v33q0 31 30 31h44" stroke="#4f8ba1" stroke-width="5" stroke-dasharray="8 6" fill="none"/>${arrow(392, 169, 'right', '#4f8ba1', .55)}<rect x="334" y="86" width="7" height="7" rx="2" fill="${C.yellow}"/></g>`;
    else out += `<g data-other-route="straight"><path d="M320 107v47" stroke="#4f8ba1" stroke-width="5" stroke-dasharray="8 6"/>${arrow(320, 152, 'straight', '#4f8ba1', -.55)}</g>`;
  }
  if (s.pedestrian) out += `<g transform="translate(396 140) rotate(90)">${zebra(0, 0, 116, 28)}</g>${person(381, 177, C.teal, 1.15)}`;
  if (s.blockedExit || s.blocked || s.exitBlocked) out += car(402, 166, 90, C.blue, 1, false, '앞차', { dy: 112 }) + car(492, 166, 90, '#81a394', 1, false, '앞차', { dy: 165 });
  if (s.signal) out += trafficLight(s);
  return out;
}

function leftAllowedJunction(s) {
  return `<g data-junction="left-allowed"><rect y="85" width="560" height="160" fill="${C.road}"/><rect x="150" width="240" height="390" fill="${C.road}"/><path d="M0 89h150V0M390 0v89h170M0 241h150v149M390 390V241h170" fill="none" stroke="${C.white}" stroke-width="3"/><path d="M310 0v78M310 251v139M0 165h142M398 165h162" stroke="${C.white}" stroke-width="3"/><path d="M230 0v78M0 125h142M398 125h162M398 205h162" stroke="${C.white}" stroke-width="2.5" stroke-dasharray="12 11"/><path d="M230 390V264q0 -60 -59 -60H0" stroke="${C.white}" stroke-width="3" fill="none"/><path data-marking="stop-line" d="M238 288h65" stroke="${C.white}" stroke-width="8"/><path d="M190 285v-25q0 -16 -17 -16h-17m10 -9 -10 9 10 9" fill="none" stroke="${C.white}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>${car(190, 340, 0, C.coral, 1, false, '내 차', { side: 'right' })}${sign('left-allowed', 75, 283, .85)}${trafficLight(s, 400, 19)}${car(477, 184, -90, C.blue, .8, false, '교차로 직진 차', { side: 'right', dy: 113 })}</g>`;
}

function junction(s) {
  if (s.sign === 'left-allowed' || s.feature === 'redleft-permitted') return leftAllowedJunction(s);
  if (s.feature === 'waiting-marking' || s.feature === 'right-turn-wait') return waitingJunction(s);
  const crossing = s.kind === 'crossing' || s.pedestrian || s.cyclist || ['crosswalk', 'pedestrian-waiting', 'overtaking-crosswalk'].includes(s.feature);
  const turningPedestrian = s.pedestrian && ['left', 'right'].includes(s.route);
  const approachCrossing = crossing && !turningPedestrian;
  const passingStoppedCar = s.feature === 'overtaking-crosswalk';
  let out = `<rect x="0" y="132" width="560" height="126" fill="${C.road}"/><rect x="202" width="156" height="390" fill="${C.road}"/><path d="M0 136h202V0M358 0v136h202M0 254h202v136M358 390V254h202" stroke="${C.white}" stroke-width="3" fill="none"/><path d="M280 0v126M280 265v125M0 195h194M366 195h194" stroke="${C.white}" stroke-width="3" stroke-dasharray="14 13" fill="none"/>`;
  out += (s.feature === 'one-way-sign' ? '' : house(101, 119, 56, 35, 49)) + tree(455, 323, 25) + tree(494, 294, 17);
  if (passingStoppedCar) out += `<rect x="130" y="258" width="72" height="132" fill="${C.road}"/><path d="M137 258v132M202 296v94" stroke="${C.white}" stroke-width="3" stroke-dasharray="12 10"/>`;
  if (approachCrossing) out += passingStoppedCar ? zebra(139, 263, 210) : zebra();
  if (turningPedestrian) out += `<g transform="translate(${s.route === 'left' ? 193 : 396} 140) rotate(90)">${zebra(0, 0, 116, 28)}</g>`;
  out += `<path data-marking="stop-line" d="M${passingStoppedCar ? 139 : 209} ${approachCrossing ? 307 : 284}h${passingStoppedCar ? 134 : 64}" stroke="${C.white}" stroke-width="7"/>`;
  if (s.feature === 'blind-corner') out += `<rect x="114" y="204" width="81" height="106" rx="3" fill="#e6ddc5"/><path d="M114 204h81v14h-81Z" fill="#567c73"/>`;
  if (s.feature === 'blocked-exit') out += s.route === 'right' ? car(400, 165, 90, C.blue, 1, false, '앞차', { dy: 112 }) + car(490, 165, 90, '#789c90', 1, false, '앞차', { dy: 165 }) : car(241, 52, 0, C.blue) + car(241, 130, 0, '#789c90');
  if (s.feature === 'wrong-lane') out += car(239, 343) + arrow(239, 284, 'straight', C.white, .65);
  else out += car(passingStoppedCar ? 167 : 239, approachCrossing || s.position === 'far' ? 349 : s.signal ? 323 : 349);
  if (s.oncoming) out += car(320, 60, 180, C.blue, 1, false, '맞은편 차', s.signal ? { side: 'left', dy: -22 } : {});
  if (passingStoppedCar) out += car(239, 329, 0, C.blue, 1, false, '옆 차');
  if (turningPedestrian) out += person(s.route === 'left' ? 179 : 381, 177, C.teal, 1.15);
  else if (s.pedestrian || s.feature === 'pedestrian-waiting') out += person(s.feature === 'pedestrian-waiting' ? 183 : 301, 279, C.teal, 1.15);
  if (s.cyclist) out += bicycle(185, 367);
  if (s.feature === 'turning-position' && s.label?.includes('유도선')) out += `<path d="M260 273v-60q0 -48 47 -48h51" stroke="${C.white}" fill="none" stroke-width="3" stroke-dasharray="8 7"/>`;
  if (s.feature === 'exit-queue') out += car(239, 137, 0, C.blue);
  if (s.feature === 'departing-turn') out += `<path d="M257 238v-27q0 -47 46 -47h48" stroke="#729eac" stroke-width="4" stroke-dasharray="7 6" fill="none"/>${car(313, 171, 78, C.blue, 1, false, '앞차', { dy: 67 })}`;
  if (s.feature === 'one-way-turn') out += arrow(239, 66, 'straight', C.white, .8) + arrow(320, 66, 'straight', C.white, .8);
  if (s.feature === 'one-way-sign') out += arrow(94, 163, 'left', C.white, .8) + arrow(453, 225, 'left', C.white, .8);
  if (s.signal) out += trafficLight(s);
  if (s.sign) out += s.sign === 'one-way-left' ? sign(s.sign, 104, 68, .85) : sign(s.sign, s.signal ? 102 : 432, s.signal ? 307 : 69, .8);
  if (s.feature === 'stop-line') out += `<path d="M147 285h50" stroke="${C.ink}" stroke-width="2"/>${txt(148, 272, '정지선', 15, C.ink, 'text-anchor="end"')}`;
  return out;
}

function road(s) {
  const wide = s.kind === 'highway' || ['right-lane', 'left-lane', 'change-lane', 'blind-spot', 'shoulder'].includes(s.feature);
  const sameDirection = ['center-yellow', 'wrong-lane', 'one-way'].includes(s.feature);
  const left = wide ? 133 : 202, right = wide ? 427 : 358;
  let out = `<rect x="${left}" width="${right - left}" height="390" fill="${C.road}"/><path d="M${left + 9} 0v390M${right - 9} 0v390" stroke="${C.white}" stroke-width="3"/>`;
  if (wide) {
    out += `<path d="M218 0v390M340 0v390" stroke="${C.white}" stroke-width="3" stroke-dasharray="18 15"/><rect x="271" width="18" height="390" fill="#91ae90"/><path d="M278 0v390M284 0v390" stroke="${C.white}" stroke-width="2"/>`;
  } else if (s.feature !== 'no-centerline' && s.feature !== 'narrow-road') out += `<path d="M280 0v390" stroke="${s.feature === 'center-yellow' ? C.yellow : C.white}" stroke-width="4" ${s.feature === 'center-yellow' ? '' : 'stroke-dasharray="18 15"'}/>`;
  out += tree(76, 298, 25) + tree(111, 61, 19) + house(487, 335, 40, 29, 41);
  if (s.kind === 'speed' && s.sign) out += `<rect x="207" y="168" width="62" height="55" rx="6" fill="${C.white}" opacity=".16"/>${txt(239, 207, s.sign, 35, C.white, 'text-anchor="middle"')}`;
  if (s.feature === 'wrong-lane') out += arrow(239, 191, 'straight', C.white, .85) + arrow(318, 191, 'right', C.white, .85);
  if (s.feature === 'center-yellow') out += arrow(239, 145, 'straight', C.white, .85) + arrow(318, 145, 'straight', C.white, .85) + car(318, 238, 0, C.blue, 1, false, '옆 차');
  if (s.feature === 'one-way') out += arrow(317, 191, 'straight', C.white, 1.05);
  if (s.feature === 'narrow-road') out += `<rect x="202" width="30" height="390" fill="${C.grass}"/><rect x="334" width="24" height="390" fill="${C.grass}"/><path d="M234 0v390M331 0v390" stroke="${C.white}" stroke-width="2"/>`;
  if (s.feature === 'blind-spot') out += `<path d="M246 246l-41 -65v115Z" fill="${C.coral}" opacity=".18"/>`;
  const myX = s.feature === 'right-lane' || s.feature === 'blind-spot' ? 245 : wide ? 177 : s.feature === 'narrow-road' ? 258 : 239;
  out += car(myX, 294);
  if (!sameDirection && (s.oncoming || ['no-centerline', 'narrow-road'].includes(s.feature))) out += car(wide ? 320 : 318, 106, 180, C.blue, 1, false, '맞은편 차', s.sign ? { side: 'left', dy: -48 } : {});
  if (s.kind === 'speed' && s.feature === 'exit-queue') out += car(239, 375, 0, C.blue, .7, false, '뒤차');
  if (s.feature === 'change-lane' || s.feature === 'blind-spot') out += car(177, 204, 0, C.blue, 1, false, '옆 차');
  if (s.feature === 'cycle-pass' || s.cyclist) out += bicycle(wide ? 151 : 216, 187);
  if (s.feature === 'shoulder') out += car(145, 133, 0, C.blue, .8, false, '정차한 차');
  if (s.feature === 'left-lane') out += arrow(177, 159, 'straight', C.white, .8) + arrow(245, 159, 'straight', C.white, .8);
  if (s.sign) out += sign(s.sign, 440, 91, .9);
  return out;
}

function rail(s) {
  const separate = s.signalScope === 'separate-intersection';
  const crossingSignal = !separate && (s.signalScope === 'crossing' || s.feature === 'rail-signal' || Boolean(s.signal));
  const flashing = s.alarm ? s.alarm === 'flashing' : s.feature === 'rail-closing';
  const closed = s.gate ? s.gate === 'closed' : s.feature === 'rail-closing' && s.label?.includes('내려오는');
  const checked = s.stage === 'stopped-checked';
  const railTop = separate ? 158 : 128, railBottom = separate ? 222 : 216;
  const gateY = railBottom + 31, stopY = gateY + 24;
  const alarmY = gateY - 67, crossY = alarmY - 39;
  const myY = checked ? stopY + 39 : 340;
  let out = `<g data-rail-scene="true" data-gate-state="${closed ? 'closed' : 'open'}" data-alarm-state="${flashing ? 'flashing' : 'off'}" data-stop-stage="${checked ? 'stopped-checked' : 'approaching'}"><rect x="202" width="156" height="390" fill="${C.road}"/><path d="M280 0v390" stroke="${C.white}" stroke-width="3" stroke-dasharray="15 15"/>`;
  if (separate) out += `<g data-junction="separate-intersection"><rect width="560" height="72" fill="${C.road}"/><path d="M0 36h195M364 36h196" stroke="${C.white}" stroke-width="3" stroke-dasharray="13 12"/><path d="M0 70h202M358 70h202" stroke="${C.white}" stroke-width="3"/><path data-marking="stop-line" data-signal-scope="separate-intersection" d="M209 91h64" stroke="${C.white}" stroke-width="7"/><g data-signal-scope="separate-intersection">${trafficLight({ signal: s.signal || 'green' }, 382, 7)}<path d="M382 34h-16v57h-87" stroke="${C.ink}" stroke-width="2" fill="none"/></g>${txt(452, 125, '앞 교차로 신호', 19, C.ink, 'text-anchor="middle"')}</g>`;
  else out += house(457, 115, 50, 37, 46);
  out += `<rect y="${railTop}" width="560" height="${railBottom - railTop}" fill="#c7c5b3"/>${Array.from({ length: 24 }, (_, i) => `<path d="M${i * 25} ${railTop + 4}v${railBottom - railTop - 8}" stroke="#9d9f8b" stroke-width="8"/>`).join('')}<path d="M0 ${railTop + 10}h560M0 ${railTop + 25}h560M0 ${railBottom - 25}h560M0 ${railBottom - 10}h560" stroke="#6b8177" stroke-width="5"/><path data-marking="stop-line" data-signal-scope="crossing" d="M209 ${stopY}h64" stroke="${C.white}" stroke-width="7"/>${car(240, myY)}${!checked ? `<path d="M230 ${myY + 40}v7M240 ${myY + 40}v9M250 ${myY + 40}v7" stroke="#6a9686" stroke-width="3" stroke-linecap="round"/>` : `<path d="M230 ${myY - 27}l-38 -17M250 ${myY - 27}l38 -17" stroke="#608b7b" stroke-width="2" stroke-dasharray="5 4"/>`}`;
  const barD = closed ? `M184 ${gateY}h166` : `M184 ${gateY}v-111`;
  out += `<g data-gate="${closed ? 'closed' : 'open'}"><circle cx="184" cy="${gateY}" r="11" fill="${C.ink}"/><path d="${barD}" stroke="${C.yellow}" stroke-width="9"/><path d="${barD}" stroke="${C.ink}" stroke-width="9" stroke-dasharray="12 15"/></g><g data-signal-type="rail-alarm" data-alarm-state="${flashing ? 'flashing' : 'off'}"><path d="M144 ${gateY + 2}V${crossY + 19}M129 ${crossY + 15}l30 -30M129 ${crossY - 15}l30 30" stroke="${C.yellow}" stroke-width="7"/><path d="M129 ${crossY + 15}l30 -30M129 ${crossY - 15}l30 30" stroke="${C.ink}" stroke-width="7" stroke-dasharray="7 8"/><rect x="115" y="${alarmY - 15}" width="58" height="30" rx="15" fill="${C.ink}"/><circle cx="130" cy="${alarmY}" r="10" fill="${flashing ? C.red : '#683e3b'}" stroke="#b55c50" stroke-width="1.5"/><circle cx="157" cy="${alarmY}" r="10" fill="${flashing ? '#f16c54' : '#683e3b'}" stroke="#b55c50" stroke-width="1.5"/>${flashing ? `<path d="M118 ${alarmY - 21}l-6 -6M141 ${alarmY - 22}v-9M165 ${alarmY - 23}l6 -6M110 ${alarmY}h-9M177 ${alarmY}h8" stroke="${C.red}" stroke-width="3" stroke-linecap="round"/>` : ''}</g>`;
  const labelY = separate ? 249 : 67, statusY = separate ? 291 : 207;
  out += `<rect x="11" y="${labelY}" width="181" height="34" rx="8" fill="${C.white}"/>${txt(102, labelY + 24, '건널목 경보등', 22, C.ink, 'text-anchor="middle"')}<path d="M100 ${separate ? labelY : labelY + 36}V${alarmY}h13" fill="none" stroke="${C.ink}" stroke-width="2"/><circle cx="113" cy="${alarmY}" r="3" fill="${C.ink}"/><rect x="12" y="${statusY}" width="151" height="31" rx="8" fill="${C.white}"/>${txt(87, statusY + 22, flashing ? '빨간불 점멸' : '꺼짐', 19, flashing ? C.red : C.ink, 'text-anchor="middle"')}`;
  if (s.exitBlocked || s.feature === 'rail-blocked') out += car(239, 27, 0, C.blue, .65) + car(239, railTop - 34, 0, '#81a394', .65);
  if (crossingSignal) out += `<g data-signal-scope="crossing"><rect x="370" y="225" width="174" height="33" rx="8" fill="${C.white}"/>${txt(457, 249, '차량 신호등', 22, C.ink, 'text-anchor="middle"')}<path d="M445 258v9" stroke="${C.ink}" stroke-width="2"/>${trafficLight({ signal: s.signal || 'green' }, 373, 267)}<path d="M373 294h-15v${stopY - 294}h-78" stroke="${C.ink}" stroke-width="2" fill="none"/></g>`;
  else out += `<g aria-label="건널목용 차량 신호등 없음"><rect x="374" y="274" width="172" height="78" rx="10" fill="${C.white}" stroke="#cbd9cb" stroke-width="1.5"/>${separate ? txt(460, 294, '건널목용', 18, C.ink, 'text-anchor="middle"') : ''}${txt(460, separate ? 318 : 303, '차량 신호등', 22, C.ink, 'text-anchor="middle"')}${txt(460, separate ? 342 : 333, '없음', 24, C.ink, 'text-anchor="middle"')}</g>`;
  if (flashing || s.trainPassed) {
    const trainX = s.trainPassed ? 382 : closed ? 207 : -66;
    const trainY = railTop + 11, trainWidth = s.trainPassed ? 174 : closed ? 190 : 162;
    out += `<g data-train-position="${s.trainPassed ? 'passed' : closed ? 'crossing' : 'approaching'}"><rect x="${trainX}" y="${trainY}" width="${trainWidth}" height="${railBottom - railTop - 22}" rx="8" fill="#eee9d7" stroke="#80978d" stroke-width="2"/><path d="M${trainX + 1} ${railBottom - 21}h${trainWidth - 2}" stroke="${C.teal}" stroke-width="8"/>${Array.from({ length: 3 }, (_, i) => `<rect x="${trainX + 13 + i * 43}" y="${trainY + 9}" width="31" height="22" rx="3" fill="#769997"/>`).join('')}<path d="M${trainX + trainWidth - 26} ${trainY - 6}h21m-7 -6 7 6 -7 6" stroke="#496e60" stroke-width="3" fill="none"/></g>`;
  }
  return out + '</g>';
}

function highway(s) {
  if (['etc-closed', 'etc-general'].includes(s.feature) || s.sign === 'etc') {
    return `<path d="M169 390V210L108 0H452L391 210v180Z" fill="${C.road}"/><path d="M280 390V0M181 390V210L132 0M379 390V210L428 0" fill="none" stroke="${C.white}" stroke-width="3" stroke-dasharray="16 14"/><rect x="135" y="133" width="290" height="14" rx="3" fill="#55776a"/><rect x="153" y="126" width="17" height="87" rx="4" fill="#839f8a"/><rect x="270" y="126" width="20" height="87" rx="4" fill="#839f8a"/><rect x="390" y="126" width="17" height="87" rx="4" fill="#839f8a"/><rect x="165" y="63" width="105" height="56" rx="5" fill="#756490"/>${txt(216, 87, 'ETC', 25, C.white, 'text-anchor="middle"')}${txt(216, 107, '専用', 16, C.white, 'text-anchor="middle"')}<rect x="289" y="63" width="105" height="56" rx="5" fill="${C.teal}"/>${txt(341, 97, '一般', 26, C.white, 'text-anchor="middle"')}${s.feature === 'etc-closed' ? `<path d="M179 172h83" stroke="${C.white}" stroke-width="8"/><path d="M179 172h83" stroke="${C.red}" stroke-width="8" stroke-dasharray="13 13"/><circle cx="217" cy="38" r="12" fill="${C.red}"/>` : `<circle cx="217" cy="38" r="12" fill="${C.teal}"/>`}${car(225, 323)}${s.feature === 'exit-queue' ? car(225, 235, 0, C.blue) : ''}${tree(82, 301, 25)}${tree(467, 265, 27)}`;
  }
  if (s.feature === 'merging') {
    return `<path d="M240 0h176v390H240Z" fill="${C.road}"/><path d="M135 390V320Q135 252 214 199L281 117" fill="none" stroke="${C.road}" stroke-width="68"/><path d="M251 0v137M251 249v141M330 0v390M405 0v390M113 390v-68q0 -88 82 -140" fill="none" stroke="${C.white}" stroke-width="3" stroke-dasharray="16 15"/>${car(281, s.oncoming ? 324 : 218, 0, C.blue, 1, false, '본선 차량')}${car(135, 324)}${tree(88, 135, 25)}${tree(478, 288, 27)}${arrow(281, 68, 'straight', C.white, .8)}`;
  }
  if (s.feature === 'missed-exit' || s.feature === 'exit-queue') {
    return `<rect x="180" width="176" height="390" fill="${C.road}"/><path d="M221 202Q136 189 91 82L56 0" fill="none" stroke="${C.road}" stroke-width="65"/><path d="M269 0v390M190 229v161M346 0v390" fill="none" stroke="${C.white}" stroke-width="3" stroke-dasharray="16 15"/><path d="M180 37l50 93h-48Z" fill="${C.white}" opacity=".8"/><rect x="30" y="22" width="104" height="49" rx="4" fill="${C.teal}"/>${txt(82, 54, '출구 ↖', 24, C.white, 'text-anchor="middle"')}${car(225, s.feature === 'missed-exit' ? 95 : 324)}${s.feature === 'exit-queue' ? car(225, 239, 0, C.blue) + car(197, 159, -25, '#81a394') + car(141, 99, -35, C.blue) : ''}${tree(452, 284, 27)}`;
  }
  return road(s);
}

function parking(s) {
  let out = `<rect x="148" width="264" height="390" fill="${C.road}"/><path d="M280 0v390" stroke="${C.white}" stroke-width="3" stroke-dasharray="16 14"/><path d="M158 0v390M402 0v390" stroke="${C.white}" stroke-width="3"/>${car(183, 273)}${car(337, 94, 180, C.blue)}${tree(469, 307, 25)}`;
  if (s.feature === 'doorway') out += house(106, 278, 79, 30, 111) + `<path d="M106 278h42" stroke="#b9b69f" stroke-width="24"/>` + person(124, 264);
  if (s.feature === 'crosswalk-parking') out += zebra(158, 170, 244, 37) + person(126, 190) + `<path d="M113 210v27M105 210h16M105 237h16" stroke="${C.ink}" stroke-width="2"/>${txt(101, 230, '3 m', 16, C.ink, 'text-anchor="end"')}`;
  if (s.feature === 'bus-stop') out += `<path d="M96 259v-71" stroke="#8ba18e" stroke-width="5"/><circle cx="96" cy="180" r="24" fill="${C.white}" stroke="${C.teal}" stroke-width="4"/><rect x="83" y="167" width="26" height="25" rx="5" fill="${C.teal}"/><rect x="87" y="171" width="18" height="10" rx="1" fill="${C.white}"/><circle cx="89" cy="190" r="3" fill="${C.ink}"/><circle cx="103" cy="190" r="3" fill="${C.ink}"/>${person(74, 239)}${person(111, 251, C.coral)}`;
  if (s.sign) out += sign(s.sign, 467, 87, .85);
  return out;
}

function weather(s) {
  let out = road({ ...s, oncoming: s.feature === 'night-highbeam' || s.oncoming });
  if (s.feature === 'rain') {
    out += `<ellipse cx="239" cy="192" rx="28" ry="55" fill="#a4c8cf" opacity=".8"/><ellipse cx="322" cy="333" rx="25" ry="43" fill="#a4c8cf" opacity=".8"/>${Array.from({ length: 25 }, (_, i) => `<path d="M${35 + (i * 101) % 490} ${15 + (i * 53) % 335}l-9 19" stroke="#7fabb7" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>`).join('')}`;
  } else if (s.feature === 'snow') {
    out += `<path d="M203 0v390M355 0v390" stroke="${C.white}" stroke-width="13"/><path d="M228 40v187M250 40v187" stroke="#91aaa5" stroke-width="4" stroke-dasharray="9 6"/>${Array.from({ length: 32 }, (_, i) => `<circle cx="${23 + (i * 93) % 520}" cy="${11 + (i * 61) % 370}" r="${i % 3 + 2}" fill="${C.white}"/>`).join('')}`;
  } else if (s.feature === 'night-highbeam') {
    out += `<rect width="560" height="390" fill="#173e38" opacity=".65"/><path d="M225 265L170 16H307L253 265Z" fill="#fff3bd" opacity=".43"/>${car(239, 294)}${car(318, 106, 180, C.blue)}<path d="M302 143l-35 84h107l-42 -84Z" fill="#fff3bd" opacity=".2"/>`;
  } else if (s.feature === 'tunnel') {
    out += `<path d="M151 210V115a129 129 0 0 1 258 0v95h-54V116a75 75 0 0 0 -150 0v94Z" fill="#90aa98"/><path d="M205 210V116a75 75 0 0 1 150 0v94Z" fill="#466b61"/><path d="M280 60v143" stroke="#afc0a4" stroke-width="3" stroke-dasharray="13 13"/><path d="M214 120v68M347 120v68" stroke="#c8d3a7" stroke-width="3"/>`;
  }
  return out;
}

function cabin(s) {
  let out = `<rect x="49" y="27" width="462" height="331" rx="65" fill="#d5e1d6"/><path d="M89 160V83q0 -17 20 -17h342q20 0 20 17v77Z" fill="#bed7d6"/><path d="M231 160l31 -94h41l31 94" fill="#9fb9ac"/><path d="M282 70v19M282 103v24M282 140v20" stroke="${C.white}" stroke-width="4"/><path d="M74 169h413v46H74Z" fill="#7d9c8d"/><rect x="115" y="233" width="105" height="104" rx="24" fill="#a1b6a5"/><rect x="342" y="233" width="105" height="104" rx="24" fill="#a1b6a5"/><circle cx="394" cy="199" r="43" fill="none" stroke="${C.ink}" stroke-width="12"/><path d="M394 176v58M365 199h58" stroke="${C.ink}" stroke-width="8"/>`;
  if (s.feature === 'belt') {
    out += `<rect x="104" y="220" width="126" height="129" rx="23" fill="#d5e1d6"/><rect x="330" y="244" width="125" height="105" rx="22" fill="#d5e1d6"/><rect x="119" y="223" width="96" height="41" rx="14" fill="#a1b6a5"/><rect x="342" y="237" width="103" height="27" rx="11" fill="#a1b6a5"/><rect x="108" y="278" width="346" height="66" rx="20" fill="#a1b6a5"/><circle cx="167" cy="287" r="21" fill="#efc598"/><path d="M139 337v-24q0 -14 28 -14t28 14v24Z" fill="${C.coral}"/><path d="M112 284v45" stroke="${C.ink}" stroke-width="6"/><rect x="109" y="323" width="10" height="13" rx="2" fill="#667b72"/><rect x="203" y="326" width="9" height="12" rx="2" fill="${C.red}"/>`;
  } else if (s.feature === 'phone') {
    out += `<path d="M413 296l-30 -54" stroke="#efc598" stroke-width="19" stroke-linecap="round"/><rect x="345" y="191" width="47" height="80" rx="9" fill="${C.ink}" transform="rotate(-12 367 231)"/><rect x="351" y="201" width="35" height="54" rx="3" fill="${C.white}" transform="rotate(-12 367 231)"/><path d="M354 228h23M354 237h17" stroke="${C.teal}" stroke-width="3"/>`;
  } else if (s.feature === 'child-seat') {
    out += `<rect x="106" y="220" width="124" height="128" rx="24" fill="#d5e1d6"/><rect x="119" y="224" width="96" height="39" rx="13" fill="#a1b6a5"/><rect x="108" y="278" width="213" height="66" rx="20" fill="#a1b6a5"/><circle cx="168" cy="291" r="16" fill="#efc598"/><path d="M148 330v-22q20 -12 40 0v22Z" fill="${C.coral}"/><path d="M157 329v11M179 329v11" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>`;
  } else if (s.feature === 'alcohol') {
    out += `<circle cx="167" cy="264" r="65" fill="${C.white}"/><path d="M131 232h52l-5 62q-21 12 -42 0Z" fill="${C.yellow}"/><path d="M137 228h42" stroke="${C.white}" stroke-width="17" stroke-linecap="round"/><path d="M184 242h12q17 23 -14 34" stroke="${C.yellow}" stroke-width="9" fill="none"/>`;
  }
  return out;
}

function emergency(s) {
  const nearJunction = s.label?.includes('교차로 부근');
  return `${nearJunction ? `<rect y="95" width="560" height="112" fill="${C.road}"/><path d="M0 150h560" stroke="${C.white}" stroke-width="3" stroke-dasharray="15 14"/>` : ''}<rect x="202" width="156" height="390" fill="${C.road}"/><path d="M280 0v${nearJunction ? 87 : 390}${nearJunction ? 'M280 215v175' : ''}" stroke="${C.white}" stroke-width="3" stroke-dasharray="15 14"/><path d="M210 220h64" stroke="${C.white}" stroke-width="${nearJunction ? 6 : 0}"/>${car(239, 269)}${car(239, 353, 0, C.white, .85, true)}${car(319, 53, 180, C.blue)}${tree(108, 286, 25)}${house(467, 304, 53, 36, 54)}<path d="M193 339l-14 -8M285 339l14 -8M198 321l-10 -12M281 321l10 -12" stroke="${C.red}" stroke-width="4" stroke-linecap="round"/>`;
}

function missedExitNavigation(compact = false) {
  if (compact) return `<g data-nav-feature="missed-exit" data-nav-position="past-fork" transform="translate(10 394)"><rect width="540" height="130" rx="19" fill="${C.white}" stroke="#cbd9cb" stroke-width="2"/><rect x="12" y="10" width="206" height="110" rx="12" fill="#e9ede0"/><rect x="120" y="10" width="44" height="110" fill="#d2d9cb"/><path d="M142 96Q98 92 70 61L39 40" fill="none" stroke="#d2d9cb" stroke-width="33"/><path d="M142 15v100" stroke="${C.white}" stroke-width="2" stroke-dasharray="6 5"/><path d="M142 115V99Q101 95 73 67L43 44" fill="none" stroke="${C.teal}" stroke-width="6" stroke-dasharray="7 5" stroke-linecap="round"/><circle cx="43" cy="44" r="6" fill="${C.teal}" stroke="${C.white}" stroke-width="2"/><path d="M142 17l-11 22 11 -4 11 4Z" fill="${C.coral}" stroke="${C.white}" stroke-width="2.5"/><path d="M142 47v26" stroke="${C.coral}" stroke-width="3" stroke-dasharray="3 5"/>${txt(374, 46, '내비게이션', 20, C.ink, 'text-anchor="middle"')}${txt(374, 94, '경로 이탈', 38, C.ink, 'text-anchor="middle"')}</g>`;
  return `<g data-nav-feature="missed-exit" data-nav-position="past-fork" transform="translate(550 17)"><rect width="194" height="354" rx="22" fill="${C.white}" stroke="#cbd9cb" stroke-width="2"/>${txt(97, 34, '내비게이션', 18, C.ink, 'text-anchor="middle"')}<rect x="12" y="51" width="170" height="248" rx="12" fill="#e9ede0"/><rect x="94" y="51" width="48" height="248" fill="#d2d9cb"/><path d="M118 237Q80 226 43 185L25 165" fill="none" stroke="#d2d9cb" stroke-width="40"/><path d="M118 58v234" stroke="${C.white}" stroke-width="2" stroke-dasharray="7 6"/><path d="M118 289V241Q80 232 43 190L25 169" fill="none" stroke="${C.teal}" stroke-width="8" stroke-dasharray="10 7" stroke-linecap="round"/><circle cx="25" cy="169" r="7" fill="${C.teal}" stroke="${C.white}" stroke-width="2"/><path d="M118 94l-12 24 12 -5 12 5Z" fill="${C.coral}" stroke="${C.white}" stroke-width="3"/><path d="M118 128v58" stroke="${C.coral}" stroke-width="3" stroke-dasharray="4 6"/>${txt(97, 333, '경로 이탈', 26, C.ink, 'text-anchor="middle"')}</g>`;
}

function navigation(route = 'straight') {
  const directions = { left: '좌회전', right: '우회전', straight: '직진' };
  const routePath = route === 'left' ? 'M99 272V183Q99 160 77 160H38' : route === 'right' ? 'M99 272V183Q99 160 121 160H163' : 'M99 272V107';
  return `<g transform="translate(550 17)"><rect width="194" height="354" rx="22" fill="${C.white}" stroke="#cbd9cb" stroke-width="2"/>${txt(97, 34, '내비게이션', 18, C.ink, 'text-anchor="middle"')}<rect x="12" y="51" width="170" height="248" rx="12" fill="#e9ede0"/><rect x="75" y="51" width="49" height="248" fill="#d2d9cb"/><rect x="12" y="137" width="170" height="49" fill="#d2d9cb"/><path d="M99 59v234M21 161h154" stroke="${C.white}" stroke-width="2" stroke-dasharray="7 6"/><rect x="25" y="76" width="35" height="43" rx="5" fill="#d3dfc9"/><rect x="139" y="206" width="28" height="69" rx="5" fill="#d3dfc9"/><path d="${routePath}" fill="none" stroke="${C.teal}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>${route === 'left' ? arrow(41, 160, 'left', C.teal, .6) : route === 'right' ? arrow(160, 160, 'right', C.teal, .6) : arrow(99, 109, 'straight', C.teal, .6)}<path d="M99 247l-12 24 12 -5 12 5Z" fill="${C.coral}" stroke="${C.white}" stroke-width="3"/>${txt(97, 333, directions[route] || directions.straight, 26, C.ink, 'text-anchor="middle"')}</g>`;
}

function compactNavigation(route = 'straight') {
  const directions = { left: '좌회전', right: '우회전', straight: '직진' };
  const routePath = route === 'left' ? 'M112 110V75Q112 56 94 56H47' : route === 'right' ? 'M112 110V75Q112 56 130 56H177' : 'M112 110V29';
  return `<g transform="translate(10 394)"><rect width="540" height="130" rx="19" fill="${C.white}" stroke="#cbd9cb" stroke-width="2"/><rect x="12" y="10" width="206" height="110" rx="12" fill="#e9ede0"/><rect x="91" y="10" width="42" height="110" fill="#d2d9cb"/><rect x="12" y="35" width="206" height="42" fill="#d2d9cb"/><path d="M112 14v100M19 56h190" stroke="${C.white}" stroke-width="2" stroke-dasharray="6 5"/><rect x="25" y="88" width="49" height="23" rx="5" fill="#d3dfc9"/><rect x="151" y="90" width="52" height="19" rx="5" fill="#d3dfc9"/><path d="${routePath}" fill="none" stroke="${C.teal}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>${route === 'left' ? arrow(48, 56, 'left', C.teal, .56) : route === 'right' ? arrow(176, 56, 'right', C.teal, .56) : arrow(112, 29, 'straight', C.teal, .56)}<path d="M112 87l-11 21 11 -4 11 4Z" fill="${C.coral}" stroke="${C.white}" stroke-width="2.5"/>${txt(374, 46, '내비게이션', 20, C.ink, 'text-anchor="middle"')}${txt(374, 94, directions[route] || directions.straight, 40, C.ink, 'text-anchor="middle"')}</g>`;
}

function wrapCaption(value, availableWidth, fontSize = 19) {
  const measure = text => [...text].reduce((width, character) => width + (/[\u2e80-\uffff]/.test(character) ? 1 : /\s/.test(character) ? .35 : .6), 0) * fontSize;
  const lines = [];
  let current = '';
  for (const word of String(value).split(/\s+/)) {
    const next = current ? `${current} ${word}` : word;
    if (current && measure(next) > availableWidth) {
      lines.push(current);
      current = word;
    } else current = next;
  }
  if (current) lines.push(current);
  return lines;
}

export function sceneArt(scene = {}, description = '') {
  const s = { kind: 'junction', ...scene };
  const hasNav = Boolean(s.nav);
  let art;
  if (s.kind === 'rail') art = rail(s);
  else if (s.kind === 'highway') art = highway(s);
  else if (s.kind === 'parking') art = parking(s);
  else if (s.kind === 'weather' || s.feature === 'tunnel') art = weather(s);
  else if (s.kind === 'cabin') art = cabin(s);
  else if (s.kind === 'emergency') art = emergency(s);
  else if (['lane', 'speed', 'road'].includes(s.kind)) art = road(s);
  else art = junction(s);
  const compactNav = hasNav && Boolean(s.compact);
  const width = hasNav && !compactNav ? 760 : 560;
  const caption = s.label || '';
  const captionLines = wrapCaption(caption, width - 38);
  const height = (compactNav ? 566 : 430) + Math.max(0, captionLines.length - 1) * 24;
  const captionY = compactNav ? 551 : 416;
  const navArt = !hasNav ? '' : s.feature === 'missed-exit' ? missedExitNavigation(compactNav) : compactNav ? compactNavigation(s.route) : navigation(s.route);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(description || caption || '일본 도로의 운전 상황')}" class="scene-art"><title>${esc(description || caption || '운전 상황')}</title><rect width="${width}" height="${height}" rx="18" fill="${C.sage}"/><svg width="540" height="390" viewBox="0 0 560 390" x="${hasNav && !compactNav ? 0 : 10}" y="0" overflow="hidden">${art}${vehicleCallouts(art)}</svg>${navArt}${captionLines.map((line, index) => txt(width / 2, captionY + index * 24, line, 19, C.ink, 'text-anchor="middle"')).join('')}${s.extraLabel ? `<rect x="15" y="348" width="${Math.min(510, 28 + String(s.extraLabel).length * 19)}" height="33" rx="10" fill="${C.white}"/>${txt(29, 371, s.extraLabel, 17)}` : ''}</svg>`;
}

export function heroArt() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 490" role="img" aria-label="후지산 아래 작은 일본 마을. 산호색 자동차가 나무와 건물 사이의 왼쪽 차로를 달립니다." class="hero-art"><title>일본으로 떠나는 작은 드라이브</title><circle cx="556" cy="91" r="42" fill="${C.coral}" opacity=".9"/><path d="M365 204L486 52L611 204Z" fill="#c0d5d9"/><path d="M452 95l34 -43 36 45 -23 -6 -13 12 -13 -12Z" fill="#fffef7"/><path d="M85 291L375 128L676 288L383 459Z" fill="#a9c3aa"/><path d="M85 277L375 114L676 274L383 445Z" fill="#d8e4cd"/><path d="M85 277v14l298 168v-14Z" fill="#bed2b5"/><path d="M383 445v14l293 -171v-14Z" fill="#adc6aa"/><path d="M130 301L296 207Q315 195 339 209L462 277Q485 290 505 278L625 210" fill="none" stroke="#f1f2df" stroke-width="67" stroke-linecap="butt"/><path d="M130 301L296 207Q315 195 339 209L462 277Q485 290 505 278L625 210" fill="none" stroke="#a9bcb2" stroke-width="52"/><path d="M130 301L296 207Q315 195 339 209L462 277Q485 290 505 278L625 210" fill="none" stroke="#fffef7" stroke-width="3" stroke-dasharray="15 12"/>${tree(340, 144, 19)}${tree(378, 163, 24)}${house(252, 245, 80, 60, 79, '#355b5c')}${house(487, 231, 66, 47, 84, '#3b6260')}<g transform="translate(471 165)"><path d="M-37 0l-19 -10v-29l19 10Z" fill="${C.coral}"/><path d="M-39 -2v-23M-45 -5v-23M-51 -8v-23" stroke="#f1d0b5" stroke-width="4"/></g>${tree(566, 233, 22)}${tree(598, 258, 18)}${tree(123, 253, 28)}<g transform="translate(276 231)"><ellipse cx="1" cy="19" rx="41" ry="15" fill="#648877" opacity=".2"/><path d="M-37 -4l43 -25 37 21 -43 25Z" fill="#f59a72"/><path d="M-37 -4v22l37 21V17Z" fill="#d96b4e"/><path d="M0 17v22l43 -25V-8Z" fill="#e7825e"/><path d="M-29 -7l15 -21 26 -15 27 17 4 18 -43 25Z" fill="#ed906b"/><path d="M-14 -28l26 -15 24 15 -28 16Z" fill="#f9ae82"/><path d="M-11 -25L7 -14 -1 8 -24 -5Z" fill="#426c68"/><path d="M11 -13l25 -14 4 17 -36 20Z" fill="#426c68"/><path d="M14 -12v15" stroke="#ed906b" stroke-width="4"/><ellipse cx="-25" cy="22" rx="7" ry="11" fill="#274d46" transform="rotate(-29 -25 22)"/><ellipse cx="-25" cy="22" rx="3" ry="5" fill="#afbeb1" transform="rotate(-29 -25 22)"/><ellipse cx="28" cy="25" rx="7" ry="11" fill="#274d46" transform="rotate(28 28 25)"/><ellipse cx="28" cy="25" rx="3" ry="5" fill="#afbeb1" transform="rotate(28 28 25)"/><path d="M-34 8l8 5v6l-8 -5Z" fill="#fff2ba"/><path d="M-12 20l8 5v6l-8 -5Z" fill="#fff2ba"/></g>${house(395, 375, 72, 52, 60, '#53786b')}<path d="M331 313l60 32v12l-60 -32Z" fill="${C.coral}"/><path d="M340 318v12M354 325v12M369 333v12M383 341v12" stroke="#f8d6b2" stroke-width="7"/>${tree(492, 367, 31)}${tree(537, 337, 22)}${tree(244, 363, 25)}${tree(205, 340, 17)}<g transform="translate(167 304)"><path d="M0 0v-41" stroke="#789a85" stroke-width="4"/><path d="M-11 -51h23L0 -31Z" fill="${C.red}" stroke="#fffef7" stroke-width="2"/></g><g transform="translate(580 192)"><path d="M0 0v-46" stroke="#789a85" stroke-width="4"/><rect x="-25" y="-53" width="54" height="19" rx="9" fill="#2c5149"/><circle cx="-15" cy="-44" r="5" fill="#8bc499"/><circle cx="2" cy="-44" r="5" fill="#758475"/><circle cx="19" cy="-44" r="5" fill="#758475"/></g><path d="M302 393l17 9M312 387l17 9M322 381l17 9M332 375l17 9" stroke="#f7f5e8" stroke-width="6"/><path d="M401 134l21 -12M408 142l22 -13" stroke="#e8edda" stroke-width="5" stroke-linecap="round"/></svg>`;
}
