import { BookOpen, CheckCircle, FileText, Search } from 'lucide-react';

interface ChatEmptyStateProps {
  introTitle: string;
  topics: string[];
  onTopicSelect: (topic: string) => void;
}

export default function ChatEmptyState({
  introTitle,
  topics,
  onTopicSelect,
}: ChatEmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full relative z-10 px-4 md:px-8 mt-[-10vh]">
      <h2 className="text-3xl md:text-4xl font-bold text-[#f5f5f7] mb-8 tracking-tight">
        {introTitle}
      </h2>

      <div className="w-full max-w-3xl mb-6 relative" id="empty-state-input-anchor">
        {/* We will let the chat input render below using CSS to position it when empty */}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-3xl absolute top-[calc(50%+60px)]">
        {topics.map((topic, i) => (
          <button
            key={i}
            onClick={() => onTopicSelect(topic)}
            className="px-4 py-2 rounded-full border border-white/10 bg-[#1c1c1e] text-sm text-[#a1a1a6] hover:bg-[#2c2c2e] transition-colors shadow-sm flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-[#86868b]" />
            {topic}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl absolute top-[calc(50%+140px)] px-4">
        <div className="p-5 rounded-2xl bg-[#1c1c1e] border border-white/10 flex flex-col cursor-pointer hover:bg-[#2c2c2e] transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><FileText className="w-5 h-5"/></div>
          </div>
          <h3 className="font-bold text-[#f5f5f7] mb-1">降AIGC</h3>
          <p className="text-xs text-[#86868b]">知网稳定过，保留学术性</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#1c1c1e] border border-white/10 flex flex-col cursor-pointer hover:bg-[#2c2c2e] transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-400"><BookOpen className="w-5 h-5"/></div>
          </div>
          <h3 className="font-bold text-[#f5f5f7] mb-1">顶会库</h3>
          <p className="text-xs text-[#86868b]">语义检索·GitHub链接直达</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#1c1c1e] border border-white/10 flex flex-col cursor-pointer hover:bg-[#2c2c2e] transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500"><CheckCircle className="w-5 h-5"/></div>
          </div>
          <h3 className="font-bold text-[#f5f5f7] mb-1">引文核验</h3>
          <p className="text-xs text-[#86868b]">鉴别参考文献的真实性</p>
        </div>
      </div>
    </div>
  );
}
