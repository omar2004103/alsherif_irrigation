import React, { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { 
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, Minus, AlignRight, AlignCenter, AlignLeft, 
  Link2, Unlink, Image as ImageIcon, Undo2, Redo2, Loader2, Code,
  Palette, Upload, Link as LinkIcon
} from 'lucide-react';
import { uploadFileToSupabase } from '@/services/storageService';
import { useToast } from '@/hooks/use-toast';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const PRESET_COLORS = [
  { label: 'الافتراضي', color: '#1e293b' },
  { label: 'أزرق الشريف', color: '#0284c7' },
  { label: 'أخضر زمردي', color: '#059669' },
  { label: 'كهرماني', color: '#d97706' },
  { label: 'أحمر داكن', color: '#dc2626' },
  { label: 'رمادي', color: '#64748b' },
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'اكتب تفاصيل ومحتوى المقال هنا...',
  disabled = false,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'right',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline font-medium hover:opacity-80 transition-opacity',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 border border-border shadow-md mx-auto block',
        },
      }),
    ],
    content: content || '',
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[340px] max-h-[600px] overflow-y-auto px-5 py-4 text-sm leading-relaxed text-foreground focus:outline-none prose prose-slate dark:prose-invert max-w-none text-right dir-rtl',
        dir: 'rtl',
      },
    },
  });

  if (!editor) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Handle Image Upload into Editor
  const handleEditorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { url } = await uploadFileToSupabase(file, 'blog-content');
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      toast({ title: 'تم إدراج الصورة في المقال بنجاح 🖼️' });
    } catch (err: any) {
      toast({ title: 'خطأ أثناء رفع الصورة', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddDirectImageUrl = () => {
    const url = window.prompt('أدخل رابط الصورة المباشر (URL):');
    if (url && url.trim()) {
      editor.chain().focus().setImage({ src: url.trim() }).run();
    }
  };

  const setLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setShowLinkInput(false);
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run();
    setLinkUrl('');
    setShowLinkInput(false);
  };

  const openLinkModal = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setShowLinkInput(true);
  };

  const wordCount = editor.storage.characterCount
    ? editor.storage.characterCount.words()
    : editor.getText().trim().split(/\s+/).filter(Boolean).length;

  const charCount = editor.getText().length;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden flex flex-col transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
      
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleEditorImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border/80 bg-muted/30 p-2.5 backdrop-blur-sm select-none" dir="rtl">
        
        {/* Headings */}
        <div className="flex items-center gap-0.5 border-l border-border/60 pl-1.5 ml-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            title="عنوان رئيسي (H1)"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            title="عنوان فرعي (H2)"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            title="عنوان قسم (H3)"
          >
            <Heading3 className="h-4 w-4" />
          </button>
        </div>

        {/* Text Formats */}
        <div className="flex items-center gap-0.5 border-l border-border/60 pl-1.5 ml-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('bold')
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            title="عريض (Bold)"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('italic')
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            title="مائل (Italic)"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('strike')
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            title="شطب (Strikethrough)"
          >
            <Strikethrough className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('code')
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            title="كود مضمن (Code)"
          >
            <Code className="h-4 w-4" />
          </button>
        </div>

        {/* Text Colors */}
        <div className="relative border-l border-border/60 pl-1.5 ml-1">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center gap-1 p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="لون النص"
          >
            <Palette className="h-4 w-4 text-emerald-600" />
          </button>

          {showColorPicker && (
            <div className="absolute top-full right-0 z-20 mt-1 flex flex-col gap-1 rounded-xl border border-border bg-card p-2 shadow-xl min-w-[140px]">
              <span className="text-[10px] font-bold text-muted-foreground px-2 pb-1 border-b border-border/50">اختر لون النص</span>
              {PRESET_COLORS.map(c => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(c.color).run();
                    setShowColorPicker(false);
                  }}
                  className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs hover:bg-accent transition-colors"
                >
                  <span className="h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: c.color }} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 border-l border-border/60 pl-1.5 ml-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive({ textAlign: 'right' })
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            title="محاذاة لليمين"
          >
            <AlignRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive({ textAlign: 'center' })
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            title="محاذاة للوسط"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive({ textAlign: 'left' })
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            title="محاذاة لليسار"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center gap-0.5 border-l border-border/60 pl-1.5 ml-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('bulletList')
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            title="قائمة نقطية"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('orderedList')
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            title="قائمة رقمية"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('blockquote')
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            title="اقتباس"
          >
            <Quote className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="فاصل أفقي"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>

        {/* Links */}
        <div className="flex items-center gap-0.5 border-l border-border/60 pl-1.5 ml-1">
          <button
            type="button"
            onClick={openLinkModal}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('link')
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
            title="إضافة أو تعديل رابط"
          >
            <Link2 className="h-4 w-4" />
          </button>
          {editor.isActive('link') && (
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
              title="إزالة الرابط"
            >
              <Unlink className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Media / Images insertion inside content */}
        <div className="flex items-center gap-1 border-l border-border/60 pl-1.5 ml-1">
          <button
            type="button"
            disabled={uploadingImage}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold disabled:opacity-50"
            title="رفع صورة من الجهاز وإدراجها في سياق المقال"
          >
            {uploadingImage ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            <span>إدراج صورة</span>
          </button>

          <button
            type="button"
            onClick={handleAddDirectImageUrl}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="إدراج صورة برابط مباشر"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 mr-auto">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30 transition-colors"
            title="تراجع (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30 transition-colors"
            title="إعادة (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Inline Link Prompt Dialog */}
      {showLinkInput && (
        <div className="flex items-center gap-2 bg-accent/30 p-2.5 border-b border-border/80" dir="rtl">
          <Link2 className="h-4 w-4 text-primary shrink-0" />
          <input
            type="url"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setLink(); } }}
            placeholder="https://example.com"
            className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
            dir="ltr"
            autoFocus
          />
          <button
            type="button"
            onClick={setLink}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90"
          >
            تطبيق
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent"
          >
            إلغاء
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="relative flex-1 bg-background/50">
        <EditorContent editor={editor} />
      </div>

      {/* Footer Word & Character Counter */}
      <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground" dir="rtl">
        <div className="flex items-center gap-4">
          <span>الكلمات: <strong className="text-foreground">{wordCount}</strong></span>
          <span>الحروف: <strong className="text-foreground">{charCount}</strong></span>
        </div>
        <span className="text-[10px] text-muted-foreground/80">محرر غني يدعم التنسيق الكامل والـ SEO</span>
      </div>
    </div>
  );
};
