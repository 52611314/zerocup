<script setup lang="ts">
import { cutPath, SECTOR_PATH, sectorTransform } from '../../shared/model'
import { patternNames, starterModels } from '../../shared/patterns'

usePageMeta('关于与来源', '纸上生花的设计说明、文化资料来源、数字创作边界与操作帮助。')

const specimen = starterModels[3]!
const specimenName = patternNames[3]
const sectorId = useId().replaceAll(':', '')
const showFolds = ref(false)
const foldAxes = 'M-100 0H100 M0-100V100 M-70.711-70.711 70.711 70.711 M-70.711 70.711 70.711-70.711'

const sources = [
  {
    publisher: '中国非物质文化遗产网',
    title: '中国民间剪纸介绍',
    url: 'https://www.ihchina.cn/Article/Index/detail?id=17241'
  },
  {
    publisher: '福建省人民政府',
    title: 'Chinese paper-cutting',
    url: 'https://www.fujian.gov.cn/english/cultureandtravel/cultureandarts/202501/t20250106_6619079.htm'
  },
  {
    publisher: '联合国教科文组织',
    title: '中国剪纸项目名录',
    url: 'https://ich.unesco.org/en/RL/chinese-paper-cut-00219'
  }
]
</script>

<template>
  <div class="wrap page about-page">
    <Breadcrumbs :items="[{ label: '关于与来源' }]" />
    <header class="about-heading">
      <div class="about-intro">
        <p class="eyebrow"><span aria-hidden="true">◇</span> 关于与来源 / 设计手记</p>
        <h1>一纸背后的<span>心意。</span></h1>
        <p class="article-lead">以剪纸为入口，让阅读、动手和分享在这里相遇。</p>
        <NuxtLink class="about-source-jump" :to="{ path: '/about', hash: '#sources' }">
          查看文化来源 <span aria-hidden="true">↓</span>
        </NuxtLink>
      </div>
      <figure class="about-figure">
        <div class="specimen-register">
          <span>剪纸对照 / {{ specimenName }}</span>
          <button class="specimen-toggle" type="button" aria-controls="about-samples" :aria-pressed="showFolds" @click="showFolds = !showFolds">
            显示折痕 <span aria-hidden="true">{{ showFolds ? '−' : '＋' }}</span>
          </button>
        </div>
        <div id="about-samples" class="specimen-pair" :class="{ 'with-folds': showFolds }">
          <div class="specimen-sample">
            <div class="specimen-plate">
              <PaperArt :model="specimen" :label="`${specimenName}，保留的纸面`" />
              <svg class="specimen-folds" viewBox="-108 -108 216 216" aria-hidden="true"><path :d="foldAxes" /></svg>
            </div>
            <p><span aria-hidden="true">01</span> 纸面 <small>保留的部分</small></p>
          </div>
          <div class="specimen-sample">
            <div class="specimen-plate specimen-negative">
              <svg class="paper-art negative-art" viewBox="-108 -108 216 216" role="img" :aria-label="`${specimenName}，剪去部分的形状`">
                <defs><clipPath :id="sectorId"><path :d="SECTOR_PATH" /></clipPath></defs>
                <circle r="100" class="negative-edge" />
                <g v-for="sector in 8" :key="sector" :transform="sectorTransform(sector - 1)">
                  <g :clip-path="`url(#${sectorId})`">
                    <path v-for="cut in specimen.cuts" :key="cut.id" :d="cutPath(cut)" :transform="`translate(${cut.x} ${cut.y}) rotate(${cut.angle})`" />
                  </g>
                </g>
              </svg>
              <svg class="specimen-folds" viewBox="-108 -108 216 216" aria-hidden="true"><path :d="foldAxes" /></svg>
            </div>
            <p><span aria-hidden="true">02</span> 留白 <small>剪去的形状</small></p>
          </div>
        </div>
        <figcaption>同一个纹样的两种读法</figcaption>
      </figure>
    </header>

    <article class="about-content">
      <section class="about-section">
        <h2><span aria-hidden="true">01</span> 为什么是剪纸</h2>
        <div>
          <p>《纸上生花》是为 2026 年零杯网页设计大赛「匠心传成，非遗焕新」主题设计的原创网站。我们从剪纸的纸面与留白出发，把阅读、动手、保存和展览连在一起。</p>
          <p>工坊以 45° 扇区为纸样。你可以放置圆形、三角形或水滴，四组旋转与镜像会把当前切口展开成八重对称的纹样。数字模型用于探索构图，实物制作前需另行检查纸面连接与强度。</p>
          <p>「团花初绽」等是项目原创练习的名称。展览中标有「原创示例」的作品由项目团队制作，用来演示数字剪纸。</p>
        </div>
      </section>

      <section id="sources" class="about-section" tabindex="-1" aria-labelledby="sources-title">
        <h2 id="sources-title"><span aria-hidden="true">02</span> 循着来源读下去</h2>
        <div>
          <p>2009 年，中国剪纸列入联合国教科文组织人类非物质文化遗产代表作名录。纸上学堂的短文由参赛团队独立整理，并逐篇列出来源。各地技艺和使用语境各有特色，欢迎结合资料继续了解。</p>
          <ul class="source-list">
            <li v-for="(source, index) in sources" :key="source.url">
              <a :href="source.url" target="_blank" rel="noopener noreferrer">
                <span class="source-number" aria-hidden="true">0{{ index + 1 }}</span>
                <span><strong>{{ source.publisher }}</strong><small>{{ source.title }}</small><span class="sr-only">（在新标签页打开）</span></span>
                <span class="source-arrow" aria-hidden="true">↗</span>
              </a>
            </li>
          </ul>
          <p class="source-note">资料核对于 2026 年 11 月 5 日。如名录页面需要人机验证，可从福建省人民政府的介绍继续阅读。</p>
        </div>
      </section>

      <section class="about-section">
        <h2><span aria-hidden="true">03</span> 从第一剪到小展览</h2>
        <div>
          <ol class="about-steps">
            <li>从<NuxtLink class="about-inline-link" to="/learn">学堂</NuxtLink>或<NuxtLink class="about-inline-link" to="/tutorials">教程</NuxtLink>进入工坊，在纸面上放下一个切口。</li>
            <li>用位置、大小和角度控件调整，点「展开作品」看完整窗花。</li>
            <li>给作品命名并保存。看到「已保存到服务器」后，可在我的纸笺里继续编辑，或下载 SVG、PNG 图像。</li>
            <li>当前展示期间，投稿会自动通过并立即进入公开展览。私人草稿在投稿前保持私密。</li>
          </ol>
        </div>
      </section>

      <section class="about-section">
        <h2><span aria-hidden="true">04</span> 纸笺与素材</h2>
        <div>
          <p>私人草稿和学习进度保存在服务器，并与当前浏览器的 Cookie 绑定。请用同一浏览器和有效的 Cookie 恢复作品。公开投稿会显示作品名称、说明与图案，请勿在作品里填写个人隐私。</p>
          <p>保存失败时，可留在当前页面重试。遇到版本冲突时，可另存一张草稿。下载的图像用于展示，继续编辑请从我的纸笺恢复。</p>
          <p>纸张肌理和页面样式由项目自行设计，纹样由原创几何模型生成，文字使用设备自带字体。Nuxt 和 Vue 提供页面和交互，PostgreSQL 保存资料。依赖版本、用途和许可随源码交付。</p>
        </div>
      </section>
    </article>

    <footer class="about-next">
      <h2>把读到的，剪成一朵花。</h2>
      <div class="about-actions">
        <NuxtLink class="btn primary" to="/studio">进入剪纸工坊 <span aria-hidden="true">↗</span></NuxtLink>
        <NuxtLink class="text-link" to="/gallery">去纸上展览 <span aria-hidden="true">→</span></NuxtLink>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.about-page { max-width: 1190px; }

.about-heading {
  display: grid;
  grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr);
  align-items: center;
  gap: clamp(22px, 4.4vw, 64px);
  margin-top: clamp(22px, 3.4vw, 44px);
  padding-block: clamp(22px, 3.6vw, 50px);
  border-block: 1px solid var(--line);
}

.about-heading .eyebrow { margin: 0; color: var(--red); font-weight: 700; }
.about-heading .eyebrow span { margin-inline-end: .4em; }
.about-heading h1 { margin: .26em 0 .29em; font-size: clamp(42px, 5.8vw, 82px); letter-spacing: -.045em; }
.about-heading h1 span { display: block; color: #9b3026; white-space: nowrap; }
.about-heading .article-lead { max-width: 19em; margin: 0; font-size: clamp(16px, 1.5vw, 21px); text-wrap: pretty; }

.about-source-jump {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  margin-top: 13px;
  color: #932b22;
  border-bottom: 1px solid #b27658;
  font-weight: 700;
  font-size: .9rem;
}
.about-source-jump:hover { color: #6c211c; }

.about-figure {
  margin: 0;
  padding: clamp(11px, 2vw, 20px);
  border: 1px solid #c2ab89;
  background: #f3e5ca;
  box-shadow: 0 9px 28px #442a180c;
}

.specimen-register {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  margin: -6px 0 5px;
  color: #6f4833;
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: .075em;
}

.specimen-pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(7px, 1.2vw, 15px);
}

.specimen-plate {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border: 1px solid #b99b75;
  background:
    repeating-linear-gradient(118deg, transparent 0 6px, #935b2910 6px 7px),
    radial-gradient(circle at 36% 34%, #fff3d7, #e5cba5);
}

.specimen-plate::before {
  position: absolute;
  inset: 5%;
  border: 1px solid #8054344a;
  content: '';
}

.specimen-negative {
  border-color: #744735;
  background:
    repeating-linear-gradient(118deg, transparent 0 6px, #fff3d708 6px 7px),
    radial-gradient(circle at 36% 34%, #6c372b, #3c251f);
}

.specimen-negative::before { border-color: #ead3af55; }
.specimen-plate :deep(.paper-art) { width: 74%; }
.specimen-plate:not(.specimen-negative) :deep(.paper-art) { filter: drop-shadow(0 5px 3px #6b322640); }
.negative-art { fill: #f5d8a6; }
.negative-edge { fill: none; stroke: #eacba073; stroke-width: 1; stroke-dasharray: 2 3; }

.specimen-folds {
  position: absolute;
  inset: 13%;
  width: 74%;
  height: 74%;
  fill: none;
  stroke: #30211b;
  opacity: 0;
  pointer-events: none;
}
.specimen-negative .specimen-folds { stroke: #fff3d6; }
.specimen-folds path { stroke-width: 1; stroke-dasharray: 3 3; vector-effect: non-scaling-stroke; }
.with-folds .specimen-folds { opacity: .82; }

@media (prefers-reduced-motion: no-preference) {
  .specimen-folds { clip-path: circle(0%); transition: opacity .2s ease, clip-path .38s ease-out; }
  .with-folds .specimen-folds { clip-path: circle(50%); }
}

.specimen-sample p {
  margin: 8px 0 10px;
  color: #442c20;
  font-weight: 700;
  font-size: .91rem;
}
.specimen-sample p span { margin-inline-end: 4px; color: #962b22; font: .77rem Georgia, serif; }
.specimen-sample small { margin-inline-start: 4px; color: #6c5545; font-weight: 400; font-size: .72rem; }

.about-figure figcaption {
  padding-top: 7px;
  border-block-start: 1px solid #c2ab89;
  color: #634735;
  font-size: .75rem;
}

.specimen-toggle {
  padding: 4px 0 4px 7px;
  border: 0;
  color: #902c22;
  font-weight: 700;
  white-space: nowrap;
}
.specimen-toggle span { display: inline-block; width: 1.35em; margin-inline-start: 1px; }

.about-content .about-section {
  display: grid;
  grid-template-columns: minmax(175px, 1fr) minmax(0, 2.45fr);
  gap: clamp(14px, 4vw, 60px);
  margin: 0;
  padding: clamp(24px, 4vw, 48px) 0;
  border-bottom: 1px solid var(--line);
  scroll-margin-top: 90px;
}

#sources:focus-visible { outline: 2px solid #8b531c; outline-offset: 5px; }
.about-section h2 { margin: 0; font-size: clamp(24px, 2.65vw, 37px); }
.about-section h2 span { display: block; margin-bottom: 8px; color: var(--red); font: 17px Georgia, serif; }
.about-section p { margin: 0 0 12px; line-height: 1.85; }
.about-section p:last-child { margin-bottom: 0; }

.source-list { list-style: none; margin: 18px 0 10px; padding: 0; border-top: 1px solid var(--line); }
.source-list a {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 11px 10px;
  border-bottom: 1px solid var(--line);
  text-decoration: none;
}
.source-list a:is(:hover, :focus-visible) { background: #efdfc5; }
.source-list small { display: block; color: var(--muted); font-size: 14px; }
.source-number { align-self: start; margin-top: .35em; color: #922d24; font: .85rem Georgia, serif; }
.source-arrow { color: var(--red); transition: transform .22s ease; }
.source-list a:is(:hover, :focus-visible) .source-arrow { transform: translate(2px, -2px); }
.source-note { color: var(--muted); font-size: 13px; }
.about-steps { margin: 0; padding-left: 1.35em; }
.about-steps li { padding: 0 0 7px .35em; }
.about-steps li::marker { color: var(--red); font-family: Georgia, serif; }
.about-inline-link { color: var(--red); text-decoration: underline; text-underline-offset: .2em; }

.about-next {
  margin-top: 26px;
  padding: clamp(18px, 3vw, 35px);
  background: #ecdfc8;
}
.about-next h2 { margin: 0 0 .45em; }
.about-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 5px 16px; }
.about-actions .text-link { gap: 6px; }

@media (max-width: 750px) {
  .about-heading, .about-content .about-section { grid-template-columns: 1fr; }
  .about-heading { margin-top: 16px; padding-block: 18px; gap: 16px; }
  .about-heading h1 { font-size: clamp(36px, 7.8vw, 52px); }
  .about-heading h1 span { display: inline; }
  .about-section h2 span { display: inline; margin-right: 5px; }
}

@media (prefers-reduced-motion: reduce) {
  .source-arrow { transition: none !important; }
  .source-list a:is(:hover, :focus-visible) .source-arrow { transform: none; }
}
</style>
