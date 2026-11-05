import { blankModel, type PaperModel, type Cut } from './model'
function cut(type: Cut['type'], x:number,y:number,size:number,aspect=1,angle=0): Cut { return {id:`c${x}_${y}_${size}`.replaceAll('.','_'),type,x,y,size,aspect,angle} }
export const starterModels: PaperModel[] = [
  [cut('drop',42,17,16,.48,23),cut('drop',70,29,12,.55,23),cut('circle',86,0,5),cut('triangle',91,35,8,.55,22),cut('circle',20,0,4),cut('drop',63,0,11,.25,90),cut('circle',70,58,5)],
  [cut('drop',47,18,22,.6,23),cut('circle',83,30,8),cut('triangle',88,0,9,.6),cut('circle',22,0,5),cut('circle',65,55,5)],
  [cut('triangle',50,20,20,.65,20),cut('circle',80,26,7),cut('drop',82,0,13,.4,90),cut('circle',22,9,5)],
  [cut('circle',54,20,16,.8),cut('circle',84,0,9,.5),cut('drop',82,31,9,.5,22),cut('triangle',22,0,6,.6)],
  [cut('drop',55,0,22,.4,90),cut('drop',68,48,16,.4,45),cut('circle',31,13,8),cut('triangle',89,25,8)],
  [cut('triangle',62,0,18,.4,0),cut('triangle',65,39,14,.7,35),cut('circle',31,12,7),cut('circle',86,32,6)],
  [cut('drop',37,15,15,.4,23),cut('drop',68,28,14,.4,23),cut('circle',89,0,7),cut('circle',72,61,5),cut('triangle',64,0,6)],
  [cut('circle',45,18,13),cut('drop',78,29,15,.4,22),cut('triangle',83,0,12,.4),cut('triangle',70,61,6,.7,45)]
].map(cuts=>({...blankModel(),cuts}))
export const patternNames = ['团花初绽','四时花信','菱角窗影','圆圆如意','叶影成双','八方星芒','水滴连珠','花间留白']
