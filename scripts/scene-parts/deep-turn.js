// Educational reconstruction of the long right-turn approach documented at
// Hamatama-chu-mae, Karatsu, in MLIT's March 2020 road-safety survey (PDF page 6).
// A is the entry signal's stop line. B is an INTERNAL waiting guide, not a
// second permission to enter on red. Geometry is schematic, not a current map.
const C = { ink:'#173e38', road:'#b8c7bc', ground:'#e9f0e9', white:'#fffef7', green:'#347b69', coral:'#e67855', blue:'#bad6df', yellow:'#efbd4d' };
const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text = (x,y,value,size=22,extra='') => `<text x="${x}" y="${y}" font-size="${size}" fill="${C.ink}" font-weight="700" ${extra}>${esc(value)}</text>`;
const line = (d,color=C.white,width=3,extra='') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" ${extra}/>`;
const arrow = (x,y,rotation=0,color=C.white,scale=1) => `<path d="M0 17V-16m-10 10 10-10 10 10" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" transform="translate(${x} ${y}) rotate(${rotation}) scale(${scale})"/>`;
function car(x,y,rotation=0,role='own') {
  return `<g data-vehicle-role="${role}" data-car-x="${x}" data-car-y="${y}" data-car-length="46" transform="translate(${x} ${y}) rotate(${rotation})"><rect x="-14" y="-15" width="28" height="10" rx="2" fill="${C.ink}"/><rect x="-14" y="11" width="28" height="10" rx="2" fill="${C.ink}"/><rect x="-12" y="-23" width="24" height="46" rx="7" fill="${role==='own'?C.coral:C.blue}"/><path d="M-9 -12q9-4 18 0l-2 10h-14ZM-8 12h16l1 6h-18Z" fill="#355b59"/><path d="M-9 -19h5m8 0h5" stroke="#fff3b8" stroke-width="3"/><path d="M-9 20h4m10 0h4" stroke="#c25142" stroke-width="2"/></g>`;
}
function tag(x,y,value,tx,ty,own=false) {
  const width=Math.max(82,value.length*19+22);
  return `<g>${line(`M${x} ${y}L${tx} ${ty}`,C.ink,1.8)}<rect x="${x-width/2}" y="${y-17}" width="${width}" height="34" rx="9" fill="${own?C.ink:C.white}" stroke="${own?C.ink:'#b8cbbb'}"/>${text(x,y+7,value,21,`text-anchor="middle"${own?' style="fill:#fffef7"':''}`)}</g>`;
}
function badge(letter,x,y) {
  return `<circle cx="${x}" cy="${y}" r="17" fill="${C.white}" stroke="${C.ink}" stroke-width="2"/>${text(x,y+8,letter,25,'text-anchor="middle"')}`;
}
function signal(s) {
  const names=['green','yellow','red'], colors=['#82cf83',C.yellow,'#e35f4c'];
  const slots=['left','straight','right'];
  return `<g data-signal-type="road" transform="translate(454 36)"><rect width="168" height="60" rx="30" fill="${C.ink}"/>${names.map((name,i)=>`<circle cx="${29+i*55}" cy="30" r="20" fill="${s.signal===name?colors[i]:'#66776a'}"/>`).join('')}<path d="M84 60v92" stroke="#88a08e" stroke-width="6"/>${s.arrows?`<rect y="71" width="168" height="46" rx="13" fill="${C.ink}"/>${slots.map((direction,i)=>`<g data-arrow="${direction}" data-lit="${s.arrows.includes(direction)}">${arrow(29+i*55,94,{left:-90,straight:0,right:90}[direction],s.arrows.includes(direction)?'#a9e797':'#53695d',.65)}</g>`).join('')}`:''}${text(84,-12,'내 차가 보는 신호',19,'text-anchor="middle"')}</g>`;
}
function navigation(mobile) {
  // The side roads are offset, like the scene, rather than a generic crossroad.
  const map = `<g><rect width="170" height="240" rx="13" fill="#e8ede0"/><rect x="64" width="44" height="240" fill="#ccd7c5"/><path d="M108 48H170V86H108M0 145H64V185H0" fill="#ccd7c5"/><path d="M86 12V230" stroke="${C.white}" stroke-width="2" stroke-dasharray="7 7"/><path d="M86 215V87Q86 67 106 67H150" fill="none" stroke="${C.green}" stroke-width="9" stroke-linecap="round"/>${arrow(147,67,90,C.green,.65)}<path d="M86 191l-10 22 10-5 10 5Z" fill="${C.coral}" stroke="${C.white}" stroke-width="2"/></g>`;
  if (mobile) return `<g data-navigation="offset-junction" transform="translate(16 660)"><rect width="608" height="114" rx="17" fill="${C.white}" stroke="#c4d4c5"/><g transform="translate(14 9) scale(.4)">${map}</g>${text(144,43,'내비게이션',22)}${text(144,84,'우회전',33)}<path d="M398 85V48q0-14 14-14h130m-14-12 14 12-14 12" fill="none" stroke="${C.green}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  return `<g data-navigation="offset-junction" transform="translate(650 145)"><rect width="194" height="355" rx="20" fill="${C.white}" stroke="#c4d4c5"/>${text(97,36,'내비게이션',22,'text-anchor="middle"')}<g transform="translate(12 52)">${map}</g>${text(97,332,'우회전',30,'text-anchor="middle"')}</g>`;
}

export function deepTurnScene(s,description='') {
  const mobile=Boolean(s.mobile||s.compact), width=mobile?640:860, height=mobile?790:650;
  const stage=s.stage||'before-entry';
  const ownY=stage==='at-waiting'?311:stage==='early-inside'?420:593;
  let out=`<g data-road-layout="large-offset-intersection" data-entry-line-y="555" data-waiting-line-y="285" data-stage="${stage}"><path d="M0 355H120Q172 355 172 300V0H388V130Q388 160 420 160H640V304H432Q388 304 388 355V650H172V518Q172 490 120 490H0Z" fill="${C.road}"/><path d="M0 359H120Q176 359 176 300V0M392 0V130Q392 156 420 156H640M640 308H432Q392 308 392 355V650M168 650V518Q168 494 120 494H0" fill="none" stroke="${C.white}" stroke-width="3"/>
  ${line('M280 0V125M280 560V650',C.white,4)}
  ${line('M208 0V130M244 0V130M316 0V130M352 0V130M208 560V650M244 560V650M316 560V650M352 560V650',C.white,2,'stroke-dasharray="12 10"')}
  ${line('M0 423H118M438 248H640',C.white,3)}${line('M438 204H640',C.white,2,'stroke-dasharray="12 10"')}
  <g data-crosswalk="entry">${Array.from({length:7},(_,i)=>`<rect x="${178+i*14}" y="521" width="8" height="22" fill="${C.white}"/>`).join('')}</g>
  <path data-marking="stop-line" data-line-id="A" d="M178 555H276" stroke="${C.white}" stroke-width="7"/>
  ${line('M244 518V292Q244 184 336 184H640',C.white,3,'stroke-dasharray="10 8"')}
  ${line('M280 518V302Q280 230 340 230H640',C.white,3,'stroke-dasharray="10 8"')}
  <path data-marking="waiting-guide" data-line-id="B" d="M246 285H278" stroke="${C.white}" stroke-width="6"/>
  ${badge('A',150,555)}${badge('B',217,285)}
  ${arrow(190,612,0,C.white,.6)}${arrow(226,612,0,C.white,.6)}
  <path d="M262 631v-13q0-7 7-7h7m-6-6 6 6-6 6" fill="none" stroke="${C.white}" stroke-width="4" stroke-linecap="round"/>
  ${text(65,590,'진입 전',18,'text-anchor="middle"')}${text(65,614,'정지선 A',21,'text-anchor="middle"')}
  ${line('M110 592L140 560',C.ink,1.5)}
  <rect x="22" y="215" width="167" height="52" rx="9" fill="${C.white}"/>${text(105,237,'교차로 안쪽',20,'text-anchor="middle"')}${text(105,259,'우회전 대기 B',22,'text-anchor="middle"')}${line('M189 252L209 275',C.ink,1.5)}
  </g>`;
  if (s.waitingQueue) {
    for (const y of [311,366,421,476]) out+=car(262,y,0,'ahead');
    out+=tag(415,442,'대기 차량',280,464);
  }
  if (s.oncoming) {
    out+=car(300,137,180,'oncoming')+tag(422,130,'맞은편 차',316,137);
    if(s.otherRoute==='left') out+=`<g data-other-route="left">${line('M300 165V183Q300 207 330 207H427','#4f8ba1',4,'stroke-dasharray="8 6"')}${arrow(421,207,90,'#4f8ba1',.5)}</g>`;
    else out+=`<g data-other-route="straight">${line('M300 166V253','#4f8ba1',4,'stroke-dasharray="8 6"')}${arrow(300,246,180,'#4f8ba1',.5)}</g>`;
  }
  if(s.straightMoving){out+=car(226,465,0,'adjacent')+tag(93,438,'직진 차',211,465)+line('M218 493v11m8-9v14m8-16v11','#6d9484',2.5);}
  if(s.adjacentStopped){out+=car(226,593,0,'adjacent')+tag(120,625,'직진 차',211,602);}
  if(s.exitBlocked){out+=car(493,207,90,'ahead')+car(547,207,90,'ahead')+car(601,207,90,'ahead')+tag(533,359,'출구 정체',545,230);}
  if(s.pedestrian){
    out+=`<g data-crosswalk="turn-exit">${Array.from({length:7},(_,i)=>`<rect x="475" y="${168+i*19}" width="30" height="11" fill="${C.white}"/>`).join('')}</g><g data-pedestrian="crossing" transform="translate(489 200)"><circle cy="-14" r="6" fill="#efc598"/><path d="M-5-6h10v17H-5Z" fill="${C.green}"/><path d="M-5 8l-5 15m15-15 5 15M-5-3l-9 10M5-3l9 10" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/></g>`;
  }
  out+=car(262,ownY,0,'own');
  const labelY=stage==='before-entry'?585:stage==='early-inside'?420:327;
  out+=tag(stage==='before-entry'?455:130,labelY,'내 차',stage==='before-entry'?277:247,ownY,true);
  out+=signal(s);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(description)}" data-scenario-feature="deep-right-turn" style="font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo',sans-serif"><title>${esc(description)}</title><rect width="${width}" height="${height}" rx="18" fill="${C.ground}"/>${out}${navigation(mobile)}</svg>`;
}
