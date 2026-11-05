// Each call produces a standalone, question-specific image. Road markings are
// exclusively derived from the scene's road rules, never from its navigation.
const C = { ink: '#173e38', teal: '#347b69', grass: '#d6e3ce', road: '#b8c7bc', white: '#fffef7', coral: '#e67855', blue: '#bad6df', red: '#d95748', yellow: '#efbd4d' };
const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const text = (x, y, s, size = 21, extra = '') => `<text x="${x}" y="${y}" font-family="Pretendard, 'Noto Sans KR', sans-serif" font-size="${size}" font-weight="750" fill="${C.ink}" ${extra}>${esc(s)}</text>`;
const line = (d, color = C.white, width = 3, extra = '') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" ${extra}/>`;

function label(x, y, word, carX, carY, side = 'right') {
  const w = word.length * 18 + 24, end = side === 'right' ? x : x + w;
  return `<g class="vehicle-callout">${line(`M${end} ${y + 18}L${carX} ${carY}`, C.ink, 2.5)}<circle cx="${carX}" cy="${carY}" r="3" fill="${C.ink}"/><rect x="${x}" y="${y}" width="${w}" height="36" rx="9" fill="${C.white}" stroke="#bdcebf"/>${text(x + w / 2, y + 25, word, 21, 'text-anchor="middle"')}</g>`;
}

function car(x, y, rotation = 0, role = 'own') {
  const color = role === 'own' ? C.coral : C.blue;
  return `<g data-vehicle-role="${role}" data-car-x="${x}" data-car-y="${y}" transform="translate(${x} ${y}) rotate(${rotation})"><rect x="-20" y="-33" width="43" height="74" rx="14" fill="${C.ink}" opacity=".12"/><path d="M-21 -21v15m42 -15v15m-42 22v14m42 -14v14" stroke="${C.ink}" stroke-width="5"/><rect x="-19" y="-35" width="38" height="72" rx="12" fill="${color}"/><path d="M-14 -17q14 -7 28 0l-3 14h-22Z M-12 21h24l2 8q-14 4 -28 0Z" fill="#355b59"/><path d="M-15 1v14M15 1v14" stroke="${C.white}" stroke-opacity=".6" stroke-width="2"/><path d="M-14 -29h7m14 0h7" stroke="#fff6cf" stroke-width="4"/><path d="M-14 32h6m16 0h6" stroke="#c34e41" stroke-width="3"/></g>`;
}

function person(x, y) {
  return `<g data-road-user="pedestrian" transform="translate(${x} ${y})"><ellipse cy="19" rx="12" ry="4" fill="${C.ink}" opacity=".15"/><path d="M-4 7l-4 11M4 7l4 11" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/><path d="M-9 1L0 -5 9 1" fill="none" stroke="${C.teal}" stroke-width="6" stroke-linecap="round"/><rect x="-5" y="-6" width="10" height="16" rx="4" fill="${C.teal}"/><circle cy="-13" r="7" fill="#efc598"/></g>`;
}

function arrow(x, y, direction, color = C.white, scale = 1) {
  const rotate = { left: -90, right: 90, straight: 0 }[direction] || 0;
  return `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale})">${line('M0 21V-20M-12 -7L0 -20 12 -7', color, 7, 'stroke-linecap="round" stroke-linejoin="round"')}</g>`;
}

function laneArrow(x, y, directions) {
  let p = line(`M${x} ${y + 25}V${y - 6}`, C.white, 7, 'stroke-linecap="round"');
  if (directions.includes('straight')) p += line(`M${x} ${y - 6}V${y - 27}m-11 12 11 -12 11 12`, C.white, 7, 'stroke-linecap="round" stroke-linejoin="round"');
  if (directions.includes('right')) p += line(`M${x} ${y - 6}Q${x} ${y - 18} ${x + 13} ${y - 18}H${x + 27}m-11 -10 11 10 -11 10`, C.white, 6, 'stroke-linecap="round" stroke-linejoin="round"');
  if (directions.includes('left')) p += line(`M${x} ${y - 6}Q${x} ${y - 18} ${x - 13} ${y - 18}H${x - 27}m11 -10 -11 10 11 10`, C.white, 6, 'stroke-linecap="round" stroke-linejoin="round"');
  return `<g data-road-marking="lane-direction" data-directions="${directions.join(',')}">${p}</g>`;
}

// MLIT official sign atlas, 312 / 313 / 303:
// https://www.skr.mlit.go.jp/road/hyousiki/h_annai/roadsign/files/dourohyousikiichiran.pdf
function sign(type, x, y, poleLength = 61) {
  let symbol;
  if (type === 'no-entry') symbol = `<circle r="38" fill="${C.red}"/><path d="M-25 0H25" stroke="${C.white}" stroke-width="13"/>`;
  else {
    const inner = type === 'no-crossing'
      ? '<path d="M-17 24V5Q-17 -7 -4 -7H19m-13 -12 13 12 -13 12" fill="none" stroke="#3c608b" stroke-width="8" stroke-linejoin="round"/>'
      : '<path d="M-13 24V-8a13 13 0 0 1 26 0V15m-9 -10 9 10 9 -10" fill="none" stroke="#3c608b" stroke-width="7" stroke-linejoin="round"/>';
    symbol = `<circle r="38" fill="${C.white}" stroke="${C.red}" stroke-width="8"/>${inner}<path d="M-26 27L26 -27" stroke="${C.red}" stroke-width="8"/>`;
  }
  return `<g data-sign="${type}" transform="translate(${x} ${y})"><path d="M0 33v${poleLength}" stroke="#839c8c" stroke-width="7"/>${symbol}</g>`;
}

function signal(s) {
  const colors = { green: '#82cf83', yellow: C.yellow, red: C.red };
  const slots = s.arrowSlots || s.arrows || [];
  const lights = ['green', 'yellow', 'red'].map((name, i) => `<circle cx="${24 + i * 43}" cy="25" r="16" fill="${s.signal === name ? colors[name] : '#60766a'}"/>`).join('');
  return `<g data-signal-type="road" transform="translate(407 20)"><path d="M65 44v83" stroke="#829c8c" stroke-width="6"/><rect width="132" height="50" rx="25" fill="${C.ink}"/>${lights}${slots.length ? `<rect y="57" width="132" height="42" rx="13" fill="${C.ink}"/>${slots.map((d, i) => `<g data-arrow="${d}" data-lit="${!!s.arrows?.includes(d)}">${arrow(66 + (i - (slots.length - 1) / 2) * 41, 78, d, s.arrows?.includes(d) ? '#a9e797' : '#53695d', .5)}</g>`).join('')}` : ''}</g>`;
}

function nav(s) {
  const route = s.route || s.exitRoute || 'right', mobile = s.mobile || s.compact;
  const direction = { right: '우회전', left: '좌회전', straight: '직진' }[route];
  const path = route === 'straight' ? 'M93 251V109' : route === 'right' ? 'M93 251V188Q93 163 118 163H160' : 'M93 251V188Q93 163 68 163H28';
  if (s.kind === 'entry') {
    // A roadside driveway is not a cross intersection. Its navigation map has
    // exactly one branch, on the same side as the actual destination.
    const left = s.destinationSide === 'left', turn = left ? 'left' : 'right';
    if (mobile) {
      const endX = left ? 225 : 341, lotX = left ? 207 : 323;
      const p = left ? 'M283 505v-28q0 -16 -16 -16h-42' : 'M283 505v-28q0 -16 16 -16h42';
      return `<g data-navigation="${route}" data-layout="mobile" data-nav-layout="driveway"><rect x="10" y="438" width="540" height="91" rx="16" fill="${C.white}" stroke="#bacdbd"/>${text(28, 473, '내비게이션', 20)}${text(28, 506, direction, 27)}<path d="M283 449v65M283 461H${endX}" stroke="#d7dfd0" stroke-width="24" fill="none"/><rect x="${lotX}" y="450" width="36" height="31" rx="4" fill="#cdd8c9"/>${line(p, C.teal, 8, 'stroke-linecap="round" stroke-linejoin="round"')}${arrow(endX, 461, turn, C.teal, .45)}<path d="M283 497l-8 15 8 -3 8 3Z" fill="${C.coral}"/><path d="M${endX} 500l-7 -10a9 9 0 1 1 14 0Z" fill="${C.coral}"/><circle cx="${endX}" cy="484" r="3" fill="${C.white}"/>${text(523, 488, '목적지 입구', 19, 'text-anchor="end"')}</g>`;
    }
    const endX = left ? 31 : 155, lotX = left ? 16 : 124;
    const p = left ? 'M93 251V194Q93 176 75 176H31' : 'M93 251V194Q93 176 111 176H155';
    return `<g data-navigation="${route}" data-nav-layout="driveway" transform="translate(568 14)"><rect width="184" height="402" rx="20" fill="${C.white}" stroke="#bacdbd"/>${text(92, 38, '내비게이션', 20, 'text-anchor="middle"')}<rect x="11" y="57" width="162" height="270" rx="12" fill="#e4eadc"/><path d="M93 57v270" stroke="#cdd8c9" stroke-width="48"/><path d="M93 176H${endX}" stroke="#cdd8c9" stroke-width="35"/><rect x="${lotX}" y="153" width="44" height="67" rx="5" fill="#cdd8c9"/><path d="M93 61v258" stroke="${C.white}" stroke-width="2" stroke-dasharray="6 7"/>${line(p, C.teal, 10, 'stroke-linecap="round" stroke-linejoin="round"')}${arrow(endX, 176, turn, C.teal, .55)}<path d="M93 251l-12 24 12 -5 12 5Z" fill="${C.coral}" stroke="${C.white}" stroke-width="2"/><path d="M${endX} 145l-9 -13a12 12 0 1 1 18 0Z" fill="${C.coral}"/><circle cx="${endX}" cy="124" r="4" fill="${C.white}"/>${text(left ? 42 : 143, 102, '목적지', 18, 'text-anchor="middle"')}${text(92, 373, direction, 28, 'text-anchor="middle"')}</g>`;
  }
  if (mobile) {
    const p = route === 'straight' ? 'M283 505v-52' : route === 'right' ? 'M283 505v-30q0 -14 14 -14h42' : 'M283 505v-30q0 -14 -14 -14h-42';
    return `<g data-navigation="${route}" data-layout="mobile"><rect x="10" y="438" width="540" height="91" rx="16" fill="${C.white}" stroke="#bacdbd"/>${text(28, 473, '내비게이션', 20)}${text(28, 506, direction, 27)}<path d="M211 461h151M283 449v65" stroke="#d7dfd0" stroke-width="24" fill="none"/>${line(p, C.teal, 8, 'stroke-linecap="round" stroke-linejoin="round"')}${arrow(route === 'straight' ? 283 : route === 'right' ? 339 : 227, route === 'straight' ? 453 : 461, route, C.teal, .45)}<path d="M283 497l-8 15 8 -3 8 3Z" fill="${C.coral}"/>${text(523, 488, '안내 경로', 19, 'text-anchor="end"')}</g>`;
  }
  return `<g data-navigation="${route}" transform="translate(568 14)"><rect width="184" height="402" rx="20" fill="${C.white}" stroke="#bacdbd"/>${text(92, 38, '내비게이션', 20, 'text-anchor="middle"')}<rect x="11" y="57" width="162" height="270" rx="12" fill="#e4eadc"/><path d="M93 57v270M11 163h162" stroke="#cdd8c9" stroke-width="48"/><path d="M93 61v258M15 163h154" stroke="${C.white}" stroke-width="2" stroke-dasharray="6 7"/>${line(path, C.teal, 10, 'stroke-linecap="round" stroke-linejoin="round"')}${arrow(route === 'straight' ? 93 : route === 'right' ? 157 : 31, route === 'straight' ? 109 : 163, route, C.teal, .6)}<path d="M93 251l-12 24 12 -5 12 5Z" fill="${C.coral}" stroke="${C.white}" stroke-width="2"/>${text(92, 373, direction, 28, 'text-anchor="middle"')}</g>`;
}

function svg(s, description, content) {
  const mobile = s.mobile || s.compact;
  const width = s.nav && !mobile ? 760 : 560, height = s.nav && mobile ? 540 : 430;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="scene-title" data-scenario-feature="${esc(s.feature || s.kind)}"><title id="scene-title">${esc(description)}</title><rect width="${width}" height="${height}" rx="18" fill="${C.grass}"/>${content}${s.nav ? nav(s) : ''}</svg>`;
}

function store(x, y, width = 120, caption = '목적지') {
  return `<g data-destination="true"><rect x="${x}" y="${y}" width="${width}" height="73" rx="4" fill="#f1ead4"/><path d="M${x - 5} ${y + 5}h${width + 10}v19H${x - 5}Z" fill="${C.teal}"/><path d="M${x + 12} ${y + 36}h27v24h-27ZM${x + width - 39} ${y + 36}h27v24h-27Z" fill="#a9c8c1"/><path d="M${x + width / 2 - 10} ${y + 39}h20v34h-20Z" fill="#6b8e83"/><path d="M${x + width / 2} ${y - 6}l-10 -15a14 14 0 1 1 20 0Z" fill="${C.coral}"/><circle cx="${x + width / 2}" cy="${y - 30}" r="5" fill="${C.white}"/><rect x="${x + width / 2 - 48}" y="${y - 73}" width="96" height="30" rx="7" fill="${C.white}"/>${text(x + width / 2, y - 51, caption, 21, 'text-anchor="middle"')}</g>`;
}

export function entryScene(s, description = '') {
  const variant = typeof s.variant === 'number' ? s.variant : String(s.variant || '').split('').reduce((n, c) => n + c.charCodeAt(0), 0);
  const offset = (variant % 3 - 1) * 8, left = 187 + offset, center = left + 78, right = left + 156;
  const ownX = left + 39, oppositeX = center + 39;
  const feature = s.feature || 'yellow-entry', roadside = !['obstacle', 'overtake'].includes(feature);
  const isLeft = s.destinationSide === 'left', exit = feature === 'parking-exit';
  // Leave room before the left driveway for the sign on our approach's roadside.
  const leftAccessWithSign = isLeft && !exit && s.sign === 'no-crossing';
  const openingY = leftAccessWithSign ? 200 : 229 + (variant % 2) * 18, openingBottom = openingY + 83;
  const roadColor = s.centerLine === 'white-dashed' ? C.white : C.yellow;
  let out = `<g data-road-layout="two-way-two-lane" data-center-line="${s.centerLine || 'yellow'}" data-has-sidewalk="${Boolean(s.sidewalk)}"><rect x="${left}" width="156" height="430" fill="${C.road}"/>${line(`M${center} 0V430`, roadColor, 5, s.centerLine === 'white-dashed' ? 'stroke-dasharray="17 13" data-centerline="white-dashed"' : 'data-centerline="yellow-solid"')}</g>`;
  const edge = (x, gap) => line(gap ? `M${x} 0V${openingY}M${x} ${openingBottom}V430` : `M${x} 0V430`);
  out += edge(left + 3, roadside && isLeft) + edge(right - 3, roadside && !isLeft);

  if (roadside) {
    const plotX = isLeft ? 7 : right + 32, plotW = isLeft ? left - 37 : 553 - plotX;
    const driveX = isLeft ? plotX : right, driveW = isLeft ? left - plotX : 553 - right;
    out += `<g data-driveway="${isLeft ? 'left' : 'right'}"><rect x="${plotX}" y="${openingY - 22}" width="${plotW}" height="${exit ? 170 : 141}" rx="5" fill="#d1d5c6"/><rect x="${driveX}" y="${openingY}" width="${driveW}" height="83" fill="#c9cfc1"/>${line(`M${driveX} ${openingY}h${driveW}M${driveX} ${openingBottom}h${driveW}`, '#a9b7a6', 2)}${store(isLeft ? 20 : right + 71, openingY - 91, 112, exit ? '주차장' : '목적지')}<path d="M${plotX + 8} ${openingBottom + 7}v28h46v-28m13 0v28h46v-28" stroke="${C.white}" stroke-width="2.5" fill="none"/></g>`;
    if (s.sidewalk) {
      const sidewalkX = isLeft ? left - 31 : right;
      const sidewalkLabelX = isLeft ? sidewalkX - 68 : sidewalkX + 43;
      out += `<g data-sidewalk="true"><rect x="${sidewalkX}" width="31" height="430" fill="#dfd0af"/>${line(`M${sidewalkX + 1} 0V${openingY}M${sidewalkX + 1} ${openingBottom}V430M${sidewalkX + 30} 0V${openingY}M${sidewalkX + 30} ${openingBottom}V430`, '#b8a887', 3)}${Array.from({ length: 14 }, (_, i) => line(`M${sidewalkX + 3} ${i * 32 + 11}h25`, '#bbaa89', 1.5)).join('')}${line(`M${sidewalkLabelX + (isLeft ? 57 : 0)} 32L${sidewalkX + 16} 65`, C.ink, 1.7)}<rect x="${sidewalkLabelX}" y="16" width="57" height="30" rx="7" fill="${C.white}"/>${text(sidewalkLabelX + 28.5, 38, '인도', 20, 'text-anchor="middle"')}</g>`;
      if (s.pedestrian) out += person(sidewalkX + 16, openingY + 37) + `<path d="M${sidewalkX + 16} ${openingY + 60}v14m-5 -5 5 5 5 -5" stroke="${C.teal}" stroke-width="3" fill="none"/>`;
    }
  }

  if (feature === 'obstacle') {
    out += `<g data-obstruction="roadworks"><rect x="${left + 9}" y="166" width="59" height="93" rx="8" fill="#958f79"/><path d="M${left + 15} 190l17 18 19 -20m-29 47 24 -16" stroke="#766f5f" stroke-width="5" fill="none"/>${[169, 208, 251].flatMap(y => [left + 9, left + 68].map(x => `<g transform="translate(${x} ${y})"><path d="M-8 9L0 -10 8 9Z" fill="${C.coral}"/><path d="M-5 2h10" stroke="${C.white}" stroke-width="3"/><path d="M-10 11h20" stroke="${C.ink}" stroke-width="3"/></g>`)).join('')}<rect x="${left + 6}" y="270" width="65" height="12" fill="${C.yellow}"/><path d="M${left + 7} 270l12 12m10 -12 12 12m10 -12 12 12" stroke="${C.ink}" stroke-width="6"/>${text(46, 220, '공사 중', 22)}${line(`M121 216L${left + 7} 216`, C.ink, 2)}</g>`;
  }
  if (feature === 'overtake') {
    out += car(ownX, 179, 0, 'ahead') + label(22, 145, '느린 앞차', ownX - 24, 175, 'left');
    out += `<g data-intended-route="overtake">${line(`M${ownX + 24} 332Q${oppositeX} 307 ${oppositeX} 263V146`, C.coral, 4, 'stroke-dasharray="8 7"')}${arrow(oppositeX, 145, 'straight', C.coral, .55)}${text(right + 19, 287, '추월?', 22)}</g>`;
    out += line(`M${ownX - 11} 230v9m11 -9v16m11 -16v9`, C.teal, 3, 'stroke-linecap="round"');
  }
  if (s.oncoming) {
    const oncomingY = feature === 'obstacle' ? 226 : s.pedestrian ? 145 : 164;
    out += car(oppositeX, oncomingY, 180, 'oncoming') + label(21, 25, '맞은편 차', oppositeX - 23, oncomingY - 7, 'left');
  }
  if (leftAccessWithSign) out += sign(s.sign, left - 60, 363, 29);
  else if (s.sign) out += sign(s.sign, s.sign === 'no-entry' ? (isLeft ? left - 48 : right + 50) : isLeft ? 461 : 87, s.sign === 'no-entry' ? openingY + 15 : 91);

  if (exit) {
    const ownY = openingY + 41, ownExitX = isLeft ? left - 84 : right + 85;
    out += car(ownExitX, ownY, isLeft ? 90 : -90, 'own') + label(isLeft ? 26 : right + 84, 379, '내 차', ownExitX, ownY + 25, isLeft ? 'left' : 'right');
    // A dotted intended path belongs to the car, rather than a painted lane arrow.
    const down = s.exitRoute === 'left' ? !isLeft : isLeft;
    const targetX = down ? oppositeX : ownX, targetY = down ? 369 : 126;
    out += `<g data-intended-route="${esc(s.exitRoute || 'right')}">${line(`M${ownExitX + (isLeft ? 41 : -41)} ${ownY}H${targetX + (isLeft ? -16 : 16)}Q${targetX} ${ownY} ${targetX} ${ownY + (down ? 20 : -20)}V${targetY}`, C.coral, 3.5, 'stroke-dasharray="7 7"')}${arrow(targetX, targetY, 'straight', C.coral, down ? -.5 : .5)}</g>`;
  } else {
    out += car(ownX, 365) + (leftAccessWithSign
      ? label(right + 32, 348, '내 차', ownX + 24, 365)
      : label(14, 348, '내 차', ownX - 24, 365, 'left'));
  }
  return svg(s, description, out);
}

export function laneScene(s, description = '') {
  const lanes = s.laneDirections || [['straight'], ['right']];
  const ownLane = s.myLane === 'right' ? 1 : 0, laneX = [207, 285], ownX = laneX[ownLane];
  const near = s.position !== 'far', junctionTop = near ? 102 : 46, junctionBottom = near ? 258 : 202;
  const eastboundDivider = junctionTop + 52, opposingDivider = junctionTop + 104;
  const stopY = junctionBottom + 10;
  const ownY = s.position === 'near' ? 371 : 386;
  // Both approach lanes are left of the opposing lane. The right-hand road is
  // physically open across the entire junction, irrespective of navigation.
  let out = `<g data-intersection="true"><rect y="${junctionTop}" width="560" height="156" fill="${C.road}"/><rect x="168" width="234" height="430" fill="${C.road}"/>${line(`M0 ${junctionTop + 3}h168V0M402 0v${junctionTop + 3}h158M0 ${junctionBottom - 3}h168V430M402 430V${junctionBottom - 3}h158`)}${line(`M324 0V${junctionTop - 5}M324 ${junctionBottom + 5}V430`, C.white, 4, 'data-road-marking="centerline"')}${line(`M246 0V${junctionTop - 5}M246 ${junctionBottom + 5}V430`, s.boundary === 'yellow' ? C.yellow : C.white, 4, `${s.boundary === 'yellow' ? 'data-lane-change="forbidden"' : 'stroke-dasharray="14 12"'} data-boundary="${s.boundary || 'white-dashed'}"`)}${line(`M0 ${opposingDivider}h161M409 ${opposingDivider}h151`, C.white, 3)}${line(`M0 ${eastboundDivider}h161M409 ${eastboundDivider}h151`, C.white, 3, 'stroke-dasharray="14 12"')}</g>`;
  out += `<path data-marking="stop-line" d="M174 ${stopY}h144" stroke="${C.white}" stroke-width="8"/>`;
  out += `<g data-lane="left" data-lane-directions="${lanes[0].join(',')}">${laneArrow(laneX[0], 306, lanes[0])}</g><g data-lane="right" data-lane-directions="${lanes[1].join(',')}">${laneArrow(laneX[1], 306, lanes[1])}</g>`;
  // Show the opposing traffic direction explicitly. Otherwise the yellow lane
  // divider can be mistaken for the center line and the turn lane for oncoming.
  out += `<g data-lane="opposing" data-travel-direction="toward-viewer"><g transform="translate(363 350) rotate(180)">${arrow(0, 0, 'straight', C.white, .8)}</g>${label(423, 342, '반대 차로', 385, 350)}${line('M324 403H412', C.ink, 1.5)}<rect x="414" y="387" width="124" height="32" rx="8" fill="${C.white}"/>${text(476, 411, '흰 중앙선', 20, 'text-anchor="middle"')}</g>`;
  if (!near) out += `${laneArrow(laneX[0], 253, lanes[0])}${laneArrow(laneX[1], 253, lanes[1])}`;
  if (lanes[0].includes('right') && lanes[1].includes('right')) out += `<g data-turning-guides="two-lanes">${line(`M207 ${junctionBottom - 5}V${junctionTop + 62}q0 -36 36 -36H400`, '#e4e9de', 2, 'stroke-dasharray="6 7"')}${line(`M285 ${junctionBottom - 5}V${junctionTop + 105}q0 -27 27 -27H400`, '#e4e9de', 2, 'stroke-dasharray="6 7"')}</g>`;
  if (near) out += `<rect x="16" y="21" width="118" height="62" rx="7" fill="#e4dcc5"/><path d="M11 21h128v18H11Z" fill="#719789"/><path d="M28 52h29v21H28Zm50 0h29v21H78Z" fill="#b2ccc2"/>`;
  out += car(ownX, ownY) + label(13, ownY - 17, '내 차', ownX - 24, ownY, 'left');
  if (s.otherCar) {
    const x = laneX[ownLane ? 0 : 1], y = near ? 363 : 348;
    out += car(x, y, 0, 'adjacent') + label(421, y - 17, '옆 차', x + 24, y);
  }
  if (s.oncoming) out += car(363, 69, 180, 'oncoming') + label(421, 274, '맞은편 차', 385, 82);
  if (s.signal) out += signal(s);
  return svg(s, description, out);
}
