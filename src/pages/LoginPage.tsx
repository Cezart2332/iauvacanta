import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context';
import logo from '../assets/logo.png';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Completează toate câmpurile.');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Adresa de email nu este validă.');
      setIsLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success && result.user) {
      navigate(result.user.isAdmin ? '/dashboard/admin' : '/dashboard/owner');
    } else {
      setError(result.error || 'A apărut o eroare.');
    }

    setIsLoading(false);
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    setError(`Autentificarea prin ${provider} nu este configurată încă.`);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--brand-sand)] px-4 py-24">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[40px] bg-white/80 shadow-[0_40px_80px_rgba(15,23,42,0.18)] md:grid-cols-2">
        <div className="relative hidden bg-gradient-to-br from-[var(--brand-ink)] via-[#0a1935] to-[#020b1a] p-10 text-white md:flex md:flex-col">
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="pattern-wave h-full w-full" />
          </div>
          <div className="relative flex flex-1 flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">Program pentru gazde</p>
              <h2 className="mt-6 text-3xl leading-tight text-white">Administrează-ți proprietățile și urmărește statisticile într-un singur loc.</h2>
              <p className="mt-4 text-white/80">
                Accesează hărți interactive cu cererea reală, recomandări dinamice de preț și instrumente pentru gazde boutique.
              </p>
            </div>
            <ul className="space-y-4 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <FiCheckCircle className="mt-0.5 h-4 w-4 text-white/90" />
                <span>Vizibilitate în județele cu trafic ridicat.</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheckCircle className="mt-0.5 h-4 w-4 text-white/90" />
                <span>Chat direct cu echipa de onboarding și suport dedicat.</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheckCircle className="mt-0.5 h-4 w-4 text-white/90" />
                <span>Perks pentru gazde: mentori și workshop-uri trimestriale.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_10px_25px_rgba(15,23,42,0.1)]">
              <img src={logo} alt="Logo iau vacanță" className="h-8 w-auto object-contain" loading="lazy" decoding="async" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--brand-slate)]/70">platformă</p>
              <p className="text-lg font-semibold text-[var(--brand-ink)]">iau vacanță</p>
            </div>
          </Link>

          <div className="mt-8 space-y-2">
            <h1 className="text-3xl text-[var(--brand-ink)]">Bine ai revenit!</h1>
            <p className="text-[var(--brand-slate)]">Intră în contul tău de gazdă și continuă optimizarea proprietăților.</p>
          </div>

          <div className="mt-8 grid gap-3">
            <button
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-3 rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold text-[var(--brand-ink)] transition hover:bg-black/5"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuă cu Google
            </button>
            <button
              onClick={() => handleSocialLogin('facebook')}
              className="flex items-center justify-center gap-3 rounded-2xl bg-[#1b74e4] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#165dc0]"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continuă cu Facebook
            </button>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white/80 px-4 text-xs uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">sau email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="text-xs uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field mt-2"
                placeholder="email@exemplu.ro"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-xs uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">
                Parolă
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field mt-2"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm text-[var(--brand-slate)]">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]" />
                Ține-mă minte
              </label>
              <a href="#" className="font-semibold text-[var(--brand-primary)]">Ai uitat parola?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-aurora w-full text-xs uppercase tracking-[0.4em] disabled:opacity-60"
            >
              {isLoading ? 'Se încarcă...' : 'Autentificare'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--brand-slate)]">
            Nu ai cont?{' '}
            <Link to="/register" className="font-semibold text-[var(--brand-primary)]">
              Creează-l acum
            </Link>
          </p>

          <div className="mt-6 rounded-2xl border border-white/80 bg-white/90 p-4 text-sm text-[var(--brand-slate)]">
            <p className="font-semibold text-[var(--brand-ink)]">Acces demo gazde</p>
            <p>ion.georgescu@email.com / password123</p>
            <p>elena.dumitrescu@email.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
