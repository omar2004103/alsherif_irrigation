import { motion } from 'framer-motion';
import { Package, MessageSquare, Star, TrendingUp, FileText, Download, Building2, FolderOpen, Eye, Phone, MessageCircle, Clock } from 'lucide-react';
import { useProducts, useCategories, useInquiries, useBlogPosts, useBrands } from '@/hooks/useSupabaseData';
import { Link } from 'react-router-dom';

const statusColors: Record<string, string> = {
  'جديد': 'bg-primary/10 text-primary',
  'جاري التواصل': 'bg-gold/10 text-gold',
  'جاري المتابعة': 'bg-gold/10 text-gold',
  'تم إرسال العرض': 'bg-secondary/10 text-secondary',
  'تم التنفيذ': 'bg-emerald/10 text-emerald',
  'مغلق': 'bg-muted text-muted-foreground',
  'تم الإغلاق': 'bg-muted text-muted-foreground',
};

const AdminDashboard = () => {
  const { data: products } = useProducts();
  const { data: categories } = useCategories();
  const { data: inquiries } = useInquiries();
  const { data: blogPosts } = useBlogPosts();
  const { data: brands } = useBrands();

  const newInquiries = inquiries?.filter(i => i.status === 'جديد').length || 0;
  const websiteMessages = inquiries?.filter(i => i.source === 'website').length || 0;
  const featuredCount = products?.filter(p => p.featured).length || 0;
  const totalViews = (products || []).reduce((sum, p: any) => sum + (p.view_count || 0), 0);

  const stats = [
    { label: 'إجمالي المنتجات', value: products?.length || 0, icon: Package, color: 'bg-primary/10 text-primary', to: '/admin/products' },
    { label: 'إجمالي التصنيفات', value: categories?.length || 0, icon: FolderOpen, color: 'bg-secondary/10 text-secondary', to: '/admin/categories' },
    { label: 'إجمالي العلامات التجارية', value: brands?.length || 0, icon: Building2, color: 'bg-gold/10 text-gold', to: '/admin/brands' },
    { label: 'طلبات عروض أسعار جديدة', value: newInquiries, icon: TrendingUp, color: 'bg-emerald/10 text-emerald', to: '/admin/inquiries' },
    { label: 'رسائل التواصل', value: websiteMessages, icon: MessageSquare, color: 'bg-primary/10 text-primary', to: '/admin/inquiries' },
    { label: 'إجمالي المشاهدات', value: totalViews, icon: Eye, color: 'bg-secondary/10 text-secondary', to: '/admin/products' },
    { label: 'المنتجات المميزة', value: featuredCount, icon: Star, color: 'bg-gold/10 text-gold', to: '/admin/featured' },
    { label: 'مقالات المدونة', value: blogPosts?.length || 0, icon: FileText, color: 'bg-emerald/10 text-emerald', to: '/admin/blog' },
  ];

  const topViewed = [...(products || [])].sort((a: any, b: any) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5);
  const latestProducts = [...(products || [])].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  const handleExportInquiries = () => {
    if (!inquiries || inquiries.length === 0) return;
    const headers = ['رقم', 'الاسم', 'الهاتف', 'واتساب', 'البريد', 'نوع العميل', 'المحافظة', 'المدينة', 'المصدر', 'الرسالة', 'الحالة', 'التاريخ'];
    const rows = inquiries.map((i: any) => [i.id.slice(0, 8).toUpperCase(), i.customer_name, i.phone, i.whatsapp || '', i.email || '', i.customer_type || '', i.governorate || '', i.city || '', i.source, i.message.replace(/\n/g, ' '), i.status, new Date(i.created_at).toLocaleDateString('ar-EG')]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground mt-1">نظرة عامة على أداء موقع آل شريف لنظم الري الحديث</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link to={stat.to} className="block rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} mb-3`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card shadow-card">
          <div className="border-b border-border p-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">آخر طلبات عروض الأسعار</h2>
            <button onClick={handleExportInquiries} className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:scale-105 transition-transform">
              <Download className="h-3.5 w-3.5" />CSV
            </button>
          </div>
          <div className="divide-y divide-border">
            {inquiries?.slice(0, 6).map((inq: any) => (
              <div key={inq.id} className="flex items-center justify-between gap-3 p-4">
                <Link to="/admin/inquiries" className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{inq.customer_name}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">{inq.phone}</p>
                </Link>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a href={`tel:${inq.phone}`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors" title="اتصال">
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                  <a href={`https://wa.me/2${(inq.whatsapp || inq.phone).replace(/\D/g, '').replace(/^20/, '').replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors" title="واتساب">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[inq.status] || 'bg-muted text-muted-foreground'}`}>{inq.status}</span>
                </div>
              </div>
            ))}
            {(!inquiries || inquiries.length === 0) && <p className="p-4 text-sm text-muted-foreground">لا توجد استفسارات بعد</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-card">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-bold text-foreground">أكثر المنتجات مشاهدة</h2>
          </div>
          <div className="divide-y divide-border">
            {topViewed.map((product: any, i) => (
              <Link key={product.id} to={`/product/${product.slug}`} className="flex items-center justify-between p-4 hover:bg-accent/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">{i + 1}</span>
                  <p className="text-sm font-semibold text-foreground">{product.title}</p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                  <Eye className="h-3 w-3" />{product.view_count || 0}
                </span>
              </Link>
            ))}
            {topViewed.length === 0 && <p className="p-4 text-sm text-muted-foreground">لا توجد بيانات كافية</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-card lg:col-span-2">
          <div className="border-b border-border p-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">آخر المنتجات المضافة</h2>
            <Link to="/admin/products" className="text-xs font-bold text-primary hover:underline">إدارة المنتجات ←</Link>
          </div>
          <div className="divide-y divide-border">
            {latestProducts.map((p: any) => (
              <Link key={p.id} to={`/product/${p.slug}`} className="flex items-center gap-3 p-4 hover:bg-accent/40 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center shrink-0">
                  {p.image_url ? <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-muted-foreground/40" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(p.created_at).toLocaleDateString('ar-EG')}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${p.availability === 'available' ? 'bg-emerald/10 text-emerald' : 'bg-gold/10 text-gold'}`}>
                  {p.availability === 'available' ? 'متوفر' : 'حسب الطلب'}
                </span>
              </Link>
            ))}
            {latestProducts.length === 0 && <p className="p-4 text-sm text-muted-foreground">لا توجد منتجات</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;