export type CutType = 'circle' | 'triangle' | 'drop'
export interface Cut { id: string; type: CutType; x: number; y: number; size: number; aspect: number; angle: number }
export interface PaperModel { schemaVersion: 1; color: string; symmetry: 'dihedral-4'; cuts: Cut[] }
export const COLORS = ['#B83228', '#8C2925', '#C45837', '#24201D']
export const blankModel = (): PaperModel => ({ schemaVersion: 1, color: COLORS[0]!, symmetry: 'dihedral-4', cuts: [] })
export const cloneModel = (m: PaperModel): PaperModel => JSON.parse(JSON.stringify(m))
export function validModel(value: unknown): value is PaperModel {
  if (!value || typeof value !== 'object') return false
  const m = value as PaperModel
  return m.schemaVersion === 1 && m.symmetry === 'dihedral-4' && COLORS.includes(m.color) && Array.isArray(m.cuts) && m.cuts.length <= 80 &&
    new Set(m.cuts.map(c => c?.id)).size === m.cuts.length && m.cuts.every(c => c && typeof c.id === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(c.id) && ['circle', 'triangle', 'drop'].includes(c.type) &&
      [c.x,c.y,c.size,c.aspect,c.angle].every(Number.isFinite) && c.x >= 0 && c.x <= 100 && c.y >= 0 && c.y <= c.x && Math.hypot(c.x,c.y) <= 100.001 && c.size >= 1 && c.size <= 28 && c.aspect >= .25 && c.aspect <= 2.5 && c.angle >= -180 && c.angle <= 180)
}
export function sectorTransform(index: number): string {
  return index % 2 === 0 ? `rotate(${index * 45})` : `rotate(${(index + 1) * 45}) scale(1 -1)`
}
export function symmetricPoint(x: number, y: number, index: number) {
  const angle = (index % 2 === 0 ? index * 45 : (index + 1) * 45) * Math.PI / 180
  const yy = index % 2 === 0 ? y : -y
  return { x: x*Math.cos(angle)-yy*Math.sin(angle), y: x*Math.sin(angle)+yy*Math.cos(angle) }
}
export function clampPosition(x: number, y: number) {
  const radius = Math.min(96, Math.max(4, Math.hypot(x,y)))
  const theta = Math.max(0, Math.min(Math.PI/4, Math.atan2(y,x)))
  return { x: Math.round(radius*Math.cos(theta)*100)/100, y: Math.round(radius*Math.sin(theta)*100)/100 }
}
export function cutPath(c: Cut): string {
  const s = c.size, h = s*c.aspect
  if (c.type === 'circle') return `M ${-s} 0 a ${s} ${h} 0 1 0 ${s*2} 0 a ${s} ${h} 0 1 0 ${-s*2} 0`
  if (c.type === 'triangle') return `M ${-s} ${-h} L ${s} 0 L ${-s} ${h} Z`
  return `M ${s} 0 C ${-s*.2} ${-h*1.5} ${-s} ${-h} ${-s} 0 C ${-s} ${h} ${-s*.2} ${h*1.5} ${s} 0 Z`
}
export const SECTOR_PATH = 'M 0 0 L 100 0 A 100 100 0 0 1 70.710678 70.710678 Z'
export function svgMarkup(m: PaperModel): string {
  if (!validModel(m)) throw new Error('无效的剪纸模型')
  const cuts = m.cuts.map(c=>`<path d="${cutPath(c)}" transform="translate(${c.x} ${c.y}) rotate(${c.angle})"/>`).join('')
  const sectors = Array.from({length:8},(_,i)=>`<g transform="${sectorTransform(i)}"><g clip-path="url(#sector)">${cuts}</g></g>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-108 -108 216 216" width="1200" height="1200"><defs><clipPath id="sector"><path d="${SECTOR_PATH}"/></clipPath><mask id="paper" maskUnits="userSpaceOnUse" x="-108" y="-108" width="216" height="216"><circle r="100" fill="white"/><g fill="black">${sectors}</g></mask></defs><circle r="100" fill="${m.color}" mask="url(#paper)"/></svg>`
}
export class ModelHistory {
  private past: PaperModel[] = []
  private future: PaperModel[] = []
  current: PaperModel
  constructor(m: PaperModel) { this.current = cloneModel(m) }
  get canUndo() { return this.past.length > 0 }
  get canRedo() { return this.future.length > 0 }
  commit(m: PaperModel) { if (JSON.stringify(m) === JSON.stringify(this.current)) return; this.past.push(cloneModel(this.current)); if(this.past.length>100) this.past.shift(); this.current=cloneModel(m); this.future=[] }
  undo() { if(this.canUndo) { this.future.push(cloneModel(this.current)); this.current=this.past.pop()! } return cloneModel(this.current) }
  redo() { if(this.canRedo) { this.past.push(cloneModel(this.current)); this.current=this.future.pop()! } return cloneModel(this.current) }
}
