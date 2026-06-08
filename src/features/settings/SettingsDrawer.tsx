import type { Dispatch, SetStateAction } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { GEMINI_MODELS } from '../../config/models';
import {
  PERSONALITIES,
  SYSTEM_NAME_EN,
  SYSTEM_NAME_ZH,
} from './constants';
import type {
  AppSettings,
  FontFamily,
  Personality,
  PersonalityDefinition,
  ThemeBackground,
  ThemeColor,
  ThemeLayout,
  ThemeMode,
} from './types';

interface SettingsDrawerProps {
  isOpen: boolean;
  settings: AppSettings;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
  onClose: () => void;
}

const THEME_MODES: ThemeMode[] = ['dark', 'light'];
const THEME_COLORS: ThemeColor[] = ['default', 'blue', 'purple', 'green', 'orange'];
const THEME_BACKGROUNDS: ThemeBackground[] = ['black', 'midnight', 'dark-gray', 'navy'];
const FONT_FAMILIES: FontFamily[] = ['sans', 'serif', 'mono'];
const THEME_LAYOUTS: ThemeLayout[] = ['comfortable', 'compact'];

export default function SettingsDrawer({
  isOpen,
  settings,
  setSettings,
  onClose,
}: SettingsDrawerProps) {
  const labels = {
    settings: settings.language === 'zh' ? '系统设置' : 'Settings',
    sysNameLabel: settings.language === 'zh' ? '系统名称' : 'System Name',
    lang: settings.language === 'zh' ? '中英文切换' : 'Language Switch',
    pers: settings.language === 'zh' ? '性格切换' : 'Personality Switch',
    model: settings.language === 'zh' ? '大模型切换' : 'Model Switch',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60  z-40"
          />
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#1c1c1e]/90 backdrop-blur-3xl shadow-2xl z-50 flex flex-col border-l border-white/10"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
              <h2 className="text-xl font-bold text-[#f5f5f7] whitespace-nowrap">{labels.settings}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-[#86868b] transition-colors shrink-0 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-10">
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#86868b] uppercase tracking-wider block whitespace-nowrap">{labels.sysNameLabel}</label>
                <input
                  type="text"
                  value={settings.systemName || ''}
                  onChange={(e) => setSettings((s) => ({ ...s, systemName: e.target.value }))}
                  placeholder={settings.language === 'zh' ? SYSTEM_NAME_ZH : SYSTEM_NAME_EN}
                  className="w-full bg-[#2c2c2e] focus:bg-[#3a3a3c] transition-colors border border-transparent focus:border-white/20 rounded-xl px-4 py-3 text-sm font-semibold text-[#f5f5f7] focus:outline-none placeholder-[#86868b]"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-[#86868b] uppercase tracking-wider block whitespace-nowrap">{labels.lang}</label>
                <div className="flex p-1 bg-[#2c2c2e] rounded-xl">
                  <button
                    onClick={() => setSettings((s) => ({ ...s, language: 'zh' }))}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${settings.language === 'zh' ? 'bg-[#1c1c1e] text-white/80 shadow-sm' : 'text-[#a1a1a6] hover:text-[#f5f5f7]'}`}
                  >
                    中文
                  </button>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, language: 'en' }))}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${settings.language === 'en' ? 'bg-[#1c1c1e] text-white/80 shadow-sm' : 'text-[#a1a1a6] hover:text-[#f5f5f7]'}`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-[#86868b] uppercase tracking-wider block whitespace-nowrap">{labels.pers}</label>
                <div className="flex flex-col gap-2">
                  {(Object.entries(PERSONALITIES) as [Personality, PersonalityDefinition][]).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setSettings((s) => ({ ...s, personality: key }))}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                        settings.personality === key
                          ? 'border-white/20 bg-white/5 ring-1 ring-white/20 shadow-sm'
                          : 'border-white/10 bg-[#1c1c1e] hover:border-white/20 hover:bg-[#2c2c2e]'
                      }`}
                    >
                      <span className="font-semibold text-[#f5f5f7]">
                        {settings.language === 'zh' ? val.nameZh : val.nameEn}
                      </span>
                      {settings.personality === key && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10 shrink-0"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-[#86868b] uppercase tracking-wider block whitespace-nowrap">{labels.model}</label>
                <div className="flex flex-col gap-2">
                  {GEMINI_MODELS.map((modelOption) => (
                    <button
                      key={modelOption.id}
                      onClick={() => setSettings((s) => ({ ...s, model: modelOption.id }))}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                        settings.model === modelOption.id
                          ? 'border-white/20 bg-white/5 ring-1 ring-white/20 shadow-sm'
                          : 'border-white/10 bg-[#1c1c1e] hover:border-white/20 hover:bg-[#2c2c2e]'
                      }`}
                    >
                      <span className="font-medium text-[#f5f5f7] text-sm">
                        {modelOption.label}
                      </span>
                      {settings.model === modelOption.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10 shrink-0"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-[#86868b] uppercase tracking-wider block whitespace-nowrap">{settings.language === 'zh' ? '外观模式' : 'Appearance'}</label>
                <div className="flex gap-2 p-1 bg-[#2c2c2e] rounded-xl flex-wrap">
                  {THEME_MODES.map((m) => (
                    <button
                      key={m}
                      onClick={() => setSettings((s) => ({ ...s, themeMode: m }))}
                      className={`flex-1 min-w-[30%] py-2 text-sm rounded-lg transition-all capitalize ${
                        settings.themeMode === m ? 'bg-[#1c1c1e] text-white/80 shadow-sm' : 'text-[#a1a1a6] hover:text-[#f5f5f7]'
                      }`}
                    >
                      {settings.language === 'zh' ? (m === 'dark' ? '深色' : '浅色') : m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-[#86868b] uppercase tracking-wider block whitespace-nowrap">{settings.language === 'zh' ? '主题颜色' : 'Accent Color'}</label>
                <div className="flex gap-3">
                  {THEME_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSettings((s) => ({ ...s, themeColor: c }))}
                      aria-label={`Select ${c} color`}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        settings.themeColor === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                      } ${
                        c === 'default' ? 'bg-[#f5f5f7]' :
                        c === 'blue' ? 'bg-blue-500' :
                        c === 'purple' ? 'bg-purple-500' :
                        c === 'green' ? 'bg-green-500' :
                        'bg-orange-500'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {settings.themeMode === 'dark' && (
                <div className="space-y-3">
                  <label className="text-sm font-bold text-[#86868b] uppercase tracking-wider block whitespace-nowrap">{settings.language === 'zh' ? '页面颜色' : 'Background Color'}</label>
                  <div className="flex gap-3">
                    {THEME_BACKGROUNDS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSettings((s) => ({ ...s, themeBackground: c }))}
                        aria-label={`Select ${c} background`}
                        className={`w-10 h-10 rounded-full border-2 transition-all shadow-inner ${
                          settings.themeBackground === c ? 'border-white scale-110' : 'border-white/10 hover:scale-105'
                        } ${
                          c === 'black' ? 'bg-[#000000]' :
                          c === 'midnight' ? 'bg-[#0f172a]' :
                          c === 'dark-gray' ? 'bg-[#18181b]' :
                          'bg-[#0a0f24]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm font-bold text-[#86868b] uppercase tracking-wider block whitespace-nowrap">{settings.language === 'zh' ? '字体风格' : 'Font Style'}</label>
                <div className="flex p-1 bg-[#2c2c2e] rounded-xl flex-wrap">
                  {FONT_FAMILIES.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSettings((s) => ({ ...s, fontFamily: f }))}
                      className={`flex-1 min-w-[30%] py-2 text-sm rounded-lg transition-all ${settings.fontFamily === f ? 'bg-[#1c1c1e] text-white/80 shadow-sm' : 'text-[#a1a1a6] hover:text-[#f5f5f7]'} ${
                        f === 'sans' ? 'font-sans font-medium' : f === 'serif' ? 'font-serif italic text-base' : 'font-mono uppercase tracking-widest text-xs'
                      }`}
                    >
                      {f === 'sans' ? 'Sans-serif' : f === 'serif' ? 'Serif' : 'Mono'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-[#86868b] uppercase tracking-wider block whitespace-nowrap">{settings.language === 'zh' ? '界面布局' : 'Layout'}</label>
                <div className="flex flex-col gap-2">
                  {THEME_LAYOUTS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setSettings((s) => ({ ...s, layout: l }))}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                        settings.layout === l
                          ? 'border-white/20 bg-white/5 ring-1 ring-white/20 shadow-sm'
                          : 'border-white/10 bg-[#1c1c1e] hover:border-white/20 hover:bg-[#2c2c2e]'
                      }`}
                    >
                      <span className="font-medium text-[#f5f5f7] text-sm capitalize">
                        {settings.language === 'zh' ? (l === 'comfortable' ? '舒适 (Comfortable)' : '紧凑 (Compact)') : l}
                      </span>
                      {settings.layout === l && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10 shrink-0"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
