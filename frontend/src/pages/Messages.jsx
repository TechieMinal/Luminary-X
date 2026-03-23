import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Send, MessageSquare, ArrowLeft, Loader2, Circle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import useMessageStore from '../store/messageStore';
import useAuthStore from '../store/authStore';
import { useSocket } from '../hooks/useSocket';
import { searchUsersApi } from '../api/messages';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Messages() {
  const { user } = useAuthStore();
  const {
    conversations, messages, isLoadingConversations, isLoadingMessages,
    fetchConversations, fetchMessages, sendMessage, addIncomingMessage,
    confirmSentMessage, activeConversation, setActiveConversation, onlineUsers,
  } = useMessageStore();

  const { sendMessage: socketSend, markRead } = useSocket();
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    const userId = searchParams.get('user');
    if (userId && userId !== activeConversation) openConversation(userId, null);
  }, [searchParams]);

  useEffect(() => {
    if (activeConversation) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages[activeConversation]?.length]);

  const openConversation = useCallback(async (userId, userObj) => {
    setActiveConversation(userId);
    if (userObj) { setActiveUser(userObj); }
    else {
      const conv = conversations.find((c) => c.participant?._id === userId);
      if (conv?.participant) setActiveUser(conv.participant);
    }
    fetchMessages(userId);
    if (activeConversation) {
      const ids = [user._id, userId].sort().join('_');
      markRead(ids);
    }
    setSearchQ(''); setUserResults([]);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [conversations, fetchMessages, setActiveConversation, markRead, user, activeConversation]);

  const handleSearch = useCallback(async (q) => {
    setSearchQ(q);
    if (!q.trim()) { setUserResults([]); return; }
    setSearching(true);
    try {
      const res = await searchUsersApi(q);
      setUserResults(Array.isArray(res.data.data) ? res.data.data : []);
    } catch { setUserResults([]); }
    finally { setSearching(false); }
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConversation || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    // Try socket first, fall back to HTTP
    const tempId = `temp_${Date.now()}`;
    const sentViaSocket = socketSend(activeConversation, content, tempId);

    if (!sentViaSocket) {
      try {
        await sendMessage(activeConversation, content);
      } catch { toast.error('Failed to send message'); }
    }
    setSending(false);
  };

  const currentMessages = messages[activeConversation] || [];
  const isOnline = (id) => onlineUsers.has(id?.toString());

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-7rem)] flex rounded-2xl overflow-hidden border border-obsidian-700 bg-obsidian-900">
      {/* Sidebar */}
      <div className={`w-full sm:w-80 flex-shrink-0 border-r border-obsidian-700 flex flex-col ${activeConversation ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-4 border-b border-obsidian-700">
          <h2 className="font-display font-bold text-white mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input type="text" className="input-field pl-9 text-sm py-2.5" placeholder="Search people…"
              value={searchQ} onChange={(e) => handleSearch(e.target.value)} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {searching && <div className="flex justify-center py-4"><Spinner size="sm" /></div>}

          {searchQ && userResults.length > 0 && (
            <div className="p-2 border-b border-obsidian-700">
              <p className="text-[10px] text-slate-600 uppercase tracking-wider font-display px-3 py-1">Start conversation</p>
              {userResults.map((u) => (
                <button key={u._id} onClick={() => openConversation(u._id, u)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-obsidian-800 transition-colors text-left">
                  <div className="relative flex-shrink-0">
                    <Avatar name={u.name} avatar={u.avatar} size="sm" />
                    {isOnline(u._id) && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-aurora-400 border-2 border-obsidian-900" />}
                  </div>
                  <div><p className="text-sm font-display font-semibold text-white">{u.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{u.role}</p></div>
                </button>
              ))}
            </div>
          )}
          {searchQ && !searching && userResults.length === 0 && (
            <p className="text-center text-xs text-slate-600 py-6">No users found</p>
          )}

          {!searchQ && (
            isLoadingConversations ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="w-8 h-8 text-obsidian-600 mx-auto mb-2" />
                <p className="text-xs text-slate-600">No conversations yet</p>
                <p className="text-xs text-slate-700 mt-1">Search to start one</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const other = conv.participant;
                const isActive = activeConversation === other?._id;
                const online = isOnline(other?._id);
                return (
                  <button key={conv.conversationId} onClick={() => openConversation(other._id, other)}
                    className={`flex items-center gap-3 w-full px-4 py-3 transition-colors text-left border-b border-obsidian-800/50
                      ${isActive ? 'bg-electric-500/10 border-l-2 border-l-electric-500' : 'hover:bg-obsidian-800/50'}`}>
                    <div className="relative flex-shrink-0">
                      <Avatar name={other?.name} avatar={other?.avatar} size="sm" />
                      {online && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-aurora-400 border-2 border-obsidian-900" />}
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-electric-500 text-white text-[9px] font-bold flex items-center justify-center">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className={`text-sm font-display font-semibold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>{other?.name}</p>
                        <span className="text-[10px] text-slate-600 flex-shrink-0 ml-2">{timeAgo(conv.lastMessage?.createdAt)}</span>
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? 'text-white font-medium' : 'text-slate-500'}`}>
                        {conv.lastMessage?.sender?.toString() === user?._id?.toString() ? 'You: ' : ''}
                        {conv.lastMessage?.content}
                      </p>
                    </div>
                  </button>
                );
              })
            )
          )}
        </div>
      </div>

      {/* Chat panel */}
      <div className={`flex-1 flex flex-col min-w-0 ${activeConversation ? 'flex' : 'hidden sm:flex'}`}>
        {!activeConversation ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState icon={MessageSquare} title="Select a conversation"
              description="Choose someone to message or search by name" />
          </div>
        ) : (
          <>
            <div className="h-14 border-b border-obsidian-700 flex items-center px-4 gap-3 flex-shrink-0">
              <button onClick={() => setActiveConversation(null)} className="sm:hidden btn-ghost p-1.5">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="relative flex-shrink-0">
                <Avatar name={activeUser?.name} avatar={activeUser?.avatar} size="sm" />
                {isOnline(activeUser?._id) && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-aurora-400 border-2 border-obsidian-900" />
                )}
              </div>
              <div>
                <p className="text-sm font-display font-semibold text-white">{activeUser?.name ?? '…'}</p>
                <p className={`text-xs ${isOnline(activeUser?._id) ? 'text-aurora-400' : 'text-slate-500'}`}>
                  {isOnline(activeUser?._id) ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {isLoadingMessages ? (
                <div className="flex justify-center pt-8"><Spinner /></div>
              ) : currentMessages.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-500 text-sm">No messages yet. Say hi! 👋</p>
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const senderId = msg.sender?._id ?? msg.sender;
                  const isMine = senderId?.toString() === user?._id?.toString();
                  return (
                    <div key={msg._id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      {!isMine && (
                        <Avatar name={activeUser?.name} avatar={activeUser?.avatar} size="xs" className="mb-1 flex-shrink-0" />
                      )}
                      <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                        ${isMine
                          ? 'bg-electric-500 text-white rounded-br-sm'
                          : 'bg-obsidian-800 text-slate-200 border border-obsidian-700 rounded-bl-sm'}`}>
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <p className={`text-[10px] mt-1 select-none ${isMine ? 'text-white/50' : 'text-slate-600'}`}>
                          {timeAgo(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-obsidian-700 flex gap-3">
              <input ref={inputRef} type="text" className="input-field flex-1 text-sm" placeholder="Type a message…"
                value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                maxLength={2000} />
              <button type="submit" className="btn-primary px-4 py-2.5 flex-shrink-0"
                disabled={!input.trim() || sending}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
