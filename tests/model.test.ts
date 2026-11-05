import test from 'node:test'
import assert from 'node:assert/strict'
import {validModel,symmetricPoint,ModelHistory,blankModel,svgMarkup} from '../shared/model'
import {starterModels} from '../shared/patterns'
test('每个基础切口生成等半径的八个不同位置',()=>{
 const positions=Array.from({length:8},(_,index)=>symmetricPoint(42,17,index))
 assert.equal(new Set(positions.map(p=>[p.x.toFixed(4),p.y.toFixed(4)].join(','))).size,8)
 for(const p of positions)assert.ok(Math.abs(Math.hypot(p.x,p.y)-Math.hypot(42,17))<1e-9)
})
test('八张起始纸均可序列化恢复并无损重做',()=>{
 for(const model of starterModels){
  const recovered=JSON.parse(JSON.stringify(model))
  assert.ok(validModel(recovered))
  const history=new ModelHistory(blankModel())
  history.commit(recovered)
  assert.equal(history.undo().cuts.length,0)
  assert.equal(svgMarkup(history.redo()),svgMarkup(model))
 }
})
test('导出拒绝不可信纸色与非法坐标',()=>{
 const model=structuredClone(starterModels[0]!)
 model.color='url(https://example.org)'
 assert.throws(()=>svgMarkup(model))
 model.color='#B83228'; model.cuts[0]!.x=Infinity
 assert.equal(validModel(model),false)
})
