import pg from 'pg'
import { randomUUID,randomBytes,scryptSync } from 'node:crypto'
import { starterModels,patternNames } from '../shared/patterns'
const client=new pg.Client({connectionString:process.env.DATABASE_URL})
const sources=[
 {title:'中国非物质文化遗产网：你见过这些传承了千百年的民间艺术吗（九）',url:'https://www.ihchina.cn/Article/Index/detail?id=17241'},
 {title:'福建省人民政府：UNESCO ICH Chinese paper-cutting',url:'https://www.fujian.gov.cn/english/cultureandtravel/cultureandarts/202501/t20250106_6619079.htm'},
 {title:'UNESCO：Chinese paper-cut（项目名录）',url:'https://ich.unesco.org/en/RL/chinese-paper-cut-00219'}
]
const articles=[
 {slug:'a-window-of-paper',title:'一纸窗花，把日子剪成风景',summary:'从窗格上的装饰开始，认识剪纸与日常生活的联系。',category:'纸上故事',body:[
  {heading:'窗上的花',text:'剪纸是一种通过剪刀或刻刀在纸上形成图案的艺术。它可以装点生活，也与不同地方的民俗活动相伴。窗花是其中一种应用：把剪成的图案贴在窗上，借着透过的光，实与空一起成为画面。'},
  {heading:'一地一面貌',text:'中国非物质文化遗产网对不同地方剪纸的介绍，记录了窗花与春节生活的联系。各地作品的形式和使用场合并不完全相同，不能把某一种图案的解释套在全部剪纸上。阅读具体作品时，地域、制作者和使用情境都值得关注。'},
  {heading:'从观察走向动手',text:'先看完整图案，再留意留下的纸与被剪掉的空白。你可以在本工坊用圆孔、水滴和三角形尝试一张对称窗花。本页插图是项目原创的数字纹样，并非馆藏或传统实物的复刻。'}],sources:[sources[0],sources[1]]},
 {slug:'paper-and-light',title:'留白，是另一半图案',summary:'看清纸与空的关系，用最少的切口得到清晰的节奏。',category:'技法入门',body:[
  {heading:'纸面与空隙',text:'剪纸通过去除局部纸面形成图案。欣赏时可以同时观察留下的轮廓与透光的空隙。本页用“纸面”和“留白”帮助初学者阅读数字示意，不把全部地方工艺概括为单一规则。'},
  {heading:'做一次小实验',text:'在工作台添加一个圆形切口，先放在中心附近，再向外移。一个孔的位置变化，会在展开后重复八次。比较两次结果，观察中心是否过密，外缘是否还有足够的纸面。这个实验来自本项目的几何设计。'},
  {heading:'数字模型的边界',text:'这里的镂空允许相互重叠，系统不会判断剪纸是否连成一体。真实纸张需要留意连接处的强度，手工操作也涉及纸材、工具与安全。屏幕预览不能保证实物制作可行。'}],sources:[sources[1]]},
 {slug:'fold-and-repeat',title:'折一折，让纹样相遇',summary:'认识重复与镜像，理解本工坊的四组旋转和八个扇区。',category:'技法入门',body:[
  {heading:'先认识我们的模型',text:'本工坊只提供一种数字对称模式：将圆纸划为八个 45° 扇区，在基础扇区中放置切口，再通过镜像和四组旋转生成全图。这是用于学习的几何简化，并非对所有传统折剪方式的定义。'},
  {heading:'同一个切口，八次相遇',text:'在基础扇区边缘添加水滴，展开后能看到相邻镜像的变化。移动切口时，观察它与扇区边界的关系。展开动画逐层显示当前作品的扇区，最后出现的就是刚刚编辑的图案。'},
  {heading:'保留不对称的想象',text:'中国剪纸的题材与样式丰富，对称只是可用于构图的方法之一。本网站选择有限的形状和一种对称模式，让第一次体验更容易上手。更多手工技法需要结合具体地域与作品继续学习。'}],sources:[sources[1],sources[2]]},
 {slug:'three-small-cuts',title:'圆、角与水滴：从三个切口开始',summary:'用本项目的参数化单元，练习疏密、方向与大小。',category:'纹样观察',body:[
  {heading:'三个原创练习单元',text:'圆形、三角形和水滴是本工坊的基础几何单元。它们用于低门槛的数字创作，不是传统纹样术语的完整分类。圆形可形成柔和的孔隙，三角形带来方向变化，水滴能组成类似花瓣或叶片的结构。'},
  {heading:'从一个变量开始',text:'先保持位置不变，只调整大小。再保持大小不变，改变角度。把这两次展开结果进行比较，比一次添加很多切口更容易理解画面的变化。所有练习图案由本项目自行设计。'},
  {heading:'名字与寓意',text:'“团花初绽”“水滴连珠”等是本项目给数字练习起的名字。除非有具体来源说明，本网站不把这些名字解释为传统寓意，也不声称示例有文物、名录或传承身份。'}],sources:[sources[1]]},
 {slug:'living-heritage',title:'非遗，生长在今天的生活里',summary:'从联合国教科文组织名录出发，认识中国剪纸的文化语境。',category:'纸上故事',body:[
  {heading:'一项名录记录',text:'中国剪纸于 2009 年列入联合国教科文组织人类非物质文化遗产代表作名录。名录记录的是文化实践及其传承语境，并不意味着本网站或这里的数字示例获得官方认证。'},
  {heading:'技艺与生活相连',text:'福建省人民政府的介绍指出，剪纸既装点日常生活，也与民俗活动相连。看一件作品时，除了图案本身，也可以追问它在什么场合使用，人们怎样学习和分享这种技艺。'},
  {heading:'我们能做的开始',text:'本项目通过可操作的几何练习，让更多人愿意仔细看一张剪纸。数字体验只是起点。想了解地方技艺时，建议继续阅读非遗机构的原始资料，并寻找有明确来源的展览和学习机会。'}],sources:[sources[2],sources[1]]},
 {slug:'from-screen-to-paper',title:'把屏幕上的花，带回纸上',summary:'理解导出、透明留白和数字模型的局限，再开始实物尝试。',category:'创作手记',body:[
  {heading:'保存一份可以继续的作品',text:'保存草稿会把切口的位置、大小、方向和纸色写入服务器数据库。当前浏览器保留的访客 Cookie 是读取私人作品的凭据，请勿清除后期待自动找回。本工坊不提供跨设备账号同步。'},
  {heading:'两种图像，来自同一模型',text:'SVG 适合放大查看，PNG 适合在常见图像软件中使用。两者都从当前作品数据生成，镂空部分保持透明。下载图像用于展示；继续编辑请从“我的纸笺”恢复草稿。'},
  {heading:'实物之前再检查',text:'屏幕上的相交切口可能割断真实纸张。本工坊不做连通性和纸张强度检测。若尝试手工制作，请先检查连接、准备合适工具，并在安全条件下练习。尊重具体作品的作者与来源。'}],sources:[sources[1]]}
]
const tutorials=[
 {slug:'first-flower',title:'第一朵窗花',summary:'认识圆孔与留白，完成你的第一次展开。',steps:[{title:'留一个圆孔',text:'选择圆形，在纸面点击一下。也可以点“添加到纸面”。',require:'circle'},{title:'看见对称',text:'点击“展开作品”，看看一个切口怎样在纸上相遇。',require:'unfold'},{title:'留住这朵花',text:'给作品起个名字，再点“保存草稿”，把它放进我的纸笺。',require:'save'}]},
 {slug:'petal-rhythm',title:'花瓣的节奏',summary:'用水滴与圆形，练习大小与方向。',steps:[{title:'添一片花瓣',text:'选择水滴并添加。下方位置与角度按钮可以微调，无需拖动。',require:'drop'},{title:'给花瓣留点光',text:'添加一个圆形，调整大小，让疏密更舒展。',require:'circle'},{title:'展开花的节奏',text:'点击“展开作品”，观察你刚才放下的每一个切口。',require:'unfold'},{title:'保存练习',text:'保存草稿。刷新后可以从我的纸笺接着创作。',require:'save'}]},
 {slug:'angular-window',title:'有棱角的风景',summary:'组合三种切口，完成一张自己的对称作品。',steps:[{title:'剪出方向',text:'添加三角形，调整角度，观察切口的朝向。',require:'triangle'},{title:'柔和的对照',text:'添加水滴，让尖角旁有一条柔和的线。',require:'drop'},{title:'留下一点空白',text:'添加圆形，尝试改变位置与大小。',require:'circle'},{title:'看完整图案',text:'展开你的作品。需要修改时可返回折叠视图。',require:'unfold'},{title:'保存你的设计',text:'保存后可投稿。展示期间投稿会自动通过，立即进入作品展。',require:'save'}]}
]
await client.connect()
try {
 await client.query('BEGIN')
 const ids:string[]=[]
 for(let i=0;i<8;i++) {
  const id=`10000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`;ids.push(id)
  await client.query('INSERT INTO patterns(id,name,description,model,sources,sort_order) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(id) DO NOTHING',[id,patternNames[i],'项目原创几何练习。观察镜像与留白，名称不代表传统寓意。',starterModels[i],JSON.stringify([sources[1]]),i])
 }
 for(let i=0;i<articles.length;i++) {const a=articles[i]!;await client.query('INSERT INTO articles(id,slug,title,summary,category,body,sources,pattern_id,sort_order) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(slug) DO NOTHING',[randomUUID(),a.slug,a.title,a.summary,a.category,JSON.stringify(a.body),JSON.stringify(a.sources),ids[i],i])}
 for(let i=0;i<tutorials.length;i++){const t=tutorials[i]!;await client.query('INSERT INTO tutorials(id,slug,title,summary,steps,pattern_id,sort_order) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(slug) DO NOTHING',[`20000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`,t.slug,t.title,t.summary,JSON.stringify(t.steps),ids[i],i])}
 for(let i=0;i<6;i++)await client.query("INSERT INTO works(id,title,description,model,status,is_example,category,featured_order,published_at) VALUES($1,$2,$3,$4,'published',true,$5,$6,now()) ON CONFLICT(id) DO NOTHING",[`30000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`,patternNames[i],'项目原创示例，用参数化切口演示对称与留白。非传统实物或馆藏复刻。',starterModels[i],i%2?'几何之美':'花叶之间',i])
 const password=process.env.ADMIN_PASSWORD,username=process.env.ADMIN_USERNAME
 if(!password||password.length<12||!username)throw new Error('请设置 ADMIN_USERNAME 和至少 12 位的 ADMIN_PASSWORD')
 const salt=randomBytes(16).toString('hex'),hash=`${salt}:${scryptSync(password,salt,64).toString('hex')}`
 await client.query('INSERT INTO admins(id,username,password_hash) VALUES($1,$2,$3) ON CONFLICT(username) DO UPDATE SET password_hash=EXCLUDED.password_hash',[randomUUID(),username,hash])
 await client.query('COMMIT');console.log('Seed complete: 8 patterns, 6 articles, 3 tutorials, 6 labeled examples. Existing content preserved; admin password initialized.')
}catch(e){await client.query('ROLLBACK');throw e}finally{await client.end()}
