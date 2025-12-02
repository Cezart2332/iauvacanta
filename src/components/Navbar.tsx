import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useAuth } from '../context';
import { BrandButton, buttonClasses } from './ui/Button';

type NavLink = {
  label: string;
  path: string;
  hash?: string;
  badge?: string;
};

const navLinks: NavLink[] = [
  { label: 'Acasă', path: '/' },
  { label: 'Destinații', path: '/', hash: '#map' },
  { label: 'Gazde', path: '/', hash: '#hosts' },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname, location.hash]);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    return currentUser.role === 'owner' ? '/dashboard/owner' : '/dashboard/traveler';
  };

  const mobileNavVariants = {
    hidden: { opacity: 0, y: -16 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
  };

  const resolvedAvatar = currentUser?.avatarUrl || `https://avatar.iran.liara.run/username?username=${currentUser?.name || 'guest'}`;
  const firstName = currentUser?.name?.split(' ')[0] || 'Contul meu';

  const isLinkActive = (path: string, hash?: string) => {
    const matchesPath = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    if (!hash) return matchesPath;
    return matchesPath && location.hash === hash;
  };

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    link: NavLink,
    options?: { onClick?: () => void }
  ) => {
    const isMapLink = link.path === '/' && link.hash === '#map';
    const isHome = location.pathname === '/';

    if (isMapLink && isHome) {
      event.preventDefault();
      window.dispatchEvent(new Event('map-focus'));
      options?.onClick?.();
      return;
    }

    options?.onClick?.();
  };

  const renderNavLink = (
    link: NavLink,
    options?: { onClick?: () => void; withIndicator?: boolean }
  ) => {
    const identifier = `${link.path}${link.hash || ''}`;
    const active = isLinkActive(link.path, link.hash);
    const hovered = hoveredLink === identifier;
    const showIndicator = options?.withIndicator ?? true;

    return (
      <Link
        key={identifier}
        to={link.hash ? { pathname: link.path, hash: link.hash } : link.path}
        onMouseEnter={() => setHoveredLink(identifier)}
        onMouseLeave={() => setHoveredLink(null)}
        onClick={(event) => handleNavClick(event, link, options)}
        className="relative px-3 py-1.5 rounded-full"
      >
        {showIndicator && (active || hovered) && (
          <motion.span
            layoutId="nav-pill"
            className="absolute inset-0 rounded-full bg-white shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          />
        )}
        <span className="relative flex items-center gap-2">
          {link.label}
          {link.badge && (
            <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--brand-primary)]/80">{link.badge}</span>
          )}
        </span>
      </Link>
    );
  };

  return (
    <nav className="fixed inset-x-0 top-5 z-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-6xl mx-auto"
      >
        <div className="surface-glass glass-ring relative flex items-center gap-4 px-4 sm:px-6 py-3 md:py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <span className="absolute -inset-1 rounded-2xl bg-aurora opacity-30 blur-md group-hover:opacity-70 transition-opacity" />
              <div className="relative w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-[0_10px_25px_rgba(15,23,42,0.1)]">
                <svg className="w-6 h-6 text-[var(--brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 12.5l9-9 9 9M5.5 10V19a1 1 0 001 1h4.25m9.25-10v9.5a1 1 0 01-1 1H15" />
                </svg>
              </div>
            </div>
            <div>
              <p className="font-semibold text-base text-[var(--brand-ink)] leading-tight">iau vacanță</p>
            </div>
            <span className="hidden sm:inline-flex text-[10px] uppercase tracking-[0.35em] text-white bg-[var(--brand-primary)]/80 px-2 py-1 rounded-full">
              Beta
            </span>
          </Link>

          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="relative flex items-center gap-1 rounded-full border border-white/60 bg-white/50 px-2 py-1 text-sm font-semibold text-[var(--brand-slate)] shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <LayoutGroup id="primary-nav">
                {navLinks.map((link) => renderNavLink(link))}
              </LayoutGroup>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-full border border-white/60 bg-white/60 px-3 py-1.5 pr-2 text-sm font-semibold text-[var(--brand-ink)] shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition hover:border-white hover:bg-white"
                >
                  <img src={resolvedAvatar} alt={currentUser?.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-white/60" />
                  <span>{firstName}</span>
                  <svg
                    className={`w-4 h-4 text-[var(--brand-slate)] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-3 w-64 surface-glass py-4 px-4"
                    >
                      <div className="pb-4 border-b border-white/60">
                        <p className="text-sm font-semibold text-[var(--brand-ink)]">{currentUser?.name}</p>
                        <p className="text-xs text-[var(--brand-slate)]">{currentUser?.email}</p>
                      </div>
                      <div className="py-3 flex flex-col gap-2 text-sm font-medium">
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/60 px-3 py-2 text-[var(--brand-slate)] transition hover:border-white hover:bg-white"
                        >
                          Dashboard
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="rounded-2xl border border-red-200/60 bg-red-50/70 px-3 py-2 text-[var(--brand-primary)] transition hover:bg-red-100"
                        >
                          Deconectare
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className={buttonClasses('ghost', 'text-sm px-4 py-2')}>
                  Autentificare
                </Link>
                <Link to="/register" className={buttonClasses('primary', 'text-sm')}>
                  Creează cont
                </Link>
              </>
            )}
          </div>

          <div className="flex flex-1 items-center justify-end gap-2 md:hidden">
            {!isAuthenticated && (
              <Link to="/register" className="text-xs font-semibold text-[var(--brand-primary)]">
                Creează cont
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/60 bg-white/60 text-[var(--brand-ink)] shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
              aria-label="Deschide meniul"
            >
              <span className="sr-only">Toggle menu</span>
              <motion.span
                animate={isMenuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
                className="absolute h-0.5 w-6 bg-[var(--brand-ink)]"
              />
              <motion.span
                animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="absolute h-0.5 w-6 bg-[var(--brand-ink)]"
              />
              <motion.span
                animate={isMenuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
                className="absolute h-0.5 w-6 bg-[var(--brand-ink)]"
              />
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={mobileNavVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="md:hidden px-4 mt-3"
          >
            <div className="surface-glass glass-ring p-4 space-y-4 text-sm">
              {navLinks.map((link) =>
                renderNavLink(link, { onClick: () => setIsMenuOpen(false), withIndicator: false })
              )}
              <div className="h-px bg-white/60" />
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={resolvedAvatar} alt={currentUser?.name} className="w-12 h-12 rounded-2xl object-cover" />
                    <div>
                      <p className="font-semibold text-[var(--brand-ink)]">{currentUser?.name}</p>
                      <p className="text-xs text-[var(--brand-slate)]">{currentUser?.email}</p>
                    </div>
                  </div>
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-2xl border border-white/60 bg-white/60 px-4 py-3 font-semibold text-[var(--brand-slate)]"
                  >
                    Deschide dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-2xl border border-red-200/60 bg-red-50/80 px-4 py-3 font-semibold text-red-500"
                  >
                    Deconectare
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link to="/login" className="block rounded-2xl border border-white/60 bg-white/40 px-4 py-3 font-semibold text-[var(--brand-primary)]">
                    Autentificare
                  </Link>
                  <Link to="/register" className="block text-center rounded-2xl bg-aurora text-white px-4 py-3 font-semibold shadow-[0_18px_35px_rgba(15,23,42,0.15)]">
                    Creează cont
                  </Link>
                  <BrandButton
                    className="w-full justify-center text-sm"
                    onClick={() => {
                      navigate('/locations/brasov');
                      setIsMenuOpen(false);
                    }}
                  >
                    Planifică o evadare
                  </BrandButton>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
