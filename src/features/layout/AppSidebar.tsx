import type { KeyboardEvent, MouseEvent } from 'react';
import {
  BookOpen,
  FileText,
  MessageSquare,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { AppTab, LayoutSession } from './types';

interface AppSidebarProps {
  isOpen: boolean;
  activeTab: AppTab;
  activeSessionId: string | null;
  sessions: LayoutSession[];
  searchQuery: string;
  systemName: string;
  searchPlaceholder: string;
  historyLabel: string;
  collapseLabel: string;
  settingsLabel: string;
  onClose: () => void;
  onStartChat: () => void;
  onSelectTab: (tab: AppTab) => void;
  onSearchChange: (query: string) => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string, event: MouseEvent | KeyboardEvent) => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export default function AppSidebar({
  isOpen,
  activeTab,
  activeSessionId,
  sessions,
  searchQuery,
  systemName,
  searchPlaceholder,
  historyLabel,
  collapseLabel,
  settingsLabel,
  onClose,
  onStartChat,
  onSelectTab,
  onSearchChange,
  onSelectSession,
  onDeleteSession,
  onOpenSettings,
  onLogout,
}: AppSidebarProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60  z-20 md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-full border-r border-white/10 bg-transparent backdrop-blur-2xl flex flex-col shrink-0 overflow-hidden absolute z-30 md:static md:z-auto shadow-[0_4px_30px_rgba(0,0,0,0.1)] md:shadow-none"
          >
            <div className="p-4 flex items-center justify-between shrink-0 mt-2">
              <div className="font-semibold text-lg text-[#f5f5f7] flex items-center gap-2 truncate whitespace-nowrap">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="tracking-tight">{systemName}</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-full text-[#86868b] transition-colors md:hidden"
                aria-label="Close sidebar"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 pb-4 shrink-0 flex flex-col gap-2 mt-2">
              <button
                onClick={onStartChat}
                className={`w-full rounded-[16px] py-2.5 px-3 flex items-center gap-3 transition-all duration-300 active:scale-[0.98] font-medium whitespace-nowrap border ${activeTab === 'chat' ? 'bg-[#1c1c1e]/60 border-white/10 text-white shadow-[0_4px_15px_rgba(0,0,0,0.05)]' : 'bg-transparent border-transparent hover:bg-white/5 text-[#86868b] hover:text-[#d2d2d7]'}`}
                aria-label="Start new chat"
                aria-current={activeTab === 'chat' ? 'page' : undefined}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${activeTab === 'chat' ? 'bg-white/10 text-white shadow-inner' : 'bg-white/5 text-[#86868b]'}`}><Plus className="w-4 h-4" /></div>
                开始 (Start)
              </button>
              <button
                onClick={() => onSelectTab('question-bank')}
                className={`w-full rounded-[16px] py-2.5 px-3 flex items-center gap-3 transition-all duration-300 active:scale-[0.98] font-medium whitespace-nowrap border ${activeTab === 'question-bank' ? 'bg-[#1c1c1e]/60 border-white/10 text-white shadow-[0_4px_15px_rgba(0,0,0,0.05)]' : 'bg-transparent border-transparent hover:bg-white/5 text-[#86868b] hover:text-[#d2d2d7]'}`}
                aria-label="Open AL and IB question bank"
                aria-current={activeTab === 'question-bank' ? 'page' : undefined}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${activeTab === 'question-bank' ? 'bg-white/10 text-white shadow-inner' : 'bg-white/5 text-[#86868b]'}`}><BookOpen className="w-4 h-4" /></div>
                题库 (AL/IB)
              </button>
              <button
                onClick={() => onSelectTab('handbook')}
                className={`w-full rounded-[16px] py-2.5 px-3 flex items-center gap-3 transition-all duration-300 active:scale-[0.98] font-medium whitespace-nowrap border ${activeTab === 'handbook' ? 'bg-[#1c1c1e]/60 border-white/10 text-white shadow-[0_4px_15px_rgba(0,0,0,0.05)]' : 'bg-transparent border-transparent hover:bg-white/5 text-[#86868b] hover:text-[#d2d2d7]'}`}
                aria-label="Open study handbook"
                aria-current={activeTab === 'handbook' ? 'page' : undefined}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${activeTab === 'handbook' ? 'bg-white/10 text-white shadow-inner' : 'bg-white/5 text-[#86868b]'}`}><FileText className="w-4 h-4" /></div>
                学习手册 (Handbook)
              </button>
              <button
                onClick={() => onSelectTab('leaderboard')}
                className={`w-full rounded-[16px] py-2.5 px-3 flex items-center gap-3 transition-all duration-300 active:scale-[0.98] font-medium whitespace-nowrap border ${activeTab === 'leaderboard' ? 'bg-[#1c1c1e]/60 border-white/10 text-white shadow-[0_4px_15px_rgba(0,0,0,0.05)]' : 'bg-transparent border-transparent hover:bg-white/5 text-[#86868b] hover:text-[#d2d2d7]'}`}
                aria-label="Open leaderboard"
                aria-current={activeTab === 'leaderboard' ? 'page' : undefined}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${activeTab === 'leaderboard' ? 'bg-white/10 text-white shadow-inner' : 'bg-white/5 text-[#86868b]'}`}><Sparkles className="w-4 h-4" /></div>
                排行榜 (Leaderboard)
              </button>
              <button
                onClick={() => onSelectTab('friends')}
                className={`w-full rounded-[16px] py-2.5 px-3 flex items-center gap-3 transition-all duration-300 active:scale-[0.98] font-medium whitespace-nowrap border ${activeTab === 'friends' ? 'bg-[#1c1c1e]/60 border-white/10 text-white shadow-[0_4px_15px_rgba(0,0,0,0.05)]' : 'bg-transparent border-transparent hover:bg-white/5 text-[#86868b] hover:text-[#d2d2d7]'}`}
                aria-label="Open friends list"
                aria-current={activeTab === 'friends' ? 'page' : undefined}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${activeTab === 'friends' ? 'bg-white/10 text-white shadow-inner' : 'bg-white/5 text-[#86868b]'}`}><Users className="w-4 h-4" /></div>
                好友 (Friends)
              </button>
            </div>

            <div className="px-4 pb-2 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-black/5 border border-transparent rounded-xl pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-4 focus:ring-white/10 focus:bg-[#1c1c1e] transition-all font-mono"
                  aria-label={searchPlaceholder}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2">
              <div className="px-2 pb-2 text-xs font-semibold text-[#86868b] uppercase tracking-wider whitespace-nowrap">
                {historyLabel}
              </div>
              <div className="space-y-1">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => onSelectSession(session.id)}
                    onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') onSelectSession(session.id); }}
                    className={`group flex items-center justify-between p-2 w-full rounded-xl cursor-pointer transition-colors active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20 ${
                      activeSessionId === session.id ? 'bg-white/10 text-white font-medium shadow-sm' : 'hover:bg-white/5 text-[#f5f5f7]'
                    }`}
                    aria-label={`Select session ${session.title}`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2 w-full">
                      <MessageSquare className={`w-4 h-4 shrink-0 ${activeSessionId === session.id ? 'text-white/80' : 'text-[#86868b]'}`} />
                      <span className="truncate text-sm font-medium pr-1 text-left">{session.title}</span>
                    </div>
                    <div
                      onClick={(e) => onDeleteSession(session.id, e)}
                      className={`${activeSessionId === session.id ? 'text-white/80 hover:text-white' : 'text-[#86868b] hover:text-red-500'} p-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0`}
                      aria-label="Delete chat session"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if(e.key === 'Enter' || e.key === ' ') {
                          onDeleteSession(session.id, e);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </div>
                  </button>
                ))}
                {sessions.length === 0 && (
                  <div className="text-center text-[#86868b] text-sm py-4">
                    No history
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-white/10 hidden md:flex items-center justify-between shrink-0 h-16 box-border font-mono">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-[#86868b] hover:text-[#f5f5f7] transition-colors text-sm font-medium whitespace-nowrap"
                aria-label={collapseLabel}
              >
                <PanelLeftClose className="w-5 h-5" />
                {collapseLabel}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onOpenSettings}
                  className="p-2 text-[#86868b] hover:text-white transition-colors tooltip flex items-center justify-center hover:bg-white/5 rounded-full"
                  title={settingsLabel}
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 text-[#86868b] hover:text-red-500 transition-colors text-sm font-medium whitespace-nowrap tooltip flex items-center justify-center hover:bg-white/5 rounded-full"
                  title="退出登录"
                  aria-label="Logout"
                >
                  登出
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
