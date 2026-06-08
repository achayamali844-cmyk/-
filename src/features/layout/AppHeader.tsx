import { Briefcase, PanelLeftOpen, Settings, Table as TableIcon } from 'lucide-react';

interface AppHeaderProps {
  isSidebarOpen: boolean;
  systemName: string;
  expandLabel: string;
  settingsLabel: string;
  tableViewLabel: string;
  taskSyncLabel: string;
  hasActiveSessionMessages: boolean;
  onOpenSidebar: () => void;
  onExtractTasks: () => void;
  onOpenTable: () => void;
  onOpenSettings: () => void;
}

export default function AppHeader({
  isSidebarOpen,
  systemName,
  expandLabel,
  settingsLabel,
  tableViewLabel,
  taskSyncLabel,
  hasActiveSessionMessages,
  onOpenSidebar,
  onExtractTasks,
  onOpenTable,
  onOpenSettings,
}: AppHeaderProps) {
  return (
    <header className="h-[60px] border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-[#1c1c1e]/60 backdrop-blur-2xl z-10 w-full relative">
      <div className="flex items-center gap-3">
        {!isSidebarOpen && (
          <button
            onClick={onOpenSidebar}
            className="p-2 hover:bg-white/5 rounded-full text-[#a1a1a6] transition-colors tooltip flex items-center justify-center shrink-0"
            title={expandLabel}
            aria-label={expandLabel}
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}

        <div className="font-semibold text-lg text-[#f5f5f7] md:hidden whitespace-nowrap tracking-tight">
          {systemName}
        </div>

        {!isSidebarOpen && <div className="hidden md:block font-semibold text-lg text-[#f5f5f7] whitespace-nowrap tracking-tight">{systemName}</div>}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {hasActiveSessionMessages && (
          <>
            <button
              onClick={onExtractTasks}
              className="p-2 hover:bg-white/5 rounded-full text-[#a1a1a6] transition-colors flex items-center gap-2 tooltip"
              title={taskSyncLabel}
              aria-label={taskSyncLabel}
            >
              <Briefcase className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenTable}
              className="p-2 hover:bg-white/5 rounded-full text-[#a1a1a6] transition-colors flex items-center gap-2 tooltip"
              title={tableViewLabel}
              aria-label={tableViewLabel}
            >
              <TableIcon className="w-5 h-5" />
            </button>
          </>
        )}
        <button
          onClick={onOpenSettings}
          className="p-2 hover:bg-white/5 rounded-full text-[#a1a1a6] transition-colors flex items-center gap-2"
          aria-label={settingsLabel}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
