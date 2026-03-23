import { create } from 'zustand';
import {
  getConversationsApi,
  getMessagesApi,
  sendMessageApi,
  getUnreadCountApi,
} from '../api/messages';

const useMessageStore = create((set, get) => ({
  conversations: [],
  messages: {},
  activeConversation: null,
  unreadCount: 0,
  onlineUsers: new Set(),
  isLoadingConversations: false,
  isLoadingMessages: false,

  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const res = await getConversationsApi();
      set({ conversations: Array.isArray(res.data.data) ? res.data.data : [] });
    } catch {
      set({ conversations: [] });
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  fetchMessages: async (userId, page = 1) => {
    set({ isLoadingMessages: true });
    try {
      const res = await getMessagesApi(userId, { page, limit: 30 });
      const msgs = Array.isArray(res.data.data) ? res.data.data : [];
      set((state) => ({
        messages: {
          ...state.messages,
          [userId]: page === 1 ? msgs : [...msgs, ...(state.messages[userId] || [])],
        },
      }));
    } catch { /* keep existing */ }
    finally { set({ isLoadingMessages: false }); }
  },

  sendMessage: async (receiverId, content) => {
    const res = await sendMessageApi({ receiverId, content });
    const newMsg = res.data.data;
    set((state) => ({
      messages: {
        ...state.messages,
        [receiverId]: [...(state.messages[receiverId] || []), newMsg],
      },
    }));
    get().fetchConversations();
    return newMsg;
  },

  // Called by socket when a real-time message arrives
  addIncomingMessage: (message) => {
    const senderId = message.sender?._id || message.sender;
    set((state) => {
      const existing = state.messages[senderId] || [];
      // Avoid duplicates (message may come via HTTP and socket)
      if (existing.some((m) => m._id === message._id)) return {};
      return {
        messages: {
          ...state.messages,
          [senderId]: [...existing, message],
        },
      };
    });
    // Refresh conversations sidebar
    get().fetchConversations();
  },

  // Called when socket confirms a sent message (replace optimistic)
  confirmSentMessage: (tempId, message) => {
    const receiverId = message.receiver?._id || message.receiver;
    set((state) => ({
      messages: {
        ...state.messages,
        [receiverId]: (state.messages[receiverId] || []).map((m) =>
          m._id === tempId ? message : m
        ),
      },
    }));
  },

  fetchUnreadCount: async () => {
    try {
      const res = await getUnreadCountApi();
      set({ unreadCount: res.data.data?.count ?? 0 });
    } catch { /* silent */ }
  },

  setUnreadCount: (count) => set({ unreadCount: count }),

  setOnlineUsers: (usersOrUpdater) => {
    if (typeof usersOrUpdater === 'function') {
      set((state) => ({ onlineUsers: usersOrUpdater(state.onlineUsers) }));
    } else {
      set({ onlineUsers: usersOrUpdater });
    }
  },

  setActiveConversation: (userId) => set({ activeConversation: userId }),

  clearMessages: () =>
    set({ messages: {}, conversations: [], activeConversation: null, unreadCount: 0 }),
}));

export default useMessageStore;
