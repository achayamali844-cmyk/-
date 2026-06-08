import type { RefObject } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import type { ChatMessage } from '../../services/ai';
import type { Language } from '../settings/types';

interface ChatMessageListProps {
  messages: ChatMessage[];
  language: Language;
  systemName: string;
  isGenerating: boolean;
  chatEndRef: RefObject<HTMLDivElement | null>;
}

export default function ChatMessageList({
  messages,
  language,
  systemName,
  isGenerating,
  chatEndRef,
}: ChatMessageListProps) {
  return (
    <div className="flex-1 p-0 md:p-0 pb-32">
      <div className="max-w-4xl mx-auto flex flex-col">
        {messages.map((msg) => (
          <div key={msg.id} className={`w-full py-6 px-4 md:px-8 border-b border-white/5 ${msg.role === 'user' ? 'bg-transparent' : 'bg-[#1c1c1e]/50'}`}>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2 mb-2">
                {msg.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/5 shadow-sm"><span className="text-xs font-semibold">U</span></div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-sm"><Sparkles className="w-4 h-4" /></div>
                )}
                <span className="text-sm font-bold text-[#86868b] uppercase tracking-wider">{msg.role === 'user' ? (language === 'zh' ? '我' : 'Me') : systemName}</span>
              </div>
              {msg.files && msg.files.map((f, i) => (
                <div key={i} className="mb-3">
                  {f.mimeType.startsWith('image/') ? (
                    <img src={`data:${f.mimeType};base64,${f.data}`} alt="uploaded" className="max-w-md rounded-lg max-h-64 object-contain border border-white/10" />
                  ) : (
                    <div className="flex items-center gap-2 border border-white/10 p-2 rounded-lg text-sm max-w-sm">
                      <FileText className="w-5 h-5 shrink-0" />
                      <span className="truncate text-white">{f.name}</span>
                    </div>
                  )}
                </div>
              ))}
              <div className="leading-snug markdown-body text-[15px] prose prose-sm md:prose-base max-w-none prose-invert text-white prose-p:my-1 prose-pre:my-2 prose-ol:my-1 prose-ul:my-1">
                {msg.text.includes('<think>') && !msg.text.includes('</think>') && (
                  <div className="flex items-center gap-3 text-xs text-[#86868b] mb-4 mt-2 p-3 bg-black border border-white/10 rounded-lg">
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-[#86868b] animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1 h-1 bg-[#86868b] animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1 h-1 bg-[#86868b] animate-bounce"></div>
                    </div>
                    <span className="font-mono tracking-wide uppercase text-[10px]">
                      {language === 'zh' ? 'Thinking Process' : 'Thinking Process'}
                    </span>
                  </div>
                )}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {msg.text.replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '')}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {isGenerating && messages.length > 0 && messages[messages.length - 1].role === 'model' && messages[messages.length - 1].text === '' && (
          <div className="flex justify-start">
            <div className="bg-[#1c1c1e] border border-white/10 text-[#f5f5f7] rounded-2xl rounded-bl-md px-5 py-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex gap-1.5 items-center">
              <motion.div className="w-1.5 h-1.5 bg-white/50 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} />
              <motion.div className="w-1.5 h-1.5 bg-white/50 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} />
              <motion.div className="w-1.5 h-1.5 bg-white/50 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
