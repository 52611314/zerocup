import {mkdir,copyFile,cp,access,mkdtemp} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {spawnSync} from 'node:child_process'
const mode=process.argv[2]
if(!['full','anonymous'].includes(mode))throw Error('选择 full 或 anonymous')
if(mode==='full')await access('TEAM.md').catch(()=>{throw Error('请先创建 TEAM.md，填写真实队员信息与分工，再准备完整版。')})
await mkdir('packages',{recursive:true})
const dir=await mkdtemp(resolve('packages',mode+'-'))
const files=['app','server','shared','scripts','tests','db','public','README.md','TESTING.md','.env.example','package.json','package-lock.json','nuxt.config.ts','tsconfig.json','docker-compose.yml']
for(const file of files)await cp(file,join(dir,file),{recursive:true})
if(mode==='full'){const {appendFile,readFile}=await import('node:fs/promises');await appendFile(join(dir,'README.md'),'\n'+await readFile('TEAM.md','utf8'))}
const archive=dir+'.zip'
const result=spawnSync('tar',['-a','-cf',archive,'-C',dir,'.'],{stdio:'inherit'})
if(result.status!==0)throw Error('未能创建 zip，请手动压缩 '+dir)
console.log(archive)
