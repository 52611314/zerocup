import { query } from '../utils/db'
export default defineEventHandler(async event=>{
 const root=(process.env.SITE_URL||'http://127.0.0.1:3000').replace(/\/$/,'')
 const articles=await query('SELECT slug FROM articles WHERE published')
 const tutorials=await query('SELECT slug FROM tutorials WHERE published')
 const works=await query("SELECT id FROM works WHERE status='published'")
 const paths=['/','/learn','/tutorials','/gallery','/about',...articles.map(a=>`/learn/${encodeURIComponent(a.slug)}`),...tutorials.map(t=>`/tutorials/${encodeURIComponent(t.slug)}`),...works.map(w=>`/gallery/${w.id}`)]
 const escape=(v:string)=>v.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;')
 setResponseHeader(event,'Content-Type','application/xml; charset=utf-8')
 return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(p=>`<url><loc>${escape(root+p)}</loc></url>`).join('')}</urlset>`
})
