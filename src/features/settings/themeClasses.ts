import type { FontFamily, ThemeBackground, ThemeColor, ThemeLayout } from './types';

export function getFontClass(fontFamily: FontFamily): string {
  switch (fontFamily) {
    case 'serif':
      return 'font-serif';
    case 'mono':
      return 'font-mono';
    default:
      return 'font-sans';
  }
}

export function getThemeColorClass(themeColor: ThemeColor): string {
  switch (themeColor) {
    case 'blue':
      return 'theme-blue';
    case 'purple':
      return 'theme-purple';
    case 'green':
      return 'theme-green';
    case 'orange':
      return 'theme-orange';
    default:
      return 'theme-default';
  }
}

export function getThemeBackgroundClass(themeBackground: ThemeBackground): string {
  switch (themeBackground) {
    case 'midnight':
      return 'bg-[#0f172a]';
    case 'dark-gray':
      return 'bg-[#18181b]';
    case 'navy':
      return 'bg-[#0a0f24]';
    default:
      return 'bg-black';
  }
}

export function getThemeBackgroundGradient(themeBackground: ThemeBackground): string {
  switch (themeBackground) {
    case 'midnight':
      return 'from-[#0f172a] via-[#0f172a]/90';
    case 'dark-gray':
      return 'from-[#18181b] via-[#18181b]/90';
    case 'navy':
      return 'from-[#0a0f24] via-[#0a0f24]/90';
    default:
      return 'from-black via-black/90';
  }
}

export function getLayoutClass(layout: ThemeLayout): string {
  return layout === 'compact' ? 'layout-compact' : 'layout-comfortable';
}
