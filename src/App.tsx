import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import SiteMeta from "@/components/SiteMeta";

import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import QuoteRequestPage from "./pages/QuoteRequestPage";
import AdminLogin from "./pages/AdminLogin";
import AdminForgotPassword from "./pages/AdminForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminProfile from "./pages/AdminProfile";
import AdminNotifications from "./pages/AdminNotifications";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminCategories from "./pages/AdminCategories";
import AdminInquiries from "./pages/AdminInquiries";
import AdminFeatured from "./pages/AdminFeatured";
import AdminBanners from "./pages/AdminBanners";
import AdminFAQ from "./pages/AdminFAQ";
import AdminSettings from "./pages/AdminSettings";
import AdminProductImages from "./pages/AdminProductImages";
import AdminBlog from "./pages/AdminBlog";
import AdminTips from "./pages/AdminTips";
import AdminUsers from "./pages/AdminUsers";
import AdminBrands from "./pages/AdminBrands";
import AdminServices from "./pages/AdminServices";
import AdminMessages from "./pages/AdminMessages";
import AdminMedia from "./pages/AdminMedia";

import CategoryPage from "./pages/CategoryPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import TipsPage from "./pages/TipsPage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ContactPage from "./pages/ContactPage";
import SearchPage from "./pages/SearchPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";

import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <SiteMeta />
        <Routes>

          <Route path="/" element={<Index />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:slug" element={<ProductDetailsPage />} />
          <Route path="/quote" element={<QuoteRequestPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/tips" element={<TipsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Navigate to="/admin/login" replace />} />
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="product-images" element={<AdminProductImages />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="inquiries" element={<AdminInquiries />} />
            <Route path="featured" element={<AdminFeatured />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="faq" element={<AdminFAQ />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="tips" element={<AdminTips />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="media" element={<AdminMedia />} />

          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
