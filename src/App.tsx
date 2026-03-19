import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider, DataProvider } from './context';
import { Navbar, Footer } from './components';
import {
  HomePage,
  ListingsPage,
  PropertyDetailsPage,
  LoginPage,
  RegisterPage,
  OwnerDashboard,
  AdminPanelPage,
} from './pages';

function AppRoutes() {
  const location = useLocation();
  const previousPathname = useRef(location.pathname);

  useEffect(() => {
    if (previousPathname.current !== location.pathname) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      previousPathname.current = location.pathname;
    }
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${location.pathname}${location.hash}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/locations/:judetSlug" element={<ListingsPage />} />
          <Route path="/property/:id" element={<PropertyDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard/owner" element={<OwnerDashboard />} />
          <Route path="/dashboard/admin" element={<AdminPanelPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <div className="relative min-h-screen bg-[var(--brand-sand)] overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-100">
              <div className="pattern-wave w-full h-full" />
              <div className="absolute -top-32 right-[-10%] w-[420px] h-[420px] bg-aurora blur-3xl opacity-12 rounded-full" />
              <div className="absolute -bottom-48 left-[-5%] w-[420px] h-[420px] bg-dawn blur-3xl opacity-18 rounded-full" />
            </div>
            <div className="relative flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 pt-24 md:pt-28">
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </div>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
