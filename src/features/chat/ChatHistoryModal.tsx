import { Download, Paperclip, Table as TableIcon, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ChatMessage } from '../../services/ai';
import type { Language } from '../settings/types';

interface ChatHistoryModalProps {
  isOpen: boolean;
  title: string;
  messages: ChatMessage[];
  language: Language;
  systemName: string;
  onClose: () => void;
  onExportCSV: () => void;
}

export default function ChatHistoryModal({
  isOpen,
  title,
  messages,
  language,
  systemName,
  onClose,
  onExportCSV,
}: ChatHistoryModalProps) {
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
            className="bg-[#1c1c1e]/90 backdrop-blur-3xl rounded-[24px] shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden border border-white/10"
          >
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                  <TableIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#f5f5f7] line-clamp-1">{title}</h2>
                  <p className="text-sm text-[#86868b]">{language === 'zh' ? '聊天记录表格视图' : 'Chat History Table View'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onExportCSV}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === 'zh' ? '导出 CSV' : 'Export CSV'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[#2c2c2e] rounded-xl text-[#86868b] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-6 bg-[#2c2c2e]/50">
              <table className="w-full text-left border-collapse bg-[#1c1c1e] rounded-xl shadow-sm overflow-hidden border border-white/10">
                <thead className="bg-[#2c2c2e] border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-[#a1a1a6] text-sm whitespace-nowrap w-24">{language === 'zh' ? '发送者' : 'Sender'}</th>
                    <th className="py-3 px-4 font-semibold text-[#a1a1a6] text-sm">{language === 'zh' ? '内容' : 'Message Content'}</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id} className="border-b border-white/10 last:border-0 hover:bg-[#2c2c2e] transition-colors">
                      <td className="py-4 px-4 align-top w-24">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          msg.role === 'user'
                            ? 'bg-white/5 text-white/80 border-white/10'
                            : 'bg-white/5 text-[#a1a1a6] border-white/10'
                        }`}>
                          {msg.role === 'user'
                            ? (language === 'zh' ? '我' : 'Me')
                            : systemName}
                        </span>
                      </td>
                      <td className="py-4 px-4 align-top text-[#d2d2d7] text-sm">
                        <div className="whitespace-pre-wrap max-w-3xl leading-relaxed">
                          {msg.text}
                        </div>
                        {msg.files && msg.files.map((f, fi) => (
                          <div key={fi} className="mt-2 text-xs text-[#86868b] flex items-center gap-1 w-fit bg-[#2c2c2e] px-2 py-1 rounded">
                            <Paperclip className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{f.name}</span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
