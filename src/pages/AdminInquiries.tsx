import React, { useState, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Search, Download, Phone, MessageCircle, Mail, X, MapPin, User,
  Package, Trash2, Copy, Check, Layers, Sprout, Droplets, Calendar,
  FileText, CheckCircle2, ExternalLink, ChevronDown, RefreshCw, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useInquiries } from '@/hooks/useSupabaseData';
import { useInquiryNotifications } from '@/hooks/useInquiryNotifications';
import { useToast } from '@/hooks/use-toast';

// Error Boundary to prevent any crash from taking down the page
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class InquiryErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('InquiryErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-center my-4" dir="rtl">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-bold text-destructive mb-1">حدث خطأ غير متوقع أثناء عرض هذا القسم</p>
          <p className="text-xs text-muted-foreground mb-3">{this.state.error?.message || 'يرجى مراجعة بيانات الطلب'}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
          >
            إعادة المحاولة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const STATUS_OPTIONS = ['جديد', 'جاري التواصل', 'تم إرسال العرض', 'تم التنفيذ', 'مغلق'] as const;

interface StatusConfigItem {
  bg: string;
  text: string;
  border: string;
  badge: string;
  dot: string;
}

const STATUS_CONFIG: Record<string, StatusConfigItem> = {
  'جديد': {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-500/30',
    badge: 'bg-blue-600 text-white',
    dot: 'bg-blue-500'
  },
  'جاري التواصل': {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/30',
    badge: 'bg-amber-600 text-white',
    dot: 'bg-amber-500'
  },
  'تم إرسال العرض': {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-500/30',
    badge: 'bg-indigo-600 text-white',
    dot: 'bg-indigo-500'
  },
  'تم التنفيذ': {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-600 text-white',
    dot: 'bg-emerald-500'
  },
  'مغلق': {
    bg: 'bg-slate-500/10 dark:bg-slate-500/20',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20',
    badge: 'bg-slate-600 text-white',
    dot: 'bg-slate-400'
  },
  // Legacy values
  'جاري المتابعة': {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/30',
    badge: 'bg-amber-600 text-white',
    dot: 'bg-amber-500'
  },
  'تم الإغلاق': {
    bg: 'bg-slate-500/10 dark:bg-slate-500/20',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20',
    badge: 'bg-slate-600 text-white',
    dot: 'bg-slate-400'
  },
};

const getStatusConfig = (status?: string | null): StatusConfigItem => {
  if (status && STATUS_CONFIG[status]) {
    return STATUS_CONFIG[status];
  }
  return STATUS_CONFIG['جديد'] || {
    bg: 'bg-blue-500/10',
    text: 'text-blue-700',
    border: 'border-blue-500/30',
    badge: 'bg-blue-600 text-white',
    dot: 'bg-blue-500'
  };
};

const safeString = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'number') return String(val).trim();
  if (typeof val === 'boolean') return String(val);
  try {
    return JSON.stringify(val);
  } catch {
    return '';
  }
};

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
};

const formatFullDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('ar-EG', {
      dateStyle: 'full',
      timeStyle: 'short'
    });
  } catch {
    return '';
  }
};

const buildWhatsAppLink = (num?: string | null, name?: string): string => {
  if (!num) return '#';
  try {
    let digits = String(num).replace(/\D/g, '');
    if (digits.startsWith('0020')) digits = digits.slice(4);
    else if (digits.startsWith('20')) digits = digits.slice(2);
    else if (digits.startsWith('0')) digits = digits.slice(1);
    const text = encodeURIComponent(`السلام عليكم ${name ? `أستاذ ${name}` : ''}، بخصوص طلب عرض السعر الخاص بكم من شركة آل شريف لنظم الري الحديث.`);
    return `https://wa.me/20${digits}?text=${text}`;
  } catch {
    return '#';
  }
};

const cleanPhoneForCall = (phone?: string | null): string => {
  if (!phone) return '';
  return String(phone).replace(/[^\d+]/g, '');
};

interface ParsedItem {
  name: string;
  qty: string | number;
  code?: string;
}

interface ParsedInquiryData {
  customerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  customerType: string;
  location: string;
  governorate: string;
  city: string;
  items: ParsedItem[];
  specs: Record<string, string>;
  cleanNotes: string;
  sourceLabel: string;
  rawMessage: string;
}

function parseInquiry(inq: any): ParsedInquiryData {
  const fallback: ParsedInquiryData = {
    customerName: safeString(inq?.customer_name) || 'عميل',
    phone: safeString(inq?.phone),
    whatsapp: safeString(inq?.whatsapp || inq?.phone),
    email: safeString(inq?.email),
    customerType: safeString(inq?.customer_type),
    location: safeString(inq?.governorate || inq?.city),
    governorate: safeString(inq?.governorate),
    city: safeString(inq?.city),
    items: [],
    specs: {},
    cleanNotes: safeString(inq?.message),
    sourceLabel: safeString(inq?.source) || 'طلب عرض سعر',
    rawMessage: safeString(inq?.message),
  };

  if (!inq || typeof inq !== 'object') return fallback;

  try {
    // 1. Safe Metadata extraction
    let meta: any = inq?.metadata;
    if (typeof meta === 'string') {
      try {
        meta = JSON.parse(meta);
      } catch {
        meta = {};
      }
    }
    if (!meta || typeof meta !== 'object') meta = {};

    const rawMsg = safeString(inq.message);
    const lines = rawMsg ? rawMsg.split('\n').map(l => l.trim()).filter(Boolean) : [];

    // 2. Items Extraction
    const items: ParsedItem[] = [];

    // From metadata.items
    if (Array.isArray(meta?.items) && meta.items.length > 0) {
      for (const it of meta.items) {
        if (!it) continue;
        if (typeof it === 'string') {
          items.push({ name: it.trim(), qty: 1, code: '' });
        } else if (typeof it === 'object') {
          items.push({
            name: safeString(it.title || it.name || it.product_name) || 'منتج',
            qty: safeString(it.qty || it.quantity) || 1,
            code: safeString(it.code || it.product_code),
          });
        }
      }
    }

    // From text lines
    if (items.length === 0 && lines.length > 0) {
      for (const line of lines) {
        try {
          // Bracketed items: [محبس عادي: 1]
          const bracketMatches = [...line.matchAll(/\[([^:\]\-]+)(?::|-)\s*(\d+[^\]]*)\]/g)];
          if (bracketMatches.length > 0) {
            for (const bm of bracketMatches) {
              if (bm && bm[1]) {
                items.push({
                  name: safeString(bm[1]),
                  qty: safeString(bm[2]) || '1',
                  code: '',
                });
              }
            }
            continue;
          }

          // Bullet items: • محبس عادي (#V-101) — الكمية: 1
          const bulletMatch = line.match(/^[•\-\*]\s*(.+?)(?:\s*\((?:#)?([^\)]+)\))?\s*(?:—|-|:)\s*(?:الكمية:?)?\s*(\d+.*)$/i);
          if (bulletMatch && bulletMatch[1]) {
            items.push({
              name: safeString(bulletMatch[1]),
              code: safeString(bulletMatch[2]).replace(/^#/, ''),
              qty: safeString(bulletMatch[3]).replace(/^الكمية:?\s*/, '') || '1',
            });
            continue;
          }

          // Simple colon item: - خرطوم: 5
          const simpleDash = line.match(/^[•\-\*]\s*([^:]+)\s*:\s*(\d+.*)$/);
          if (simpleDash && simpleDash[1] && !simpleDash[1].includes('بيانات') && !simpleDash[1].includes('المساحة')) {
            items.push({
              name: safeString(simpleDash[1]),
              qty: safeString(simpleDash[2]) || '1',
              code: '',
            });
          }
        } catch {
          // Ignore line regex errors
        }
      }
    }

    // 3. Technical Project Specs
    const specs: Record<string, string> = {};
    if (meta?.area) specs['المساحة'] = safeString(meta.area);
    if (meta?.crop) specs['المحصول'] = safeString(meta.crop);
    if (meta?.project_type) specs['نوع المشروع'] = safeString(meta.project_type);
    if (meta?.irrigation_type) specs['الري'] = safeString(meta.irrigation_type);

    for (const line of lines) {
      try {
        if (line.includes('|')) {
          const parts = line.split('|').map(p => p.trim());
          for (const part of parts) {
            const pMatch = part.match(/^(المساحة|مساحة الأرض|مساحة المزرعة|المحصول|نوع المحصول|الري|نوع الري|نظام الري|طريقة الري|نوع المشروع|المشروع)\s*:\s*(.+)$/i);
            if (pMatch && pMatch[1]) {
              const rawKey = pMatch[1];
              const standardKey = rawKey.includes('مساحة') ? 'المساحة' : rawKey.includes('محصول') ? 'المحصول' : rawKey.includes('ري') ? 'الري' : rawKey;
              if (!specs[standardKey]) specs[standardKey] = safeString(pMatch[2]);
            }
          }
        }

        const areaM = line.match(/^(?:المساحة|مساحة الأرض|مساحة المزرعة)\s*:\s*(.+)$/i);
        if (areaM && areaM[1] && !specs['المساحة']) specs['المساحة'] = safeString(areaM[1]);

        const cropM = line.match(/^(?:نوع المحصول|المحصول|المحاصيل)\s*:\s*(.+)$/i);
        if (cropM && cropM[1] && !specs['المحصول']) specs['المحصول'] = safeString(cropM[1]);

        const irrM = line.match(/^(?:نظام الري|نوع الري|الري|طريقة الري)\s*:\s*(.+)$/i);
        if (irrM && irrM[1] && !specs['الري']) specs['الري'] = safeString(irrM[1]);

        const projM = line.match(/^(?:نوع المشروع|المشروع)\s*:\s*(.+)$/i);
        if (projM && projM[1] && !specs['نوع المشروع']) specs['نوع المشروع'] = safeString(projM[1]);

        const locM = line.match(/^(?:موقع المشروع|الموقع)\s*:\s*(.+)$/i);
        if (locM && locM[1] && !specs['موقع المشروع']) specs['موقع المشروع'] = safeString(locM[1]);
      } catch {
        // Ignore regex error
      }
    }

    // 4. Location Extraction
    let gov = safeString(inq?.governorate);
    let city = safeString(inq?.city);
    for (const line of lines) {
      if (!gov) {
        const gM = line.match(/^(?:المحافظة)\s*:\s*(.+)$/i);
        if (gM && gM[1]) gov = safeString(gM[1]);
      }
      if (!city) {
        const cM = line.match(/^(?:المدينة|المركز)\s*:\s*(.+)$/i);
        if (cM && cM[1]) city = safeString(cM[1]);
      }
    }

    let locationStr = '';
    if (gov && city && gov !== city) {
      locationStr = `${gov} - ${city}`;
    } else {
      locationStr = gov || city || '';
    }

    // 5. Clean Notes & Remarks
    const filteredLines = lines.filter(l => {
      const trimmed = safeString(l);
      if (/^(طلب عرض سعر:?|— بيانات العميل —|— بيانات المشروع —|وصف الاحتياج:?|ملاحظات:?)$/i.test(trimmed)) return false;
      if (/^[•\-\*]\s*.+(?:—|-|:)\s*(?:الكمية)?/i.test(trimmed)) return false;
      if (/^\[[^:\]\-]+(?::|-)\s*\d+[^\]]*\]/i.test(trimmed)) return false;
      if (trimmed.includes('|') && trimmed.includes(':')) return false;
      if (/^(الاسم|الهاتف|واتساب|البريد|الشركة|نوع العميل|المحافظة|المدينة|موقع المشروع|المساحة|مساحة الأرض|مساحة المزرعة|المحصول|نوع المحصول|الري|نوع الري|نظام الري|طريقة الري|نوع المشروع)\s*:/i.test(trimmed)) return false;
      return true;
    });

    const cleanNotes = filteredLines.join('\n').trim();

    // Source Label
    const sourceLabel = inq?.source === 'quote_request'
      ? 'طلب عرض سعر'
      : inq?.source === 'project_inquiry'
        ? 'استفسار مشروع'
        : 'نموذج تواصل';

    return {
      customerName: safeString(inq?.customer_name) || 'عميل',
      phone: safeString(inq?.phone),
      whatsapp: safeString(inq?.whatsapp || inq?.phone),
      email: safeString(inq?.email),
      customerType: safeString(inq?.customer_type),
      location: locationStr,
      governorate: gov,
      city: city,
      items,
      specs,
      cleanNotes,
      sourceLabel,
      rawMessage: rawMsg,
    };
  } catch (err) {
    console.error('Safe fallback triggered in parseInquiry:', err);
    return fallback;
  }
}

const AdminInquiries = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: inquiries, isLoading, isError, refetch } = useInquiries();
  const { markAsRead } = useInquiryNotifications();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Copy phone handler
  const handleCopyPhone = (phone: string, id: string) => {
    try {
      if (phone) navigator.clipboard.writeText(phone);
      setCopiedId(id);
      toast({ title: 'تم نسخ الرقم', description: phone });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ title: 'تعذر النسخ' });
    }
  };

  // Status Change directly on the card
  const handleStatusChange = async (id: string, status: string) => {
    if (!id) return;
    try {
      const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      if (selected?.id === id) setSelected({ ...selected, status });
      toast({ title: 'تم تحديث الحالة بنجاح', description: `تم نقل الطلب إلى: ${status}` });
    } catch {
      toast({ title: 'خطأ أثناء التحديث', description: 'تعذر حفظ الحالة الجديدة', variant: 'destructive' });
    }
  };

  // Delete Inquiry
  const handleDelete = async (id: string) => {
    if (!id) return;
    if (!confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) return;
    try {
      const { error } = await supabase.from('inquiries').delete().eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      setSelected(null);
      toast({ title: 'تم حذف الطلب' });
    } catch {
      toast({ title: 'خطأ', description: 'تعذر حذف الطلب', variant: 'destructive' });
    }
  };

  // Filtered List with crash-proof guards
  const filtered = useMemo(() => {
    if (!Array.isArray(inquiries)) return [];
    return inquiries.filter(i => {
      if (!i || typeof i !== 'object') return false;
      try {
        const parsed = parseInquiry(i);
        const searchTarget = `${parsed.customerName} ${parsed.phone} ${parsed.location} ${parsed.cleanNotes} ${parsed.items.map(it => it?.name || '').join(' ')} ${Object.values(parsed.specs || {}).join(' ')} ${safeString(i?.source)}`.toLowerCase();
        const matchSearch = !search?.trim() || searchTarget.includes(search.toLowerCase().trim());
        const matchStatus = !filterStatus || i?.status === filterStatus;
        return matchSearch && matchStatus;
      } catch (err) {
        console.error('Filter check error:', err);
        return true;
      }
    });
  }, [inquiries, search, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    if (!Array.isArray(inquiries)) return { total: 0, newCount: 0, inContact: 0, quoteSent: 0, completed: 0 };
    return {
      total: inquiries.length,
      newCount: inquiries.filter(i => i?.status === 'جديد').length,
      inContact: inquiries.filter(i => i?.status === 'جاري التواصل' || i?.status === 'جاري المتابعة').length,
      quoteSent: inquiries.filter(i => i?.status === 'تم إرسال العرض').length,
      completed: inquiries.filter(i => i?.status === 'تم التنفيذ').length,
    };
  }, [inquiries]);

  // Comprehensive CSV Export with parsed details
  const handleExport = () => {
    if (!filtered.length) return;
    try {
      const headers = [
        'كود الطلب',
        'اسم العميل',
        'رقم الهاتف',
        'المحافظة والمدينة',
        'نوع العميل',
        'المنتجات المطلوبة',
        'بيانات المشروع والمزرعة',
        'ملاحظات إضافية',
        'المصدر',
        'الحالة',
        'تاريخ الطلب'
      ];

      const rows = filtered.map(i => {
        try {
          const parsed = parseInquiry(i);
          const itemsStr = (parsed.items || []).map(it => `${it?.name || 'منتج'} (الكمية: ${it?.qty || 1})`).join(' | ');
          const specsStr = Object.entries(parsed.specs || {}).map(([k, v]) => `${k}: ${v}`).join(' | ');
          const idStr = String(i?.id || '').slice(0, 8).toUpperCase();
          return [
            `#${idStr}`,
            parsed.customerName || '',
            parsed.phone || '',
            parsed.location || '',
            parsed.customerType || '',
            itemsStr,
            specsStr,
            (parsed.cleanNotes || '').replace(/\n/g, ' - '),
            parsed.sourceLabel || '',
            i?.status || 'جديد',
            formatDate(i?.created_at)
          ];
        } catch {
          return [
            `#${String(i?.id || '').slice(0, 8)}`,
            safeString(i?.customer_name),
            safeString(i?.phone),
            '',
            '',
            '',
            '',
            safeString(i?.message),
            safeString(i?.source),
            safeString(i?.status),
            ''
          ];
        }
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `طلبات-عروض-الأسعار-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      toast({ title: 'تم تصدير ملف CSV بنجاح' });
    } catch {
      toast({ title: 'حدث خطأ أثناء تصدير الملف', variant: 'destructive' });
    }
  };

  return (
    <InquiryErrorBoundary>
      <div className="space-y-6" dir="rtl">
        {/* 1. Page Header (توحيد المسميات والعدادات) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-foreground">طلبات عروض الأسعار</h1>
              {stats.newCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-black text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  {stats.newCount} جديد
                </span>
              )}
              <span className="text-xs font-bold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-lg">
                إجمالي {stats.total}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              متابعة وإدارة طلبات عروض الأسعار واستفسارات المشاريع الواردة من عملاء الموقع
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl bg-card border border-border px-3 py-1.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">جاري التواصل:</span>
              <span className="font-bold text-foreground">{stats.inContact}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-card border border-border px-3 py-1.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-muted-foreground">تم العرض:</span>
              <span className="font-bold text-foreground">{stats.quoteSent}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-card border border-border px-3 py-1.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">تم التنفيذ:</span>
              <span className="font-bold text-foreground">{stats.completed}</span>
            </div>
          </div>
        </div>

        {/* 2. Unified Actions Bar (دمج البحث، الفلاتر، وتصدير CSV في سطر واحد منظم RTL) */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Right-to-Left Search Bar with Magnifier on the Right */}
          <div className="relative flex-1" dir="rtl">
            <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              dir="rtl"
              placeholder="ابحث بالاسم، الهاتف، المحافظة، أو المنتجات المطلوبة..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-input bg-card py-2.5 pr-10 pl-10 text-sm text-foreground placeholder:text-muted-foreground text-right focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="مسح البحث"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/50">
            <button
              onClick={() => setFilterStatus(null)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                !filterStatus
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
              }`}
            >
              الكل ({inquiries?.length || 0})
            </button>
            {STATUS_OPTIONS.map(s => {
              const count = Array.isArray(inquiries) ? inquiries.filter(i => i?.status === s).length : 0;
              const isSelected = filterStatus === s;
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-card text-foreground shadow-sm border border-border ring-1 ring-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
                  }`}
                >
                  <span>{s}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Export CSV Button (في نفس السطر) */}
          <button
            onClick={handleExport}
            disabled={!filtered.length}
            className="flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-secondary-foreground shadow-button hover:bg-secondary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Download className="h-3.5 w-3.5" />
            <span>تصدير CSV</span>
          </button>
        </div>

        {/* Error State Fallback */}
        {isError && (
          <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-center">
            <p className="text-sm font-bold text-destructive mb-2">تعذر تحميل بيانات الطلبات</p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              إعادة التحميل
            </button>
          </div>
        )}

        {/* 3. Inquiries List Cards */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm font-medium">جاري تحميل طلبات عروض الأسعار...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((inq: any) => {
              if (!inq) return null;
              const inqId = safeString(inq?.id);
              const parsed = parseInquiry(inq);
              const statusCfg = getStatusConfig(inq?.status);
              const hasItems = Array.isArray(parsed?.items) && parsed.items.length > 0;
              const hasSpecs = parsed?.specs && Object.keys(parsed.specs).length > 0;
              const badgeIndicatorClass = (statusCfg?.badge || 'bg-blue-600').split(' ')[0] || 'bg-blue-600';
              const idRef = inqId.slice(0, 8).toUpperCase() || 'REF';

              return (
                <div
                  key={inqId || Math.random().toString()}
                  className="group relative rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover hover:border-primary/40 transition-all duration-200"
                >
                  {/* Visual Status Indicator Strip on the right */}
                  <div className={`absolute top-0 right-0 bottom-0 w-1.5 rounded-r-2xl ${badgeIndicatorClass}`} />

                  {/* --- Card Header --- */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 pr-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-mono font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                          #{idRef}
                        </span>
                        {parsed.customerType && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">
                            <User className="h-3 w-3" />
                            {parsed.customerType}
                          </span>
                        )}
                        {inq?.created_at && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(inq.created_at)}
                          </span>
                        )}
                        <span className="text-[11px] font-medium text-muted-foreground/80 bg-muted/40 px-2 py-0.5 rounded">
                          {parsed.sourceLabel}
                        </span>
                      </div>

                      {/* Customer Name, Phone, and Location */}
                      <div className="flex flex-wrap items-center gap-3">
                        <h3
                          onClick={() => {
                            if (inqId) markAsRead(inqId);
                            setSelected(inq);
                          }}
                          className="text-lg font-black text-foreground hover:text-primary cursor-pointer transition-colors"
                        >
                          {parsed.customerName}
                        </h3>

                        {parsed.phone && (
                          <div className="flex items-center gap-1 bg-muted/50 rounded-lg px-2 py-1 text-xs font-semibold text-foreground" dir="ltr">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{parsed.phone}</span>
                            <button
                              onClick={() => handleCopyPhone(parsed.phone, inqId)}
                              className="p-1 hover:text-primary transition-colors"
                              title="نسخ رقم الهاتف"
                            >
                              {copiedId === inqId ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                            </button>
                          </div>
                        )}

                        {parsed.location && (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {parsed.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Dropdown Select directly on the card */}
                    <div className="flex items-center gap-2 self-start shrink-0">
                      <div className="relative inline-block">
                        <select
                          value={inq?.status || 'جديد'}
                          onChange={e => handleStatusChange(inqId, e.target.value)}
                          className={`appearance-none rounded-xl px-3.5 py-2 pr-8 text-xs font-black cursor-pointer border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s} className="bg-card text-foreground py-1 font-medium">
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-70" />
                      </div>
                    </div>
                  </div>

                  {/* --- Section 1: Items Badges Grid (شبكة المنتجات بشارات مستقلة) --- */}
                  {hasItems && (
                    <div className="mb-3 rounded-xl bg-accent/30 dark:bg-accent/15 border border-accent/40 p-3">
                      <p className="text-[11px] font-black text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-primary" />
                        المنتجات المطلوبة ({parsed.items.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {parsed.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 rounded-lg bg-card border border-border/80 px-2.5 py-1 text-xs shadow-xs"
                          >
                            <span className="font-bold text-foreground">
                              {it?.name || 'منتج'}
                              {it?.code && <span className="mr-1 text-[10px] font-mono text-muted-foreground font-normal">(#{it.code})</span>}
                            </span>
                            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-black text-primary">
                              الكمية: {it?.qty ?? 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* --- Section 2: Project Technical Specs Box (الملاحظات الفنية للمشروع) --- */}
                  {hasSpecs && (
                    <div className="mb-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 p-3">
                      <p className="text-[11px] font-black text-emerald-800 dark:text-emerald-300 mb-1.5 flex items-center gap-1.5">
                        <Sprout className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        بيانات المشروع الفنية للمزرعة:
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-foreground font-medium">
                        {parsed.specs['المساحة'] && (
                          <div className="flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-muted-foreground">المساحة:</span>
                            <span className="font-bold text-foreground">{parsed.specs['المساحة']}</span>
                          </div>
                        )}
                        {parsed.specs['الري'] && (
                          <div className="flex items-center gap-1.5">
                            <Droplets className="h-3.5 w-3.5 text-cyan-600" />
                            <span className="text-muted-foreground">الري:</span>
                            <span className="font-bold text-foreground">{parsed.specs['الري']}</span>
                          </div>
                        )}
                        {parsed.specs['المحصول'] && (
                          <div className="flex items-center gap-1.5">
                            <Sprout className="h-3.5 w-3.5 text-amber-600" />
                            <span className="text-muted-foreground">المحصول:</span>
                            <span className="font-bold text-foreground">{parsed.specs['المحصول']}</span>
                          </div>
                        )}
                        {parsed.specs['نوع المشروع'] && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">النوع:</span>
                            <span className="font-bold text-foreground">{parsed.specs['نوع المشروع']}</span>
                          </div>
                        )}
                        {parsed.specs['موقع المشروع'] && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-red-500" />
                            <span className="text-muted-foreground">الموقع:</span>
                            <span className="font-bold text-foreground">{parsed.specs['موقع المشروع']}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* --- Section 3: Clean Notes / Free-form Message --- */}
                  {parsed.cleanNotes && (
                    <div className="mb-3 rounded-xl bg-muted/30 border border-border/40 p-3 text-xs leading-relaxed text-foreground flex items-start gap-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="line-clamp-2 text-muted-foreground hover:line-clamp-none transition-all">
                        {parsed.cleanNotes}
                      </p>
                    </div>
                  )}

                  {/* Fallback if no structured data was extracted */}
                  {!hasItems && !hasSpecs && !parsed.cleanNotes && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{parsed.rawMessage}</p>
                  )}

                  {/* --- Section 4: Card Actions & Contact Bar (أزرار الإجراءات) --- */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3">
                    {/* Left (RTL Start): Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {parsed.phone && (
                        <>
                          <a
                            href={cleanPhoneForCall(parsed.phone) ? `tel:${cleanPhoneForCall(parsed.phone)}` : '#'}
                            className="flex h-8 items-center gap-1.5 rounded-lg bg-primary/10 px-3 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 shadow-xs"
                            title="اتصال مباشر"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>اتصال</span>
                          </a>

                          <a
                            href={buildWhatsAppLink(parsed.whatsapp || parsed.phone, parsed.customerName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 items-center gap-1.5 rounded-lg bg-[#25D366]/10 px-3 text-xs font-bold text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all active:scale-95 shadow-xs"
                            title="محادثة واتساب"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>واتساب</span>
                          </a>
                        </>
                      )}

                      {parsed.email && (
                        <a
                          href={`mailto:${parsed.email}?subject=${encodeURIComponent('بخصوص طلب عرض السعر من شركة آل شريف لنظم الري')}`}
                          className="flex h-8 items-center gap-1.5 rounded-lg bg-secondary/15 px-3 text-xs font-bold text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground transition-all active:scale-95 shadow-xs"
                          title="إرسال بريد إلكتروني"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          <span>بريد</span>
                        </a>
                      )}

                      <button
                        onClick={() => {
                          if (inqId) markAsRead(inqId);
                          setSelected(inq);
                        }}
                        className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>عرض التفاصيل</span>
                      </button>
                    </div>

                    {/* Right (RTL End): Delete button */}
                    <div>
                      <button
                        onClick={() => handleDelete(inqId)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="حذف الطلب"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 bg-card rounded-2xl border border-dashed border-border text-center">
                <Package className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-base font-bold text-foreground">لا توجد طلبات عروض أسعار مطابقة</p>
                <p className="text-xs text-muted-foreground mt-1">جرّب تغيير كلمات البحث أو تغيير فلتر الحالة</p>
              </div>
            )}
          </div>
        )}

        {/* 4. Full Detail Modal (نافذة العرض التفصيلي المنظمة) */}
        {selected && (() => {
          const selectedId = safeString(selected?.id);
          const parsed = parseInquiry(selected);
          const statusCfg = getStatusConfig(selected?.status);
          const modalRefId = selectedId.slice(0, 8).toUpperCase() || 'REF';

          return (
            <div
              className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
              onClick={() => setSelected(null)}
            >
              <div
                className="w-full max-w-2xl rounded-3xl bg-card p-6 md:p-8 shadow-hero my-8 border border-border animate-in fade-in-50 zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
                dir="rtl"
              >
                {/* Modal Header */}
                <div className="mb-6 flex items-start justify-between gap-3 border-b border-border/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        #{modalRefId}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                        {selected?.status || 'جديد'}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-foreground">{parsed.customerName}</h2>
                    {selected?.created_at && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatFullDate(selected.created_at)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Customer Contact Details Grid */}
                <div className="grid gap-3 sm:grid-cols-2 mb-6">
                  <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
                    <p className="text-[11px] font-bold text-muted-foreground mb-1">رقم الهاتف</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground" dir="ltr">{parsed.phone || 'غير محدد'}</span>
                      {parsed.phone && (
                        <button
                          onClick={() => handleCopyPhone(parsed.phone, 'modal')}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          {copiedId === 'modal' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          نسخ
                        </button>
                      )}
                    </div>
                  </div>

                  {parsed.location && (
                    <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
                      <p className="text-[11px] font-bold text-muted-foreground mb-1">المحافظة / المركز</p>
                      <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {parsed.location}
                      </p>
                    </div>
                  )}

                  {parsed.customerType && (
                    <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
                      <p className="text-[11px] font-bold text-muted-foreground mb-1">نوع العميل</p>
                      <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-primary" />
                        {parsed.customerType}
                      </p>
                    </div>
                  )}

                  {parsed.email && (
                    <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
                      <p className="text-[11px] font-bold text-muted-foreground mb-1">البريد الإلكتروني</p>
                      <p className="text-sm font-bold text-foreground truncate" dir="ltr">{parsed.email}</p>
                    </div>
                  )}
                </div>

                {/* Items Section */}
                {parsed.items.length > 0 && (
                  <div className="mb-6 rounded-2xl border border-border bg-card p-4">
                    <h4 className="text-xs font-black text-foreground mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      قائمة المنتجات المطلوبة ({parsed.items.length})
                    </h4>
                    <div className="divide-y divide-border/60">
                      {parsed.items.map((it, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span className="font-bold text-foreground">{it?.name || 'منتج'}</span>
                            {it?.code && <span className="text-xs font-mono text-muted-foreground">(#{it.code})</span>}
                          </div>
                          <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">
                            الكمية: {it?.qty ?? 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project Specs Section */}
                {Object.keys(parsed.specs).length > 0 && (
                  <div className="mb-6 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 p-4">
                    <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
                      <Sprout className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      الملاحظات الفنية للمشروع
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-2 text-xs">
                      {Object.entries(parsed.specs).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between bg-card/60 p-2.5 rounded-xl border border-emerald-500/10">
                          <span className="text-muted-foreground">{k}:</span>
                          <span className="font-bold text-foreground">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clean Notes / Remarks */}
                {parsed.cleanNotes && (
                  <div className="mb-6 rounded-2xl border border-border p-4 bg-muted/20">
                    <h4 className="text-xs font-black text-muted-foreground mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      ملاحظات العميل الإضافية
                    </h4>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{parsed.cleanNotes}</p>
                  </div>
                )}

                {/* Update Status Bar */}
                <div className="mb-6">
                  <p className="text-xs font-black text-muted-foreground mb-2">تحديث حالة الطلب</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(selectedId, s)}
                        className={`rounded-xl px-3.5 py-2 text-xs font-black transition-all ${
                          selected?.status === s
                            ? 'ring-2 ring-primary ' + (STATUS_CONFIG[s]?.badge || 'bg-primary text-primary-foreground')
                            : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons in Modal */}
                <div className="grid gap-3 sm:grid-cols-3 mb-6">
                  <a
                    href={cleanPhoneForCall(parsed.phone) ? `tel:${cleanPhoneForCall(parsed.phone)}` : '#'}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-button hover:bg-primary/90 hover:scale-[1.02] transition-all"
                  >
                    <Phone className="h-4 w-4" />
                    اتصال مباشر
                  </a>
                  <a
                    href={buildWhatsAppLink(parsed.whatsapp || parsed.phone, parsed.customerName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white shadow-button hover:bg-[#20ba5a] hover:scale-[1.02] transition-all"
                  >
                    <MessageCircle className="h-4 w-4" />
                    محادثة واتساب
                  </a>
                  <a
                    href={parsed.email ? `mailto:${parsed.email}?subject=${encodeURIComponent('بخصوص طلب عرض السعر')}` : '#'}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
                      parsed.email
                        ? 'bg-secondary text-secondary-foreground hover:scale-[1.02]'
                        : 'bg-muted text-muted-foreground/40 pointer-events-none'
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    إرسال بريد
                  </a>
                </div>

                {/* Delete button */}
                <div className="flex items-center justify-between border-t border-border/60 pt-4">
                  <button
                    onClick={() => handleDelete(selectedId)}
                    className="flex items-center gap-2 text-xs font-bold text-destructive hover:underline"
                  >
                    <Trash2 className="h-4 w-4" />
                    حذف هذا الطلب نهائياً
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground"
                  >
                    إغلاق النافذة
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </InquiryErrorBoundary>
  );
};

export default AdminInquiries;
