export const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/royalcruiserasia/',
    icon: 'ig',
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/61591129253765',
    icon: 'fb',
  },
  {
    label: 'Threads',
    href: 'https://www.threads.com/@royalcruiserasia',
    icon: 'th',
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
