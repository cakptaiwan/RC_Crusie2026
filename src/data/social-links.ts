const navIcon = (path: string, viewBox = '0 0 24 24') =>
  `<svg class="h-full w-full" viewBox="${viewBox}" aria-hidden="true"><path fill="currentColor" d="${path}"/></svg>`;

export const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/61591129253765',
    svg: `<svg class="h-full w-full" viewBox="0 0 24 24" aria-hidden="true"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    navSvg: navIcon(
      'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    ),
  },
] as const;

/** White square + navy icon — nav strip (130% scale) */
export const navStripSocialLinkClass =
  'social-icon-link flex h-[47px] w-[47px] shrink-0 items-center justify-center rounded bg-white p-2.5 text-[#061556] shadow-sm';

/** White square + navy icon — for nav bar & footer on dark background */
export const navSocialLinkClass =
  'social-icon-link flex h-9 w-9 shrink-0 items-center justify-center rounded bg-white p-2 text-[#061556] shadow-sm';

/** Social icon group — matches nav strip layout */
export const navSocialGroupClass =
  'flex items-center gap-5 border-l border-white/15 pl-6';
