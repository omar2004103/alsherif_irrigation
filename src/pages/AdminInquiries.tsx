import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Search, Download, Phone, MessageCircle, Mail, X, MapPin, User, Package, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useInquiries } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

const statusOptions = ['جديد', 'جاري التواصل', 'تم إرسال العرض', 'تم التنفيذ', 'مغلق'];
const statusColors: Record<string, string> = {
  'جديد': 'bg-primary/10 text-primary',
  'جاري التواصل': 'bg-gold/10 text-gold',
  'تم إرسال العرض': 'bg-secondary/10 text-secondary',
  'تم التنفيذ': 'bg-emerald/10 text-emerald',
  'مغلق': 'bg-muted text-muted-foreground',
  // Legacy
  'جاري المتابعة': 'bg-gold/10 text-gold',
  'تم الإغلاق': 'bg-muted text-muted-foreground',
};

const waLink = (num?: string | null, name?: string) => {
  if (!num) return '#';
  const clean = num.replace(/\D/g, '').replace(/^20/, '').replace(/^0/, '');
  const text = encodeURIComponent(`السلام عليكم ${name || ''}، بخصوص طلب عرض السعر الخاص بكم من موقع آل شريف لنظم الري الحديث.`);
  return `https://wa.me/20${clean}?text=${text}`;
};

const AdminInquiries = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: inquiries, isLoading } = useInquiries();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);

  const filtered = inquiries?.filter(i => {
    const matchSearch = i.customer_name.includes(search) || i.phone.includes(search) || i.message.includes(search);
    const matchStatus = !filterStatus || i.status === filterStatus;
    return matchSearch && matchStatus;
  }) || [];

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from('inquiries').update({ status }).eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    if (selected?.id === id) setSelected({ ...selected, status });
    toast({ title: 'تم التحديث' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذا الطلب نهائياً؟')) return;
    await supabase.from('inquiries').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    setSelected(null);
    toast({ title: 'تم الحذف' });
  };

  const handleExport = () => {
    if (!filtered.length) return;
    const headers = ['الاسم', 'الهاتف', 'البريد', 'الرسالة', 'المصدر', 'الحالة', 'التاريخ'];
    const rows = filtered.map(i => [i.customer_name, i.phone, i.email || '', i.message, i.source, i.status, new Date(i.created_at).toLocaleDateString('ar-EG')]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">إدارة الاستفسارات</h1>
        <button onClick={handleExport}
          className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-secondary-foreground shadow-button hover:scale-105 transition-transform">
          <Download className="h-4 w-4" />تصدير CSV
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="ابحث..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-input bg-card py-3 pr-10 pl-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilterStatus(null)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${!filterStatus ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:bg-accent'}`}>الكل</button>
          {statusOptions.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:bg-accent'}`}>{s}</button>
          ))}
        </div>
      </div>

      {isLoading ? <p className="text-muted-foreground">جاري التحميل...</p> : (
        <div className="space-y-3">
          {filtered.map((inq: any) => (
            <div key={inq.id} className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between mb-3 gap-3">
                <button onClick={() => setSelected(inq)} className="text-right min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-muted-foreground">#{inq.id.slice(0, 8).toUpperCase()}</span>
                    {inq.customer_type && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">{inq.customer_type}</span>}
                  </div>
                  <h3 className="font-bold text-foreground">{inq.customer_name}</h3>
                  <p className="text-xs text-muted-foreground" dir="ltr">{inq.phone} {inq.email && `• ${inq.email}`}</p>
                </button>
                <select value={inq.status} onChange={e => handleStatusChange(inq.id, e.target.value)} onClick={e => e.stopPropagation()}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium border-0 cursor-pointer ${statusColors[inq.status] || 'bg-muted text-muted-foreground'}`}>
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <p className="text-sm text-foreground mb-3 line-clamp-2">{inq.message}</p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {inq.governorate && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{inq.governorate}</span>}
                  <span>{inq.source === 'quote_request' ? 'طلب عرض سعر' : inq.source === 'project_inquiry' ? 'استفسار مشروع' : 'نموذج تواصل'}</span>
                  <span>•</span>
                  <span>{new Date(inq.created_at).toLocaleDateString('ar-EG')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <a href={`tel:${inq.phone}`} className="flex h-8 items-center gap-1 rounded-lg bg-primary/10 px-3 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Phone className="h-3 w-3" />اتصال
                  </a>
                  <a href={waLink(inq.whatsapp || inq.phone, inq.customer_name)} target="_blank" rel="noopener noreferrer" className="flex h-8 items-center gap-1 rounded-lg bg-[#25D366]/10 px-3 text-xs font-bold text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors">
                    <MessageCircle className="h-3 w-3" />واتساب
                  </a>
                  {inq.email && (
                    <a href={`mailto:${inq.email}`} className="flex h-8 items-center gap-1 rounded-lg bg-secondary/10 px-3 text-xs font-bold text-secondary hover:bg-secondary hover:text-secondary-foreground transition-colors">
                      <Mail className="h-3 w-3" />بريد
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">لا توجد استفسارات</p>}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-foreground/50 p-4 overflow-y-auto" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl rounded-2xl bg-card p-6 shadow-hero my-8" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-mono text-muted-foreground mb-1">#{selected.id.slice(0, 8).toUpperCase()}</p>
                <h2 className="text-xl font-bold text-foreground">{selected.customer_name}</h2>
                <p className="text-xs text-muted-foreground mt-1">{new Date(selected.created_at).toLocaleString('ar-EG')}</p>
              </div>
              <button onClick={() => setSelected(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 mb-4">
              {selected.customer_type && <div className="rounded-lg bg-muted/40 p-3"><p className="text-[10px] text-muted-foreground">نوع العميل</p><p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5"><User className="h-3.5 w-3.5" />{selected.customer_type}</p></div>}
              {selected.governorate && <div className="rounded-lg bg-muted/40 p-3"><p className="text-[10px] text-muted-foreground">المحافظة / المدينة</p><p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5"><MapPin className="h-3.5 w-3.5" />{selected.governorate}{selected.city && ` — ${selected.city}`}</p></div>}
              <div className="rounded-lg bg-muted/40 p-3"><p className="text-[10px] text-muted-foreground">الهاتف</p><p className="text-sm font-semibold text-foreground mt-0.5" dir="ltr">{selected.phone}</p></div>
              {selected.whatsapp && <div className="rounded-lg bg-muted/40 p-3"><p className="text-[10px] text-muted-foreground">واتساب</p><p className="text-sm font-semibold text-foreground mt-0.5" dir="ltr">{selected.whatsapp}</p></div>}
              {selected.email && <div className="rounded-lg bg-muted/40 p-3 sm:col-span-2"><p className="text-[10px] text-muted-foreground">البريد الإلكتروني</p><p className="text-sm font-semibold text-foreground mt-0.5" dir="ltr">{selected.email}</p></div>}
            </div>

            <div className="rounded-xl border border-border p-4 mb-4">
              <p className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5"><Package className="h-3.5 w-3.5" />تفاصيل الطلب</p>
              <pre className="text-sm text-foreground whitespace-pre-wrap font-body">{selected.message}</pre>
            </div>

            <div className="mb-4">
              <p className="text-xs font-bold text-muted-foreground mb-2">حالة الطلب</p>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(s => (
                  <button key={s} onClick={() => handleStatusChange(selected.id, s)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${selected.status === s ? 'ring-2 ring-primary ' + (statusColors[s] || '') : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 mb-4">
              <a href={`tel:${selected.phone}`} className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:scale-[1.02] transition-transform">
                <Phone className="h-4 w-4" />اتصال مباشر
              </a>
              <a href={waLink(selected.whatsapp || selected.phone, selected.customer_name)} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white hover:scale-[1.02] transition-transform">
                <MessageCircle className="h-4 w-4" />فتح واتساب
              </a>
              <a href={selected.email ? `mailto:${selected.email}?subject=${encodeURIComponent('بخصوص طلب عرض السعر')}` : '#'}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-transform ${selected.email ? 'bg-secondary text-secondary-foreground hover:scale-[1.02]' : 'bg-muted text-muted-foreground/50 pointer-events-none'}`}>
                <Mail className="h-4 w-4" />إرسال بريد
              </a>
            </div>

            <button onClick={() => handleDelete(selected.id)} className="flex items-center gap-2 text-xs font-medium text-destructive hover:underline">
              <Trash2 className="h-3.5 w-3.5" />حذف الطلب نهائياً
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;
