# 纸上生花

维护入口见 [项目交接文档](HANDOFF.md) 和 [项目维护规则](AGENTS.md)。比赛包内的启动与演示步骤可直接使用下文。

2026 年零杯网页设计大赛主题二“匠心传成，非遗焕新”。从纸上学堂认识剪纸，在基础扇区里创作，再展开、保存和投稿。审核通过的作品拥有公开展览网址。

## 本地启动

更新到本地第一轮优化后，先对正在使用的数据库执行 `npm run db:migrate`，新增的 002 迁移用于记录教程本次练习与关联草稿。原作品格式保持 schemaVersion 1。完成初始化的数据库无需重复种子。切换至 Docker 时，本机 .data/postgres 与 Docker 命名卷各自保存数据。

使用 Node 24 和 npm，在项目根目录执行。安装依赖需要联网，演示使用本地数据库及本地 SVG。首次安装后复制环境示例，分别设置数据库密码和管理员密码。数据库连接串内的密码须与 PG_LOCAL_PASSWORD 一致，建议使用随机字母数字。已有 .env 时请保留原文件。

```powershell
npm ci
Copy-Item .env.example .env
npm run db:local
```

保持数据库终端开启。也可用 Docker Compose 的 db 服务替代 db:local，二者占用同一端口。另开一个终端执行以下命令。

```powershell
npm run db:migrate
npm run db:seed
npm run build
npm start
```

访问 http://127.0.0.1:3000 。开发模式可用 npm run dev，写操作允许当前本机请求地址的同源 Origin，支持 127.0.0.1、localhost 和 IPv6 回环地址；来源仍须与正在访问的地址和端口一致。生产模式的写请求须与 SITE_URL 的 origin 一致。后台入口 /admin，登录信息取自 .env。重复种子初始化会按配置重设管理员密码，已有编辑过的内容会保留。数据库文件保存在 .data/postgres，Docker 使用命名卷。服务停止后保留数据。公开部署须配置 HTTPS 与实际站点地址。

遇到“请求来源不匹配”时，先保留当前编辑并重试。检查终端中是否设置了 SITE_URL 环境变量，Node 会优先使用该值，再读取 .env。生产预览须将 SITE_URL 设置为实际访问地址，例如 http://127.0.0.1:3109；普通开发使用 http://127.0.0.1:3000。开发模式本机同源校验不使用代理转发头。

前端保存、投稿、教程进度、收藏和后台写操作会先从 /api/csrf 获取与 HttpOnly 访客会话绑定的校验令牌。来源头缺失或为 null 时可用有效令牌验证；开发环境中同一回环主机的 Origin 端口被改写时也须验证该令牌。普通跨站请求、伪造或其他会话的令牌仍被拒绝。若浏览器禁用本站 Cookie，需先允许 Cookie 才能持久保存私人草稿。此机制无需数据库迁移或修改 Docker 配置。

Windows 下，如果项目路径包含中文，且内置 PostgreSQL 初始化报 UTF-8 编码错误，可以在空闲盘符下启动数据库。例如当前目录为项目根目录、Z 盘空闲时执行以下命令。

```powershell
subst Z: (Get-Location).Path
Set-Location Z:\
npm run db:local
```

停止数据库后，切回原项目目录，执行 `subst Z: /D` 释放盘符。数据库文件仍在原项目的 .data/postgres 内。

## 三分钟演示

1. 在首页点“看留白”，观察团花翻色后显出双燕。向下看三扇纸窗和长卷，点“翻一景”换景，也可在工坊段演示折展。通过纸窗进入学堂，打开一篇札记，查看来源，再点“用此纹样开始”。
2. 将浏览器切到 390px。添加水滴，用方向按钮移动、调整大小、撤销和重做，再展开。
3. 命名并保存，刷新工作台核对图案。下载透明 PNG，或到“我的纸笺”恢复。
4. 投稿后查看“等待展馆审核”。另一浏览器打开 /admin，核对作品，通过并展出。
5. 从展览详情复刻作品。后台修改札记摘要，刷新学堂详情观察更新。
6. 停止并重启应用和数据库，保留 .data 与访客浏览器 Cookie，复核草稿与发布状态。

## 设计与代码

朱砂红表示纸面和主操作，纸白表示被剪去的空隙，墨黑用于阅读。标题采用系统宋体。手机将画面置于工具上方。切口可以点击放置，也可通过按钮添加和调整。减少动态效果时立即显示完整图案。

shared/model.ts 定义有版本的作品格式、基础扇区、镜像与旋转、快照历史及 SVG 序列化。PaperArt.vue 与导出复用相同的切口路径及扇区变换。PNG 由浏览器绘制同一 SVG。没有连通性、任意曲线切割或物理仿真。

server/services 下按公开查询、私人作品和后台分工。服务端校验访客 Cookie、作品归属、提交来源与版本；数据库通过带状态和版本条件的更新防止覆盖。作品依次经历 draft、pending、published，退回时为 rejected。数据库保存会话令牌摘要与密码哈希。公开详情与站点地图只查询已发布记录。教程进度按访客与教程唯一，收藏按访客与作品唯一。

## 评分维度与演示位置

|维度|可查看的位置|
|---|---|
|创意 10|同一张纸从文化阅读进入创作与展览|
|功能 20|工作台、纸笺、教程、审核和公开详情|
|设计 45|纸面与留白、中文展签、原创 SVG、不同宽度布局|
|文档 5|本说明、测试源码、环境示例与迁移|
|技术 20／30|几何变换、导出、SSR、数据库并发更新|
|额外移动端与后台|触控按钮完成编辑，审核后前台更新。分值由评委判定|

## 依赖与素材

固定版本及传递依赖见 package-lock.json。Nuxt 4.4.2 提供 SSR、路由和 Nitro，Vue 3 与 Vue Router 提供交互与导航，pg 8.23.1 在服务端与迁移脚本使用参数查询。TypeScript、vue-tsc 和两个 @types 包用于类型检查，tsx 执行种子与测试，Playwright 用于浏览器验证，embedded-postgres 17.6.0-beta.15 仅启动真实本地 PostgreSQL。项目未使用预设样式库。所有剪纸几何、展览示例、CSS 纹理和站标均为项目原创。系统字体随设备提供，无字体文件分发。文化来源逐篇列在知识详情与 /about。

技术参考见 [Nuxt 4 服务端](https://nuxt.com/docs/4.x/directory-structure/server)、[Vue 组合式 API](https://vuejs.org/guide/typescript/composition-api)、[pg 参数查询](https://node-postgres.com/features/queries) 与 [PostgreSQL 17](https://www.postgresql.org/docs/17/)。

## 提交准备

两个版本均只复制 app、server、shared、scripts、tests、db、public、README.md、环境示例、锁文件、package.json、Nuxt 与 TypeScript 配置、Docker Compose 配置及测试记录。不要复制 .env、.data、日志、node_modules、Git 元数据、缓存或比赛原始材料。用 npm ci 安装时保留各依赖许可证。

完整版 README 由队伍在提交前填写真实分组、队名、队长、成员与分工。匿名版保留相同代码和功能，复查 README、文件名、注释、页面和元数据中的身份信息。两个内包置于外层压缩包中。手册要求作品在 11 月 14 日 22:00 前提交，PPT 初赛时间到 11 月 16 日，匿名包命名示例还含队长姓名，须向主办方核实。Chrome 129 与评分表所提 IE 的兼容范围也待确认。
