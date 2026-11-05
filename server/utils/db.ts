import pg from 'pg'
let pool: pg.Pool | undefined
export function database() {
 if(!process.env.DATABASE_URL) throw createError({statusCode:503,message:'数据库尚未配置，请按启动说明设置环境变量。'})
 return pool ||= new pg.Pool({connectionString:process.env.DATABASE_URL,max:10,connectionTimeoutMillis:3000,idleTimeoutMillis:30000})
}
export async function query<T extends pg.QueryResultRow = any>(sql:string, values: unknown[] = []): Promise<T[]> {
 try {return (await database().query<T>(sql,values)).rows}
 catch(e) { console.error('[database]', e instanceof Error ? e.message : 'query failed'); throw createError({statusCode:503,message:'暂时无法连接资料库，您的编辑仍保留在当前页面，请稍后重试。'}) }
}
