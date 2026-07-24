import { Image } from 'lucide-react';

const AdminBanners = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-foreground">إدارة البانرات</h1>
    <div className="rounded-2xl border border-border bg-card p-10 shadow-card text-center">
      <Image className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
      <h3 className="text-lg font-bold text-foreground mb-2">لا توجد بانرات حالياً</h3>
      <p className="text-sm text-muted-foreground">يمكنك إضافة بانرات للصفحة الرئيسية من هنا</p>
    </div>
  </div>
);

export default AdminBanners;
