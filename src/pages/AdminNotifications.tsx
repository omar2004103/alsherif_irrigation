import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Phone, MessageCircle, ExternalLink, Circle } from 'lucide-react';
import { useInquiryNotifications } from '@/hooks/useInquiryNotifications';
import { useState } from 'react';

const AdminNotifications = () => {
  const { items, unread, unreadCount, markAsRead, markAllRead } = useInquiryNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const list = filter === 'unread' ? unread : items;
  const unreadSet = new Set(unread.map(i => i.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> مركز الإشعارات
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : 'لا توجد إشعارات جديدة'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border bg-card p-1">
            {(['all', 'unread'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {f === 'all' ? 'الكل' : `غير مقروء (${unreadCount})`}
              </button>
            ))}
          </div>
          <button onClick={markAllRead} disabled={unreadCount === 0}
            className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-bold text-secondary-foreground hover:scale-105 transition-transform disabled:opacity-50">
            <CheckCheck className="h-3.5 w-3.5" /> تحديد الكل كمقروء
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        {list.length === 0 ? (
          <div className="p-16 text-center">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {list.map((inq) => {
              const isUnread = unreadSet.has(inq.id);
              return (
                <motion.div key={inq.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  className={`p-4 transition-colors ${isUnread ? 'bg-primary/[0.04]' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 shrink-0">
                      {isUnread ? <Circle className="h-2.5 w-2.5 fill-primary text-primary" /> : <Circle className="h-2.5 w-2.5 text-muted-foreground/30" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-foreground">🔔 طلب جديد من {inq.customer_name}</p>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{inq.status}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{inq.message}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground" dir="ltr">
                        {inq.phone} · {new Date(inq.created_at).toLocaleString('ar-EG')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a href={`tel:${inq.phone}`} onClick={() => markAsRead(inq.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground" title="اتصال">
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                      <a href={`https://wa.me/2${inq.phone.replace(/\D/g, '').replace(/^20/, '').replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" onClick={() => markAsRead(inq.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white" title="واتساب">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                      <Link to="/admin/inquiries" onClick={() => markAsRead(inq.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground hover:bg-accent" title="فتح">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;