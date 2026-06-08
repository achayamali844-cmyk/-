import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Check, Crown, Loader2, Medal, Search, Trophy, UserPlus, X } from 'lucide-react';

type LeaderProfile = {
  id: string;
  name: string;
  email: string;
  score: number;
};

type FriendCandidate = {
  id: string;
  name: string;
  email: string;
  grade: string;
};

const LEADERBOARD_STORAGE_KEY = 'academic-brainstorm-os:leaderboard-leaders';
const SENT_REQUESTS_STORAGE_KEY = 'academic-brainstorm-os:leaderboard-sent-requests';

const LOCAL_FRIEND_CANDIDATES: FriendCandidate[] = [
  { id: 'local-alex', name: 'Alex Chen', email: 'alex.chen@example.com', grade: 'G11' },
  { id: 'local-maya', name: 'Maya Li', email: 'maya.li@example.com', grade: 'G12' },
  { id: 'local-river', name: 'River Zhang', email: 'river.zhang@example.com', grade: 'G10' },
];

function getStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeLeader(value: unknown): LeaderProfile | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const id = getStringValue(record.id);
  const email = getStringValue(record.email);
  const name = getStringValue(record.name) || email.split('@')[0];
  const score = typeof record.score === 'number' ? record.score : Number(record.score);

  if (!id || !email || !name || !Number.isFinite(score)) return null;

  return {
    id,
    name,
    email,
    score: Math.max(0, Math.round(score)),
  };
}

function loadStoredLeaders(): LeaderProfile[] {
  if (typeof window === 'undefined') return [];

  const raw = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);
  if (!raw) return [];

  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map(normalizeLeader)
    .filter((leader): leader is LeaderProfile => Boolean(leader))
    .sort((a, b) => b.score - a.score);
}

function loadSentRequests(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};

  const raw = window.localStorage.getItem(SENT_REQUESTS_STORAGE_KEY);
  if (!raw) return {};

  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

  return Object.fromEntries(
    Object.entries(parsed).filter((entry): entry is [string, boolean] => {
      const [key, value] = entry;
      return typeof key === 'string' && value === true;
    })
  );
}

function saveSentRequests(requests: Record<string, boolean>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SENT_REQUESTS_STORAGE_KEY, JSON.stringify(requests));
}

function getInitial(value: string): string {
  return value.trim().charAt(0).toUpperCase() || '?';
}

export default function Leaderboard() {
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<FriendCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});
  const [lastActionMessage, setLastActionMessage] = useState('');

  const [leaders, setLeaders] = useState<LeaderProfile[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState('');

  useEffect(() => {
    let isMounted = true;

    setIsLeaderboardLoading(true);
    setLeaderboardError('');

    const timer = window.setTimeout(() => {
      try {
        const storedLeaders = loadStoredLeaders();
        const storedRequests = loadSentRequests();

        if (!isMounted) return;
        setLeaders(storedLeaders);
        setSentRequests(storedRequests);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        if (isMounted) {
          setLeaderboardError('排行榜加载失败，请刷新页面后重试。');
        }
      } finally {
        if (isMounted) {
          setIsLeaderboardLoading(false);
        }
      }
    }, 350);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, []);

  const sortedLeaders = useMemo(() => {
    return [...leaders].sort((a, b) => b.score - a.score);
  }, [leaders]);

  const sentRequestCount = useMemo(() => {
    const uniqueCandidateIds = LOCAL_FRIEND_CANDIDATES.filter((candidate) => sentRequests[candidate.id]).length;
    return uniqueCandidateIds;
  }, [sentRequests]);

  const resetModalSearch = () => {
    setSearchEmail('');
    setSearchResults([]);
    setSearchError('');
    setLastActionMessage('');
    setIsSearching(false);
  };

  const openAddFriendModal = () => {
    setIsAddFriendOpen(true);
    setSearchError('');
    setLastActionMessage('');
  };

  const closeAddFriendModal = () => {
    setIsAddFriendOpen(false);
    resetModalSearch();
  };

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();

    const normalizedEmail = searchEmail.trim().toLowerCase();
    if (!normalizedEmail) return;

    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);
    setLastActionMessage('');

    window.setTimeout(() => {
      const results = LOCAL_FRIEND_CANDIDATES.filter((candidate) => {
        return candidate.email.toLowerCase().includes(normalizedEmail);
      });

      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('本地演示名单中没有这个邮箱，换一个邮箱试试。');
      }
      setIsSearching(false);
    }, 400);
  };

  const handleAddFriend = (candidate: FriendCandidate) => {
    if (sentRequests[candidate.id]) return;

    const nextRequests = {
      ...sentRequests,
      [candidate.id]: true,
      [candidate.email.toLowerCase()]: true,
    };

    setSentRequests(nextRequests);
    setSearchError('');
    setLastActionMessage(`已向 ${candidate.name} 发送好友请求。`);

    try {
      saveSentRequests(nextRequests);
    } catch (error) {
      console.error('Error saving friend request:', error);
      setLastActionMessage('请求已在本页标记，但本地保存失败。');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto w-full flex flex-col p-4 md:p-6 pb-40 bg-transparent items-center relative">
      <div className="max-w-4xl w-full">
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between md:mb-10">
          <h1 className="text-3xl font-bold text-[#f5f5f7] flex items-center gap-3 tracking-tight leading-tight">
            <Crown className="w-8 h-8 text-yellow-500 shrink-0" />
            <span>排行榜 (Leaderboard)</span>
          </h1>
          <button
            onClick={openAddFriendModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 active:scale-95 transition-all tooltip shadow-sm"
            title="添加好友 (Add Friend)"
          >
            <UserPlus className="w-4 h-4" />
            添加好友
          </button>
        </div>

        {isLeaderboardLoading ? (
          <div className="bg-[#1c1c1e] border border-white/10 rounded-3xl p-10 text-center text-[#86868b] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-center gap-2 font-medium">
              <Loader2 className="w-5 h-5 animate-spin" />
              正在加载排行榜...
            </div>
          </div>
        ) : leaderboardError ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-10 text-center text-red-400 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-center gap-2 font-semibold">
              <AlertCircle className="w-5 h-5" />
              {leaderboardError}
            </div>
          </div>
        ) : sortedLeaders.length === 0 ? (
          <div className="bg-[#1c1c1e] border border-white/10 rounded-3xl px-6 py-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-[#86868b]" />
            </div>
            <h2 className="text-xl font-bold text-[#f5f5f7] tracking-tight mb-2">
              还没有可展示的好友排名
            </h2>
            <p className="text-sm text-[#86868b] font-medium max-w-md mx-auto leading-relaxed">
              添加好友后，这里会按学习积分展示彼此的排名。先发送一个好友请求，等对方通过后再开始比较进度。
            </p>
            {sentRequestCount > 0 && (
              <p className="mt-4 text-sm text-green-400 font-semibold">
                已发送 {sentRequestCount} 个好友请求，等待对方通过。
              </p>
            )}
            <button
              onClick={openAddFriendModal}
              className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              添加好友
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-center gap-4 mb-12 h-48">
              {sortedLeaders.length > 1 && (
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center min-w-0">
                  <div className="w-16 h-16 bg-[#3a3a3c] rounded-full flex items-center justify-center mb-3 shadow-md border-4 border-white/20">
                    <span className="font-bold text-[#86868b] text-xl">2</span>
                  </div>
                  <div className="bg-[#3a3a3c] w-24 h-24 rounded-t-xl flex flex-col items-center justify-start pt-4 shadow-inner relative overflow-hidden px-2">
                    <div className="font-bold text-[#d2d2d7] truncate max-w-full">{sortedLeaders[1].name}</div>
                    <div className="text-sm text-[#a1a1a6]">{sortedLeaders[1].score} pts</div>
                  </div>
                </motion.div>
              )}

              {sortedLeaders.length > 0 && (
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center min-w-0">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-3 shadow-lg border-4 border-yellow-400 relative">
                    <Crown className="w-8 h-8 text-yellow-500 absolute -top-5" />
                    <span className="font-bold text-yellow-600 text-2xl">1</span>
                  </div>
                  <div className="bg-yellow-400 w-28 h-32 rounded-t-xl flex flex-col items-center justify-start pt-4 shadow-inner relative overflow-hidden px-2">
                    <div className="font-bold text-yellow-900 truncate max-w-full">{sortedLeaders[0].name}</div>
                    <div className="text-sm text-yellow-800">{sortedLeaders[0].score} pts</div>
                  </div>
                </motion.div>
              )}

              {sortedLeaders.length > 2 && (
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center min-w-0">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3 shadow-md border-4 border-orange-300">
                    <span className="font-bold text-orange-600 text-xl">3</span>
                  </div>
                  <div className="bg-orange-300 w-24 h-20 rounded-t-xl flex flex-col items-center justify-start pt-4 shadow-inner relative overflow-hidden px-2">
                    <div className="font-bold text-orange-900 truncate max-w-full">{sortedLeaders[2].name}</div>
                    <div className="text-sm text-orange-800">{sortedLeaders[2].score} pts</div>
                  </div>
                </motion.div>
              )}
            </div>

            {sortedLeaders.length > 3 && (
              <div className="bg-[#1c1c1e] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/10 overflow-hidden">
                {sortedLeaders.slice(3).map((leader, index) => (
                  <div key={leader.id} className="flex items-center justify-between gap-4 p-4 border-b border-white/10 last:border-none hover:bg-[#2c2c2e]/50 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="w-8 h-8 flex items-center justify-center font-bold text-[#86868b] shrink-0">{index + 4}</span>
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                        {getInitial(leader.name)}
                      </div>
                      <span className="font-semibold text-[#d2d2d7] tracking-tight truncate">{leader.name}</span>
                    </div>
                    <span className="font-bold text-[#86868b] whitespace-nowrap">{leader.score} pts</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {isAddFriendOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={closeAddFriendModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(event) => event.stopPropagation()}
              className="bg-[#1c1c1e]/90 backdrop-blur-3xl rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.2)] border border-white/10 w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-white/10 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-[#f5f5f7] tracking-tight">添加好友</h2>
                <button onClick={closeAddFriendModal} className="text-[#86868b] hover:text-[#a1a1a6] hover:bg-white/5 active:scale-95 p-1.5 rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 sm:p-6">
                <form onSubmit={handleSearch} className="flex flex-col gap-4 mb-5">
                  <label className="text-sm font-medium text-[#a1a1a6]">
                    通过邮箱搜索本地演示用户:
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="email"
                      required
                      placeholder="alex.chen@example.com"
                      value={searchEmail}
                      onChange={(event) => setSearchEmail(event.target.value)}
                      className="min-w-0 flex-1 px-4 py-2.5 border border-white/10 rounded-xl focus:outline-none focus:ring-4 focus:ring-white/10 focus:border-white/30 bg-[#1c1c1e]/50 transition-all font-medium text-sm"
                    />
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="w-full sm:w-auto px-4 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm font-semibold text-sm"
                    >
                      {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      搜索
                    </button>
                  </div>
                  <p className="text-xs text-[#86868b] font-medium">
                    可试试 alex.chen@example.com、maya.li@example.com 或 river.zhang@example.com。
                  </p>
                </form>

                <div className="flex flex-col gap-3">
                  {isSearching && (
                    <div className="text-center text-[#86868b] py-4 text-sm font-medium flex items-center justify-center gap-2" aria-live="polite">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      正在搜索...
                    </div>
                  )}

                  {!isSearching && searchError && (
                    <div className="text-center text-red-400 py-4 text-sm font-medium flex items-center justify-center gap-2" aria-live="assertive">
                      <AlertCircle className="w-4 h-4" />
                      {searchError}
                    </div>
                  )}

                  {!isSearching && lastActionMessage && (
                    <div className="text-center text-green-400 py-3 text-sm font-semibold flex items-center justify-center gap-2" aria-live="polite">
                      <Check className="w-4 h-4" />
                      {lastActionMessage}
                    </div>
                  )}

                  {!isSearching && searchResults.map((user) => {
                    const hasSentRequest = sentRequests[user.id];

                    return (
                      <div key={user.id} className="flex flex-col gap-3 p-3 bg-[#1c1c1e]/50 border border-white/10 rounded-2xl shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                            {getInitial(user.name)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-[#f5f5f7] tracking-tight truncate">{user.name}</span>
                            <span className="text-xs text-[#86868b] font-medium break-all">{user.email}</span>
                            <span className="text-[11px] text-[#86868b] font-semibold">{user.grade}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddFriend(user)}
                          disabled={hasSentRequest}
                          className="w-full sm:w-auto px-4 py-1.5 bg-white/10 text-white rounded-full text-sm font-semibold hover:bg-white/20 active:scale-95 transition-all shadow-sm disabled:opacity-60 disabled:scale-100 disabled:cursor-default flex items-center justify-center gap-1.5"
                        >
                          {hasSentRequest ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                          {hasSentRequest ? '已发送' : '添加'}
                        </button>
                      </div>
                    );
                  })}

                  {!isSearching && !searchError && searchResults.length === 0 && !searchEmail && (
                    <div className="text-sm text-[#86868b] text-center py-4 font-medium flex flex-col items-center gap-2">
                      <Medal className="w-5 h-5" />
                      搜索好友后，可以在这里发送请求。
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
