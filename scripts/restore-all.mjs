import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const src = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const w = (rel, content) => {
  const p = path.join(src, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
};

const T = {
  home: '\u9996\u9801',
  royal: '\u7687\u5bb6\u65c5\u4eba',
  about: '\u95dc\u65bc\u90f5\u8f2a',
  first: '\u7b2c\u4e00\u6b21\u642d\u4e58',
  join: '\u4e00\u8d77\u642d\u90f5\u8f2a',
  guest: '\u7559\u8a00\u677f',
  stateroom: '\u8239\u623f\u4ecb\u7d39',
  stateroomTitle: '\u8239\u623f\u9078\u64c7',
  featured: '\u7cbe\u9078',
  heroTitle: '\u63a2\u7d22\u90f5\u8f2a\u65c5\u904a\u7684\u7cbe\u5f69\u4e16\u754c',
  homeDesc:
    'Royal Traveler \u7687\u5bb6\u65c5\u4eba \u2014 \u500b\u4eba\u90f5\u8f2a\u65c5\u904a\u5fc3\u5f97\u8207\u8cc7\u8a0a\u5206\u4eab\u90e8\u843d\u683c\u3002\u5206\u4eab\u5730\u4e2d\u6d77\u3001\u52a0\u52d2\u6bd4\u6d77\u3001\u5317\u6b50\u5cfd\u7063\u7b49\u4e16\u754c\u9802\u5c16\u90f5\u8f2a\u65c5\u904a\u7684\u771f\u5be6\u9ad4\u9a57\u3002',
  aboutDesc:
    '\u6df1\u5165\u4e86\u89e3\u73fe\u4ee3\u90f5\u8f2a\u7684\u9b45\u529b\u8207\u7279\u8272\u3002\u63a2\u7d22\u90f5\u8f2a\u6b77\u53f2\u3001\u4e16\u754c\u5927\u90f5\u8f2a\u516c\u53f8\u6bd4\u8f03\uff0c\u4ee5\u53ca\u90f5\u8f2a\u696d\u7684\u672a\u4f86\u767c\u5c55\u8207\u65b0\u8da8\u52e2\u3002',
  firstDesc:
    '\u90f5\u8f2a\u65c5\u904a\u65b0\u624b\u5fc5\u8b80\u6307\u5357\u3002\u5f9e\u8a02\u7968\u3001\u767b\u8239\u3001\u8239\u4e0a\u751f\u6d3b\u5230\u4e0b\u8239\uff0c\u8b93\u60a8\u7684\u7b2c\u4e00\u6b21\u90f5\u8f2a\u4e4b\u65c5\u9806\u5229\u6109\u5feb\u3002',
  roomDesc:
    '\u90f5\u8f2a\u8239\u623f\u5b8c\u6574\u4ecb\u7d39\uff0c\u5f9e\u5167\u8239\u5ba2\u8239\u3001\u6d77\u666f\u5ba2\u8239\u5230\u5957\u623f\uff0c\u5e6b\u52a9\u60a8\u9078\u64c7\u6700\u9069\u5408\u7684\u4f4f\u5bbf\u7a7a\u9593\u3002',
  topStrip: '\u63a2\u7d22\u90f5\u8f2a\u65c5\u904a\u7684\u771f\u5be6\u9ad4\u9a57\u8207\u5be6\u7528\u653b\u7565',
  subscribe: '\u8a02\u9605\u7687\u5bb6\u65c5\u4eba\u96fb\u5b50\u5831',
  tagline: '\u7687\u5bb6\u65c5\u4eba \u00b7 \u90f5\u8f2a\u65c5\u904a\u90e8\u843d\u683c',
  mainNav: '\u4e3b\u8981\u5c0e\u89bd',
  search: '\u641c\u5c0b\u6587\u7ae0...',
  openMenu: '\u958b\u555f\u9078\u55ae',
  mobileNav: '\u884c\u52d5\u88dd\u7f6e\u5c0e\u89bd',
  quickContact: '\u5feb\u901f\u806f\u7d61',
  footerTag: '\u6eab\u99b3\u7684\u90f5\u8f2a\u65c5\u7a0b \u00b7 \u7528\u5fc3\u8a18\u9304\u6bcf\u4e00\u6bb5\u6d77\u4e0a\u6642\u5149',
  joinPending: '\u5167\u5bb9\u5c1a\u70ba\u7a7a\u767d\uff0c\u656c\u8acb\u671f\u5f85\u5f8c\u7e8c\u66f4\u65b0\u3002',
  nameLabel: '\u7a31\u547c',
  namePh: '\u8acb\u8f38\u5165\u7a31\u547c',
  msgLabel: '\u7559\u8a00\u5167\u5bb9',
  msgPh: '\u5728\u6b64\u7559\u4e0b\u60a8\u7684\u8a0a\u606f...',
  submit: '\u9001\u51fa',
  commentsUnit: '\u5247\u7559\u8a00',
  likesUnit: '\u4eba\u559c\u6b61',
  travel: '\u65c5\u904a',
  cruise: '\u90f5\u8f2a',
  blogTag: '\u90f5\u8f2a\u65c5\u904a\u90e8\u843d\u683c',
  authorPhoto: '\u4f5c\u8005\u7167\u7247',
  discuss: '\u8b80\u8005\u8a0e\u8ad6',
  seoDesc: '\u5c08\u696d\u90f5\u8f2a\u65c5\u904a\u5fc3\u5f97\uff0c\u63d0\u4f9b\u771f\u5be6\u9ad4\u9a57\u8207\u5be6\u7528\u653b\u7565',
  cruiseHeart: '\u90f5\u8f2a\u5fc3\u5f97',
  travelTips: '\u884c\u7a0b\u653b\u7565',
  beauty: '\u7f8e\u98df\u63a2\u7d22',
  shore: '\u5cb8\u4e0a\u884c\u7a0b',
  editorTitle: '\u5730\u4e2d\u6d77\u90f5\u8f2a\u9ad4\u9a57\uff1a\u5922\u5e7b\u76847\u5929\u591c',
  pickRoom: '\u5982\u4f55\u9078\u64c7\u90f5\u8f2a\u8239\u623f',
  caribbean: '\u52a0\u52d2\u6bd4\u6d77\u90f5\u8f2a\u653b\u7565',
  fjord: '\u5317\u6b50\u5cfd\u7063\u5cb8\u4e0a\u9ad4\u9a57',
  sidebarAbout:
    '\u6211\u662f\u90f5\u8f2a\u65c5\u904a\u7684\u71b1\u611b\u8005\uff0c\u5df2\u7d93\u642d\u904e\u591a\u6b21\u90f5\u8f2a\u3002\u8d70\u8a2a\u904e\u5730\u4e2d\u6d77\u3001\u52a0\u52d2\u6bd4\u6d77\u3001\u5317\u6b50\u5cfd\u7063\u7b49\u5730\u3002\u5206\u4eab\u6211\u771f\u5be6\u7684\u90f5\u8f2a\u65c5\u884c\u7d93\u9a57...',
  newsletterSide:
    '\u8a02\u9605\u7687\u5bb6\u65c5\u4eba\u96fb\u5b50\u5831\uff0c\u63a5\u6536\u6700\u65b0\u90f5\u8f2a\u65c5\u904a\u8cc7\u8a0a\u8207\u653b\u7565\u3002',
  mar2024: '2024\u5e743\u6708',
  feb2024: '2024\u5e742\u6708',
  mar10: '2024-03-10',
  mar5: '2024-03-05',
  feb28: '2024-02-28',
  mar15: '2024-03-15',
  royalDesc:
    '\u4e86\u89e3 Royal Traveler \u7687\u5bb6\u65c5\u4eba\u90e8\u843d\u683c\u7684\u6545\u4e8b\uff0c\u8a8d\u8b58\u535a\u4e3b\u672c\u4eba\u4ee5\u53ca\u70ba\u4f55\u5206\u4eab\u90f5\u8f2a\u65c5\u904a\u5fc3\u5f97\u8207\u8cc7\u8a0a\u3002',
  royalBio:
    '\u5927\u5bb6\u597d\uff0c\u6211\u662f\u7687\u5bb6\u65c5\u4eba\uff0c\u4e00\u540d\u71b1\u611b\u90f5\u8f2a\u65c5\u904a\u7684\u53f0\u7063\u90e8\u843d\u5ba2\u30022015\u5e74\u7b2c\u4e00\u6b21\u767b\u4e0a\u90f5\u8f2a\u5f8c\uff0c\u5c31\u88ab\u9019\u7a2e\u7368\u7279\u7684\u65c5\u884c\u65b9\u5f0f\u6df1\u6df1\u5438\u5f15\u3002\u81f3\u4eca\u5df2\u642d\u904e\u8d85\u904e 20 \u6b21\u90f5\u8f2a\uff0c\u8d70\u8a2a\u5730\u4e2d\u6d77\u3001\u52a0\u52d2\u6bd4\u6d77\u3001\u5317\u6b50\u5cfd\u7063\u7b49\u5730\u3002\u6b61\u8fce\u7559\u8a00\u4ea4\u6d41\u90f5\u8f2a\u65c5\u904a\u76f8\u95dc\u8a71\u984c\u3002',
  royalTag2: '\u90f5\u8f2a\u65c5\u904a\u90e8\u843d\u683c & \u65c5\u904a\u651d\u5f71\u5e2b',
  svc1t: '\u90f5\u8f2a\u65c5\u904a\u5fc3\u5f97',
  svc1d:
    '\u5206\u4eab\u89aa\u8eab\u9ad4\u9a57\u5404\u5927\u90f5\u8f2a\u516c\u53f8\u7684\u771f\u5be6\u9ad4\u9a57\uff0c\u6db5\u84cb\u5730\u4e2d\u6d77\u3001\u52a0\u52d2\u6bd4\u6d77\u3001\u5317\u6b50\u5cfd\u7063\u7b49\u71b1\u9580\u822a\u7dda\u3002',
  svc2t: '\u884c\u7a0b\u653b\u7565\u64b0\u5beb',
  svc2d:
    '\u7531\u6dfa\u5165\u6df1\u7684\u8a18\u9304\u6bcf\u4e00\u6bb5\u65c5\u7a0b\uff0c\u5f9e\u767b\u8239\u5230\u4e0b\u8239\u7684\u7d30\u7bc0\uff0c\u8b93\u8b80\u8005\u8f15\u9b06\u898f\u89ba\u597d\u822a\u7dda\u3002',
  svc3t: '\u8b80\u8005\u8aee\u8a62\u56de\u8986',
  svc3d:
    '\u958b\u653e\u8b80\u8005\u4fe1\u4ef6\u8a62\u554f\u90f5\u8f2a\u76f8\u95dc\u554f\u984c\uff0c\u4ee5\u500b\u4eba\u7d93\u9a57\u63d0\u4f9b\u5be6\u7528\u5efa\u8b70\u8207\u63a8\u85a6\u3002',
  svc4t: '\u65c5\u904a\u651d\u5f71\u5206\u4eab',
  svc4d:
    '\u7528\u93e1\u982d\u8a18\u9304\u6bcf\u4e00\u500b\u4ee4\u4eba\u9a5a\u5606\u7684\u6d77\u4e0a\u77ac\u9593\uff0c\u5206\u4eab\u90f5\u8f2a\u65c5\u884c\u7684\u8996\u89ba\u4e4b\u7f8e\u3002',
  videoTitle: '\u7687\u5bb6\u65c5\u4eba \u00b7 \u5730\u4e2d\u6d77\u90f5\u8f2a\u5168\u7d00\u9304 4K',
  videoSub: 'YouTube \u89c0\u5f71\u5f71\u7247',
  cruiseVideo: '\u90f5\u8f2a\u65c5\u884c\u5f71\u7247',
  quoteH2:
    '\u90f5\u8f2a\uff0c\u662f\u8b93\u4f60\u5728\u5922\u5883\u4e2d\u74b0\u904a\u4e16\u754c\u7684\u65b9\u5f0f',
  quoteP:
    '\u6bcf\u4e00\u6b21\u767b\u8239\u90fd\u662f\u5168\u65b0\u7684\u958b\u59cb\u3002\u90f5\u8f2a\u65c5\u904a\u6700\u8ff7\u4eba\u7684\u5730\u65b9\uff0c\u5728\u65bc\u4f60\u53ea\u9700\u8981\u5e36\u4e0a\u81ea\u5df1\uff0c\u5373\u53ef\u5728\u4e00\u8d9f\u65c5\u7a0b\u4e2d\u63a2\u7d22\u591a\u500b\u570b\u5bb6\u8207\u6d77\u57df\u3002',
  quoteBlock:
    '\u65c5\u884c\u4e0d\u662f\u9003\u96e2\u751f\u6d3b\uff0c\u800c\u662f\u8b93\u751f\u6d3b\u66f4\u4e0d\u9003\u96e2\u4f60\u3002\u6bcf\u4e00\u6b21\u90f5\u8f2a\u4e4b\u65c5\uff0c\u90fd\u8b93\u6211\u5011\u770b\u898b\u66f4\u6e05\u6670\u7684\u81ea\u5df1\u8207\u4e16\u754c\u3002',
  postP1:
    '\u90f5\u8f2a\u65c5\u904a\u662f\u4e00\u7a2e\u7368\u7279\u800c\u5168\u9762\u7684\u65c5\u884c\u65b9\u5f0f\uff0c\u8b93\u65c5\u5ba2\u5728\u4e00\u8d9f\u884c\u7a0b\u4e2d\u63a2\u7d22\u591a\u500b\u76ee\u7684\u5730\uff0c\u540c\u6642\u4eab\u53d7\u8239\u4e0a\u8c50\u5bcc\u7684\u5a1b\u6a02\u8a2d\u65bd\u8207\u7cbe\u7dfb\u9910\u98f2\u3002',
  postP2:
    '\u4ee5\u4e0b\u5c07\u4ee5\u771f\u5be6\u9ad4\u9a57\u7684\u89d2\u5ea6\u5206\u4eab\u9019\u6b21\u90f5\u8f2a\u4e4b\u65c5\u3002\u5f9e\u8e0f\u4e0a\u78bc\u982d\u90a3\u4e00\u523b\u8d77\uff0c\u5230\u6700\u5f8c\u770b\u8457\u6e2f\u53e3\u6f38\u6f38\u6d88\u5931\u5728\u6d77\u5e73\u9762\u4e0a\uff0c\u6bcf\u500b\u74b0\u7bc0\u90fd\u503c\u5f97\u7d30\u7d30\u54c1\u5473\u3002',
  postQuote:
    '\u65c5\u884c\u4e0d\u662f\u9003\u96e2\u751f\u6d3b\uff0c\u800c\u662f\u8b93\u751f\u6d3b\u66f4\u52a0\u8c50\u5bcc\u3002\u6bcf\u4e00\u6b21\u90f5\u8f2a\u4e4b\u65c5\uff0c\u90fd\u5e36\u4f86\u65b0\u7684\u8996\u89d2\u8207\u611f\u52d5\u3002',
  postP3:
    '\u7121\u8ad6\u4f60\u662f\u8ffd\u6c42\u5962\u83ef\u9ad4\u9a57\u7684\u65c5\u5ba2\uff0c\u9084\u662f\u7cbe\u7b97\u7d30\u7b97\u7684\u63a2\u7d22\u8005\uff0c\u90f5\u8f2a\u90fd\u6709\u9069\u5408\u4f60\u7684\u65b9\u6848\u3002',
  notionNote:
    '\u5b8c\u6574\u6587\u7ae0\u5167\u5bb9\u5c07\u900f\u904e Notion \u8cc7\u6599\u5eab\u4e32\u63a5\u986f\u793a\u3002\u8a2d\u5b9a NOTION_TOKEN \u5f8c\u5373\u53ef\u81ea\u52d5\u540c\u6b65\u3002',
  authorBioShort:
    '\u71b1\u611b\u90f5\u8f2a\u65c5\u904a\u7684\u53f0\u7063\u90e8\u843d\u5ba2\uff0c\u8d70\u8a2a\u5730\u4e2d\u6d77\u3001\u52a0\u52d2\u6bd4\u6d77\u3001\u5317\u6b50\u5cfd\u7063\u7b49\u5730\u3002\u81f4\u529b\u5206\u4eab\u771f\u5be6\u7684\u90f5\u8f2a\u65c5\u884c\u5fc3\u5f97\u3002',
};

const pag = `    <div class="mt-10 flex items-center justify-between border-t border-canvas-ceramic pt-6">
      <a href="#" class="flex items-center gap-2 text-micro font-semibold tracking-brand text-ink-soft transition-colors hover:text-blue-accent">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        Older Posts
      </a>
      <a href="#" class="flex items-center gap-2 text-micro font-semibold tracking-brand text-ink-soft transition-colors hover:text-blue-accent">
        Newer Posts
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
      </a>
    </div>`;

function catPage(catKey, title, desc, label) {
  return `---
import BaseLayout from '../layouts/BaseLayout.astro';
import PostCard from '../components/PostCard.astro';
import ContentLayout from '../components/ContentLayout.astro';
import CategoryPageHeader from '../components/CategoryPageHeader.astro';
import { getPosts } from '../lib/notion';

const posts = await getPosts('${catKey}');

const leftPosts = posts.filter((_, i) => i % 2 === 0);
const rightPosts = posts.filter((_, i) => i % 2 === 1);
---

<BaseLayout
  title="${title}"
  description="${desc}"
>
  <ContentLayout>
    <CategoryPageHeader label="${label}" />

    <div class="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
      <div class="space-y-6">
        {leftPosts.map((post) => <PostCard {...post} />)}
      </div>
      <div class="space-y-6">
        {rightPosts.map((post) => <PostCard {...post} />)}
      </div>
    </div>
${pag}
  </ContentLayout>
</BaseLayout>
`;
}

w('pages/index.astro', `---
import BaseLayout from '../layouts/BaseLayout.astro';
import PostCard from '../components/PostCard.astro';
import ContentLayout from '../components/ContentLayout.astro';
import { getPosts, getFeaturedPosts } from '../lib/notion';

const allFeatured = await getFeaturedPosts();
const FALLBACK_HERO = 'https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=1600';
const heroImage = (url?: string | null) => {
  const src = url ?? FALLBACK_HERO;
  return src.includes('pexels.com') ? src.replace(/w=\\d+/, 'w=1600') : src;
};
const featuredPost = {
  ...(allFeatured[0] ?? {
    url: '#',
    category: '${T.featured}',
    title: '${T.heroTitle}',
    image: FALLBACK_HERO,
  }),
  image: heroImage(allFeatured[0]?.image),
};

const posts = await getPosts('HOME');
const leftPosts = posts.filter((_, i) => i % 2 === 0);
const rightPosts = posts.filter((_, i) => i % 2 === 1);
---

<BaseLayout
  title="${T.home}"
  description="${T.homeDesc}"
>
  <section class="hero-featured relative mb-10 w-full">
    <div class="overflow-hidden shadow-card">
      <a
        href={featuredPost.url}
        class="group relative block min-h-[300px] overflow-hidden sm:min-h-[360px] md:min-h-[420px] lg:min-h-[480px]"
      >
        <img
          src={featuredPost.image}
          alt={featuredPost.title}
          loading="eager"
          fetchpriority="high"
          class="absolute inset-0 h-full w-full scale-105 object-cover object-center transition-transform duration-700 group-hover:scale-110"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-blue-house/90 via-blue-house/35 to-transparent" />
        <div class="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <span class="category-badge mb-3 inline-block">{featuredPost.category}</span>
          <h2 class="mb-3 max-w-3xl text-xl font-semibold leading-tight tracking-brand text-onDark md:text-3xl">
            {featuredPost.title}
          </h2>
          <span class="btn-on-dark-outline !text-micro">Read More</span>
        </div>
      </a>
    </div>
  </section>

  <ContentLayout class="!pb-12 !pt-0">
    <div class="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
      <div class="space-y-6">
        {leftPosts.map((post) => (
          <PostCard {...post} />
        ))}
      </div>
      <div class="space-y-6">
        {rightPosts.map((post) => (
          <PostCard {...post} />
        ))}
      </div>
    </div>
${pag}
  </ContentLayout>
</BaseLayout>
`);

w('pages/about-cruises.astro', catPage(T.about, T.about, T.aboutDesc, T.about));
w('pages/getting-started.astro', catPage(T.first, T.first, T.firstDesc, T.first));
w('pages/staterooms.astro', catPage(T.stateroom, T.stateroomTitle, T.roomDesc, T.stateroom));

w('pages/join.astro', `---
import BaseLayout from '../layouts/BaseLayout.astro';
import ContentLayout from '../components/ContentLayout.astro';
---
<BaseLayout title="${T.join}" description="${T.join}">
  <ContentLayout showSidebar={false}>
    <h1 class="mb-6 text-3xl font-semibold tracking-brand text-blue-brand">${T.join}</h1>
    <div class="ds-card-pad text-body text-ink-soft">
      <p>${T.joinPending}</p>
    </div>
  </ContentLayout>
</BaseLayout>
`);

w('pages/guestbook.astro', `---
import BaseLayout from '../layouts/BaseLayout.astro';
import ContentLayout from '../components/ContentLayout.astro';
---
<BaseLayout title="${T.guest}" description="${T.guest}">
  <ContentLayout showSidebar={false}>
    <h1 class="mb-8 text-3xl font-semibold tracking-brand text-blue-brand">${T.guest}</h1>
    <div class="ds-card-pad">
      <form class="space-y-6">
        <div>
          <label for="guest-name" class="mb-2 block text-sm font-semibold tracking-brand text-ink">${T.nameLabel}</label>
          <input id="guest-name" name="name" type="text" placeholder="${T.namePh}" class="ds-input" />
        </div>
        <div>
          <label for="guest-message" class="mb-2 block text-sm font-semibold tracking-brand text-ink">${T.msgLabel}</label>
          <textarea id="guest-message" name="message" rows="6" placeholder="${T.msgPh}" class="ds-input resize-y"></textarea>
        </div>
        <button type="button" class="btn-primary">${T.submit}</button>
      </form>
    </div>
  </ContentLayout>
</BaseLayout>
`);

w('components/Header.astro', `---
const currentPath = Astro.url.pathname;

const navLinks = [
  { href: '/', label: '${T.home}' },
  { href: '/royal-traveler', label: '${T.royal}' },
  { href: '/about-cruises', label: '${T.about}' },
  { href: '/getting-started', label: '${T.first}' },
  { href: '/join', label: '${T.join}' },
  { href: '/guestbook', label: '${T.guest}' },
];
---

<header class="sticky top-0 z-40 w-full">
  <div class="bg-black text-onDark">
    <div class="mx-auto flex max-w-content items-center justify-between gap-4 px-gutter-sm py-2 md:px-gutter-md lg:px-gutter-lg">
      <p class="hidden text-micro text-onDark-soft sm:block">${T.topStrip}</p>
      <a href="#newsletter" class="btn-primary !border-black !bg-black text-micro sm:ml-auto">${T.subscribe}</a>
    </div>
  </div>

  <div class="border-b border-canvas-ceramic bg-surface-white shadow-nav">
    <div class="mx-auto flex max-w-content items-center justify-between gap-6 px-gutter-sm py-4 md:px-gutter-md lg:px-gutter-lg">
      <a href="/" class="group flex shrink-0 items-center gap-3">
        <span class="flex h-11 w-11 items-center justify-center rounded-full bg-blue-light text-blue-brand">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3a2 2 0 110 4 2 2 0 010-4zm0 14.5c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
        </span>
        <span>
          <span class="block text-lg font-semibold tracking-brand text-blue-brand transition-colors group-hover:text-blue-accent">Royal Traveler</span>
          <span class="block text-micro text-ink-soft">${T.tagline}</span>
        </span>
      </a>
      <nav class="hidden items-center gap-1 lg:flex" aria-label="${T.mainNav}">
        {navLinks.map(({ href, label }) => {
          const isActive = currentPath === href || (href !== '/' && currentPath.startsWith(href));
          return (
            <a href={href} class:list={['rounded-pill px-3 py-2 text-sm font-medium tracking-brand transition-colors duration-brand', isActive ? 'bg-blue-light text-blue-brand font-semibold' : 'text-ink hover:text-blue-accent']}>{label}</a>
          );
        })}
      </nav>
      <div class="hidden items-center gap-2 md:flex">
        <input type="search" placeholder="${T.search}" class="ds-input !w-44 !rounded-pill !py-1.5 !text-micro lg:!w-52" />
        <a href="/guestbook" class="btn-outline-dark !text-micro">${T.guest}</a>
        <a href="/join" class="btn-primary !text-micro">${T.join}</a>
      </div>
      <button id="mobile-nav-toggle" type="button" class="rounded-pill p-2 text-ink hover:bg-canvas-ceramic lg:hidden" aria-expanded="false" aria-controls="mobile-nav-menu">
        <span class="sr-only">${T.openMenu}</span>
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
    </div>
    <div id="mobile-nav-menu" class="hidden border-t border-canvas-ceramic bg-surface-cool lg:hidden">
      <nav class="flex flex-col px-gutter-sm py-2" aria-label="${T.mobileNav}">
        {navLinks.map(({ href, label }) => {
          const isActive = currentPath === href;
          return (
            <a href={href} class:list={['rounded-card px-4 py-3 text-sm font-medium tracking-brand transition-colors', isActive ? 'bg-blue-light text-blue-brand font-semibold' : 'text-ink hover:bg-canvas-ceramic']}>{label}</a>
          );
        })}
        <div class="mt-3 flex flex-col gap-2 border-t border-canvas-ceramic pt-3">
          <a href="/guestbook" class="btn-outline-dark w-full justify-center">${T.guest}</a>
          <a href="/join" class="btn-primary w-full justify-center">${T.join}</a>
        </div>
      </nav>
    </div>
  </div>
</header>
<script>
  const toggle = document.getElementById('mobile-nav-toggle');
  const menu = document.getElementById('mobile-nav-menu');
  toggle?.addEventListener('click', () => {
    const hidden = menu?.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', hidden ? 'false' : 'true');
  });
</script>
`);

// Footer: patch Chinese only
{
  const fp = path.join(src, 'components/Footer.astro');
  let f = fs.readFileSync(fp, 'utf8');
  f = f.replace(/Royal Traveler[^<]+<\/span>/, `Royal Traveler ${T.royal}</span>`);
  f = f.replace(/<p class="mt-2[^>]+>[^<]+<\/p>/, `<p class="mt-2 text-micro text-onDark-soft">${T.footerTag}</p>`);
  fs.writeFileSync(fp, f, 'utf8');
}

w('layouts/BaseLayout.astro', fs.readFileSync(path.join(src, 'layouts/BaseLayout.astro'), 'utf8').replace(/aria-label="[^"]*"/, `aria-label="${T.quickContact}"`));

w('components/SEO.astro', `---
export interface Props {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
  jsonLd?: Record<string, unknown>;
}
const { title, description, image = 'https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=1200', type = 'website', jsonLd } = Astro.props;
const siteUrl = 'https://royaltraveler.com';
const canonicalUrl = new URL(Astro.url.pathname, siteUrl).toString();
const baseJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Royal Traveler ${T.royal}',
  url: siteUrl,
  logo: \`\${siteUrl}/favicon.svg\`,
  description: '${T.seoDesc}',
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', availableLanguage: ['Chinese', 'English'] },
};
const mergedJsonLd = jsonLd ?? baseJsonLd;
---
<title>{title} | Royal Traveler ${T.royal}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalUrl} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonicalUrl} />
<meta property="og:image" content={image} />
<meta property="og:type" content={type} />
<meta property="og:site_name" content="Royal Traveler ${T.royal}" />
<meta property="og:locale" content="zh_TW" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={image} />
<script type="application/ld+json" set:html={JSON.stringify(mergedJsonLd)} />
`);

w('components/Sidebar.astro', `---
const editorsPick = { image: 'https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?auto=compress&cs=tinysrgb&w=400', category: '${T.cruiseHeart}', title: '${T.editorTitle}', date: '${T.mar15}', author: '${T.royal}' };
const popularPosts = [
  { image: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=200', category: '${T.travelTips}', title: '${T.pickRoom}', date: '${T.mar10}' },
  { image: 'https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=200', category: '${T.cruiseHeart}', title: '${T.caribbean}', date: '${T.mar5}' },
  { image: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=200', category: '${T.shore}', title: '${T.fjord}', date: '${T.feb28}' },
];
const flickerPhotos = ['https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=150','https://images.pexels.com/photos/1430676/pexels-photo-1430676.jpeg?auto=compress&cs=tinysrgb&w=150','https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=150','https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?auto=compress&cs=tinysrgb&w=150','https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=150','https://images.pexels.com/photos/1654698/pexels-photo-1654698.jpeg?auto=compress&cs=tinysrgb&w=150'];
const categories = [{ name: '${T.cruiseHeart}', count: 4 },{ name: '${T.travelTips}', count: 7 },{ name: '${T.beauty}', count: 6 },{ name: '${T.shore}', count: 8 },{ name: '${T.stateroom}', count: 5 }];
const archives = [{ label: '${T.mar2024}', href: '#' },{ label: '${T.feb2024}', href: '#' },{ label: '2024\u5e741\u6708', href: '#' }];
const socials = [{ label: 'f', title: 'Facebook', href: '#' },{ label: 'X', title: 'Twitter', href: '#' },{ label: 'G+', title: 'Google+', href: '#' },{ label: 'in', title: 'LinkedIn', href: '#' },{ label: 'IG', title: 'Instagram', href: '#' }];
---
<aside class="w-full space-y-8">
  <div class="sidebar-widget"><h4>About Me</h4><div class="text-center"><img src="https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=200" alt="${T.authorPhoto}" loading="lazy" class="mx-auto mb-3 h-20 w-20 rounded-full border-2 border-blue-light object-cover" /><p class="mb-0.5 text-micro font-semibold tracking-brand text-blue-brand">${T.royal}</p><p class="mb-3 text-micro text-ink-soft">${T.blogTag}</p><p class="text-left text-body text-ink-soft">${T.sidebarAbout} <a href="/royal-traveler" class="ml-1 font-semibold text-blue-accent hover:underline">Read More</a></p></div></div>
  <div class="sidebar-widget"><h4>Newsletter</h4><p class="mb-4 text-center text-body text-ink-soft">${T.newsletterSide}</p><input type="email" placeholder="Your e-mail" class="ds-input mb-2 !text-micro" /><button type="button" class="btn-primary w-full justify-center">Subscribe Now</button></div>
  <div class="sidebar-widget"><h4>Editor's Picks</h4><a href="#" class="group block"><img src={editorsPick.image} alt={editorsPick.title} loading="lazy" class="mb-3 h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105" /><span class="category-badge mb-2 inline-block">{editorsPick.category}</span><h5 class="text-sm font-semibold leading-snug tracking-brand text-ink group-hover:text-blue-accent">{editorsPick.title}</h5></a></div>
  <div class="sidebar-widget"><h4>Popular Posts</h4><div class="space-y-4">{popularPosts.map((p) => <a href="#" class="group flex gap-3"><img src={p.image} alt={p.title} loading="lazy" class="h-16 w-16 shrink-0 object-cover" /><div><span class="category-badge mb-1 inline-block">{p.category}</span><h5 class="line-clamp-2 text-micro font-semibold text-ink group-hover:text-blue-accent">{p.title}</h5></div></a>)}</div></div>
  <div class="sidebar-widget"><h4>Categories</h4><ul>{categories.map(({ name, count }) => <li><a href="#" class="group flex justify-between py-1.5 text-micro font-semibold text-ink-soft hover:text-blue-accent"><span>{name}</span><span class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-accent text-[10px] font-bold text-onDark">{count}</span></a></li>)}</ul></div>
</aside>
`);

w('pages/royal-traveler.astro', `---
import BaseLayout from '../layouts/BaseLayout.astro';
import ContentLayout from '../components/ContentLayout.astro';
const services = [
  { icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>', title: '${T.svc1t}', desc: '${T.svc1d}' },
  { icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>', title: '${T.svc2t}', desc: '${T.svc2d}' },
  { icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>', title: '${T.svc3t}', desc: '${T.svc3d}' },
  { icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>', title: '${T.svc4t}', desc: '${T.svc4d}' },
];
---
<BaseLayout title="${T.royal}" description="${T.royalDesc}">
  <ContentLayout showSidebar={false}>
    <div class="ds-card-pad mb-8 flex flex-col items-start gap-6 sm:flex-row">
      <img src="https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=200" alt="${T.authorPhoto}" loading="eager" class="h-24 w-24 shrink-0 rounded-full border-2 border-blue-light object-cover" />
      <div class="min-w-0 flex-1"><h1 class="mb-0.5 text-h1">${T.royal}</h1><p class="text-micro font-semibold text-blue-accent">${T.royalTag2}</p><p class="mt-3 text-body text-ink-soft">${T.royalBio}</p></div>
    </div>
    <div class="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
      <div class="relative aspect-video overflow-hidden rounded-card shadow-card group"><img src="https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=800" alt="${T.cruiseVideo}" loading="lazy" class="absolute inset-0 h-full w-full object-cover opacity-80" /><div class="absolute bottom-3 left-3"><p class="text-xs font-semibold text-onDark">${T.videoTitle}</p><p class="text-micro text-onDark-soft">${T.videoSub}</p></div></div>
      <div><h2 class="mb-4 font-serif text-2xl font-semibold text-ink">${T.quoteH2}</h2><p class="mb-5 text-body text-ink-soft">${T.quoteP}</p><blockquote class="rounded-card border border-canvas-ceramic bg-gold-lightest p-5"><p class="text-body italic text-ink-rewards">${T.quoteBlock}</p></blockquote></div>
    </div>
    <div class="grid grid-cols-1 gap-6 border-t border-canvas-ceramic py-10 sm:grid-cols-2 md:grid-cols-4">{services.map((s) => <div class="ds-card-pad text-center"><div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-accent text-onDark" set:html={s.icon} /><h3 class="mb-3 text-micro font-semibold text-ink">{s.title}</h3><p class="text-body text-ink-soft">{s.desc}</p></div>)}</div>
  </ContentLayout>
</BaseLayout>
`);

{
  const pl = path.join(src, 'layouts/PostLayout.astro');
  let c = fs.readFileSync(pl, 'utf8');
  c = c.replace(/\{comments\}[^\n<]+/, `{comments} ${T.commentsUnit}`);
  c = c.replace(/\{likes\}[^\n<]+/, `{likes} ${T.likesUnit}`);
  c = c.replace(/\[category,[^\]]+\]/, `[category, '${T.cruise}', '${T.travel}']`);
  c = c.replace(/<p class="mb-2 text-micro font-semibold text-blue-accent">[^<]+/, `<p class="mb-2 text-micro font-semibold text-blue-accent">${T.blogTag}</p>`);
  c = c.replace(/<p class="text-body text-ink-soft">\s*[^<]{20,}/, `<p class="text-body text-ink-soft">${T.authorBioShort}</p>`);
  fs.writeFileSync(pl, c, 'utf8');
}
{
  const gp = path.join(src, 'components/GiscusComments.astro');
  let g = fs.readFileSync(gp, 'utf8');
  g = g.replace(/<h3[^>]+>[^<]+<\/h3>/, `<h3 class="text-micro font-semibold tracking-brand text-ink">${T.discuss}</h3>`);
  fs.writeFileSync(gp, g, 'utf8');
}

console.log('Restored UTF-8 files with blue theme tokens.');
