import React, { createContext, useContext, useState, useEffect } from 'react';
import { seedThreads } from '../data/seedThreads';
import { validateMessage } from '../utils/moderation';

const BoardsContext = createContext();

export const BoardsProvider = ({ children }) => {
  const [threadsByClass, setThreadsByClass] = useState({});
  const [loungeThreads, setLoungeThreads] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lmBoards_v1');
      if (saved) {
        const data = JSON.parse(saved);
        setThreadsByClass(data.threadsByClass || {});
        setLoungeThreads(data.loungeThreads || []);
      } else {
        // Initialize with seed data
        setThreadsByClass(seedThreads);
        setLoungeThreads(seedThreads.lounge || []);
        localStorage.setItem('lmBoards_v1', JSON.stringify({ threadsByClass: seedThreads, loungeThreads: seedThreads.lounge }));
      }
    } catch (e) {
      setThreadsByClass(seedThreads);
      setLoungeThreads(seedThreads.lounge || []);
    }
  }, []);

  const saveToStorage = (threads, lounge) => {
    try {
      localStorage.setItem('lmBoards_v1', JSON.stringify({ threadsByClass: threads, loungeThreads: lounge }));
    } catch (e) {}
  };

  const createThread = (classId, payload) => {
    const thread = {
      id: `thread_${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
      pinned: false,
      locked: false,
      posts: [{ id: `post_${Date.now()}`, author: payload.author, role: payload.role, text: payload.text, createdAt: new Date().toISOString(), reactions: {} }]
    };

    if (classId === 'lounge') {
      const updated = [thread, ...loungeThreads];
      setLoungeThreads(updated);
      saveToStorage(threadsByClass, updated);
      if (window.setLMMood) window.setLMMood('hyped');
    } else {
      const updated = { ...threadsByClass, [classId]: [thread, ...(threadsByClass[classId] || [])] };
      setThreadsByClass(updated);
      saveToStorage(updated, loungeThreads);
      if (payload.role === 'student' && window.setLMMood) window.setLMMood('hyped');
    }
  };

  const addPost = (threadId, payload, userId = 'user') => {
    // Validate and sanitize message
    const validation = validateMessage(payload.text, userId);
    
    if (!validation.valid) {
      // Rejected - trigger LM tired mood with gentle reminder
      if (window.setLMMood) {
        window.setLMMood('tired');
      }
      console.warn('Post rejected:', validation.reason);
      return { success: false, reason: validation.reason };
    }

    // Use sanitized text
    const post = { 
      id: `post_${Date.now()}`, 
      ...payload, 
      text: validation.sanitized,
      createdAt: new Date().toISOString(), 
      reactions: {} 
    };
    
    const updateThreads = (threads) => {
      return threads.map(t => t.id === threadId ? { ...t, posts: [...t.posts, post] } : t);
    };

    let found = false;
    const updatedByClass = {};
    Object.keys(threadsByClass).forEach(classId => {
      const threads = threadsByClass[classId];
      const updated = updateThreads(threads);
      updatedByClass[classId] = updated;
      if (updated !== threads) found = true;
    });

    if (found) {
      setThreadsByClass(updatedByClass);
      saveToStorage(updatedByClass, loungeThreads);
    } else {
      const updated = updateThreads(loungeThreads);
      setLoungeThreads(updated);
      saveToStorage(threadsByClass, updated);
    }

    // Check if this is first reply within 5 minutes
    const thread = Object.values(threadsByClass)
      .flat()
      .concat(loungeThreads)
      .find(t => t.id === threadId);
    
    if (thread && thread.posts.length === 1) {
      const threadTime = new Date(thread.createdAt).getTime();
      const now = Date.now();
      const timeDiff = now - threadTime;
      
      if (timeDiff < 5 * 60 * 1000) {
        // First reply within 5 minutes - LM proud!
        if (window.setLMMood) window.setLMMood('proud');
      }
    } else {
      if (window.setLMMood) window.setLMMood('proud');
    }

    return { success: true, post };
  };

  const togglePin = (threadId) => {
    const updateThreads = (threads) => threads.map(t => t.id === threadId ? { ...t, pinned: !t.pinned } : t);
    const updatedByClass = {};
    Object.keys(threadsByClass).forEach(classId => {
      updatedByClass[classId] = updateThreads(threadsByClass[classId]);
    });
    setThreadsByClass(updatedByClass);
    setLoungeThreads(updateThreads(loungeThreads));
    saveToStorage(updatedByClass, updateThreads(loungeThreads));
  };

  const toggleLock = (threadId) => {
    const updateThreads = (threads) => threads.map(t => t.id === threadId ? { ...t, locked: !t.locked } : t);
    const updatedByClass = {};
    Object.keys(threadsByClass).forEach(classId => {
      updatedByClass[classId] = updateThreads(threadsByClass[classId]);
    });
    setThreadsByClass(updatedByClass);
    setLoungeThreads(updateThreads(loungeThreads));
    saveToStorage(updatedByClass, updateThreads(loungeThreads));
    if (window.setLMMood) window.setLMMood('tired');
  };

  const reactToPost = (threadId, postId, emoji) => {
    const updatePosts = (threads) => {
      return threads.map(t => {
        if (t.id !== threadId) return t;
        return {
          ...t,
          posts: t.posts.map(p => {
            if (p.id !== postId) return p;
            const reactions = { ...p.reactions };
            reactions[emoji] = (reactions[emoji] || 0) + 1;
            return { ...p, reactions };
          })
        };
      });
    };

    const updatedByClass = {};
    Object.keys(threadsByClass).forEach(classId => {
      updatedByClass[classId] = updatePosts(threadsByClass[classId]);
    });
    setThreadsByClass(updatedByClass);
    setLoungeThreads(updatePosts(loungeThreads));
    saveToStorage(updatedByClass, updatePosts(loungeThreads));
  };

  const value = {
    threadsByClass,
    loungeThreads,
    createThread,
    addPost,
    togglePin,
    toggleLock,
    reactToPost
  };

  return <BoardsContext.Provider value={value}>{children}</BoardsContext.Provider>;
};

export const useBoards = () => {
  const context = useContext(BoardsContext);
  if (!context) throw new Error('useBoards must be used within BoardsProvider');
  return context;
};

export default BoardsContext;
