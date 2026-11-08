const loopbackHosts = new Set(['127.0.0.1', 'localhost', '[::1]'])

export function csrfOriginEligible(origin:string|undefined,requestOrigin:string,development:boolean,configuredSite?:string) {
  if(!origin||origin==='null')return true
  try {
    const source=new URL(origin),target=new URL(requestOrigin)
    const localPreview=source.port==='' && configuredSite!==undefined && new URL(configuredSite).origin===target.origin
    return (development||localPreview) && source.origin===origin && loopbackHosts.has(target.hostname)
      && source.hostname===target.hostname && source.protocol===target.protocol
  }catch{return false}
}

export function allowedWriteOrigin(
  origin: string | undefined,
  configuredSite: string,
  requestOrigin: string,
  development: boolean,
): boolean {
  if (!origin || origin === 'null') return false
  try {
    const source = new URL(origin)
    // An Origin header contains only scheme, hostname and port.
    if (source.origin !== origin) return false
    if (development) {
      const target = new URL(requestOrigin)
      if (loopbackHosts.has(target.hostname) && source.origin === target.origin) return true
    }
    return source.origin === new URL(configuredSite).origin
  } catch {
    return false
  }
}
