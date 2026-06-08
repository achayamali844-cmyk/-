import { useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Filter,
  GraduationCap,
  Search,
  Sparkles,
} from 'lucide-react';

import {
  QUESTION_BANK,
  QUESTION_BANK_DIFFICULTIES,
  QUESTION_BANK_SUBJECTS,
  QUESTION_BANK_SYSTEMS,
  type ExamSystem,
  type QuestionBankItem,
  type QuestionDifficulty,
} from './data';

const difficultyLabels: Record<QuestionDifficulty, string> = {
  foundation: '基础',
  standard: '标准',
  challenge: '挑战',
};

function getDifficultyClass(difficulty: QuestionDifficulty): string {
  if (difficulty === 'foundation') return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300';
  if (difficulty === 'standard') return 'border-blue-400/30 bg-blue-500/10 text-blue-300';
  return 'border-amber-400/30 bg-amber-500/10 text-amber-300';
}

interface QuestionCardProps {
  question: QuestionBankItem;
  isSelected: boolean;
  onSelect: () => void;
}

function QuestionCard({ question, isSelected, onSelect }: QuestionCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border p-4 transition-all active:scale-[0.99] ${
        isSelected
          ? 'border-emerald-400/50 bg-emerald-500/10 shadow-[0_0_30px_rgba(34,197,94,0.08)]'
          : 'border-white/10 bg-[#1c1c1e]/70 hover:border-white/20 hover:bg-[#2c2c2e]/70'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#d2d2d7]">
          {question.system}
        </span>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${getDifficultyClass(question.difficulty)}`}>
          {difficultyLabels[question.difficulty]}
        </span>
        <span className="ml-auto text-xs font-semibold text-[#86868b]">
          {question.marks} marks
        </span>
      </div>
      <h3 className="text-sm font-bold text-[#f5f5f7] leading-snug">
        {question.subject} · {question.topic}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#a1a1a6]">
        {question.question}
      </p>
    </button>
  );
}

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
        active
          ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
          : 'border-white/10 bg-white/5 text-[#a1a1a6] hover:border-white/20 hover:text-[#f5f5f7]'
      }`}
    >
      {label}
    </button>
  );
}

export default function QuestionBank() {
  const [selectedSystem, setSelectedSystem] = useState<ExamSystem | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selectedQuestionId, setSelectedQuestionId] = useState(QUESTION_BANK[0]?.id || '');
  const [showAnswer, setShowAnswer] = useState(false);

  const filteredQuestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return QUESTION_BANK.filter((question) => {
      const matchesSystem = selectedSystem === 'all' || question.system === selectedSystem;
      const matchesSubject = selectedSubject === 'all' || question.subject === selectedSubject;
      const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;
      const searchableText = [
        question.system,
        question.subject,
        question.course,
        question.topic,
        question.commandTerm,
        question.question,
      ].join(' ').toLowerCase();
      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);

      return matchesSystem && matchesSubject && matchesDifficulty && matchesQuery;
    });
  }, [query, selectedDifficulty, selectedSubject, selectedSystem]);

  const selectedQuestion = useMemo(() => {
    return filteredQuestions.find((question) => question.id === selectedQuestionId)
      || filteredQuestions[0]
      || null;
  }, [filteredQuestions, selectedQuestionId]);

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setShowAnswer(false);
  };

  const handleResetFilters = () => {
    setSelectedSystem('all');
    setSelectedSubject('all');
    setSelectedDifficulty('all');
    setQuery('');
    setShowAnswer(false);
  };

  return (
    <main className="h-full overflow-y-auto p-4 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-3xl border border-white/10 bg-[#1c1c1e]/60 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.18)] md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                <GraduationCap className="h-4 w-4" />
                A-Level / IB Question Bank
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#f5f5f7] md:text-4xl">
                AL 与 IB 原创仿真题库
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#a1a1a6] md:text-base">
                这里先放入可直接练习的原创考试风格题、答案步骤和评分点。它不是官方历年真题库；如果你后续提供有授权的真题资料，可以继续接入导入和检索。
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/20 p-3 text-center">
              <div>
                <div className="text-2xl font-black text-emerald-300">{QUESTION_BANK.length}</div>
                <div className="text-[11px] font-semibold text-[#86868b]">题目</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#f5f5f7]">{QUESTION_BANK_SYSTEMS.length}</div>
                <div className="text-[11px] font-semibold text-[#86868b]">体系</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#f5f5f7]">{QUESTION_BANK_SUBJECTS.length}</div>
                <div className="text-[11px] font-semibold text-[#86868b]">学科</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#1c1c1e]/60 p-4 md:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#f5f5f7]">
                <Filter className="h-4 w-4 text-emerald-300" />
                筛选题目
              </div>
              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索 subject / topic / command term..."
                  className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-[#f5f5f7] outline-none transition-all placeholder:text-[#86868b] focus:border-emerald-400/40 focus:ring-4 focus:ring-emerald-400/10"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterPill label="全部体系" active={selectedSystem === 'all'} onClick={() => setSelectedSystem('all')} />
              {QUESTION_BANK_SYSTEMS.map((system) => (
                <FilterPill
                  key={system}
                  label={system}
                  active={selectedSystem === system}
                  onClick={() => setSelectedSystem(system)}
                />
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterPill label="全部学科" active={selectedSubject === 'all'} onClick={() => setSelectedSubject('all')} />
              {QUESTION_BANK_SUBJECTS.map((subject) => (
                <FilterPill
                  key={subject}
                  label={subject}
                  active={selectedSubject === subject}
                  onClick={() => setSelectedSubject(subject)}
                />
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterPill label="全部难度" active={selectedDifficulty === 'all'} onClick={() => setSelectedDifficulty('all')} />
              {QUESTION_BANK_DIFFICULTIES.map((difficulty) => (
                <FilterPill
                  key={difficulty}
                  label={difficultyLabels[difficulty]}
                  active={selectedDifficulty === difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="grid min-h-[520px] grid-cols-1 gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div className="text-sm font-bold text-[#f5f5f7]">
                共 {filteredQuestions.length} 题
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#86868b] transition-colors hover:text-[#f5f5f7]"
              >
                重置筛选
              </button>
            </div>

            {filteredQuestions.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                {filteredQuestions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    isSelected={selectedQuestion?.id === question.id}
                    onSelect={() => handleSelectQuestion(question.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/15 bg-[#1c1c1e]/50 p-8 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-[#86868b]" />
                <h3 className="mt-4 text-lg font-bold text-[#f5f5f7]">没有匹配题目</h3>
                <p className="mt-2 text-sm leading-6 text-[#86868b]">
                  换一个体系、学科或关键词试试。
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-[#f5f5f7] hover:bg-white/10"
                >
                  清空筛选
                </button>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#1c1c1e]/70 p-5 md:p-6">
            {selectedQuestion ? (
              <div className="flex h-full flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-[#d2d2d7]">
                    {selectedQuestion.system}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-[#d2d2d7]">
                    {selectedQuestion.course}
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getDifficultyClass(selectedQuestion.difficulty)}`}>
                    {difficultyLabels[selectedQuestion.difficulty]}
                  </span>
                  <span className="ml-auto rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-300">
                    {selectedQuestion.marks} marks
                  </span>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-300">
                    <BookOpen className="h-4 w-4" />
                    {selectedQuestion.subject} · {selectedQuestion.topic}
                  </div>
                  <h2 className="text-xl font-bold leading-tight text-[#f5f5f7] md:text-2xl">
                    {selectedQuestion.commandTerm}
                  </h2>
                  <p className="mt-4 whitespace-pre-line text-base leading-8 text-[#d2d2d7]">
                    {selectedQuestion.question}
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => setShowAnswer((value) => !value)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black transition-all hover:bg-emerald-300 active:scale-[0.98]"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {showAnswer ? '隐藏答案' : '查看答案与评分点'}
                  </button>
                  <button
                    onClick={() => setShowAnswer(false)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-[#f5f5f7] transition-all hover:bg-white/10 active:scale-[0.98]"
                  >
                    先自己再做一遍
                  </button>
                </div>

                {showAnswer && (
                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#f5f5f7]">
                        <Sparkles className="h-4 w-4 text-emerald-300" />
                        答案步骤
                      </div>
                      <ol className="space-y-3 text-sm leading-6 text-[#d2d2d7]">
                        {selectedQuestion.answer.map((point, index) => (
                          <li key={point} className="flex gap-3">
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-black text-emerald-300">
                              {index + 1}
                            </span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="mb-3 text-sm font-bold text-[#f5f5f7]">
                        评分点提醒
                      </div>
                      <ul className="space-y-3 text-sm leading-6 text-[#d2d2d7]">
                        {selectedQuestion.examinerNotes.map((note) => (
                          <li key={note} className="flex gap-3">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-6">
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
                    版权边界：当前题库为原创仿真题和学习用评分点，不包含官方真题原文。要加入官方 AL / IB 题库，请先提供你有权使用的材料或链接。
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
                <AlertCircle className="h-10 w-10 text-[#86868b]" />
                <h3 className="mt-4 text-lg font-bold text-[#f5f5f7]">请选择一道题</h3>
                <p className="mt-2 text-sm text-[#86868b]">左侧题目会显示完整题干和答案要点。</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
