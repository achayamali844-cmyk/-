import type { GeminiModel } from '../../config/models';

export type Language = 'zh' | 'en';
export type Personality = 'academic' | 'socratic' | 'creative' | 'interdisciplinary';
export type Model = GeminiModel;
export type ThemeColor = 'default' | 'blue' | 'purple' | 'green' | 'orange';
export type ThemeMode = 'dark' | 'light';
export type ThemeBackground = 'black' | 'midnight' | 'dark-gray' | 'navy';
export type FontFamily = 'sans' | 'serif' | 'mono';
export type ThemeLayout = 'comfortable' | 'compact';

export interface AppSettings {
  language: Language;
  personality: Personality;
  model: Model;
  themeColor: ThemeColor;
  themeMode: ThemeMode;
  themeBackground: ThemeBackground;
  fontFamily: FontFamily;
  layout: ThemeLayout;
  systemName?: string;
}

export interface PersonalityDefinition {
  zh: string;
  en: string;
  nameZh: string;
  nameEn: string;
}
