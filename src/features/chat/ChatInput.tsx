import type { ChangeEvent, KeyboardEvent } from 'react';
import { FileText, Mic, Paperclip, Send, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { SelectedChatFile } from './types';

interface ChatInputProps {
  hasMessages: boolean;
  input: string;
  selectedFile: SelectedChatFile | null;
  isListening: boolean;
  isGenerating: boolean;
  typePlaceholder: string;
  listeningLabel: string;
  backgroundGradientClass: string;
  onInputChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveSelectedFile: () => void;
  onVoiceInput: () => void;
  onStopListening: () => void;
  onSend: () => void;
}

export default function ChatInput({
  hasMessages,
  input,
  selectedFile,
  isListening,
  isGenerating,
  typePlaceholder,
  listeningLabel,
  backgroundGradientClass,
  onInputChange,
  onKeyDown,
  onFileUpload,
  onRemoveSelectedFile,
  onVoiceInput,
  onStopListening,
  onSend,
}: ChatInputProps) {
  return (
    <div className={hasMessages ? `absolute bottom-0 left-0 w-full bg-gradient-to-t ${backgroundGradientClass} to-transparent pt-8 pb-6 px-4 md:px-8 z-20` : "relative w-full max-w-4xl mx-auto px-4 z-20 mt-[-20px]"}>
      <div className="max-w-4xl mx-auto flex flex-col gap-2 relative w-full">
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute bottom-[calc(100%+0.75rem)] left-0 bg-[#1c1c1e] border border-white/10 rounded-2xl p-2 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-between w-64 z-20"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {selectedFile.preview ? (
                  <img src={selectedFile.preview} className="w-10 h-10 rounded object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded bg-[#2c2c2e] flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#86868b]" />
                  </div>
                )}
                <div className="truncate text-sm font-medium text-[#d2d2d7] pl-1">{selectedFile.name}</div>
              </div>
              <button onClick={onRemoveSelectedFile} className="p-1 hover:bg-[#2c2c2e] rounded-full text-[#86868b] ml-2 shrink-0" aria-label="Remove attachment">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 bg-white/10 text-white rounded-full px-4 py-2 shadow-lg flex items-center gap-3 z-20 whitespace-nowrap"
            >
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1c1c1e] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1c1c1e]"></span>
              </span>
              <span className="text-sm font-medium">{listeningLabel}</span>
              <button onClick={onStopListening} className="ml-2 hover:bg-[#1c1c1e]/20 p-1 rounded-full shrink-0" aria-label="Stop listening"><X className="w-3 h-3" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex items-end w-full rounded-[24px] border border-white/[0.08] bg-[#1c1c1e]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] focus-within:border-white/[0.15] transition-all duration-500 min-h-[64px]">
          <div className="flex flex-col pb-2 pl-2 shrink-0">
            <label className="p-2.5 hover:bg-white/5 text-[#86868b] hover:text-[#f5f5f7] rounded-full cursor-pointer transition-colors block active:scale-95">
              <Paperclip className="w-5 h-5" />
              <input type="file" className="hidden" onChange={onFileUpload} aria-label="Upload file" />
            </label>
          </div>

          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={typePlaceholder}
            aria-label={typePlaceholder}
            className="flex-1 max-h-48 min-h-[64px] py-5 px-2 resize-none bg-transparent focus:outline-none text-[#f5f5f7] scrollbar-hide block w-full outline-none leading-relaxed"
            rows={1}
            style={{ height: "auto" }}
          />

          <div className="flex items-center gap-1 pb-2 pr-2 shrink-0">
            <button
              onClick={onVoiceInput}
              className={`p-2.5 rounded-full transition-colors active:scale-95 ${isListening ? 'bg-red-500/10 text-red-500' : 'hover:bg-white/5 text-[#86868b] hover:text-[#f5f5f7]'}`}
              aria-label="Voice input"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={onSend}
              disabled={(!input.trim() && !selectedFile) || isGenerating}
              className="p-2.5 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-[#86868b] text-white rounded-full transition-all active:scale-95 shrink-0 disabled:scale-100 flex items-center justify-center m-1 shadow-sm disabled:shadow-none"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
