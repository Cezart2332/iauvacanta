import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FiEye, FiHome, FiMessageCircle, FiStar } from 'react-icons/fi';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth, useData } from '../context';
import { counties } from '../mock/counties';
import { propertyTypeLabels, facilityLabels, type PropertyType, type Facility, type Property } from '../mock/properties';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.06
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const allFacilities: Facility[] = [
  'wifi', 'parcare', 'mic-dejun', 'piscină', 'restaurant', 
  'spa', 'aer-conditionat', 'animale', 'fitness', 'room-service',
  'bar', 'terasă', 'grătar', 'jacuzzi', 'saună'
];

interface PropertyFormData {
  name: string;
  type: PropertyType;
  judetSlug: string;
  city: string;
  address: string;
  priceMin: number;
  priceMax: number;
  facilities: Facility[];
  mainImageUrl: string;
  description: string;
  tagline: string;
  phone: string;
  email: string;
  website: string;
}

const emptyForm: PropertyFormData = {
  name: '',
  type: 'hotel',
  judetSlug: '',
  city: '',
  address: '',
  priceMin: 100,
  priceMax: 300,
  facilities: [],
  mainImageUrl: '',
  description: '',
  tagline: '',
  phone: '',
  email: '',
  website: '',
};

export function OwnerDashboard() {
  const { currentUser, isAuthenticated } = useAuth();
  const { getPropertiesByOwner, addProperty, updateProperty, deleteProperty } = useData();
  
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<PropertyFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role === 'admin') {
    return <Navigate to="/dashboard/admin" replace />;
  }

  if (currentUser.role !== 'owner') {
    return <Navigate to="/login" replace />;
  }

  const myProperties = getPropertiesByOwner(currentUser.id);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'priceMin' || name === 'priceMax' ? Number(value) : value,
    }));
  };

  const handleFacilityToggle = (facility: Facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  const [submitError, setSubmitError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    if (editingProperty) {
      try {
        await updateProperty(editingProperty.id, formData);
      } catch {
        setSubmitError('Nu am putut actualiza proprietatea. Verifică autentificarea și încearcă din nou.');
        return;
      }
    } else {
      try {
        await addProperty({
          ...formData,
          images: [formData.mainImageUrl],
          rating: 4.0,
          reviewCount: 0,
          ownerId: currentUser.id,
          isApproved: false
        });
      } catch {
        setSubmitError('Nu am putut crea proprietatea. Verifică autentificarea și încearcă din nou.');
        return;
      }
    }

    setFormData(emptyForm);
    setShowForm(false);
    setEditingProperty(null);
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      name: property.name,
      type: property.type,
      judetSlug: property.judetSlug,
      city: property.city,
      address: property.address,
      priceMin: property.priceMin,
      priceMax: property.priceMax,
      facilities: property.facilities,
      mainImageUrl: property.mainImageUrl,
      description: property.description,
      tagline: property.tagline,
      phone: property.phone,
      email: property.email,
      website: property.website,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProperty(id);
      setDeleteConfirm(null);
    } catch {
      setSubmitError('Nu am putut șterge proprietatea. Încearcă din nou.');
    }
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    setShowForm(false);
    setEditingProperty(null);
  };

  return (
    <motion.div
      className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(82,118,180,0.2)_0%,_rgba(10,16,28,0.88)_42%,_rgba(8,12,20,0.96)_100%)] pt-20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--brand-ink)]">
              Proprietățile mele
            </h1>
            <p className="mt-1 text-[var(--brand-slate)]">
              Gestionează-ți proprietățile și vezi statisticile
            </p>
          </div>
          <motion.button
            onClick={() => setShowForm(true)}
            className="btn-accent flex items-center gap-2"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Adaugă proprietate
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Proprietăți', value: myProperties.length, Icon: FiHome },
            { label: 'Rating mediu', value: myProperties.length > 0 ? (myProperties.reduce((acc, p) => acc + p.rating, 0) / myProperties.length).toFixed(1) : '0', Icon: FiStar },
            { label: 'Total recenzii', value: myProperties.reduce((acc, p) => acc + p.reviewCount, 0), Icon: FiMessageCircle },
            { label: 'Vizualizări', value: '1.2K', Icon: FiEye },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="rounded-2xl border border-white/20 bg-white/8 backdrop-blur-xl shadow-[0_18px_45px_rgba(2,6,23,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] p-6"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + index * 0.06, duration: 0.28 }}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-[var(--brand-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <stat.Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-2xl font-bold text-[var(--brand-ink)]">{stat.value}</div>
                  <div className="text-sm text-[var(--brand-slate)]">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Property Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleCancel}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/20 bg-[#0d1524]/94 backdrop-blur-2xl shadow-[0_35px_80px_rgba(2,6,23,0.65),inset_0_1px_0_rgba(255,255,255,0.08)]"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              >
              <div className="sticky top-0 border-b border-white/20 bg-[#0d1524]/95 backdrop-blur-xl px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-[var(--brand-ink)]">
                  {editingProperty ? 'Editează proprietatea' : 'Adaugă proprietate nouă'}
                </h2>
                <button onClick={handleCancel} className="p-2 hover:bg-white/10 rounded-full">
                  <svg className="w-5 h-5 text-[var(--brand-slate)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {submitError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {submitError}
                  </div>
                )}
                {/* Basic info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nume proprietate *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Hotel Paradise"
                    />
                  </div>
                  <div>
                    <label className="label">Tip *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      {(Object.keys(propertyTypeLabels) as PropertyType[]).map(type => (
                        <option key={type} value={type}>{propertyTypeLabels[type]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Județ *</label>
                    <select
                      name="judetSlug"
                      value={formData.judetSlug}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                    >
                      <option value="">Selectează...</option>
                      {counties.map(county => (
                        <option key={county.slug} value={county.slug}>{county.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Oraș *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="București"
                    />
                  </div>
                  <div>
                    <label className="label">Adresă *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Strada Exemplu 123"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Preț minim (RON/noapte) *</label>
                    <input
                      type="number"
                      name="priceMin"
                      value={formData.priceMin}
                      onChange={handleInputChange}
                      required
                      min={1}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Preț maxim (RON/noapte) *</label>
                    <input
                      type="number"
                      name="priceMax"
                      value={formData.priceMax}
                      onChange={handleInputChange}
                      required
                      min={formData.priceMin}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Facilities */}
                <div>
                  <label className="label">Facilități</label>
                  <div className="flex flex-wrap gap-2">
                    {allFacilities.map(facility => (
                      <button
                        key={facility}
                        type="button"
                        onClick={() => handleFacilityToggle(facility)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          formData.facilities.includes(facility)
                            ? 'bg-[var(--brand-primary)]/25 text-[#dce8ff] ring-2 ring-[var(--brand-primary)]/60'
                            : 'bg-white/10 text-[var(--brand-slate)] hover:bg-white/15'
                        }`}
                      >
                        {facilityLabels[facility]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="label">URL imagine principală *</label>
                  <input
                    type="url"
                    name="mainImageUrl"
                    value={formData.mainImageUrl}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.mainImageUrl && (
                    <div className="mt-2">
                      <img
                        src={formData.mainImageUrl}
                        alt="Preview"
                        className="w-32 h-24 object-cover rounded-lg"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="label">Descriere *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Descrieți proprietatea..."
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label className="label">Tagline (opțional)</label>
                  <input
                    type="text"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="ex: Vedere la munte"
                  />
                </div>

                {/* Contact */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Telefon *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="+40 XXX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="contact@proprietate.ro"
                    />
                  </div>
                  <div>
                    <label className="label">Website (opțional)</label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="www.proprietate.ro"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <button type="button" onClick={handleCancel} className="btn-outline-glow flex-1 justify-center">
                    Anulează
                  </button>
                  <button type="submit" className="btn-aurora flex-1 justify-center">
                    {editingProperty ? 'Salvează modificările' : 'Adaugă proprietate'}
                  </button>
                </div>
              </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Properties list */}
        {myProperties.length === 0 ? (
          <motion.div variants={itemVariants} className="rounded-2xl border border-white/20 bg-white/8 shadow-[0_20px_45px_rgba(2,6,23,0.5)] p-12 text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[var(--brand-slate)]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[var(--brand-ink)] mb-2">
              Nu ai încă proprietăți listate
            </h3>
            <p className="text-[var(--brand-slate)] mb-6">
              Adaugă prima ta proprietate și începe să primești cereri de rezervare
            </p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Adaugă prima proprietate
              </span>
            </button>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="space-y-4">
            {myProperties.map((property, index) => (
              <motion.div
                key={property.id}
                className="rounded-xl border border-white/20 bg-white/8 shadow-[0_18px_40px_rgba(2,6,23,0.5)] overflow-hidden"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * index, duration: 0.25 }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                    <img
                      src={property.mainImageUrl}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            {propertyTypeLabels[property.type]}
                          </span>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-medium">{property.rating}</span>
                            <span className="text-xs text-gray-400">({property.reviewCount})</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--brand-ink)] mb-1">
                          <Link to={`/property/${property.id}`} className="hover:text-blue-600">
                            {property.name}
                          </Link>
                        </h3>
                        <p className="text-[var(--brand-slate)] text-sm mb-3">
                          {property.city}, {property.address}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {property.facilities.slice(0, 4).map(f => (
                            <span key={f} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              {facilityLabels[f]}
                            </span>
                          ))}
                          {property.facilities.length > 4 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              +{property.facilities.length - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <div className="text-lg font-bold text-[var(--brand-ink)]">
                            {property.priceMin} - {property.priceMax} RON
                          </div>
                          <div className="text-sm text-[var(--brand-slate)]">per noapte</div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link
                            to={`/property/${property.id}`}
                            className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Vezi
                          </Link>
                          <button
                            onClick={() => handleEdit(property)}
                            className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Editează
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(property.id)}
                            className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Șterge
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delete confirmation */}
                <AnimatePresence>
                  {deleteConfirm === property.id && (
                    <motion.div
                      className="bg-red-50 border-t border-red-100 px-6 py-4 flex items-center justify-between"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-red-700">Ești sigur că vrei să ștergi această proprietate?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-4 py-2 text-sm text-gray-600 hover:bg-white rounded-lg transition-colors"
                        >
                          Anulează
                        </button>
                        <button
                          onClick={() => void handleDelete(property.id)}
                          className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Șterge definitiv
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
