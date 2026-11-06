let pendingToken:Promise<{token:string}>|undefined

interface WriteOptions {
 method:'POST'|'PUT'|'PATCH'|'DELETE'
 body?:Record<string,unknown>
 headers?:HeadersInit
}

export async function writeApi<T=any>(path:string,options:WriteOptions) {
 // Fetch fresh credentials before a mutation. Coalesce simultaneous bootstrap
 // requests so the first visit cannot create competing anonymous sessions.
 pendingToken ||= $fetch<{token:string}>('/api/csrf').finally(()=>{pendingToken=undefined})
 const {token}=await pendingToken
 const headers=new Headers(options.headers)
 headers.set('x-paper-csrf',token)
 return $fetch<T>(path,{...options,headers})
}
