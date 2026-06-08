import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Check, Clock, Loader2, Search, User, UserPlus, Users, X } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

type FriendProfile = {
  id: string;
  name: string;
  email: string;
  grade?: string;
  status?: 'online' | 'offline';
};

type SearchUser = {
  id: string;
  name?: string;
  email: string;
  grade?: string;
  status?: 'online' | 'offline';
};

const FRIENDS_STORAGE_KEY = 'academic-brainstorm-os:friends';
const SENT_REQUESTS_STORAGE_KEY = 'academic-brainstorm-os:sent-friend-requests';
const SEARCH_TIMEOUT_MS = 8000;

function getStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getDisplayName(profile: Pick<SearchUser, 'name' | 'email' | 'grade'>): string {
  return getStringValue(profile.name) || getStringValue(profile.grade) || profile.email.split('@')[0] || '未命名用户';
}

function getInitial(value: string): string {
  return value.trim().charAt(0).toUpperCase() || '?';
}

function normalizeStatus(value: unknown): 'online' | 'offline' {
  return value === 'online' ? 'online' : 'offline';
}

function normalizeFriend(value: unknown): FriendProfile | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const email = getStringValue(record.email);
  const id = getStringValue(record.id) || email;

  if (!id || !email) return null;

  return {
    id,
    email,
    name: getDisplayName({
      email,
      grade: getStringValue(record.grade),
      name: getStringValue(record.name),
    }),
    grade: getStringValue(record.grade) || undefined,
    status: normalizeStatus(record.status),
  };
}

function normalizeSearchUser(id: string, value: unknown): SearchUser | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const email = getStringValue(record.email).toLowerCase();

  if (!email) return null;

  return {
    id,
    email,
    name: getStringValue(record.name) || getStringValue(record.displayName) || undefined,
    grade: getStringValue(record.grade) || undefined,
    status: normalizeStatus(record.status),
  };
}

function loadStoredFriends(): FriendProfile[] {
  if (typeof window === 'undefined') return [];

  const raw = window.localStorage.getItem(FRIENDS_STORAGE_KEY);
  if (!raw) return [];

  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];

  return parsed.map(normalizeFriend).filter((friend): friend is FriendProfile => Boolean(friend));
}

function loadStoredRequests(): Record<string, boolean> {
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

function saveStoredRequests(requests: Record<string, boolean>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SENT_REQUESTS_STORAGE_KEY, JSON.stringify(requests));
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Search timed out'));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

export default function FriendsList() {
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [isFriendsLoading, setIsFriendsLoading] = useState(true);
  const [friendsError, setFriendsError] = useState('');

  const [requests, setRequests] = useState<FriendProfile[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<SearchUser[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [globalSearchError, setGlobalSearchError] = useState('');
  const [sentFriendRequests, setSentFriendRequests] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;

    setIsFriendsLoading(true);
    setFriendsError('');

    try {
      const storedFriends = loadStoredFriends();
      const storedRequests = loadStoredRequests();

      if (!isMounted) return;
      setFriends(storedFriends);
      setSentFriendRequests(storedRequests);
    } catch (error) {
      console.error('Error loading friends:', error);
      if (isMounted) {
        setFriendsError('好友列表加载失败，请刷新后重试。');
      }
    } finally {
      if (isMounted) {
        setIsFriendsLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const searchUsers = async () => {
      const normalizedQuery = globalSearchQuery.trim().toLowerCase();

      if (normalizedQuery.length < 3) {
        setGlobalSearchResults([]);
        setGlobalSearchError('');
        setIsSearchingGlobal(false);
        return;
      }

      setIsSearchingGlobal(true);
      setGlobalSearchError('');

      try {
        const usersRef = collection(db, 'users');
        const userQuery = query(
          usersRef,
          where('email', '>=', normalizedQuery),
          where('email', '<=', normalizedQuery + '\uf8ff')
        );
        const querySnapshot = await withTimeout(getDocs(userQuery), SEARCH_TIMEOUT_MS);
        const results: SearchUser[] = [];

        querySnapshot.forEach((doc) => {
          const user = normalizeSearchUser(doc.id, doc.data());
          if (user) results.push(user);
        });

        if (isActive) {
          setGlobalSearchResults(results);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        if (isActive) {
          setGlobalSearchResults([]);
          setGlobalSearchError('搜索失败，请稍后重试，或检查网络/权限设置。');
        }
      } finally {
        if (isActive) {
          setIsSearchingGlobal(false);
        }
      }
    };

    const debounce = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => {
      isActive = false;
      clearTimeout(debounce);
    };
  }, [globalSearchQuery]);

  const filteredFriends = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return friends;

    return friends.filter((friend) => {
      return `${friend.name} ${friend.email}`.toLowerCase().includes(normalizedQuery);
    });
  }, [friends, searchQuery]);

  const hasFriendSearch = searchQuery.trim().length > 0;
  const hasGlobalSearch = globalSearchQuery.trim().length >= 3;

  const isExistingFriend = (user: SearchUser) => {
    const email = user.email.toLowerCase();
    return friends.some((friend) => friend.id === user.id || friend.email.toLowerCase() === email);
  };

  const isRequestSent = (user: SearchUser) => {
    return sentFriendRequests[user.id] || sentFriendRequests[user.email.toLowerCase()];
  };

  const handleAddFriend = (user: SearchUser) => {
    if (isExistingFriend(user) || isRequestSent(user)) return;

    const nextRequests = {
      ...sentFriendRequests,
      [user.id]: true,
      [user.email.toLowerCase()]: true,
    };

    setSentFriendRequests(nextRequests);
    setGlobalSearchError('');

    try {
      saveStoredRequests(nextRequests);
    } catch (error) {
      console.error('Error saving friend request:', error);
      setGlobalSearchError('好友请求已在本页标记，但本地保存失败。');
    }
  };

  const handleAcceptRequest = (request: FriendProfile) => {
    setFriends((currentFriends) => {
      if (currentFriends.some((friend) => friend.id === request.id || friend.email === request.email)) {
        return currentFriends;
      }

      const nextFriends = [...currentFriends, request];
      try {
        window.localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(nextFriends));
      } catch (error) {
        console.error('Error saving friends:', error);
        setFriendsError('好友已在本页添加，但本地保存失败。');
      }
      return nextFriends;
    });
    setRequests((currentRequests) => currentRequests.filter((item) => item.id !== request.id));
  };

  const handleRejectRequest = (requestId: string) => {
    setRequests((currentRequests) => currentRequests.filter((item) => item.id !== requestId));
  };

  return (
    <div className="flex-1 overflow-y-auto w-full flex flex-col p-4 md:p-6 pb-40 bg-transparent items-center">
      <div className="max-w-4xl w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-white/10 text-white rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-[#f5f5f7] tracking-tight">
            好友列表 (Friends)
          </h1>
        </div>

        {requests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-[#d2d2d7] mb-4 flex items-center gap-2 tracking-tight">
              <Clock className="w-5 h-5 text-orange-500" />
              新的好友请求 (New Requests)
            </h2>
            <div className="bg-[#1c1c1e] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/10 overflow-hidden divide-y divide-black/5">
              {requests.map((request) => (
                <div key={request.id} className="flex flex-col gap-4 p-4 hover:bg-[#2c2c2e]/50 transition-colors sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg shadow-sm shrink-0">
                      {getInitial(request.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[#f5f5f7] tracking-tight truncate">{request.name}</div>
                      <div className="text-sm text-[#86868b] font-medium break-all">{request.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptRequest(request)}
                      className="p-2 text-white bg-white/5 hover:bg-emerald-100 active:scale-95 rounded-full transition-all tooltip flex items-center justify-center shadow-sm"
                      title="接受 (Accept)"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="p-2 text-rose-400 bg-rose-500/20 hover:bg-rose-100 active:scale-95 rounded-full transition-all tooltip flex items-center justify-center shadow-sm"
                      title="拒绝 (Reject)"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#d2d2d7] mb-4 flex items-center gap-2 tracking-tight">
            添加好友 (Add Friend)
          </h2>
          <div className="bg-[#1c1c1e] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/10 p-4">
            <div className="relative w-full mb-4">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]" />
              <input
                type="text"
                placeholder="通过邮箱搜索已登录平台的好友..."
                value={globalSearchQuery}
                onChange={(event) => setGlobalSearchQuery(event.target.value)}
                className="w-full bg-[#1c1c1e] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-white/10 focus:border-white/30 transition-all font-medium"
              />
            </div>

            {isSearchingGlobal ? (
              <div className="text-center text-[#86868b] py-4 text-sm font-medium flex items-center justify-center gap-2" aria-live="polite">
                <Loader2 className="w-4 h-4 animate-spin" />
                搜索中...
              </div>
            ) : globalSearchError ? (
              <div className="text-center text-red-400 py-4 text-sm font-medium flex items-center justify-center gap-2" aria-live="assertive">
                <AlertCircle className="w-4 h-4" />
                {globalSearchError}
              </div>
            ) : globalSearchResults.length > 0 ? (
              <div className="divide-y divide-black/5">
                {globalSearchResults.map((user) => {
                  const alreadyFriend = isExistingFriend(user);
                  const requestSent = isRequestSent(user);
                  const buttonLabel = alreadyFriend ? '已添加' : requestSent ? '已发送' : '添加';

                  return (
                    <div key={user.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                          {getInitial(getDisplayName(user))}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[#f5f5f7] text-sm tracking-tight truncate">{getDisplayName(user)}</div>
                          <div className="text-xs text-[#86868b] font-medium break-all">{user.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddFriend(user)}
                        disabled={alreadyFriend || requestSent}
                        className="w-full sm:w-auto px-4 py-1.5 bg-white/10 text-white rounded-full text-sm font-semibold hover:bg-white/20 active:scale-95 transition-all shadow-sm disabled:opacity-60 disabled:scale-100 disabled:cursor-default flex items-center justify-center gap-1.5"
                      >
                        {alreadyFriend || requestSent ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        {buttonLabel}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : hasGlobalSearch ? (
              <div className="text-center text-[#86868b] py-4 text-sm font-medium" aria-live="polite">
                没有找到这个邮箱账号，请确认对方已经登录过平台。
              </div>
            ) : (
              <div className="text-center text-[#86868b] py-4 text-sm font-medium">
                输入至少 3 个字符搜索邮箱
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-[#d2d2d7] flex items-center gap-2 tracking-tight">
              <User className="w-5 h-5 text-white shrink-0" />
              我的好友 (My Friends)
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]" />
              <input
                type="text"
                placeholder="搜索好友..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full bg-[#1c1c1e] border border-white/10 rounded-full pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-white/10 focus:border-white/30 transition-all font-medium shadow-sm"
              />
            </div>
          </div>

          <div className="bg-[#1c1c1e] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/10 overflow-hidden divide-y divide-black/5">
            {isFriendsLoading ? (
              <div className="p-8 text-center text-[#86868b] font-medium flex items-center justify-center gap-2" aria-live="polite">
                <Loader2 className="w-4 h-4 animate-spin" />
                正在加载好友...
              </div>
            ) : friendsError ? (
              <div className="p-8 text-center text-red-400 font-medium flex items-center justify-center gap-2" aria-live="assertive">
                <AlertCircle className="w-4 h-4" />
                {friendsError}
              </div>
            ) : filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <div key={friend.id} className="flex flex-col gap-4 p-4 hover:bg-[#2c2c2e]/50 transition-colors sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {getInitial(friend.name)}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${friend.status === 'online' ? 'bg-white/50' : 'bg-[#3a3a3c]'}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[#f5f5f7] tracking-tight truncate">{friend.name}</div>
                      <div className="text-sm text-[#86868b] font-medium break-all">{friend.email}</div>
                    </div>
                  </div>
                  <button className="w-full sm:w-auto px-4 py-2 border border-white/10 text-[#a1a1a6] rounded-full text-sm font-semibold hover:bg-[#2c2c2e] active:scale-95 transition-all shadow-sm">
                    发消息 (Message)
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[#86868b] font-medium">
                {hasFriendSearch ? '没有匹配当前关键词的好友' : '还没有好友。先在上方搜索邮箱发送好友请求。'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
