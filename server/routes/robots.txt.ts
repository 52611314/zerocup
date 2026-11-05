export default defineEventHandler(event=>{
 setResponseHeader(event,'Content-Type','text/plain; charset=utf-8')
 return `User-agent: *\nAllow: /\nDisallow: /me\nDisallow: /admin\nDisallow: /studio\nDisallow: /api/\nSitemap: ${process.env.SITE_URL||'http://127.0.0.1:3000'}/sitemap.xml\n`
})
