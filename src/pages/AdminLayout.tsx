import { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, FolderOpen, MessageSquare, Settings, LogOut, Menu, X,
  Image as ImageIcon, FileText, Users, ChevronLeft, ChevronDown, Building2, Bell,
  UserCircle, Wrench, Inbox, PlusCircle, ListChecks,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useInquiryNotifications } from '@/hooks/useInquiryNotifications';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import logoAsset from '@/assets/al-sherif-logo.png.asset.json';

type NavLeaf = { label: string; icon: any; path: string; badgeKey?: 'inquiries' };
type NavGroup = { label: string; icon: any; key: string; children: NavLeaf[] };
type NavItem = NavLeaf | NavGroup;

const isGroup = (i: NavItem): i is NavGroup => 'children' in i;

const NAV: NavItem[] = [
  { label: '📊 لوحة التحكم', icon: LayoutDashboard, path: '/admin/dashboard' },
  {
    label: '📦 المنتجات', icon: Package, key: 'products', children: [
      { label: 'كل المنتجات', icon: ListChecks, path: '/admin/products' },
      { label: 'إضافة منتج جديد', icon: PlusCircle, path: '/admin/products?new=1' },
      { label: 'الأقسام', icon: FolderOpen, path: '/admin/categories' },
      { label: 'العلامات التجارية', icon: Building2, path: '/admin/brands' },
    ],
  },
  {
    label: '🛠️ الخدمات', icon: Wrench, key: 'services', children: [
      { label: 'كل الخدمات', icon: ListChecks, path: '/admin/services' },
      { label: 'إضافة خدمة جديدة', icon: PlusCircle, path: '/admin/services?new=1' },
    ],
  },
  {
    label: '📰 المقالات', icon: FileText, key: 'blog', children: [
      { label: 'كل المقالات', icon: ListChecks, path: '/admin/blog' },
      { label: 'إضافة مقال جديد', icon: PlusCircle, path: '/admin/blog?new=1' },
    ],
  },
  { label: '📋 طلبات عروض الأسعار', icon: MessageSquare, path: '/admin/inquiries', badgeKey: 'inquiries' },
  { label: '📩 رسائل التواصل', icon: Inbox, path: '/admin/messages' },
  { label: '🖼️ مكتبة الوسائط', icon: ImageIcon, path: '/admin/media' },
  { label: '👥 المستخدمون', icon: Users, path: '/admin/users' },
  { label: '⚙️ إعدادات الموقع', icon: Settings, path: '/admin/settings' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, isAdmin, isStaff, roles: userRolesRaw, signOut } = useAuth() as any;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { unreadCount } = useInquiryNotifications();
  const { s } = useSiteSettings();
  const logoUrl = s('logo_url') || logoAsset.url || '/logo.png';
  const brand = s('company_name_ar', 'آل شريف');

  // Which group is expanded
  const initialOpen: Record<string, boolean> = {};
  NAV.forEach(i => {
    if (isGroup(i) && i.children.some(c => location.pathname.startsWith(c.path.split('?')[0]))) initialOpen[i.key] = true;
  });
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initialOpen);
  const toggleGroup = (k: string) => setOpenGroups(p => ({ ...p, [k]: !p[k] }));

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/admin/login'); return; }
    const hasAccess = isAdmin || isStaff || (userRolesRaw && userRolesRaw.some((r: string) => ['admin','manager','sales','content','staff'].includes(r)));
    if (!hasAccess) navigate('/admin/login');
  }, [user, loading, isAdmin, isStaff, userRolesRaw, navigate]);

  const handleLogout = async () => { await signOut(); navigate('/admin/login'); };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">جاري التحميل...</p></div>;
  const hasAdminAccess = isAdmin || isStaff || (userRolesRaw && userRolesRaw.some((r: string) => ['admin','manager','sales','content','staff'].includes(r)));
  if (!user || !hasAdminAccess) return null;

  const isLeafActive = (path: string) => {
    const clean = path.split('?')[0];
    return location.pathname === clean || (clean !== '/admin' && location.pathname.startsWith(clean + '/'));
  };

  const leafClasses = (active: boolean) =>
    `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
      active ? 'bg-sidebar-accent text-sidebar-primary' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
    }`;

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-sidebar text-sidebar-foreground shadow-hero transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoUrl} alt={brand} className="h-8 w-8 rounded-lg object-contain" />
            <span className="text-sm font-bold">{brand}</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"><X className="h-5 w-5" /></button>
        </div>

        <nav className="p-3 space-y-1 max-h-[calc(100vh-11rem)] overflow-y-auto">
          {NAV.map(item => {
            if (!isGroup(item)) {
              const active = isLeafActive(item.path);
              const showBadge = item.badgeKey === 'inquiries' && unreadCount > 0;
              return (
                <NavLink key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={leafClasses(active)}>
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {showBadge && <span className="min-w-[20px] rounded-full bg-destructive px-1.5 py-0.5 text-center text-[10px] font-bold text-destructive-foreground">{unreadCount}</span>}
                </NavLink>
              );
            }
            const open = !!openGroups[item.key];
            const anyChildActive = item.children.some(c => isLeafActive(c.path));
            return (
              <div key={item.key}>
                <button type="button" onClick={() => toggleGroup(item.key)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${anyChildActive ? 'bg-sidebar-accent/60 text-sidebar-primary' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50'}`}>
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1 text-right">{item.label}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="mt-1 mr-4 border-r border-sidebar-border/50 pr-3 space-y-1">
                    {item.children.map(child => (
                      <NavLink key={child.path} to={child.path} onClick={() => setSidebarOpen(false)}
                        className={leafClasses(isLeafActive(child.path))}>
                        <child.icon className="h-3.5 w-3.5" />
                        <span className="flex-1 text-xs">{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="absolute bottom-0 right-0 left-0 border-t border-sidebar-border p-3">
          <button onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-destructive/10 hover:text-destructive transition-colors">
            <LogOut className="h-4 w-4" />🚪 تسجيل الخروج
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-foreground/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/95 backdrop-blur-md px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden rounded-lg p-2 text-foreground hover:bg-accent"><Menu className="h-5 w-5" /></button>
          <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4" />العودة للموقع
          </Link>
          <div className="mr-auto flex items-center gap-2">
            <Link to="/admin/notifications" className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-foreground hover:bg-primary hover:text-primary-foreground transition-colors" title="الإشعارات">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -left-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link to="/admin/profile" className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-foreground hover:bg-primary hover:text-primary-foreground transition-colors" title="ملفي الشخصي">
              <UserCircle className="h-4 w-4" />
            </Link>
          </div>
        </header>
        <main className="p-4 lg:p-6"><Outlet /></main>
      </div>
    </div>
  );
};

export default AdminLayout;
