import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPageImproved from './pages/CheckoutPageImproved';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AccountLayout from './pages/AccountLayout';
import AccountPage from './pages/AccountPage';
import OrdersPage from './pages/OrdersPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminDeliveryZones from './pages/admin/AdminDeliveryZones';
import AdminDeliverySlots from './pages/admin/AdminDeliverySlots';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCategories from './pages/admin/AdminCategories';
import AdminVouchers from './pages/admin/AdminVouchers';
import SubstitutionApprovalPage from './pages/SubstitutionApprovalPage';
import ContactPage from './pages/ContactPage';
import InfoPage from './pages/InfoPage';
import CookieConsent from './components/CookieConsent';
import { useUTMTracking } from './hooks/useUTMTracking';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  // Track UTM parameters for marketing attribution
  useUTMTracking();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPageImproved />} />
            <Route path="order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="info/:type" element={<InfoPage />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/orders" element={<AdminOrders />} />
            <Route path="admin/products" element={<AdminProducts />} />
            <Route path="admin/delivery-zones" element={<AdminDeliveryZones />} />
            <Route path="admin/delivery-slots" element={<AdminDeliverySlots />} />
            <Route path="admin/analytics" element={<AdminAnalytics />} />
            <Route path="admin/categories" element={<AdminCategories />} />
            <Route path="admin/vouchers" element={<AdminVouchers />} />
            <Route path="substitution/:orderNumber/:itemId/:action" element={<SubstitutionApprovalPage />} />
            <Route path="/" element={<AccountLayout />}>
              <Route path="account" element={<AccountPage />} />
              <Route path="orders" element={<OrdersPage />} />
            </Route>
          </Route>
        </Routes>
        <CookieConsent />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
