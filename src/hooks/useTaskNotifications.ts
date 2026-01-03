import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, Task, getUserTasks, markTaskAsRead } from '../lib/supabase';

interface UseTaskNotificationsReturn {
  tasks: Task[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (taskId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Play a pleasant notification sound
 * Uses Web Audio API to generate a soft, positive chime
 */
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Pleasant chime: two-tone ascending melody
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

    oscillator.type = 'sine'; // Soft sine wave
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01); // Soft volume
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);

    // Cleanup
    oscillator.onended = () => {
      audioContext.close();
    };
  } catch (error) {
    // Fallback: silent fail if audio context not available
    console.debug('[useTaskNotifications] Audio context not available:', error);
  }
};

/**
 * Hook for real-time task notifications
 * Subscribes to task changes for the current user
 */
export function useTaskNotifications(participantId: string | null): UseTaskNotificationsReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousUnreadCountRef = useRef<number>(0);

  // Calculate unread count
  const unreadCount = tasks.filter(task => !task.is_read).length;

  // Fetch initial tasks
  const fetchTasks = useCallback(async () => {
    if (!participantId) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const fetchedTasks = await getUserTasks(participantId);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('[useTaskNotifications] Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [participantId]);

  // Debounced update handler
  const handleUpdate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      fetchTasks();
    }, 1000); // 1 second debounce
  }, [fetchTasks]);

  // Play sound when new notifications arrive
  useEffect(() => {
    if (!isLoading && unreadCount > previousUnreadCountRef.current && previousUnreadCountRef.current > 0) {
      // Only play sound if unread count increased (new notification)
      playNotificationSound();
    }
    previousUnreadCountRef.current = unreadCount;
  }, [unreadCount, isLoading]);

  // Set up real-time subscription
  useEffect(() => {
    if (!participantId) {
      return;
    }

    // Fetch initial tasks
    fetchTasks();

    // Subscribe to task changes
    const channel = supabase
      .channel(`tasks:${participantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `assigned_to_participant_id=eq.${participantId}`,
        },
        (payload) => {
          console.log('[useTaskNotifications] Real-time update:', payload);
          handleUpdate();
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup subscription on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [participantId, fetchTasks, handleUpdate]);

  // Mark task as read
  const markAsRead = useCallback(async (taskId: string) => {
    // Optimistic update
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.task_id === taskId
          ? { ...task, is_read: true, read_at: new Date().toISOString() }
          : task
      )
    );

    // Update in database
    const success = await markTaskAsRead(taskId);
    if (!success) {
      // Rollback on error
      fetchTasks();
    }
  }, [fetchTasks]);

  // Refresh tasks manually
  const refresh = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    unreadCount,
    isLoading,
    markAsRead,
    refresh,
  };
}

