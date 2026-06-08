import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ListTodo,
  Loader2,
  Maximize2,
  Minimize2,
  Move,
  Target,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { verifyStudyCheckIn } from '../services/ai';

type TaskStatus = 'done' | 'doing' | 'to do';

type HandbookTask = {
  id: string;
  title: string;
  status: TaskStatus;
  estimated_min: number;
  due_date: string;
  dag_order: number;
};

type ExamSchedule = {
  type: string;
  date: string;
  location: string;
};

type ScoreRecord = {
  exam_type: string;
  score: number;
  max_score: number;
};

type Subject = {
  id: string;
  name: string;
  category: string;
  color: string;
  dailyTask: string;
  tasks: HandbookTask[];
  examSchedules: ExamSchedule[];
  scores: ScoreRecord[];
  avgScore: number | null;
};

type CheckInData = {
  passed: boolean;
  score?: number;
  feedback?: string;
};

type VerificationResult = {
  passed?: boolean;
  message?: string;
  score?: number;
};

const HANDBOOK_STORAGE_KEY = 'academic-brainstorm-os:study-handbook-subjects';

const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 's1',
    name: 'IB Physics',
    category: 'IB',
    color: 'blue',
    dailyTask: '复习力学公式并完成 3 道历年真题',
    tasks: [
      { id: 't1', title: '总结力学公式', status: 'done', estimated_min: 30, due_date: '2026-05-18', dag_order: 1 },
      { id: 't2', title: '完成 3 道历年真题', status: 'doing', estimated_min: 60, due_date: '2026-05-18', dag_order: 2 },
    ],
    examSchedules: [{ type: 'final', date: '2026-05-20', location: 'Hall A' }],
    scores: [{ exam_type: 'IA', score: 20, max_score: 24 }],
    avgScore: 85,
  },
  {
    id: 's2',
    name: 'IB Economics',
    category: 'IB',
    color: 'green',
    dailyTask: '阅读微观经济学第一章并总结笔记',
    tasks: [
      { id: 't3', title: '阅读第一章', status: 'to do', estimated_min: 40, due_date: '2026-05-19', dag_order: 1 },
    ],
    examSchedules: [{ type: 'final', date: '2026-05-25', location: 'Room 101' }],
    scores: [{ exam_type: 'IA', score: 38, max_score: 45 }],
    avgScore: 90,
  },
  {
    id: 's3',
    name: 'IB Math AA',
    category: 'IB',
    color: 'orange',
    dailyTask: '练习微积分导数运算题 10 道',
    tasks: [
      { id: 't4', title: '推导导数公式', status: 'done', estimated_min: 20, due_date: '2026-05-16', dag_order: 1 },
      { id: 't5', title: '完成 10 道练习', status: 'to do', estimated_min: 45, due_date: '2026-05-17', dag_order: 2 },
    ],
    examSchedules: [{ type: 'midterm', date: '2026-06-01', location: 'Lab 2' }],
    scores: [],
    avgScore: null,
  },
  {
    id: 's4',
    name: 'IB History',
    category: 'IB',
    color: 'purple',
    dailyTask: '梳理冷战时期时间线与重大事件',
    tasks: [
      { id: 't6', title: '阅读冷战教材', status: 'doing', estimated_min: 60, due_date: '2026-05-18', dag_order: 1 },
    ],
    examSchedules: [{ type: 'mock exam', date: '2026-06-10', location: 'Library' }],
    scores: [{ exam_type: 'Essay 1', score: 12, max_score: 15 }],
    avgScore: 80,
  },
  {
    id: 's5',
    name: 'IB Psychology',
    category: 'IB',
    color: 'pink',
    dailyTask: '记忆生物学视角下的关键实验',
    tasks: [
      { id: 't7', title: '整理 MRI 实验笔记', status: 'to do', estimated_min: 30, due_date: '2026-05-20', dag_order: 1 },
    ],
    examSchedules: [{ type: 'final', date: '2026-06-15', location: 'Hall B' }],
    scores: [{ exam_type: 'Quiz', score: 18, max_score: 22 }],
    avgScore: 82,
  },
  {
    id: 's6',
    name: 'IB Visual Arts',
    category: 'IB',
    color: 'teal',
    dailyTask: '完成作品集草图整理',
    tasks: [
      { id: 't8', title: '素描基础', status: 'done', estimated_min: 120, due_date: '2026-05-10', dag_order: 1 },
      { id: 't9', title: '整理草本', status: 'doing', estimated_min: 60, due_date: '2026-05-22', dag_order: 2 },
    ],
    examSchedules: [{ type: 'portfolio deadline', date: '2026-06-20', location: 'Art Studio' }],
    scores: [{ exam_type: 'Project', score: 28, max_score: 30 }],
    avgScore: 93,
  },
  {
    id: 's7',
    name: 'A-Level Math',
    category: 'A-Level',
    color: 'indigo',
    dailyTask: '复习代数与函数，完成课后测试',
    tasks: [
      { id: 't10', title: '函数作图练习', status: 'to do', estimated_min: 40, due_date: '2026-05-25', dag_order: 1 },
    ],
    examSchedules: [{ type: 'paper 1', date: '2026-06-05', location: 'Room 203' }],
    scores: [{ exam_type: 'Mock', score: 90, max_score: 100 }],
    avgScore: 90,
  },
  {
    id: 's8',
    name: 'A-Level Econ',
    category: 'A-Level',
    color: 'cyan',
    dailyTask: '分析通货膨胀案例研究',
    tasks: [
      { id: 't11', title: '查找案例', status: 'done', estimated_min: 20, due_date: '2026-05-14', dag_order: 1 },
      { id: 't12', title: '撰写分析', status: 'doing', estimated_min: 50, due_date: '2026-05-18', dag_order: 2 },
    ],
    examSchedules: [{ type: 'paper 2', date: '2026-06-08', location: 'Hall C' }],
    scores: [],
    avgScore: null,
  },
  {
    id: 's9',
    name: 'A-Level Chemistry',
    category: 'A-Level',
    color: 'yellow',
    dailyTask: '背诵有机化学反应条件',
    tasks: [
      { id: 't13', title: '制作反应条件卡片', status: 'to do', estimated_min: 30, due_date: '2026-05-21', dag_order: 1 },
    ],
    examSchedules: [{ type: 'paper 3', date: '2026-06-12', location: 'Lab 1' }],
    scores: [{ exam_type: 'Practical', score: 35, max_score: 40 }],
    avgScore: 88,
  },
  {
    id: 's10',
    name: 'A-Level Psychology',
    category: 'A-Level',
    color: 'red',
    dailyTask: '复习认知心理学记忆模型',
    tasks: [
      { id: 't14', title: '默写记忆模型', status: 'to do', estimated_min: 20, due_date: '2026-05-23', dag_order: 1 },
    ],
    examSchedules: [{ type: 'paper 1', date: '2026-06-18', location: 'Room 305' }],
    scores: [{ exam_type: 'Midterm', score: 65, max_score: 80 }],
    avgScore: 81,
  },
  {
    id: 's11',
    name: 'A-Level Physics',
    category: 'A-Level',
    color: 'blue',
    dailyTask: '完成电磁学经典习题',
    tasks: [
      { id: 't15', title: '右手定则复习', status: 'done', estimated_min: 15, due_date: '2026-05-15', dag_order: 1 },
      { id: 't16', title: '完成 5 道电磁学题目', status: 'doing', estimated_min: 45, due_date: '2026-05-18', dag_order: 2 },
    ],
    examSchedules: [{ type: 'paper 2', date: '2026-06-22', location: 'Hall B' }],
    scores: [{ exam_type: 'AS exam', score: 95, max_score: 100 }],
    avgScore: 95,
  },
  {
    id: 's12',
    name: 'A-Level Further Math',
    category: 'A-Level',
    color: 'purple',
    dailyTask: '复习矩阵运算及应用',
    tasks: [
      { id: 't17', title: '矩阵乘法练习', status: 'to do', estimated_min: 40, due_date: '2026-05-20', dag_order: 1 },
    ],
    examSchedules: [{ type: 'paper 1', date: '2026-06-25', location: 'Hall A' }],
    scores: [{ exam_type: 'Core 1', score: 98, max_score: 100 }],
    avgScore: 98,
  },
];

function getStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeTask(value: unknown): HandbookTask | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const status = getStringValue(record.status);
  const normalizedStatus: TaskStatus = status === 'done' || status === 'doing' ? status : 'to do';
  const id = getStringValue(record.id);
  const title = getStringValue(record.title);
  const estimatedMin = Number(record.estimated_min);
  const dagOrder = Number(record.dag_order);

  if (!id || !title) return null;

  return {
    id,
    title,
    status: normalizedStatus,
    estimated_min: Number.isFinite(estimatedMin) ? Math.max(0, Math.round(estimatedMin)) : 0,
    due_date: getStringValue(record.due_date),
    dag_order: Number.isFinite(dagOrder) ? Math.round(dagOrder) : 0,
  };
}

function normalizeSubject(value: unknown): Subject | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const id = getStringValue(record.id);
  const name = getStringValue(record.name);
  const tasks = Array.isArray(record.tasks) ? record.tasks.map(normalizeTask).filter((task): task is HandbookTask => Boolean(task)) : [];
  const examSchedules = Array.isArray(record.examSchedules)
    ? record.examSchedules
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const exam = item as Record<string, unknown>;
          const date = getStringValue(exam.date);
          if (!date) return null;
          return {
            type: getStringValue(exam.type) || 'exam',
            date,
            location: getStringValue(exam.location) || 'TBD',
          };
        })
        .filter((item): item is ExamSchedule => Boolean(item))
    : [];
  const scores = Array.isArray(record.scores)
    ? record.scores
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const scoreRecord = item as Record<string, unknown>;
          const score = Number(scoreRecord.score);
          const maxScore = Number(scoreRecord.max_score);
          if (!Number.isFinite(score) || !Number.isFinite(maxScore)) return null;
          return {
            exam_type: getStringValue(scoreRecord.exam_type) || 'Score',
            score,
            max_score: maxScore,
          };
        })
        .filter((item): item is ScoreRecord => Boolean(item))
    : [];

  if (!id || !name) return null;

  return {
    id,
    name,
    category: getStringValue(record.category) || 'Course',
    color: getStringValue(record.color) || 'green',
    dailyTask: getStringValue(record.dailyTask) || '完成今日复习任务',
    tasks,
    examSchedules,
    scores,
    avgScore: typeof record.avgScore === 'number' ? record.avgScore : null,
  };
}

function loadStoredSubjects(): Subject[] | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(HANDBOOK_STORAGE_KEY);
  if (!raw) return null;

  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];

  return parsed.map(normalizeSubject).filter((subject): subject is Subject => Boolean(subject));
}

function parseLocalDate(dateValue: string): Date | null {
  const match = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
  return date;
}

function startOfLocalDay(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDayDifference(targetDateValue: string, now = new Date()): number | null {
  const targetDate = parseLocalDate(targetDateValue);
  if (!targetDate) return null;

  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((targetDate.getTime() - startOfLocalDay(now).getTime()) / oneDay);
}

function getCountdownLabel(dateValue: string): { label: string; tone: string } {
  const dayDiff = getDayDifference(dateValue);

  if (dayDiff === null) {
    return { label: '日期待确认', tone: 'text-[#86868b]' };
  }

  if (dayDiff === 0) return { label: '今天', tone: 'text-yellow-400' };
  if (dayDiff === 1) return { label: '明天', tone: 'text-yellow-400' };
  if (dayDiff > 1) return { label: `${dayDiff} 天`, tone: dayDiff <= 7 ? 'text-yellow-400' : 'text-[#a1a1a6]' };

  return { label: `已过期 ${Math.abs(dayDiff)} 天`, tone: 'text-red-400' };
}

function getFocusExam(subject: Subject): ExamSchedule | null {
  if (subject.examSchedules.length === 0) return null;

  const schedules = [...subject.examSchedules].sort((a, b) => {
    const aDiff = getDayDifference(a.date);
    const bDiff = getDayDifference(b.date);
    if (aDiff === null && bDiff === null) return 0;
    if (aDiff === null) return 1;
    if (bDiff === null) return -1;
    if (aDiff >= 0 && bDiff < 0) return -1;
    if (aDiff < 0 && bDiff >= 0) return 1;
    if (aDiff >= 0 && bDiff >= 0) return aDiff - bDiff;
    return bDiff - aDiff;
  });

  return schedules[0];
}

function getColorClass(color: string) {
  switch (color) {
    case 'blue': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'green': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'orange': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'purple': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'pink': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    case 'teal': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
    case 'indigo': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    case 'cyan': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    case 'yellow': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'red': return 'bg-red-500/10 text-red-400 border-red-500/20';
    default: return 'bg-white/10 text-[#d2d2d7] border-white/20';
  }
}

function getStatusIcon(status: TaskStatus) {
  switch (status) {
    case 'done': return <CheckSquare className="w-4 h-4 text-green-500 shrink-0" />;
    case 'doing': return <Activity className="w-4 h-4 text-blue-400 shrink-0" />;
    default: return <ListTodo className="w-4 h-4 text-[#86868b] shrink-0" />;
  }
}

function getCompletionText(subject: Subject): string {
  const doneCount = subject.tasks.filter((task) => task.status === 'done').length;
  return `子任务: ${doneCount}/${subject.tasks.length} 已完成`;
}

function getSortedTasks(subject: Subject): HandbookTask[] {
  return [...subject.tasks].sort((a, b) => a.dag_order - b.dag_order);
}

export default function StudyHandbook({
  isFloating = false,
  onFloat,
  onClose,
}: {
  isFloating?: boolean;
  onFloat?: () => void;
  onClose?: () => void;
}) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [checkedIn, setCheckedIn] = useState<Record<string, CheckInData>>({});
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [checkingSubject, setCheckingSubject] = useState<string | null>(null);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyInputError, setVerifyInputError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setLoadError('');

    const timer = window.setTimeout(() => {
      try {
        const storedSubjects = loadStoredSubjects();
        if (!isMounted) return;
        setSubjects(storedSubjects ?? DEFAULT_SUBJECTS);
      } catch (error) {
        console.error('Error loading study handbook:', error);
        if (isMounted) {
          setLoadError('学习手册加载失败，请刷新后重试。');
          setSubjects([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, []);

  const currentSubject = useMemo(() => {
    return subjects.find((subject) => subject.name === checkingSubject) ?? null;
  }, [checkingSubject, subjects]);

  const startCheckIn = (subjectName: string) => {
    setCheckingSubject(subjectName);
    setVerifyInput('');
    setVerifyInputError('');
    setVerifyResult(null);
  };

  const closeVerification = () => {
    if (isVerifying) return;
    setCheckingSubject(null);
    setVerifyInput('');
    setVerifyInputError('');
    setVerifyResult(null);
  };

  const handleCheckInAreaClick = (event: React.MouseEvent, subject: Subject) => {
    event.preventDefault();
    event.stopPropagation();

    if (!checkedIn[subject.name]) {
      startCheckIn(subject.name);
    }
  };

  const submitVerification = async () => {
    const normalizedInput = verifyInput.trim();

    if (normalizedInput.length < 5) {
      setVerifyInputError('请补充更具体的学习总结，至少 5 个字符。');
      return;
    }

    if (!checkingSubject) return;

    setIsVerifying(true);
    setVerifyInputError('');
    setVerifyResult(null);

    const taskDefinition = currentSubject?.dailyTask || '今日学习任务';
    const result = await verifyStudyCheckIn(checkingSubject, taskDefinition, normalizedInput);

    setIsVerifying(false);
    setVerifyResult(result);

    if (result.passed) {
      setCheckedIn((previous) => ({
        ...previous,
        [checkingSubject]: { passed: true, score: result.score, feedback: result.message },
      }));
      window.setTimeout(() => {
        setCheckingSubject(null);
      }, 2500);
    }
  };

  const renderDetailPanel = (subject: Subject) => (
    <div className="p-5 md:p-8 grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#86868b] uppercase tracking-wider flex items-center gap-2">
          <ListTodo className="w-4 h-4" />
          任务清单 (Tasks)
        </h3>
        <div className="space-y-2">
          {getSortedTasks(subject).length > 0 ? getSortedTasks(subject).map((task) => (
            <div key={task.id} className="flex items-center justify-between gap-3 p-3 bg-[#1c1c1e] rounded-xl border border-white/5 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                {getStatusIcon(task.status)}
                <span className={`text-sm ${task.status === 'done' ? 'text-[#86868b] line-through' : 'text-[#f5f5f7]'} font-medium break-words`}>
                  {task.title}
                </span>
              </div>
              <span className="text-xs text-[#86868b] bg-white/5 px-2 py-1 rounded-md whitespace-nowrap">{task.estimated_min} min</span>
            </div>
          )) : (
            <div className="text-sm text-[#86868b] italic">暂无任务清单</div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#86868b] uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            考试时间 (Schedules)
          </h3>
          {subject.examSchedules.length > 0 ? subject.examSchedules.map((exam, index) => (
            <div key={`${exam.date}-${index}`} className="flex flex-col gap-3 p-3 bg-[#1c1c1e] rounded-xl border border-white/5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#f5f5f7] capitalize">{exam.type} Exam</span>
                <span className="text-xs text-[#86868b]">{exam.location}</span>
              </div>
              <span className="text-sm font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full w-fit">{exam.date}</span>
            </div>
          )) : (
            <div className="text-sm text-[#86868b] italic">暂无考试时间</div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#86868b] uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4" />
            成绩记录 (Scores)
          </h3>
          {subject.scores.length > 0 ? subject.scores.map((score, index) => (
            <div key={`${score.exam_type}-${index}`} className="flex items-center justify-between gap-3 p-3 bg-[#1c1c1e] rounded-xl border border-white/5 shadow-sm">
              <span className="text-sm font-medium text-[#f5f5f7]">{score.exam_type}</span>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-sm font-bold text-green-400">{score.score}</span>
                <span className="text-xs text-[#86868b]">/ {score.max_score}</span>
              </div>
            </div>
          )) : (
            <div className="text-sm text-[#86868b] italic">暂无考核成绩</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCheckInState = (subject: Subject) => {
    const checkInData = checkedIn[subject.name];

    if (checkInData) {
      return (
        <div className="flex flex-col items-start gap-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 text-white rounded-full text-xs font-semibold shadow-inner border border-white/5">
            <CheckCircle className="w-3.5 h-3.5 text-green-400" />
            验证通过
          </span>
          {checkInData.score !== undefined && (
            <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
              <Award className="w-3 h-3" />
              AI评分: {checkInData.score}
            </span>
          )}
        </div>
      );
    }

    return (
      <button
        onClick={(event) => {
          event.stopPropagation();
          startCheckIn(subject.name);
        }}
        className="px-4 py-1.5 bg-white/10 text-white hover:bg-white/20 hover:text-white active:scale-95 rounded-full text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
      >
        <CheckCircle className="w-4 h-4" />
        提交验证
      </button>
    );
  };

  const renderSubjectTable = () => (
    <div className={`${isFloating ? 'hidden' : 'hidden md:block'} bg-[#1c1c1e] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/10 overflow-hidden`}>
      <table className="w-full text-left border-collapse">
        <thead className="bg-transparent border-b border-white/10">
          <tr>
            <th className="py-4 px-2 w-10"></th>
            <th className="py-4 px-4 font-semibold text-[#86868b] uppercase tracking-wider text-xs whitespace-nowrap">学科 (Subject)</th>
            <th className="py-4 px-6 font-semibold text-[#86868b] uppercase tracking-wider text-xs">总任务 / 当前阶段</th>
            <th className="py-4 px-6 font-semibold text-[#86868b] uppercase tracking-wider text-xs whitespace-nowrap">打卡记录 (Check-in)</th>
            <th className="py-4 px-6 font-semibold text-[#86868b] uppercase tracking-wider text-xs whitespace-nowrap">倒计时</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {subjects.map((subject) => {
            const isExpanded = expandedSubject === subject.id;
            const focusExam = getFocusExam(subject);
            const countdown = focusExam ? getCountdownLabel(focusExam.date) : { label: '暂无考试', tone: 'text-[#86868b]' };

            return (
              <AnimatePresence key={subject.id}>
                <tr
                  className={`hover:bg-[#2c2c2e]/50 transition-colors cursor-pointer ${isExpanded ? 'bg-[#2c2c2e]/30' : ''}`}
                  onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                >
                  <td className="py-4 px-2 text-center text-[#86868b]">
                    {isExpanded ? <ChevronDown className="w-5 h-5 inline-block" /> : <ChevronRight className="w-5 h-5 inline-block" />}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-[#f5f5f7]">{subject.name}</span>
                      <span className={`text-[10px] uppercase font-bold w-fit px-2 py-0.5 rounded-md border ${getColorClass(subject.color)}`}>
                        {subject.category}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#d2d2d7] font-medium text-sm flex items-start gap-2">
                        <Target className="w-4 h-4 text-[#86868b] mt-0.5 shrink-0" />
                        {subject.dailyTask}
                      </span>
                      <span className="text-xs text-[#86868b]">{getCompletionText(subject)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[#a1a1a6] whitespace-nowrap" onClick={(event) => handleCheckInAreaClick(event, subject)}>
                    {renderCheckInState(subject)}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`text-sm font-bold flex items-center gap-2 tracking-wide ${countdown.tone}`}>
                        <Calendar className="w-4 h-4" />
                        {countdown.label}
                      </span>
                      {focusExam && <span className="text-xs text-[#86868b]">{focusExam.date}</span>}
                    </div>
                  </td>
                </tr>

                {isExpanded && (
                  <motion.tr
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-black/20"
                  >
                    <td colSpan={5} className="p-0 border-b border-white/5">
                      {renderDetailPanel(subject)}
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderSubjectCards = () => (
    <div className={`${isFloating ? 'block' : 'md:hidden'} space-y-4`}>
      {subjects.map((subject) => {
        const isExpanded = expandedSubject === subject.id;
        const focusExam = getFocusExam(subject);
        const countdown = focusExam ? getCountdownLabel(focusExam.date) : { label: '暂无考试', tone: 'text-[#86868b]' };

        return (
          <div key={subject.id} className="bg-[#1c1c1e] rounded-3xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <button
              onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
              className="w-full p-4 text-left flex flex-col gap-4 hover:bg-[#2c2c2e]/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-[#f5f5f7] truncate">{subject.name}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border shrink-0 ${getColorClass(subject.color)}`}>
                      {subject.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#d2d2d7] leading-relaxed">{subject.dailyTask}</p>
                </div>
                {isExpanded ? <ChevronDown className="w-5 h-5 text-[#86868b] shrink-0" /> : <ChevronRight className="w-5 h-5 text-[#86868b] shrink-0" />}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/5 border border-white/5 p-3">
                  <div className="text-[11px] text-[#86868b] font-bold uppercase tracking-wider">进度</div>
                  <div className="mt-1 text-sm text-[#d2d2d7] font-semibold">{getCompletionText(subject).replace('子任务: ', '')}</div>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/5 p-3">
                  <div className="text-[11px] text-[#86868b] font-bold uppercase tracking-wider">考试</div>
                  <div className={`mt-1 text-sm font-bold ${countdown.tone}`}>{countdown.label}</div>
                </div>
              </div>
            </button>

            <div className="px-4 pb-4" onClick={(event) => handleCheckInAreaClick(event, subject)}>
              {renderCheckInState(subject)}
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/5 bg-black/20"
                >
                  {renderDetailPanel(subject)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );

  const renderMainState = () => {
    if (isLoading) {
      return (
        <div className="bg-[#1c1c1e] border border-white/10 rounded-3xl p-10 text-center text-[#86868b] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center justify-center gap-2 font-medium">
            <Loader2 className="w-5 h-5 animate-spin" />
            正在加载学习手册...
          </div>
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-10 text-center text-red-400 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center justify-center gap-2 font-semibold">
            <AlertCircle className="w-5 h-5" />
            {loadError}
          </div>
        </div>
      );
    }

    if (subjects.length === 0) {
      return (
        <div className="bg-[#1c1c1e] border border-white/10 rounded-3xl px-6 py-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-[#86868b]" />
          </div>
          <h2 className="text-xl font-bold text-[#f5f5f7] tracking-tight mb-2">学习手册还没有学科</h2>
          <p className="text-sm text-[#86868b] font-medium max-w-md mx-auto leading-relaxed">
            添加学科、考试时间和每日任务后，这里会生成可打卡的学习进度表。
          </p>
        </div>
      );
    }

    return (
      <>
        {renderSubjectTable()}
        {renderSubjectCards()}
      </>
    );
  };

  const content = (
    <div className={`flex-1 overflow-y-auto w-full flex flex-col bg-transparent relative ${isFloating ? 'h-full p-4' : 'p-4 md:p-6 pb-40'}`}>
      <div className="max-w-6xl mx-auto w-full">
        {!isFloating && (
          <h1 className="text-3xl font-bold text-[#f5f5f7] mb-6 flex flex-col gap-3 tracking-tight sm:flex-row sm:items-center sm:justify-between">
            学习手册 & 进度表
            {onFloat && (
              <button onClick={onFloat} className="w-full sm:w-auto text-sm px-4 py-2 bg-[#1c1c1e]/70 border border-white/10 rounded-full shadow-sm hover:bg-white/5 active:scale-95 flex items-center justify-center gap-2 transition-all">
                <Minimize2 className="w-4 h-4" />
                悬浮小窗
              </button>
            )}
          </h1>
        )}

        {(!isFloating || !isMinimized) && (
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            <div className="bg-[#1c1c1e] border border-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-xl font-bold text-[#f5f5f7] mb-3 flex items-center gap-2 tracking-tight">
                <div className="p-2 bg-white/10 text-white rounded-xl"><BookOpen className="w-5 h-5" /></div>
                每天需要学习什么？
              </h2>
              <p className="text-[#a1a1a6] leading-relaxed text-sm md:text-base font-medium">
                下方列出了每门学科的 <strong>【今日学习任务】</strong>。任务会结合考试时间、任务依赖和完成情况来帮助你安排打卡节奏。
              </p>
            </div>
            <div className="bg-[#1c1c1e] border border-white/10 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><CheckCircle className="w-32 h-32" /></div>
              <h2 className="text-xl font-bold text-[#f5f5f7] mb-3 flex items-center gap-2 tracking-tight relative z-10">
                <div className="p-2 bg-[#3a3a3c] text-[#d2d2d7] rounded-xl"><CheckCircle className="w-5 h-5" /></div>
                如何打卡？
              </h2>
              <ul className="list-disc list-inside text-[#a1a1a6] space-y-2 leading-relaxed text-sm font-medium relative z-10">
                <li><strong>提交验证：</strong> 填写学习总结后系统会给予评分与反馈。</li>
                <li><strong>查看详情：</strong> 展开学科可查看任务清单、考试时间与成绩记录。</li>
              </ul>
            </div>
          </div>
        )}

        {renderMainState()}
      </div>

      <AnimatePresence>
        {checkingSubject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[80] flex items-center justify-center p-4"
            onClick={closeVerification}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(event) => event.stopPropagation()}
              className="bg-[#1c1c1e]/95 backdrop-blur-3xl rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.2)] border border-white/10 w-full max-w-md max-h-[85vh] overflow-y-auto flex flex-col"
            >
              <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-white/10 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-[#f5f5f7] flex items-center gap-2 tracking-tight">
                  <div className="p-1.5 bg-white/10 text-white rounded-lg"><CheckCircle className="w-5 h-5" /></div>
                  AI 任务检测验证
                </h2>
                {!isVerifying && (
                  <button onClick={closeVerification} className="text-[#86868b] hover:text-[#a1a1a6] hover:bg-white/5 active:scale-95 p-1.5 rounded-full transition-all">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-[#a1a1a6] mb-4 text-sm font-medium leading-relaxed">
                  要完成 <strong>{checkingSubject}</strong> 的打卡，请简要描述你今天学到了什么，或者你是如何完成任务的。
                </p>
                <textarea
                  value={verifyInput}
                  onChange={(event) => {
                    setVerifyInput(event.target.value);
                    if (verifyInputError) setVerifyInputError('');
                  }}
                  disabled={isVerifying || verifyResult?.passed}
                  placeholder="例如：我复习了牛顿第二定律，并完成了三道历年真题..."
                  className="w-full h-28 p-4 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/10 focus:border-white/30 resize-none text-sm mb-3 bg-[#1c1c1e]/50 disabled:bg-black/5 disabled:text-[#86868b] font-medium transition-all"
                />

                {verifyInputError && (
                  <div className="p-3 rounded-2xl mb-4 text-sm font-medium bg-red-500/10 text-red-400 flex items-start gap-2" aria-live="assertive">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {verifyInputError}
                  </div>
                )}

                {verifyResult && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-2xl mb-4 text-sm font-medium ${verifyResult.passed ? 'bg-white/5 text-[#a1a1a6]' : 'bg-red-500/10 text-red-400'}`}>
                    <div className="font-bold flex items-center gap-2 mb-1">
                      {verifyResult.passed ? <CheckCircle className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4" />}
                      {verifyResult.passed ? '验证通过！' : '还需要再补充一些！'}
                    </div>
                    {verifyResult.score !== undefined && (
                      <div className="text-yellow-400 font-bold mb-2 flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        综合评分: {verifyResult.score}/100
                      </div>
                    )}
                    {verifyResult.message}
                  </motion.div>
                )}

                <button
                  onClick={submitVerification}
                  disabled={isVerifying || verifyResult?.passed}
                  className="w-full py-3 bg-white/10 text-white rounded-2xl font-semibold hover:bg-white/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 shadow-sm"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      验证中...
                    </>
                  ) : (
                    '提交检测'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (isFloating) {
    return (
      <motion.div
        drag
        dragMomentum={false}
        initial={{ x: window.innerWidth > 600 ? window.innerWidth - 600 : 20, y: 50, width: window.innerWidth > 500 ? 500 : 350, height: 600 }}
        className="fixed z-50 bg-[#1c1c1e]/90 backdrop-blur-3xl rounded-[24px] shadow-2xl border border-white/20 flex flex-col overflow-hidden resize"
        style={{
          minWidth: '300px',
          maxWidth: '90vw',
          minHeight: '200px',
          maxHeight: '90vh',
        }}
      >
        <div className="drag-handle h-12 bg-transparent border-b border-white/10 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing shrink-0">
          <div className="flex items-center gap-2 text-[#a1a1a6] font-semibold select-none">
            <Move className="w-4 h-4" />
            学习手册 (浮窗)
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/5 rounded-full text-[#86868b] transition-colors">
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-full text-[#86868b] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto flex relative">
          {content}
        </div>
      </motion.div>
    );
  }

  return content;
}
