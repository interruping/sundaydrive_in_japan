// Every arrowhead is constructed from its arc endpoint and tangent. The filled
// head overlaps the shaft so it stays connected at small rendered sizes.
export function circularArrows({ cx = 12, cy = 12, radius = 7.2, count = 2, color = 'currentColor', strokeWidth = 1.8, headLength = 3.2, headWidth = 4.8, startAngle = -130, gapAngle = 50 } = {}) {
  const round = value => Number(value.toFixed(3));
  const point = angle => ({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
  const pieces = Array.from({ length: count }, (_, index) => {
    const start = (startAngle + index * 360 / count) * Math.PI / 180;
    const end = start + (360 / count - gapAngle) * Math.PI / 180;
    const a = point(start), b = point(end);
    const tangent = { x: -Math.sin(end), y: Math.cos(end) };
    const normal = { x: Math.cos(end), y: Math.sin(end) };
    const base = { x: b.x - tangent.x * strokeWidth * .7, y: b.y - tangent.y * strokeWidth * .7 };
    const tip = { x: b.x + tangent.x * headLength, y: b.y + tangent.y * headLength };
    const outer = { x: base.x + normal.x * headWidth / 2, y: base.y + normal.y * headWidth / 2 };
    const inner = { x: base.x - normal.x * headWidth / 2, y: base.y - normal.y * headWidth / 2 };
    return `<g data-circular-arrow="${index}"><path d="M${round(a.x)} ${round(a.y)}A${radius} ${radius} 0 0 1 ${round(b.x)} ${round(b.y)}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/><path d="M${round(outer.x)} ${round(outer.y)}L${round(tip.x)} ${round(tip.y)}L${round(inner.x)} ${round(inner.y)}Z" fill="${color}" stroke="none"/></g>`;
  }).join('');
  return `<g data-circular-arrows="${count}" data-direction="clockwise">${pieces}</g>`;
}
