export const errorMessage=(e:any)=>e?.data?.message||e?.message||'暂时无法完成，请稍后重试。'
export function useFeedback() {
 const notice=useState('notice',()=>({text:'',kind:'success'}))
 function feedback(text:string,kind='success'){notice.value={text,kind}}
 return {notice,feedback}
}
