import { Briefcase, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { TaskItem } from '../../services/ai';
import type { Language } from '../settings/types';

interface TaskExtractionModalProps {
  isOpen: boolean;
  title?: string;
  language: Language;
  tasks: TaskItem[];
  isExtractingTasks: boolean;
  isSyncingNotion: boolean;
  onClose: () => void;
  onSyncToNotion: () => void;
}

export default function TaskExtractionModal({
  isOpen,
  title,
  language,
  tasks,
  isExtractingTasks,
  isSyncingNotion,
  onClose,
  onSyncToNotion,
}: TaskExtractionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60  z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1c1c1e]/90 backdrop-blur-3xl rounded-[24px] shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden border border-white/10"
          >
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#f5f5f7] line-clamp-1">{language === 'zh' ? '任务提炼与同步' : 'Task Extraction & Sync'}</h2>
                  <p className="text-sm text-[#86868b]">{title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[#2c2c2e] rounded-xl text-[#86868b] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-6 bg-[#2c2c2e]/50">
              {isExtractingTasks ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-4">
                  <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-emerald-600 animate-spin"></div>
                  <p className="text-[#86868b] font-medium">
                    {language === 'zh' ? '正在使用 AI 提炼任务链 (DAG)...' : 'AI is extracting task chain (DAG)...'}
                  </p>
                </div>
              ) : tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.map((task, i) => (
                    <div key={i} className="bg-[#1c1c1e] p-4 rounded-xl border border-white/10 shadow-sm flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#2c2c2e] text-[#a1a1a6] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#f5f5f7] text-base">{task.name}</h3>
                        <p className="text-[#a1a1a6] text-sm mt-1 leading-relaxed">{task.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-[#86868b] py-12">
                  {language === 'zh' ? '未找到明显任务，请多聊几句然后再试。' : 'No tasks found. Elaborate more in chat and try again.'}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-[#1c1c1e] flex justify-end gap-3 shrink-0">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-medium text-[#a1a1a6] hover:bg-[#2c2c2e] transition-colors"
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={onSyncToNotion}
                disabled={isExtractingTasks || tasks.length === 0 || isSyncingNotion}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                {isSyncingNotion ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                ) : (
                  <Briefcase className="w-4 h-4" />
                )}
                {language === 'zh' ? '同步至 Notion' : 'Sync to Notion'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
