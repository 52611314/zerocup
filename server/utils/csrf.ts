import {timingSafeEqual} from 'node:crypto'
import type {H3Event} from 'h3'
import {hashToken,visitor} from './security'
import {query} from './db'

const csrfToken=(session:string)=>hashToken('paper-csrf-v1:'+session)

export async function issueCsrf(event:H3Event) {
 await visitor(event)
 // visitor() may have just issued the cookie on this response.
 const issued=event.context.paperVisitorToken as string|undefined
 const session=issued||getCookie(event,'paper_visitor')
 if(!session)throw createError({statusCode:401,message:'访客会话未建立，请允许本站 Cookie 后重试。'})
 return {token:csrfToken(session)}
}

export async function hasSessionCsrf(event:H3Event) {
 const supplied=getRequestHeader(event,'x-paper-csrf')
 const session=getCookie(event,'paper_visitor')
 if(!supplied||!session||!/^[a-f0-9]{64}$/.test(supplied)||!/^[a-f0-9]{64}$/.test(session))return false
 const expected=csrfToken(session)
 if(!timingSafeEqual(Buffer.from(supplied,'hex'),Buffer.from(expected,'hex')))return false
 const [record]=await query('SELECT id FROM visitor_sessions WHERE token_hash=$1 AND expires_at>now()',[hashToken(session)])
 return !!record
}
