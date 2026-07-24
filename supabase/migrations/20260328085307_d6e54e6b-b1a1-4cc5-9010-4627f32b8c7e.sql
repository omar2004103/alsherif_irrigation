
-- Create updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);

-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  featured BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Product images (multiple per product)
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product images are publicly readable" ON public.product_images FOR SELECT USING (true);

-- Inquiries table
CREATE TABLE public.inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  message TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'جديد',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FAQ items
CREATE TABLE public.faq_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FAQ items are publicly readable" ON public.faq_items FOR SELECT USING (true);

-- Testimonials
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Testimonials are publicly readable" ON public.testimonials FOR SELECT USING (true);

-- Blog posts
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  author_name TEXT NOT NULL DEFAULT 'الإدارة',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published blog posts are publicly readable" ON public.blog_posts FOR SELECT USING (published = true);
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tips
CREATE TABLE public.tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'عام',
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published tips are publicly readable" ON public.tips FOR SELECT USING (published = true);
CREATE TRIGGER update_tips_updated_at BEFORE UPDATE ON public.tips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Site settings
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT ''
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site settings are publicly readable" ON public.site_settings FOR SELECT USING (true);

-- User roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'customer');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Admins can read roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for all tables
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admins can manage product images" ON public.product_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admins can manage inquiries" ON public.inquiries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admins can update inquiries" ON public.inquiries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admins can delete inquiries" ON public.inquiries FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage FAQ" ON public.faq_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admins can manage blog" ON public.blog_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admin can read all blog posts" ON public.blog_posts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admins can manage tips" ON public.tips FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admin can read all tips" ON public.tips FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Product notes
CREATE TABLE public.product_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.product_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage product notes" ON public.product_notes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
CREATE POLICY "Public read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')));
CREATE POLICY "Admins can update product images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')));
CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff')));

-- Seed categories
INSERT INTO public.categories (name, slug, "order") VALUES
  ('مصادر المياه', 'water-sources', 1),
  ('طلمبات', 'pumps', 2),
  ('خزانات مياه', 'tanks', 3),
  ('مواسير PVC', 'pvc-pipes', 4),
  ('مواسير بولي إيثيلين', 'pe-pipes', 5),
  ('خراطيم ري', 'hoses', 6),
  ('وصلات وكوع وتي ومحابس', 'fittings', 7),
  ('خراطيم تنقيط', 'drip-hoses', 8),
  ('نقاطات', 'drippers', 9),
  ('منظمات ضغط', 'regulators', 10),
  ('فلاتر', 'filters', 11),
  ('رشاشات', 'sprinklers', 12),
  ('عدادات مياه', 'meters', 13),
  ('صمامات أمان', 'safety-valves', 14),
  ('أغطية نهايات الخطوط', 'end-caps', 15);

-- Seed products
INSERT INTO public.products (title, slug, description, category_id, featured) VALUES
  ('آبار مياه عميقة', 'deep-wells', 'حفر وتجهيز آبار المياه العميقة بأحدث التقنيات لتوفير مصدر مياه موثوق للمزارع والمشاريع الزراعية', (SELECT id FROM public.categories WHERE slug='water-sources'), true),
  ('طلمبة غاطسة 2 حصان', 'submersible-pump-2hp', 'طلمبة غاطسة عالية الكفاءة بقدرة 2 حصان، مناسبة للآبار المتوسطة العمق مع ضمان شامل', (SELECT id FROM public.categories WHERE slug='pumps'), true),
  ('طلمبة سطحية 1 حصان', 'surface-pump-1hp', 'طلمبة سطحية بقدرة 1 حصان لسحب المياه من الخزانات والمصادر السطحية بكفاءة عالية', (SELECT id FROM public.categories WHERE slug='pumps'), false),
  ('خزان مياه 1000 لتر', 'tank-1000l', 'خزان مياه سعة 1000 لتر مصنوع من البولي إيثيلين عالي الجودة، مقاوم للأشعة فوق البنفسجية', (SELECT id FROM public.categories WHERE slug='tanks'), true),
  ('خزان مياه 2000 لتر', 'tank-2000l', 'خزان مياه سعة 2000 لتر للمشاريع الكبيرة، متين ومقاوم للتآكل مع ضمان 10 سنوات', (SELECT id FROM public.categories WHERE slug='tanks'), false),
  ('مواسير PVC 6 بار', 'pvc-6bar', 'مواسير PVC ضغط 6 بار بأقطار متعددة، مناسبة لشبكات الري والصرف الزراعي', (SELECT id FROM public.categories WHERE slug='pvc-pipes'), true),
  ('مواسير PVC 10 بار', 'pvc-10bar', 'مواسير PVC ضغط 10 بار للاستخدامات الثقيلة وشبكات المياه عالية الضغط', (SELECT id FROM public.categories WHERE slug='pvc-pipes'), false),
  ('مواسير بولي إيثيلين PE', 'pe-pipes-main', 'مواسير بولي إيثيلين مرنة وقوية لنقل المياه في المشاريع الزراعية بأقطار من 16 إلى 110 مم', (SELECT id FROM public.categories WHERE slug='pe-pipes'), true),
  ('خراطيم ري رئيسية', 'main-hoses', 'خراطيم ري رئيسية متينة لتوزيع المياه في الحقول بكفاءة عالية ومقاومة للضغط', (SELECT id FROM public.categories WHERE slug='hoses'), false),
  ('وصلات وأكواع PVC', 'pvc-fittings', 'تشكيلة كاملة من وصلات وأكواع ومحابس PVC لجميع أقطار المواسير مع ضمان الجودة', (SELECT id FROM public.categories WHERE slug='fittings'), true),
  ('خراطيم تنقيط 16 مم', 'drip-hose-16mm', 'خراطيم تنقيط قطر 16 مم بمسافات متعددة بين النقاطات، مثالية للزراعة المكثفة', (SELECT id FROM public.categories WHERE slug='drip-hoses'), true),
  ('نقاطات تعويضية', 'compensating-drippers', 'نقاطات تعويضية الضغط بتصريفات متعددة (2، 4، 8 لتر/ساعة) لري منتظم في جميع الظروف', (SELECT id FROM public.categories WHERE slug='drippers'), true),
  ('منظم ضغط 2 بار', 'regulator-2bar', 'منظم ضغط 2 بار لتنظيم ضغط المياه في شبكات الري بالتنقيط وحماية المكونات', (SELECT id FROM public.categories WHERE slug='regulators'), false),
  ('فلتر شبكي 2 بوصة', 'mesh-filter-2inch', 'فلتر شبكي 2 بوصة لتنقية المياه من الشوائب وحماية شبكة الري من الانسداد', (SELECT id FROM public.categories WHERE slug='filters'), true),
  ('رشاش دوار 360 درجة', 'rotary-sprinkler', 'رشاش دوار بزاوية 360 درجة لتغطية مساحات واسعة بري منتظم وفعال', (SELECT id FROM public.categories WHERE slug='sprinklers'), true),
  ('عداد مياه 1 بوصة', 'water-meter-1inch', 'عداد مياه 1 بوصة لقياس استهلاك المياه بدقة عالية في المشاريع الزراعية', (SELECT id FROM public.categories WHERE slug='meters'), false),
  ('صمام أمان 2 بوصة', 'safety-valve-2inch', 'صمام أمان 2 بوصة لحماية شبكة الري من الضغط الزائد والمطرقة المائية', (SELECT id FROM public.categories WHERE slug='safety-valves'), false),
  ('أغطية نهايات خطوط 16 مم', 'end-cap-16mm', 'أغطية نهايات خطوط الري قطر 16 مم لإحكام غلق نهايات خراطيم التنقيط', (SELECT id FROM public.categories WHERE slug='end-caps'), false);

-- Seed FAQ
INSERT INTO public.faq_items (question, answer, "order") VALUES
  ('ما هي أنظمة الري المتاحة لديكم؟', 'نوفر جميع أنظمة الري الحديث بما في ذلك الري بالتنقيط، الري بالرش، والري السطحي.', 1),
  ('هل توفرون خدمة التركيب والتصميم؟', 'نعم، نقدم خدمة تصميم شبكات الري بالكامل وتركيبها على يد فنيين متخصصين مع ضمان شامل.', 2),
  ('ما هي مناطق التوصيل المتاحة؟', 'نغطي جميع محافظات مصر مع خدمة توصيل سريعة خلال 24-48 ساعة.', 3),
  ('ما هو الفرق بين مواسير PVC و PE؟', 'PVC صلبة للضغط العالي والشبكات الرئيسية. PE مرنة للخطوط الفرعية والتنقيط.', 4),
  ('كيف أختار الفلتر المناسب؟', 'يعتمد على مصدر المياه: جوفية = فلتر شبكي، ترع = فلتر رملي.', 5),
  ('ما الضغط المناسب للري بالتنقيط؟', 'الضغط المثالي 1-2 بار مع منظم ضغط لضمان الانتظام.', 6);

-- Seed testimonials
INSERT INTO public.testimonials (name, role, content, rating) VALUES
  ('م. أحمد السيد', 'مزارع - المنوفية', 'تعاملت مع شركة الشريف في تجهيز شبكة ري كاملة لمزرعتي. المنتجات ممتازة والأسعار منافسة.', 5),
  ('م. محمد عبدالله', 'مهندس زراعي - الفيوم', 'خدمة ممتازة وسرعة في التوريد. طلبت كميات كبيرة وكل شيء وصل في الموعد بجودة عالية.', 5),
  ('الحاج عبدالرحمن', 'صاحب مشتل - البحيرة', 'من أفضل الشركات في مجال الري. دعم فني متميز ومتابعة بعد البيع.', 5),
  ('م. سارة حسن', 'مهندسة ري - الشرقية', 'منتجات عالية الجودة وفريق فني محترف. ساعدوني في تصميم شبكة ري متكاملة.', 4);

-- Seed site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('phone1', '01111661177'),
  ('phone2', '01008028048'),
  ('admin_phone', '01028200048'),
  ('whatsapp', '201111661177'),
  ('address', 'مصر'),
  ('hours', 'السبت - الخميس: 9 صباحاً - 6 مساءً'),
  ('hero_title', 'حلول الري الحديث وتوريدات المياه'),
  ('hero_subtitle', 'نوفر لك أجود منتجات الري والمياه بأسعار تنافسية مع دعم فني متكامل');

-- Seed blog posts
INSERT INTO public.blog_posts (title, slug, content, excerpt, published, author_name) VALUES
  ('أفضل أنظمة الري الحديث للمزارع المصرية', 'best-irrigation-systems', 'تعتبر أنظمة الري الحديث من أهم عوامل نجاح الزراعة في مصر. الري بالتنقيط يوصل المياه مباشرة لجذور النبات وهو الأكثر كفاءة. الري بالرش مناسب للمساحات الكبيرة.', 'استعراض شامل لأفضل أنظمة الري الحديث', true, 'فريق الشريف'),
  ('الفرق بين مواسير PVC و PE', 'pvc-vs-pe-pipes', 'مواسير PVC صلبة وقوية ومناسبة للضغط العالي والشبكات الرئيسية. مواسير PE مرنة وسهلة التمديد ومناسبة للخطوط الفرعية والري بالتنقيط.', 'دليل شامل للفرق بين مواسير PVC وPE', true, 'فريق الشريف'),
  ('مشاكل الضغط في شبكات الري وحلولها', 'pressure-problems', 'انخفاض الضغط يحدث بسبب تسريب أو قطر مواسير صغير. الحل: فحص الشبكة وإصلاح التسريبات واستخدام منظم ضغط وصمام أمان.', 'حلول عملية لمشاكل الضغط الشائعة', true, 'فريق الشريف');

-- Seed tips
INSERT INTO public.tips (title, content, category, published) VALUES
  ('كيفية اختيار النقاطات المناسبة', 'للتربة الرملية استخدم نقاطات بتصريف 4-8 لتر/ساعة. للتربة الطينية استخدم 2-4 لتر/ساعة.', 'نقاطات', true),
  ('صيانة الفلاتر الدورية', 'نظف الفلاتر كل أسبوعين. الفلاتر الشبكية تُنظف بالماء والفرشاة. الرملية تحتاج غسيل عكسي.', 'فلاتر', true),
  ('ضبط ضغط شبكة الري', 'الضغط المثالي للتنقيط 1-2 بار. استخدم منظم ضغط عند مدخل كل قطاع.', 'ضغط', true),
  ('حماية الشبكة من المطرقة المائية', 'ركب صمام أمان وأغلق المحابس ببطء واستخدم خزان هوائي لامتصاص الصدمات.', 'صمامات', true),
  ('اختيار الرشاشات حسب المساحة', 'مساحات صغيرة: بوب أب. متوسطة: دوارة. كبيرة: بندقية Rain Gun.', 'رشاشات', true);
