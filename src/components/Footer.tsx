import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const socialLinks = [
  { label: 'Facebook', href: '#', icon: (
    <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  ) },
  { label: 'Instagram', href: '#', icon: (
    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
  ) },
  { label: 'Twitter', href: '#', icon: (
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  ) },
];

const quickLinks = [
  { label: 'Acasă', to: '/' },
  { label: 'Destinații', to: '/locations/brasov' },
  { label: 'Autentificare', to: '/login' },
  { label: 'Înregistrare', to: '/register' },
];

const featuredCounties = ['brasov', 'constanta', 'cluj', 'bucuresti', 'sibiu'];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 bg-gradient-to-br from-[#111d36] via-[#13294a] to-[#1c3a69] text-white">
      <div className="absolute inset-0 opacity-55">
        <div className="pattern-wave h-full w-full" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(15,23,42,0.55)] to-[rgba(15,23,42,0.8)]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="space-y-5">
            <Link to="/" className="inline-flex items-center gap-3 rounded-[24px] border border-white/30 bg-white/10 px-4 py-3 backdrop-blur-md">
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center">
                <img src={logo} alt="Logo iau vacanță" className="h-9 w-auto object-contain" loading="lazy" decoding="async" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/70">studio</p>
                <p className="text-xl font-semibold">iau vacanță</p>
              </div>
            </Link>
            <p className="text-white/70">
              Curăm experiențe autentice în toate cele 42 de județe și conectăm turiștii cu gazde atent verificate.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-white/80 transition hover:border-white/50 hover:bg-white/18"
                  aria-label={item.label}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    {item.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Link-uri rapide</p>
            <ul className="mt-4 space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="inline-flex items-center gap-2 text-white/80 hover:text-white">
                    <span>{link.label}</span>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Destinații în trend</p>
            <ul className="mt-4 space-y-2">
              {featuredCounties.map((slug) => (
                <li key={slug}>
                  <Link to={`/locations/${slug}`} className="text-white/80 hover:text-white">
                    {slug.charAt(0).toUpperCase() + slug.slice(1)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Contact</p>
            <div className="space-y-3 text-white/80">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                contact@iauvacanta.ro
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                +40 123 456 789
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                București, România
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/20 pt-6 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} iau vacanță. Toate drepturile rezervate.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Politica de confidențialitate</a>
            <a href="#" className="hover:text-white">Termeni și condiții</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
