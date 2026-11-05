import EmbeddedPostgres from 'embedded-postgres'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
const password=process.env.PG_LOCAL_PASSWORD
if(!password || password.length<12) throw new Error('请在 .env 设置至少 12 位的 PG_LOCAL_PASSWORD')
const databaseDir=resolve('.data/postgres')
const db=new EmbeddedPostgres({databaseDir,user:'paper',password,port:55432,persistent:true,
  authMethod:'scram-sha-256',initdbFlags:['--encoding=UTF8','--locale=C'],postgresFlags:['-h','127.0.0.1'],
  onLog:()=>{},onError:(message)=>console.error(String(message))})
if(!existsSync(resolve(databaseDir,'PG_VERSION'))) await db.initialise()
await db.start()
const client=db.getPgClient()
await client.connect()
if(!(await client.query("SELECT 1 FROM pg_database WHERE datname='paperstudio'")).rows.length) await db.createDatabase('paperstudio')
await client.end()
console.log('真实 PostgreSQL 已启动于 127.0.0.1:55432；数据保留在 .data/postgres。Ctrl+C 安全停止。')
let stopping=false
async function stop(){if(stopping)return;stopping=true;await db.stop();process.exit(0)}
process.on('SIGINT',stop);process.on('SIGTERM',stop)
setInterval(()=>{},60000)
