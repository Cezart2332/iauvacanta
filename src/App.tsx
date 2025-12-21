import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, DataProvider } from './context';
import { Navbar, Footer } from './components';
import {
  HomePage,
  ListingsPage,
  PropertyDetailsPage,
  LoginPage,
  RegisterPage,
  OwnerDashboard,
} from './pages';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <div className="relative min-h-screen bg-[var(--brand-sand)] overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-70">
              <div className="pattern-wave w-full h-full" />
              <div className="absolute -top-32 right-[-10%] w-[420px] h-[420px] bg-aurora blur-3xl opacity-20 rounded-full" />
              <div className="absolute -bottom-48 left-[-5%] w-[420px] h-[420px] bg-dawn blur-3xl opacity-20 rounded-full" />
            </div>
            <div className="relative flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 pt-24 md:pt-28">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/locations/:judetSlug" element={<ListingsPage />} />
                <Route path="/property/:id" element={<PropertyDetailsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard/owner" element={<OwnerDashboard />} />
              </Routes>
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
