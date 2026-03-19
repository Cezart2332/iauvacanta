import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { motion } from 'motion/react';
import { useAuth } from '../context';
import { approvePlace, fetchPendingPlaces, type BackendPlace } from '../services/place';

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      staggerChildren: 0.06
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
};

export function AdminPanelPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [pendingPlaces, setPendingPlaces] = useState<BackendPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadPending = async (): Promise<void> => {
      setIsLoading(true);
      setError('');

      try {
        const places = await fetchPendingPlaces();
        if (isMounted) {
          setPendingPlaces(places);
        }
      } catch {
        if (isMounted) {
          setError('Nu am putut încărca proprietățile în așteptare.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (isAdmin) {
      void loadPending();
    }

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const setApproval = async (id: number, approved: boolean): Promise<void> => {
    try {
      await approvePlace(id, approved);
      setPendingPlaces((prev) => prev.filter((place) => place.id !== id));
    } catch {
      setError('Nu am putut actualiza starea proprietății.');
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(82,118,180,0.2)_0%,_rgba(10,16,28,0.88)_48%,_rgba(8,12,20,0.96)_100%)] px-4 py-24"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.header
          variants={itemVariants}
          className="rounded-3xl border border-white/20 bg-white/8 backdrop-blur-xl p-6 shadow-[0_18px_45px_rgba(2,6,23,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--brand-slate)]/75">Admin</p>
          <h1 className="mt-2 text-3xl text-[var(--brand-ink)]">Panel de aprobare proprietăți</h1>
          <p className="mt-2 text-[var(--brand-slate)]">Aprobă sau respinge proprietățile trimise de gazde înainte de publicare.</p>
        </motion.header>

        {error && (
          <motion.div variants={itemVariants} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </motion.div>
        )}

        {isLoading ? (
          <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/8 p-12 text-center text-[var(--brand-slate)]">
            Se încarcă proprietățile în așteptare...
          </motion.div>
        ) : pendingPlaces.length === 0 ? (
          <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/8 p-12 text-center">
            <h2 className="text-2xl text-[var(--brand-ink)]">Nu există proprietăți în așteptare</h2>
            <p className="mt-2 text-[var(--brand-slate)]">Toate solicitările au fost procesate.</p>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="space-y-4">
            {pendingPlaces.map((place, index) => (
              <motion.article
                key={place.id}
                className="rounded-3xl border border-white/20 bg-white/8 backdrop-blur-xl p-5 shadow-[0_18px_45px_rgba(2,6,23,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.24 }}
              >
                <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                  <img
                    src={place.photoUrl}
                    alt={place.title}
                    className="h-40 w-full rounded-2xl object-cover"
                    loading="lazy"
                  />

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--brand-ink)]">{place.title}</h3>
                        <p className="text-sm text-[var(--brand-slate)]">{place.city} • {place.stars} stele • Owner #{place.ownerId}</p>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100">
                        <FiClock className="h-3.5 w-3.5" />
                        În așteptare
                      </span>
                    </div>

                    <p className="text-sm text-[var(--brand-slate)]">{place.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {place.facilities.map((facility) => (
                        <span key={facility} className="rounded-full border border-white/20 bg-white/8 px-3 py-1 text-xs text-[var(--brand-slate)]">
                          {facility}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={() => void setApproval(place.id, true)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        <FiCheckCircle className="h-4 w-4" />
                        Aprobă
                      </button>
                      <button
                        onClick={() => void setApproval(place.id, false)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                      >
                        <FiXCircle className="h-4 w-4" />
                        Respinge
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
