import { randomBytes, randomUUID, createHash, scryptSync, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { query } from './db'
export const hashToken = (v:string) => createHash('sha256').update(v).digest('hex')
export function hashPassword(password:string) { const salt=randomBytes(16).toString('hex');return `${salt}:${scryptSync(password,salt,64).toString('hex')}` }
export function verifyPassword(password:string, stored:string) {
 const [salt,hex]=stored.split(':'); if(!salt||!hex)return false
 const a=Buffer.from(hex,'hex'), b=scryptSync(password,salt,64); return a.length===b.length&&timingSafeEqual(a,b)
}
function cookie(event:H3Event,name:string,value:string,maxAge:number) {
 setCookie(event,name,value,{httpOnly:true,sameSite:'lax',secure:(process.env.SITE_URL||'').startsWith('https://'),path:'/',maxAge})
}
export async function visitor(event:H3Event, create=true):Promise<string> {
 const token=getCookie(event,'paper_visitor')
 if(token&&/^[a-f0-9]{64}$/.test(token)) {const [s]=await query('SELECT id FROM visitor_sessions WHERE token_hash=$1 AND expires_at>now()',[hashToken(token)]);if(s)return s.id}
 if(!create) throw createError({statusCode:401,message:'访客会话已过期，请回到我的纸笺重新开始。'})
 const raw=randomBytes(32).toString('hex'),id=randomUUID()
 await query("INSERT INTO visitor_sessions(id,token_hash,expires_at) VALUES($1,$2,now()+interval '90 days')",[id,hashToken(raw)])
 event.context.paperVisitorToken=raw
 cookie(event,'paper_visitor',raw,90*86400); return id
}
export async function admin(event:H3Event) {
 const token=getCookie(event,'paper_admin')||''
 const [a]=await query('SELECT a.id,a.username FROM admin_sessions s JOIN admins a ON a.id=s.admin_id WHERE s.token_hash=$1 AND s.expires_at>now()',[hashToken(token)])
 if(!a)throw createError({statusCode:401,message:'请先登录管理后台。'})
 return a as {id:string;username:string}
}
export async function login(event:H3Event,username:string,password:string) {
 await rateLimit(event,'login',8,900)
 const [a]=await query('SELECT * FROM admins WHERE username=$1',[username])
 const dummy='00'.repeat(16)+':'+ '00'.repeat(64)
 if(!verifyPassword(password,a?.password_hash||dummy)||!a)throw createError({statusCode:401,message:'账号或密码不正确。'})
 const raw=randomBytes(32).toString('hex')
 await query("INSERT INTO admin_sessions(token_hash,admin_id,expires_at) VALUES($1,$2,now()+interval '8 hours')",[hashToken(raw),a.id])
 cookie(event,'paper_admin',raw,8*3600);return {username:a.username}
}
export async function rateLimit(event:H3Event,scope:string,max=90,seconds=60) {
 const key=hashToken(`${scope}:${getRequestIP(event)||'local'}`)
 const [r]=await query('INSERT INTO rate_limits(key,hits,reset_at) VALUES($1,1,now()+make_interval(secs=>$2)) ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN rate_limits.reset_at<now() THEN 1 ELSE rate_limits.hits+1 END, reset_at=CASE WHEN rate_limits.reset_at<now() THEN now()+make_interval(secs=>$2) ELSE rate_limits.reset_at END RETURNING hits',[key,seconds])
 if(r.hits>max){setResponseHeader(event,'Retry-After',seconds);throw createError({statusCode:429,message:'操作有些频繁，请稍后再试。'})}
}
export async function jsonBody(event:H3Event) {
 const raw=await readRawBody(event)
 if(!raw || Buffer.byteLength(raw)>65536) throw createError({statusCode:413,message:'提交内容为空或超过 64KB。'})
 try { return JSON.parse(raw) as Record<string,any> } catch {throw createError({statusCode:400,message:'请提交有效 JSON。'})}
}
export function textField(v:unknown,max:number,min=0) {
 if(typeof v!=='string'||v.trim().length<min||v.trim().length>max)throw createError({statusCode:400,message:`文字长度须为 ${min}–${max} 字。`})
 return v.trim()
}
export function uuid(v:unknown) { if(typeof v!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v))throw createError({statusCode:400,message:'无效的记录编号。'});return v }
