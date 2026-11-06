import type {PaperModel} from '../../shared/model'
export interface WindowWork {id:string;title:string;model:PaperModel;is_example:boolean}
export interface WindowFlight {work:WindowWork;rect:{left:number;top:number;width:number;height:number}}
export const useWindowFlight=()=>useState<WindowFlight|null>('window-flight',()=>null)
