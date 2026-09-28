import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const READ_KEY = 'admin_read_inquiry_ids';

const getRead = (): string[] => {
  try { return JSON.parse(localStorage.getItem(READ_KEY) || '[]'); } catch { return []; }
};
const setRead = (ids: string[]) => localStorage.setItem(READ_KEY, JSON.stringify(ids));

export interface InquiryNotification {
  id: string;
  customer_name: string;
  phone: string;
  status: string;
  source: string;
  message: string;
  created_at: string;
}

export const useInquiryNotifications = () => {
  const [items, setItems] = useState<InquiryNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>(getRead());

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('inquiries')
      .select('id, customer_name, phone, status, source, message, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setItems(data as any);
  }, []);

  useEffect(() => {
    load();
    const channelTopic = `admin-inquiries-notifs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const channel = supabase
      .channel(channelTopic)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inquiries' }, (payload) => {
        const row = payload.new as any;
        setItems(prev => [row, ...prev].slice(0, 50));
        toast({ title: '🔔 طلب عرض سعر جديد', description: `${row?.customer_name || 'عميل'} — ${row?.phone || ''}` });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'inquiries' }, (payload) => {
        const row = payload.new as any;
        setItems(prev => prev.map(i => i.id === row.id ? { ...i, ...row } : i));
      });

    channel.subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        console.warn('Realtime channel error on', channelTopic);
      }
    });

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.warn('Failed to remove channel:', err);
      }
    };
  }, [load]);

  const unread = items.filter(i => !readIds.includes(i.id));
  const unreadCount = unread.length;

  const markAsRead = (id: string) => {
    const next = Array.from(new Set([...readIds, id]));
    setReadIds(next); setRead(next);
  };
  const markAllRead = () => {
    const next = Array.from(new Set([...readIds, ...items.map(i => i.id)]));
    setReadIds(next); setRead(next);
  };

  return { items, unread, unreadCount, markAsRead, markAllRead, reload: load };
};
