import pg from 'pg'
import { readdir, readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
const client = new pg.Client({connectionString:process.env.DATABASE_URL})
if(!process.env.DATABASE_URL) throw new Error('请先配置 .env 中的 DATABASE_URL')
await client.connect()
try {
 await client.query('SELECT pg_advisory_lock(72026001)')
 await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())')
 for(const name of (await readdir(new URL('../db/migrations/',import.meta.url))).filter(n=>n.endsWith('.sql')).sort()) {
  const sql=await readFile(new URL(`../db/migrations/${name}`,import.meta.url),'utf8')
  const checksum=createHash('sha256').update(sql).digest('hex')
  const old=await client.query('SELECT checksum FROM schema_migrations WHERE name=$1',[name])
  if(old.rows.length) { if(old.rows[0].checksum!==checksum) throw new Error(`已执行的迁移不可修改：${name}`); continue }
  await client.query('BEGIN')
  try { await client.query(sql); await client.query('INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)',[name,checksum]); await client.query('COMMIT'); console.log(`Applied ${name}`) }
  catch(e) { await client.query('ROLLBACK'); throw e }
 }
} finally { await client.query('SELECT pg_advisory_unlock(72026001)'); await client.end() }
