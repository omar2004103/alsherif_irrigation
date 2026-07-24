import { Wrench } from 'lucide-react';

const AdminServices = () => (
  <div className="mx-auto max-w-4xl">
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Wrench className="h-5 w-5" /></div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">إدارة الخدمات</h1>
        <p className="text-sm text-muted-foreground">أضف وعدّل الخدمات التي تقدمها الشركة.</p>
      </div>
    </div>
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <p className="text-sm text-muted-foreground">وحدة الخدمات قيد الإعداد — سيتم تفعيل الإضافة/التعديل قريباً.</p>
    </div>
  </div>
);
export default AdminServices;
