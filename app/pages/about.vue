<script setup lang="ts">
import { starterModels } from '../../shared/patterns'

usePageMeta('关于与来源', '纸上生花的设计说明、文化资料来源、数字创作边界与操作帮助。')

const specimen = starterModels[3]!
const reverseSpecimen = { ...specimen, color: '#f5dfb3' }
const reverse = ref(false)

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
    <header class="page-heading about-heading">
      <div>
        <p class="eyebrow">关于与来源 / 设计手记</p>
        <h1>一纸背后的心意。</h1>
        <p class="article-lead">以剪纸为入口，让阅读、动手和分享在这里相遇。</p>
      </div>
      <figure class="about-figure" :class="{ 'specimen-reverse': reverse }">
        <div class="about-paper-stage" aria-hidden="true">
          <div class="about-paper">
            <div class="about-paper-face"><PaperArt :model="specimen" /></div>
            <div class="about-paper-face about-paper-reverse"><PaperArt :model="reverseSpecimen" /></div>
          </div>
        </div>
        <figcaption>
          <span aria-live="polite">{{ reverse ? '留白 · 反面' : '朱纸 · 正面' }}</span>
          <button class="specimen-toggle" type="button" :aria-pressed="reverse" @click="reverse = !reverse">
            看反面 <span aria-hidden="true">↻</span>
          </button>
        </figcaption>
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

      <section id="sources" class="about-section">
        <h2><span aria-hidden="true">02</span> 循着来源读下去</h2>
        <div>
          <p>2009 年，中国剪纸列入联合国教科文组织人类非物质文化遗产代表作名录。纸上学堂的短文由参赛团队独立整理，并逐篇列出来源。各地技艺和使用语境各有特色，欢迎结合资料继续了解。</p>
          <ul class="source-list">
            <li v-for="source in sources" :key="source.url">
              <a :href="source.url" target="_blank" rel="noopener noreferrer">
                <span><strong>{{ source.publisher }}</strong><small>{{ source.title }}</small></span>
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
.about-page { max-width: 1120px; }

.about-heading {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(180px, 1fr);
  align-items: center;
  gap: 24px;
  margin: clamp(22px, 4vw, 50px) 0 0;
  padding: clamp(20px, 3.2vw, 44px) 0;
  border-block: 1px solid var(--line);
}

.about-heading .eyebrow { margin: 0; color: var(--red); font-weight: 700; }
.about-heading h1 { margin: .3em 0; font-size: clamp(35px, 5.4vw, 76px); }
.about-heading .article-lead { margin: 0; font-size: clamp(16px, 1.5vw, 21px); }

.about-figure {
  display: grid;
  justify-items: stretch;
  margin: 0;
  background: #f8edd7;
  border: 1px solid var(--line);
}

.about-paper-stage {
  display: grid;
  place-items: center;
  padding: 12px;
  perspective: 680px;
  background: radial-gradient(ellipse at center, #f8edd7 8%, #ebdcc0 80%);
}

.about-paper {
  display: grid;
  width: min(62%, 210px);
  transform-style: preserve-3d;
  transition: transform .47s cubic-bezier(.36,.55,.34,1);
}

.specimen-reverse .about-paper { transform: rotateY(180deg); }

.about-paper-face {
  position: relative;
  grid-area: 1 / 1;
  backface-visibility: hidden;
}

.about-paper-face :deep(.paper-art) { position: relative; filter: drop-shadow(0 6px 5px #42271d32); }
.about-paper-reverse { transform: rotateY(180deg); }
.about-paper-reverse::before {
  position: absolute;
  inset: 4%;
  border-radius: 50%;
  background: #85251e;
  content: '';
}

.about-figure figcaption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 12px;
  border-block-start: 1px solid var(--line);
  color: var(--muted);
  font-size: 12px;
  letter-spacing: .08em;
}

.specimen-toggle {
  padding: 8px 0;
  border: 0;
  color: var(--red);
  font-weight: 700;
}
.specimen-toggle span { display: inline-block; margin-inline-start: 3px; transition: transform .3s ease; }
.specimen-toggle[aria-pressed="true"] span { transform: rotate(180deg); }

.about-content .about-section {
  display: grid;
  grid-template-columns: minmax(175px, 1fr) minmax(0, 2.45fr);
  gap: clamp(14px, 4vw, 60px);
  margin: 0;
  padding: clamp(24px, 4vw, 48px) 0;
  border-bottom: 1px solid var(--line);
  scroll-margin-top: 20px;
}

.about-section h2 { margin: 0; font-size: clamp(24px, 2.65vw, 37px); }
.about-section h2 span { display: block; margin-bottom: 8px; color: var(--red); font: 17px Georgia, serif; }
.about-section p { margin: 0 0 12px; line-height: 1.85; }
.about-section p:last-child { margin-bottom: 0; }

.source-list { list-style: none; margin: 18px 0 10px; padding: 0; border-top: 1px solid var(--line); }
.source-list a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 11px 10px;
  border-bottom: 1px solid var(--line);
  text-decoration: none;
}
.source-list a:hover { background: #efdfc5; }
.source-list small { display: block; color: var(--muted); font-size: 14px; }
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

@media (max-width: 670px) {
  .about-heading, .about-content .about-section { grid-template-columns: 1fr; }
  .about-paper { width: min(50%, 145px); }
  .about-section h2 span { display: inline; margin-right: 5px; }
}

@media (prefers-reduced-motion: reduce) {
  .about-paper, .specimen-toggle span, .source-arrow { transition: none !important; }
  .source-list a:is(:hover, :focus-visible) .source-arrow { transform: none; }
}
</style>
