import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, generateChatResponseStream, extractTasksFromChat, TaskItem } from '../services/ai';
import StudyHandbook from '../components/StudyHandbook';
import Leaderboard from '../components/Leaderboard';
import FriendsList from '../components/FriendsList';
import { isGeminiModel } from '../config/models';
import ChatEmptyState from '../features/chat/ChatEmptyState';
import ChatHistoryModal from '../features/chat/ChatHistoryModal';
import ChatInput from '../features/chat/ChatInput';
import ChatMessageList from '../features/chat/ChatMessageList';
import TaskExtractionModal from '../features/chat/TaskExtractionModal';
import type { SelectedChatFile } from '../features/chat/types';
import AppHeader from '../features/layout/AppHeader';
import AppSidebar from '../features/layout/AppSidebar';
import type { AppTab } from '../features/layout/types';
import QuestionBank from '../features/question-bank/QuestionBank';
import SettingsDrawer from '../features/settings/SettingsDrawer';
import {
  DEFAULT_SETTINGS,
  PERSONALITIES,
  SYSTEM_NAME_EN,
  SYSTEM_NAME_ZH,
  buildSystemPrompt,
} from '../features/settings/constants';
import {
  getFontClass,
  getLayoutClass,
  getThemeBackgroundClass,
  getThemeBackgroundGradient,
  getThemeColorClass,
} from '../features/settings/themeClasses';
import type { AppSettings, Personality } from '../features/settings/types';

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
  personality?: Personality;
}

import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEYS = {
  sessions: 'academic-brainstorm-os:sessions',
  activeSessionId: 'academic-brainstorm-os:active-session-id',
  settings: 'academic-brainstorm-os:settings',
};

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch (error) {
    console.warn(`Failed to load ${key}`, error);
    return fallback;
  }
}

function getInitialSettings(): AppSettings {
  const saved = loadJson<Partial<AppSettings>>(STORAGE_KEYS.settings, {});
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    model: isGeminiModel(saved.model) ? saved.model : DEFAULT_SETTINGS.model,
  };
}

function getInitialSessions(): ChatSession[] {
  const saved = loadJson<unknown>(STORAGE_KEYS.sessions, []);
  if (!Array.isArray(saved)) return [];

  return saved.filter((session): session is ChatSession => {
    if (!session || typeof session !== 'object') return false;
    const value = session as Partial<ChatSession>;
    return (
      typeof value.id === 'string' &&
      typeof value.title === 'string' &&
      Array.isArray(value.messages) &&
      typeof value.updatedAt === 'number'
    );
  });
}

function getInitialActiveSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(STORAGE_KEYS.activeSessionId);
}

export default function MainApp() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AppTab>('chat');
  const [sessions, setSessions] = useState<ChatSession[]>(getInitialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(getInitialActiveSessionId);
  
  const [isHandbookFloating, setIsHandbookFloating] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>(getInitialSettings);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isExtractingTasks, setIsExtractingTasks] = useState(false);
  const [isSyncingNotion, setIsSyncingNotion] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<TaskItem[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedChatFile | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const hasBootstrappedSession = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId, isGenerating]);
  
  useEffect(() => {
    if (sessions.length === 0) {
      if (!hasBootstrappedSession.current) {
        hasBootstrappedSession.current = true;
        handleNewChat();
      }
      return;
    }

    if (!activeSessionId || !sessions.some((session) => session.id === activeSessionId)) {
      setActiveSessionId(sessions[0].id);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (activeSessionId) {
      window.localStorage.setItem(STORAGE_KEYS.activeSessionId, activeSessionId);
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.activeSessionId);
    }
  }, [activeSessionId]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }, [settings]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch(err) {
      console.error(err);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const activeMessages = activeSession?.messages || [];

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: settings.language === 'zh' ? '新对话' : 'New Chat',
      messages: [],
      updatedAt: Date.now(),
      personality: settings.personality
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    if(window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (activeSessionId === id) {
      setActiveSessionId(newSessions.length > 0 ? newSessions[0].id : null);
    }
  };

  const handleStartChat = () => {
    setActiveTab('chat');
    handleNewChat();
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    if(window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleExportCSV = () => {
    if (!activeSession) return;
    const headers = settings.language === 'zh' ? ['发送者', '内容'] : ['Role', 'Message'];
    const rows = activeSession.messages.map(msg => {
       const role = msg.role === 'user' ? (settings.language === 'zh' ? '我' : 'Me') : t.sysName;
       const text = `"${msg.text.replace(/"/g, '""')}"`;
       return `${role},${text}`;
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeSession.title || 'chat'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExtractTasks = async () => {
    if (!activeSession || activeSession.messages.length === 0) return;
    setIsTaskModalOpen(true);
    setIsExtractingTasks(true);
    try {
      const tasks = await extractTasksFromChat(activeSession.messages, settings.model);
      setExtractedTasks(tasks);
    } catch(err) {
      console.error(err);
    } finally {
      setIsExtractingTasks(false);
    }
  };

  const handleSyncToNotion = async () => {
    if (extractedTasks.length === 0) return;
    setIsSyncingNotion(true);
    try {
      const res = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tasks: extractedTasks,
          title: activeSession?.title
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(settings.language === 'zh' ? `成功同步 ${data.count} 个任务至 Notion` : `Successfully synced ${data.count} tasks to Notion`);
        setIsTaskModalOpen(false);
      } else {
        alert(data.error || 'Failed to sync');
      }
    } catch(err) {
      alert('Error communicating with server');
    } finally {
      setIsSyncingNotion(false);
    }
  };

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = error => reject(error);
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    let preview = '';
    if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
    }
    
    try {
        const base64Data = await toBase64(file);
        setSelectedFile({
            name: file.name,
            file,
            preview,
            mimeType: file.type,
            data: base64Data
        });
    } catch (error) {
        console.error("Failed to read file", error);
    }
    e.target.value = ''; // Reset
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(settings.language === 'zh' ? '当前浏览器不支持语音识别' : 'Speech recognition not supported');
      return;
    }
    
    if (isListening) return;

    const recognition = new SpeechRecognition();
    recognition.lang = settings.language === 'zh' ? 'zh-CN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + speechResult);
      setIsListening(false);
    };
    
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;
    if (!activeSessionId) return;

    const userText = input.trim();
    setInput('');
    
    let currentFiles: ChatMessage['files'] = undefined;
    if (selectedFile) {
        currentFiles = [{
            mimeType: selectedFile.mimeType,
            data: selectedFile.data,
            name: selectedFile.name
        }];
        setSelectedFile(null);
    }

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      files: currentFiles
    };
    
    // We need to construct the updated messages synchronously before the async API call
    let newMessages = activeSession ? [...activeSession.messages, newUserMsg] : [newUserMsg];
    
    setSessions(prev => {
        return prev.map(s => {
            if (s.id === activeSessionId) {
                const newTitle = s.messages.length === 0 && userText ? userText.substring(0, 20) : s.title;
                return { ...s, title: newTitle, messages: newMessages, updatedAt: Date.now() };
            }
            return s;
        });
    });

    setIsGenerating(true);

    const modelMsgId = (Date.now() + 1).toString();
    const newModelMsg: ChatMessage = {
      id: modelMsgId,
      role: 'model',
      text: ''
    };

    setSessions(prev => {
        return prev.map(s => {
            if (s.id === activeSessionId) {
                return { ...s, messages: [...s.messages, newModelMsg], updatedAt: Date.now() };
            }
            return s;
        });
    });

    try {
        const sysPrompt = buildSystemPrompt(settings.personality, settings.language);
        await generateChatResponseStream(newMessages, sysPrompt, settings.model, (chunk) => {
             setSessions(prev => {
                 return prev.map(s => {
                     if (s.id === activeSessionId) {
                         const msgs = [...s.messages];
                         const lastMsg = msgs[msgs.length - 1];
                         if (lastMsg && lastMsg.id === modelMsgId) {
                             msgs[msgs.length - 1] = { ...lastMsg, text: chunk };
                         }
                         return { ...s, messages: msgs, updatedAt: Date.now() };
                     }
                     return s;
                 });
             });
        });

    } catch (error) {
        console.error("Chat generation failed:", error);
        const errorText = settings.language === 'zh'
          ? `生成回复时出错：${error instanceof Error ? error.message : String(error)}`
          : `Sorry, an error occurred while generating the response: ${error instanceof Error ? error.message : String(error)}`;
        setSessions(prev => {
            return prev.map(s => {
                if (s.id === activeSessionId) {
                    const messages = s.messages.map(msg => (
                      msg.id === modelMsgId ? { ...msg, text: errorText } : msg
                    ));
                    return { ...s, messages, updatedAt: Date.now() };
                }
                return s;
            });
        });
    } finally {
        setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  const filteredSessions = sessions.filter(s => {
      const query = searchQuery.toLowerCase();
      if (!query) return true;

      if (s.title.toLowerCase().includes(query)) return true;

      if (s.personality) {
          if (PERSONALITIES[s.personality].nameZh.toLowerCase().includes(query)) return true;
          if (PERSONALITIES[s.personality].nameEn.toLowerCase().includes(query)) return true;
      }

      const dateStr = new Date(s.updatedAt).toLocaleDateString(settings.language === 'zh' ? 'zh-CN' : 'en-US');
      if (dateStr.includes(query)) return true;

      const hasMatchingMessage = s.messages.some(m => m.text.toLowerCase().includes(query));
      if (hasMatchingMessage) return true;

      return false;
  });

  const t = {
    sysName: settings.systemName || (settings.language === 'zh' ? SYSTEM_NAME_ZH : SYSTEM_NAME_EN),
    newChat: settings.language === 'zh' ? '新建会话' : 'New Chat',
    history: settings.language === 'zh' ? '历史记录' : 'History',
    search: settings.language === 'zh' ? '搜索历史...' : 'Search history...',
    collapse: settings.language === 'zh' ? '收起' : 'Collapse',
    expand: settings.language === 'zh' ? '展开' : 'Expand',
    introTitle: settings.language === 'zh' ? '欢迎来到动态学术共创系统' : 'Welcome to Academic Brainstorm OS',
    introSub: settings.language === 'zh' ? '在这里释放你的学术创造力，我将以独特的视角与你共创知识。' : 'Unleash your academic creativity. I will co-create knowledge with you from unique perspectives.',
    recommendTitle: settings.language === 'zh' ? '推荐话题' : 'Recommended Topics',
    topics: settings.language === 'zh' ? [
        "生成一份量子物理实验设计与A-Level考点分析",
        "随机测试一道 IB Math AA 微积分大题",
        "讲解一道 A-Level Chemistry 有机化学历年真题",
        "帮我梳理 IB Economics 宏观经济学术语库",
    ] : [
        "Generate a quantum physics experiment design & A-Level points",
        "Give me a random IB Math AA Calculus past paper question",
        "Explain an A-Level Chemistry Organic Chemistry past paper",
        "Help me review IB Economics Macroeconomics terms",
    ],
    typePlaceholder: settings.language === 'zh' ? '输入你的想法...' : 'Type your thoughts...',
    listening: settings.language === 'zh' ? '正在聆听...' : 'Listening...',
    settings: settings.language === 'zh' ? '系统设置' : 'Settings',
    tableView: settings.language === 'zh' ? '聊天记录表格与导出' : 'Chat History Table & Export',
  };

  return (
    <div className={`flex h-screen w-full text-[#f5f5f7] overflow-hidden ${getFontClass(settings.fontFamily)} ${getThemeColorClass(settings.themeColor)} ${settings.themeMode === 'light' ? 'light bg-[#fafafa]' : getThemeBackgroundClass(settings.themeBackground)} ${getLayoutClass(settings.layout)}`}>
      <AppSidebar
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        activeSessionId={activeSessionId}
        sessions={filteredSessions}
        searchQuery={searchQuery}
        systemName={t.sysName}
        searchPlaceholder={t.search}
        historyLabel={t.history}
        collapseLabel={t.collapse}
        settingsLabel={t.settings}
        onClose={() => setIsSidebarOpen(false)}
        onStartChat={handleStartChat}
        onSelectTab={setActiveTab}
        onSearchChange={setSearchQuery}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col relative w-full overflow-hidden shrink min-w-0 bg-transparent">
        <AppHeader
          isSidebarOpen={isSidebarOpen}
          systemName={t.sysName}
          expandLabel={t.expand}
          settingsLabel={t.settings}
          tableViewLabel={t.tableView}
          taskSyncLabel={settings.language === 'zh' ? '提取任务并同步' : 'Extract Tasks & Sync'}
          hasActiveSessionMessages={Boolean(activeSession && activeSession.messages.length > 0)}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onExtractTasks={handleExtractTasks}
          onOpenTable={() => setIsTableModalOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {activeTab === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto w-full flex flex-col pt-4">
              {activeMessages.length === 0 ? (
                <ChatEmptyState
                  introTitle={t.introTitle}
                  topics={t.topics}
                  onTopicSelect={(topic) => setInput(topic)}
                />
          ) : (
            <ChatMessageList
              messages={activeMessages}
              language={settings.language}
              systemName={t.sysName}
              isGenerating={isGenerating}
              chatEndRef={chatEndRef}
            />
          )}
        </div>

        <ChatInput
          hasMessages={activeMessages.length > 0}
          input={input}
          selectedFile={selectedFile}
          isListening={isListening}
          isGenerating={isGenerating}
          typePlaceholder={t.typePlaceholder}
          listeningLabel={t.listening}
          backgroundGradientClass={getThemeBackgroundGradient(settings.themeBackground)}
          onInputChange={setInput}
          onKeyDown={handleKeyDown}
          onFileUpload={handleFileUpload}
          onRemoveSelectedFile={() => setSelectedFile(null)}
          onVoiceInput={handleVoiceInput}
          onStopListening={() => setIsListening(false)}
          onSend={handleSend}
        />
        </>
        )}
        
        {activeTab === 'question-bank' && <QuestionBank />}
        {activeTab === 'handbook' && !isHandbookFloating && <StudyHandbook onFloat={() => setIsHandbookFloating(true)} />}
        {activeTab === 'leaderboard' && <Leaderboard />}
        {activeTab === 'friends' && <FriendsList />}

        {isHandbookFloating && (
           <StudyHandbook isFloating={true} onClose={() => setIsHandbookFloating(false)} />
        )}

      </div>

      <SettingsDrawer
        isOpen={isSettingsOpen}
        settings={settings}
        setSettings={setSettings}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ChatHistoryModal
        isOpen={isTableModalOpen && Boolean(activeSession)}
        title={activeSession?.title || ''}
        messages={activeSession?.messages || []}
        language={settings.language}
        systemName={t.sysName}
        onClose={() => setIsTableModalOpen(false)}
        onExportCSV={handleExportCSV}
      />

      <TaskExtractionModal
        isOpen={isTaskModalOpen}
        title={activeSession?.title}
        language={settings.language}
        tasks={extractedTasks}
        isExtractingTasks={isExtractingTasks}
        isSyncingNotion={isSyncingNotion}
        onClose={() => setIsTaskModalOpen(false)}
        onSyncToNotion={handleSyncToNotion}
      />
    </div>
  );
}
