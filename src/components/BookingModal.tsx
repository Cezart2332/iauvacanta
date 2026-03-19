import { useState } from 'react';
import { reservePlace } from '../services/reservation';
import { useAuth } from '../context';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
  propertyId: string;
}

export function BookingModal({ isOpen, onClose, propertyName, propertyId }: BookingModalProps) {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError('Trebuie să fii autentificat pentru a face o rezervare.');
      return;
    }

    const placeId = Number(propertyId);
    if (Number.isNaN(placeId)) {
      setError('ID proprietate invalid pentru rezervare.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await reservePlace({
        placeId,
        startDate: formData.checkIn,
        endDate: formData.checkOut
      });

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          checkIn: '',
          checkOut: '',
          guests: 1,
          message: '',
        });
        onClose();
      }, 2000);
    } catch {
      setError('Nu am putut trimite rezervarea. Verifică datele și încearcă din nou.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-white/40 bg-white/95 shadow-[0_40px_80px_rgba(15,23,42,0.35)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-aurora" />

        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-white/60 bg-white/95 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">Rezervare personalizată</p>
            <h2 className="text-2xl font-semibold text-[var(--brand-ink)]">{propertyName}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/60 p-2 text-[var(--brand-slate)] hover:bg-white"
            aria-label="Închide"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6">
          {isSubmitted ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-emerald-100" />
                <svg className="absolute inset-0 m-auto h-10 w-10 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--brand-ink)]">Cerere trimisă cu succes!</h3>
                <p className="text-[var(--brand-slate)]">Echipa sau proprietarul îți va răspunde în cel mai scurt timp.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">
                    Nume complet *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Ion Popescu"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="email@exemplu.ro"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+40 722 123 456"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="guests" className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">
                    Număr persoane *
                  </label>
                  <input
                    type="number"
                    id="guests"
                    name="guests"
                    min={1}
                    max={20}
                    required
                    value={formData.guests}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="checkIn" className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">
                    Check-in *
                  </label>
                  <input
                    type="date"
                    id="checkIn"
                    name="checkIn"
                    required
                    value={formData.checkIn}
                    onChange={handleChange}
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="checkOut" className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">
                    Check-out *
                  </label>
                  <input
                    type="date"
                    id="checkOut"
                    name="checkOut"
                    required
                    value={formData.checkOut}
                    onChange={handleChange}
                    className="input-field"
                    min={formData.checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">
                  Mesaj (opțional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  className="input-field resize-none"
                  placeholder="Menționează cerințe speciale, ore de sosire etc."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-aurora px-6 py-3 text-white font-semibold shadow-[0_25px_45px_rgba(18,86,212,0.25)] transition duration-300 hover:shadow-[0_30px_55px_rgba(18,86,212,0.35)] disabled:opacity-60"
              >
                {isSubmitting ? 'Se trimite...' : 'Trimite cerere de rezervare'}
              </button>

              <p className="text-center text-xs text-[var(--brand-slate)]">
                Trimițând formularul confirmi că ești de acord cu
                <a href="#" className="text-[var(--brand-primary)] hover:underline"> termenii platformei</a>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
