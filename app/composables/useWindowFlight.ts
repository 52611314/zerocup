import type {PaperModel} from '../../shared/model'
export interface WindowWork {id:string;title:string;model:PaperModel;is_example:boolean}
interface WindowPose { x: number; y: number; width: number; height: number; angle: number }
export interface WindowFlight { work: WindowWork; pose: WindowPose }

export function measureWindowArtwork(art: SVGSVGElement): WindowPose {
  const matrix = art.getScreenCTM()
  const box = art.viewBox.baseVal
  if (matrix && box.width && box.height) {
    const center = new DOMPoint(box.x + box.width / 2, box.y + box.height / 2).matrixTransform(matrix)
    return {
      x: center.x,
      y: center.y,
      width: box.width * Math.hypot(matrix.a, matrix.b),
      height: box.height * Math.hypot(matrix.c, matrix.d),
      angle: Math.atan2(matrix.b, matrix.a) * 180 / Math.PI,
    }
  }

  const rect = art.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height, angle: 0 }
}

export const useWindowFlight=()=>useState<WindowFlight|null>('window-flight',()=>null)
