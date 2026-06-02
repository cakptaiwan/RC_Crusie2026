import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'components', 'GiscusComments.astro');

const content = `---
/**
 * GiscusComments.astro - GitHub Discussions comments via Giscus
 */

export interface Props {
  postTitle?: string;
  postSlug?: string;
}

const { postTitle = '', postSlug = '' } = Astro.props;

const repo = import.meta.env.GISCUS_REPO ?? '';
const repoId = import.meta.env.GISCUS_REPO_ID ?? '';
const category = import.meta.env.GISCUS_CATEGORY ?? 'Comments';
const categoryId = import.meta.env.GISCUS_CATEGORY_ID ?? '';

const isConfigured = !!(repo && repoId && categoryId);
---

<section class="giscus-section mt-12 border-t-2 border-canvas-ceramic pt-8">
  <div class="mb-6 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <h3 class="text-micro font-semibold tracking-brand text-ink">${'\u8b80\u8005\u8a0e\u8ad6'}</h3>
      <span class="text-xs text-ink-soft/40">\u00b7</span>
      <span class="text-micro font-medium text-ink-soft">Comments</span>
    </motion>
    <a
      href={isConfigured ? \`https://github.com/\${repo}/discussions\` : 'https://github.com/apps/giscus'}
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-1.5 text-micro text-ink-soft transition-colors hover:text-blue-accent"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
      {isConfigured ? 'GitHub Discussions' : '${'\u8a2d\u5b9a'} Giscus'}
    </a>
  </motion>

  {isConfigured ? (
    <>
      <div id="giscus-container" class="min-h-[200px]"></motion>
      <script is:inline define:vars={{ repo, repoId, category, categoryId, postSlug }}>
        (function () {
          const script = document.createElement('script');
          script.src = 'https://giscus.app/client.js';
          script.setAttribute('data-repo', repo);
          script.setAttribute('data-repo-id', repoId);
          script.setAttribute('data-category', category);
          script.setAttribute('data-category-id', categoryId);
          script.setAttribute('data-mapping', postSlug ? 'specific' : 'pathname');
          if (postSlug) script.setAttribute('data-term', postSlug);
          script.setAttribute('data-strict', '0');
          script.setAttribute('data-reactions-enabled', '1');
          script.setAttribute('data-emit-metadata', '0');
          script.setAttribute('data-input-position', 'top');
          script.setAttribute('data-theme', 'light');
          script.setAttribute('data-lang', 'zh-TW');
          script.setAttribute('data-loading', 'lazy');
          script.crossOrigin = 'anonymous';
          script.async = true;
          document.getElementById('giscus-container')?.appendChild(script);
        })();
      </script>
    </>
  ) : (
    <div class="ds-card overflow-hidden">
      <div class="flex items-center gap-3 border-b border-canvas-ceramic bg-surface-cool px-5 py-3">
        <div class="h-7 w-7 shrink-0 rounded-full bg-canvas-ceramic"></motion>
        <div class="flex h-8 flex-1 items-center rounded-pill border border-canvas-ceramic bg-surface-white px-3">
          <span class="text-micro text-ink-soft/50">${'\u767b\u5165 GitHub \u5f8c\u5373\u53ef\u7559\u8a00'} ...</span>
        </motion>
      </motion>
      <div class="bg-surface-white px-5 py-8 text-center">
        <p class="mb-1 text-sm font-semibold text-ink">Giscus ${'\u7559\u8a00\u677f'}</p>
        <p class="mx-auto mb-5 max-w-xs text-micro leading-relaxed text-ink-soft">
          ${'\u672c\u6587\u7ae0\u7684\u8a0e\u8ad6\u529f\u80fd\u5c07\u900f\u904e GitHub Discussions (Giscus) \u4e32\u63a5\uff0c\u5b8c\u6210\u8a2d\u5b9a\u5f8c\u5373\u53ef\u958b\u653e\u8a0e\u8ad6\u3002'}
        </p>
        <div class="mb-5 inline-block space-y-2.5 rounded-card border border-dashed border-canvas-ceramic px-5 py-4 text-left">
          <p class="mb-3 text-[10px] font-bold uppercase tracking-widest text-ink-soft">${'\u8a2d\u5b9a\u6e05\u55ae'}</p>
          {[
            ['GISCUS_REPO', '${'\u4f60\u7684 GitHub Repo'}', !!(import.meta.env.GISCUS_REPO)],
            ['GISCUS_REPO_ID', '${'\u5f9e giscus.app \u53d6\u5f97'}', !!(import.meta.env.GISCUS_REPO_ID)],
            ['GISCUS_CATEGORY', 'Discussions ${'\u5206\u985e\u540d\u7a31'}', !!(import.meta.env.GISCUS_CATEGORY)],
            ['GISCUS_CATEGORY_ID', '${'\u5f9e giscus.app \u53d6\u5f97'}', !!(import.meta.env.GISCUS_CATEGORY_ID)],
          ].map(([key, hint, done]) => (
            <div class="flex items-start gap-2.5">
              <span class={\`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full \${done ? 'bg-blue-accent' : 'border border-canvas-ceramic'}\`}>
                {done && (
                  <svg class="h-2 w-2 text-onDark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <div>
                <code class="font-mono text-[10px] text-ink-soft">{key}</code>
                <span class="ml-1.5 text-[10px] text-ink-soft/70">{hint}</span>
              </motion>
            </motion>
          ))}
        </motion>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <a href="https://giscus.app/" target="_blank" rel="noopener noreferrer" class="btn-primary !text-micro">
            ${'\u524d\u5f80 giscus.app \u9032\u884c\u8a2d\u5b9a'}
          </a>
          <a href="https://github.com/apps/giscus" target="_blank" rel="noopener noreferrer" class="btn-outline-primary !text-micro">
            ${'\u5b89\u88dd Giscus App'}
          </a>
        </motion>
      </motion>
    </motion>
  )}
</section>
`;

const out = content.replace(/<div/g, '<div').replace(/<\/motion>/g, '</motion>');
fs.writeFileSync(p, out.replace(/<div/g, '<div').replace(/<\/motion>/g, '</motion>'), 'utf8');
console.log('GiscusComments rewritten');
