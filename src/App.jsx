import React, { useState, useEffect } from 'react';
import {
  MapPin, Calendar, ArrowLeft, Plane, Globe, Camera,
  Plus, Save, X, Edit2, Trash2, AlertTriangle, Search,
  Shield, Eye, Upload, Loader2, LogOut
} from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, storage } from './firebase/firebaseConfig';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import UsersPage from './pages/UsersPage';
import imageCompression from 'browser-image-compression';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

// ── LOGIN ──────────────────────────────────────────────────
function LoginPage() {
  const { login, register } = useAuth();
  const [mode,    setMode]    = useState('login');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [form,    setForm]    = useState({ displayName: '', email: '', password: '', confirm: '' });
  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (mode === 'register' && form.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (mode === 'register' && form.password !== form.confirm) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.email, form.password, form.displayName.trim());
    } catch (err) { setError(mapError(err.code)); }
    finally { setLoading(false); }
  }

  const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all placeholder:text-gray-400";
  const labelCls = "block text-xs font-semibold text-primary-900 mb-1.5 uppercase tracking-wide";

  return (
    <div className="min-h-screen flex">
      {/* Left visual panel */}
      <div className="hidden lg:flex lg:w-3/5 relative bg-primary-900 flex-col items-center justify-center overflow-hidden">
        <div className="absolute top-[-100px] right-[-120px] w-[480px] h-[480px] rounded-full bg-white/[0.04]" />
        <div className="absolute bottom-[-80px] left-[-100px] w-[360px] h-[360px] rounded-full bg-white/[0.05]" />
        <div className="absolute top-[30%] left-[8%] w-48 h-48 rounded-full bg-white/[0.03]" />

        {/* Floating mini cards */}
        <div className="absolute top-14 left-10 w-52 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl -rotate-3">
          <div className="w-full h-24 bg-gradient-to-br from-[#0e6b89] to-[#29a0c2] rounded-xl mb-3" />
          <p className="font-serif font-bold text-white text-base leading-tight">Santorini</p>
          <p className="text-white/55 text-xs mt-0.5">Grecia · Jun 2024</p>
        </div>
        <div className="absolute top-20 right-8 w-48 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl rotate-[4deg]">
          <div className="w-full h-20 bg-gradient-to-br from-[#7e1d10] to-[#c04020] rounded-xl mb-3" />
          <p className="font-serif font-bold text-white text-sm leading-tight">Marrakech</p>
          <p className="text-white/55 text-xs mt-0.5">Marruecos · Sep 2024</p>
        </div>
        <div className="absolute bottom-16 left-14 w-52 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl rotate-[2deg]">
          <div className="w-full h-24 bg-gradient-to-br from-[#1e3d6b] to-[#2f5fa0] rounded-xl mb-3" />
          <p className="font-serif font-bold text-white text-base leading-tight">Patagonia</p>
          <p className="text-white/55 text-xs mt-0.5">Argentina · Ene 2025</p>
        </div>
        <div className="absolute bottom-24 right-10 w-44 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl -rotate-2">
          <div className="w-full h-20 bg-gradient-to-br from-[#5b1e7a] to-[#8b35b8] rounded-xl mb-3" />
          <p className="font-serif font-bold text-white text-sm leading-tight">Lisboa</p>
          <p className="text-white/55 text-xs mt-0.5">Portugal · Ago 2024</p>
        </div>

        {/* Brand center */}
        <div className="z-10 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="font-serif text-3xl font-bold text-primary-900 leading-none">B</span>
          </div>
          <h1 className="font-serif text-4xl font-bold text-white mb-2">Mi Bitácora</h1>
          <p className="font-serif italic text-lg text-white/70">Guardá cada aventura</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-warm-50 p-8">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center mb-8 lg:hidden">
            <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center mr-3 shadow-md">
              <span className="font-serif text-xl font-bold text-white leading-none">B</span>
            </div>
            <span className="font-serif text-xl font-bold text-gray-900">Mi Bitácora</span>
          </div>

          {/* Tabs */}
          <div className="flex bg-warm-100 rounded-2xl p-1 mb-8 border border-gray-200/60">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'login' ? 'bg-white shadow-sm text-primary-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'register' ? 'bg-white shadow-sm text-primary-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Crear cuenta
            </button>
          </div>

          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-1">
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Empezá tu bitácora'}
          </h2>
          <p className="text-gray-400 text-sm mb-7">
            {mode === 'login' ? 'Ingresá para ver tu colección de viajes.' : 'Creá tu cuenta y comenzá a registrar aventuras.'}
          </p>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm mb-5">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className={labelCls}>Nombre completo</label>
                <input required placeholder="Tu nombre" className={inputCls} value={form.displayName} onChange={set('displayName')} />
              </div>
            )}
            <div>
              <label className={labelCls}>Correo electrónico</label>
              <input required type="email" placeholder="tu@email.com" className={inputCls} value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className={labelCls}>Contraseña</label>
              <input required type="password" placeholder="••••••••" className={inputCls} value={form.password} onChange={set('password')} />
            </div>
            {mode === 'register' && (
              <div>
                <label className={labelCls}>Confirmar contraseña</label>
                <input required type="password" placeholder="••••••••" className={inputCls} value={form.confirm} onChange={set('confirm')} />
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-primary-900 text-white py-3.5 rounded-2xl font-semibold hover:bg-primary-800 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg shadow-primary-900/25 mt-2">
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (mode === 'login' ? 'Ingresar' : 'Crear cuenta')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── NAVBAR ─────────────────────────────────────────────────
function Navbar({ onGoHome, onNewTrip, onUsers, isAdmin }) {
  const { logout } = useAuth();
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={onGoHome}>
            <div className="w-9 h-9 bg-primary-900 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <span className="font-serif text-lg font-bold text-white leading-none">B</span>
            </div>
            <span className="font-serif font-bold text-xl text-gray-900 tracking-tight">Mi Bitácora</span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button onClick={onUsers}
                  className="hidden sm:flex items-center text-sm font-medium text-gray-500 hover:text-primary-900 transition-colors bg-gray-50 hover:bg-gray-100 px-3.5 py-2 rounded-full border border-gray-200 gap-1.5">
                  <Shield className="h-3.5 w-3.5" /><span>Usuarios</span>
                </button>
                <button onClick={onNewTrip}
                  className="bg-primary-900 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-800 flex items-center gap-1.5 shadow-md shadow-primary-900/20 transition-all">
                  <Plus className="h-4 w-4" /><span className="hidden sm:inline">Nuevo Viaje</span>
                </button>
              </>
            )}
            <span className={`hidden sm:flex items-center text-xs font-semibold px-3 py-1.5 rounded-full ${isAdmin ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-primary-50 text-primary-800 border border-primary-100'}`}>
              {isAdmin ? <Shield className="h-3 w-3 mr-1.5" /> : <Eye className="h-3 w-3 mr-1.5" />}
              {isAdmin ? 'Admin' : 'Viajero'}
            </span>
            <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Cerrar sesión">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ── TRIP CARD ──────────────────────────────────────────────
const TripCard = ({ trip, onClick }) => (
  <div onClick={() => onClick(trip.id)} className="rounded-3xl overflow-hidden cursor-pointer group flex flex-col h-full shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <div className="relative h-56 overflow-hidden bg-gray-100">
      <img src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000&auto=format&fit=crop'} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute top-3 left-3 bg-white text-primary-900 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">{formatDate(trip.date)}</div>
      <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold px-2.5 py-1 rounded-full">{trip.country}</div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-serif text-xl font-bold text-white leading-tight line-clamp-2 drop-shadow-sm">{trip.title}</h3>
      </div>
    </div>
    <div className="bg-white p-4 flex flex-col gap-1.5 flex-grow">
      <div className="flex items-center text-gray-500 text-sm gap-1.5">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-secondary-700" />
        <span className="truncate">{trip.location}</span>
      </div>
      <p className="text-gray-400 text-sm line-clamp-2">{trip.description}</p>
    </div>
  </div>
);

// ── HOME ───────────────────────────────────────────────────
const Home = ({ trips, onTripSelect, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const sorted = [...trips].sort((a, b) => new Date(b.date) - new Date(a.date));
  const filtered = sorted.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.country.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const uniqueCountries = new Set(trips.map(t => t.country.trim().toLowerCase())).size;
  const totalPhotos = trips.reduce((acc, t) => acc + (t.gallery?.length || 0), 0);
  const featuredTrip = filtered[0];
  const restTrips = filtered.slice(1);

  return (
    <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold text-gray-900 tracking-tight">Mis Aventuras</h1>
          <p className="text-gray-500 mt-1">Explora mis recuerdos y destinos alrededor del mundo.</p>
        </div>
        {trips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-2.5">
              <span className="text-xl font-bold text-primary-900">{trips.length}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Viajes</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-2.5">
              <span className="text-xl font-bold text-primary-900">{uniqueCountries}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Países</span>
            </div>
            {totalPhotos > 0 && (
              <div className="flex items-center gap-2 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-2.5">
                <span className="text-xl font-bold text-primary-900">{totalPhotos}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fotos</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      {trips.length > 0 && (
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Buscar por título, país o destino..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none shadow-sm text-sm"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Sincronizando...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron viajes.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured card — viaje más reciente */}
          {featuredTrip && !searchTerm && (
            <div onClick={() => onTripSelect(featuredTrip.id)}
              className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden cursor-pointer group shadow-xl">
              <img src={featuredTrip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000&auto=format&fit=crop'}
                alt={featuredTrip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute top-5 left-5 bg-secondary-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                <span>★</span> Viaje destacado
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Globe className="h-3 w-3" />{featuredTrip.country}
                  </span>
                  <span className="bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />{formatDate(featuredTrip.date)}
                  </span>
                  <span className="bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />{featuredTrip.location}
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight drop-shadow-lg">{featuredTrip.title}</h2>
              </div>
            </div>
          )}

          {/* Grid */}
          {(searchTerm ? filtered : restTrips).length > 0 && (
            <>
              {!searchTerm && restTrips.length > 0 && (
                <div className="flex items-center justify-between pt-2">
                  <h3 className="font-serif text-xl font-bold text-gray-800">Todos los viajes</h3>
                  <span className="text-sm text-gray-400">{restTrips.length} {restTrips.length === 1 ? 'viaje' : 'viajes'}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(searchTerm ? filtered : restTrips).map(trip => <TripCard key={trip.id} trip={trip} onClick={onTripSelect} />)}
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
};

// ── TRIP DETAIL ────────────────────────────────────────────
const TripDetail = ({ trip, onBack, onEdit, onDelete, isAdmin }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [tempReview, setTempReview] = useState('');

  if (!trip) return null;

  // Normalizar la galería para manejar tanto strings como objetos
  const normalizedGallery = (trip.gallery || []).map(item => 
    typeof item === 'string' ? { url: item, review: '' } : item
  );

  const handleOpenLightbox = (index) => {
    setSelectedImageIndex(index);
    setTempReview(normalizedGallery[index].review || '');
    setIsEditingReview(false);
  };

  const handleSaveReview = async (e) => {
    e.stopPropagation();
    const updatedGallery = [...normalizedGallery];
    updatedGallery[selectedImageIndex] = { 
      ...updatedGallery[selectedImageIndex], 
      review: tempReview 
    };

    try {
      await updateDoc(doc(db, 'trips', trip.id), { gallery: updatedGallery });
      setIsEditingReview(false);
    } catch (err) {
      console.error('Error al guardar reseña:', err);
    }
  };

  return (
    <main className="flex-grow bg-warm-50 w-full pb-20">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] w-full bg-gray-900">
        <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        
        {/* Navigation / Actions */}
        <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-10 max-w-7xl mx-auto px-4">
          <button onClick={onBack} className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full text-white transition-all shadow-sm">
            <ArrowLeft className="h-6 w-6" />
          </button>
          {isAdmin && (
            <div className="flex gap-3">
              <button onClick={onEdit} className="bg-primary-900/90 hover:bg-primary-800 backdrop-blur-sm px-5 py-2.5 rounded-full text-white text-sm font-bold shadow-lg flex items-center transition-all">
                <Edit2 className="h-4 w-4 mr-2" />Editar Viaje
              </button>
              <button onClick={() => setShowDeleteModal(true)} className="bg-red-600/90 hover:bg-red-700 backdrop-blur-sm px-5 py-2.5 rounded-full text-white text-sm font-bold shadow-lg flex items-center transition-all">
                <Trash2 className="h-4 w-4 mr-2" />Eliminar
              </button>
            </div>
          )}
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-24 left-0 w-full px-6 md:px-12 max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="bg-secondary-700 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">{trip.country}</span>
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center shadow-lg">
              <Calendar className="h-3 w-3 mr-1.5 text-secondary-600" />{formatDate(trip.date)}
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center shadow-lg">
              <MapPin className="h-3 w-3 mr-1.5 text-secondary-600" />{trip.location}
            </span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-4 leading-tight drop-shadow-xl">{trip.title}</h1>
        </div>
      </div>

      {/* Main Content Overlapping Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-20 -mt-16">
        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 p-8 md:p-16 mb-12">
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-primary-900">Descripción del viaje</h2>
            <div className="w-10 h-1 bg-secondary-600 rounded-full mt-2" />
          </div>
          <div className="prose prose-lg md:prose-xl max-w-none text-gray-700 leading-relaxed whitespace-pre-line font-serif">
            {trip.description}
          </div>
        </div>

        {/* Gallery Section */}
        {normalizedGallery.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center justify-between mb-10 px-4">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                  <Camera className="h-7 w-7 text-secondary-700" />
                  Momentos Capturados
                </h2>
                <div className="w-10 h-1 bg-secondary-600 rounded-full mt-2 ml-10" />
              </div>
              <span className="text-gray-500 font-medium bg-white px-4 py-1 rounded-full shadow-sm border border-gray-100">{normalizedGallery.length} fotos</span>
            </div>
            
            {/* Masonry Layout */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {normalizedGallery.map((item, i) => (
                <div 
                  key={i} 
                  className="relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl group cursor-pointer break-inside-avoid transition-all duration-300 border-4 border-transparent hover:border-secondary-600/20"
                  onClick={() => handleOpenLightbox(i)}
                >
                  <img src={item.url} alt={`Galería ${i}`} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                  {item.review && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs line-clamp-2 italic">"{item.review}"</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <div className="bg-white/30 backdrop-blur-md p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                      <Camera className="text-white h-6 w-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map Section */}
        <div className="mb-12">
          <div className="mb-10 px-4">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <MapPin className="h-7 w-7 text-secondary-700" />
              Ubicación
            </h2>
            <div className="w-10 h-1 bg-secondary-600 rounded-full mt-2 ml-10" />
          </div>
          <div className="w-full h-[500px] rounded-[40px] overflow-hidden shadow-2xl border border-gray-100 relative group">
            <div className="absolute inset-0 bg-primary-900/5 group-hover:bg-transparent transition-colors duration-500 pointer-events-none z-10" />
            <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen src={`https://maps.google.com/maps?q=${encodeURIComponent(trip.location + ', ' + trip.country)}&t=&z=12&ie=UTF8&iwloc=&output=embed`} />
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8" onClick={() => setSelectedImageIndex(null)}>
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/5 hover:bg-white/20 p-4 rounded-full backdrop-blur-md transition-all z-10"
            onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(null); }}
          >
            <X className="h-8 w-8" />
          </button>
          
          {selectedImageIndex > 0 && (
            <button 
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-white/5 hover:bg-white/20 p-4 rounded-full backdrop-blur-md transition-all z-10"
              onClick={(e) => { e.stopPropagation(); handleOpenLightbox(selectedImageIndex - 1); }}
            >
              <ArrowLeft className="h-8 w-8" />
            </button>
          )}

          <div className="relative max-w-5xl w-full flex flex-col items-center gap-6" onClick={e => e.stopPropagation()}>
            <img 
              src={normalizedGallery[selectedImageIndex].url} 
              alt="Full screen" 
              className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl" 
            />

            {/* Review Section in Lightbox */}
            <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 text-center relative group">
              {isEditingReview ? (
                <div className="space-y-4">
                  <textarea 
                    autoFocus
                    className="w-full bg-black/20 border border-white/20 rounded-xl p-4 text-white placeholder-white/40 focus:ring-2 focus:ring-secondary-600 outline-none resize-none"
                    placeholder="Escribe una breve reseña de este momento..."
                    value={tempReview}
                    onChange={e => setTempReview(e.target.value)}
                    rows="3"
                  />
                  <div className="flex justify-center gap-3">
                    <button onClick={() => setIsEditingReview(false)} className="px-6 py-2 rounded-full bg-white/10 text-white text-sm font-bold hover:bg-white/20">Cancelar</button>
                    <button onClick={handleSaveReview} className="px-6 py-2 rounded-full bg-secondary-700 text-white text-sm font-bold hover:bg-secondary-600">Guardar Reseña</button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {tempReview ? (
                    <p className="text-white text-lg font-medium italic leading-relaxed">"{tempReview}"</p>
                  ) : (
                    <p className="text-white/40 italic">Sin reseña para esta foto</p>
                  )}
                  {isAdmin && (
                    <button 
                      onClick={() => setIsEditingReview(true)}
                      className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center mx-auto gap-2 text-secondary-400 hover:text-secondary-300 text-sm font-bold"
                    >
                      <Edit2 className="h-4 w-4" /> {tempReview ? 'Editar reseña' : 'Agregar reseña'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedImageIndex < normalizedGallery.length - 1 && (
            <button 
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-white/5 hover:bg-white/20 p-4 rounded-full backdrop-blur-md transition-all z-10 rotate-180"
              onClick={(e) => { e.stopPropagation(); handleOpenLightbox(selectedImageIndex + 1); }}
            >
              <ArrowLeft className="h-8 w-8" />
            </button>
          )}
          
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 font-medium tracking-widest text-sm bg-black/50 px-6 py-2 rounded-full backdrop-blur-md">
            {selectedImageIndex + 1} / {normalizedGallery.length}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6"><AlertTriangle className="h-8 w-8 text-red-600" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Confirmás la eliminación?</h3>
            <p className="text-gray-500 mb-8">Esta acción borrará permanentemente "{trip.title}".</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-2xl font-bold text-gray-700">Cancelar</button>
              <button onClick={() => onDelete(trip.id)} className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-2xl font-bold text-white">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

// ── CREATE / EDIT ──────────────────────────────────────────
// ── CREATE / EDIT ──────────────────────────────────────────
const CreateTrip = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData || { title: '', country: '', location: '', date: '', coverImage: '', description: '', gallery: [] });
  const [imageFile, setImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const uploadFile = async (file) => {
    const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
    const compressedFile = await imageCompression(file, options);

    const data = new FormData();
    data.append('file', compressedFile);
    data.append('upload_preset', 'bitacora-viajes');
    data.append('folder', 'bitacora-viajes');
    
    const res = await fetch('https://api.cloudinary.com/v1_1/ddol2m1rg/image/upload', { method: 'POST', body: data });
    if (!res.ok) throw new Error('Error al subir imagen a Cloudinary');
    const json = await res.json();
    return json.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress({ current: 0, total: galleryFiles.length + (imageFile ? 1 : 0), message: 'Iniciando subida...' });
    try {
      let coverUrl = formData.coverImage;
      if (imageFile) {
        setUploadProgress(p => ({ ...p, message: 'Subiendo portada...' }));
        coverUrl = await uploadFile(imageFile);
        setUploadProgress(p => ({ ...p, current: p.current + 1 }));
      }
      
      const galleryUrls = [...formData.gallery];
      for (let i = 0; i < galleryFiles.length; i++) {
        setUploadProgress(p => ({ ...p, message: `Subiendo foto ${i + 1} de ${galleryFiles.length}...` }));
        const url = await uploadFile(galleryFiles[i]);
        galleryUrls.push({ url, review: '' });
        setUploadProgress(p => ({ ...p, current: p.current + 1 }));
      }
      onSave({ ...formData, coverImage: coverUrl, gallery: galleryUrls });
    } catch (err) { 
      console.error('Error al subir archivos:', err); 
    } finally { 
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", e.target.parentNode);
    }
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const items = [...formData.gallery];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setFormData({ ...formData, gallery: items });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const inputCls = "w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-primary-600 outline-none";
  return (
    <main className="flex-grow max-w-4xl mx-auto px-4 py-12 w-full">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black text-gray-900">{initialData ? 'Editar Aventura' : 'Nueva Aventura'}</h2>
          <button onClick={onCancel} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-2">Título del Viaje</label><input required className={inputCls} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Ej: Mi verano en los Alpes" /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-2">País</label><input required className={inputCls} value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} placeholder="Ej: Suiza" /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-2">Ubicación Específica</label><input required className={inputCls} value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Ej: Zermatt" /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-2">Fecha del Viaje</label><input required type="date" className={inputCls} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} /></div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Foto de Portada</label>
              <div className="relative group cursor-pointer">
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setImageFile(e.target.files[0])} />
                <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 flex items-center justify-center text-gray-500 group-hover:bg-primary-50 group-hover:border-primary-200 transition-all">
                  <Upload className="h-5 w-5 mr-2" /><span className="text-sm">{imageFile ? imageFile.name : 'Seleccionar Archivo'}</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-2">Tu Relato</label><textarea required rows="6" className={`${inputCls} resize-none`} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Contanos qué descubriste..." /></div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Fotos de Galería</label>
              
              {/* Mostrar fotos existentes si las hay */}
              {formData.gallery?.length > 0 && (
                <div className="mb-4">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 block">Fotos guardadas (Arrastra para reordenar)</span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {formData.gallery.map((item, i) => {
                      const url = typeof item === 'string' ? item : item.url;
                      return (
                        <div 
                          key={i} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, i)}
                          onDragOver={(e) => handleDragOver(e, i)}
                          onDragEnd={handleDragEnd}
                          className={`relative group rounded-xl overflow-hidden shadow-sm h-24 border ${draggedIndex === i ? 'border-primary-500 opacity-50' : 'border-gray-100 cursor-grab active:cursor-grabbing'}`}
                        >
                          <img src={url} alt={`Existente ${i}`} className="w-full h-full object-cover pointer-events-none" />
                          <button 
                            type="button" 
                            onClick={() => setFormData(prev => ({...prev, gallery: prev.gallery.filter((_, idx) => idx !== i)}))}
                            className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-700 backdrop-blur-sm text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                            title="Eliminar esta foto"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Input para agregar nuevas fotos */}
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 block">Agregar nuevas fotos</span>
              <input type="file" multiple accept="image/*" className="w-full bg-gray-50 border-0 rounded-2xl p-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-800 hover:file:bg-primary-100" onChange={e => setGalleryFiles(prev => [...prev, ...Array.from(e.target.files)])} />
              
              {/* Previsualización de nuevas fotos */}
              {galleryFiles.length > 0 && (
                <div className="mt-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {galleryFiles.map((file, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden shadow-sm h-24 border border-primary-200">
                        <img src={URL.createObjectURL(file)} alt="Nueva foto" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setGalleryFiles(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-700 backdrop-blur-sm text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                          title="Quitar foto nueva"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end pt-6">
            <button disabled={uploading} type="submit" className="bg-primary-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-primary-800 disabled:opacity-50 flex items-center shadow-xl relative overflow-hidden">
              {uploading ? (
                <>
                  <Loader2 className="animate-spin mr-2 z-10" />
                  <span className="z-10 relative">{uploadProgress?.message || 'Guardando...'}</span>
                  {uploadProgress && uploadProgress.total > 0 && (
                    <div className="absolute top-0 bottom-0 left-0 bg-primary-600/50 transition-all duration-300" style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}></div>
                  )}
                </>
              ) : (
                <>
                  <Save className="mr-2" />
                  {initialData ? 'Guardar Cambios' : 'Publicar Viaje'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

// ── APP CONTENT ────────────────────────────────────────────
function AppContent() {
  const { user, profile, loading, isAdmin } = useAuth();
  const [currentView,    setCurrentView]    = useState('home');
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [trips,          setTrips]          = useState([]);
  const [tripsLoading,   setTripsLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;
    const tripsRef = collection(db, 'trips');
    const unsub = onSnapshot(tripsRef, (snap) => {
      setTrips(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTripsLoading(false);
    }, () => setTripsLoading(false));
    return unsub;
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-warm-50"><Loader2 className="h-10 w-10 text-primary-600 animate-spin" /></div>;
  }

  if (!user || !profile) return <LoginPage />;

  const handleSave = async (data) => {
    const { id, ...rest } = data;
    const tripsRef = collection(db, 'trips');
    if (currentView === 'edit') {
      await updateDoc(doc(db, 'trips', id), rest);
      setCurrentView('detail');
    } else {
      await addDoc(tripsRef, rest);
      setCurrentView('home');
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'trips', id));
    setCurrentView('home');
  };

  const activeTrip = trips.find(t => t.id === selectedTripId);

  return (
    <div className="min-h-screen flex flex-col bg-warm-50 font-sans">
      <Navbar isAdmin={isAdmin} onGoHome={() => setCurrentView('home')} onNewTrip={() => setCurrentView('create')} onUsers={() => setCurrentView('users')} />
      {currentView === 'home'   && <Home trips={trips} loading={tripsLoading} isAdmin={isAdmin} onTripSelect={id => { setSelectedTripId(id); setCurrentView('detail'); }} />}
      {currentView === 'users'  && <UsersPage onBack={() => setCurrentView('home')} />}
      {currentView === 'detail' && <TripDetail trip={activeTrip} isAdmin={isAdmin} onBack={() => setCurrentView('home')} onEdit={() => setCurrentView('edit')} onDelete={handleDelete} />}
      {currentView === 'create' && <CreateTrip onSave={handleSave} onCancel={() => setCurrentView('home')} />}
      {currentView === 'edit'   && <CreateTrip initialData={activeTrip} onSave={handleSave} onCancel={() => setCurrentView('detail')} />}
      <footer className="mt-auto py-12 border-t border-gray-100 bg-white text-center">
        <p className="text-gray-400 text-sm font-medium">Hecho con ♥ para viajeros aventureros.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}

function mapError(code) {
  const map = {
    'auth/user-not-found':       'No existe una cuenta con ese email.',
    'auth/wrong-password':       'Contraseña incorrecta.',
    'auth/invalid-credential':   'Email o contraseña incorrectos.',
    'auth/email-already-in-use': 'Ese email ya está registrado.',
    'auth/weak-password':        'La contraseña debe tener al menos 6 caracteres.',
    'auth/invalid-email':        'El email no tiene un formato válido.',
    'auth/too-many-requests':    'Demasiados intentos. Intentá más tarde.',
  };
  return map[code] ?? 'Ocurrió un error inesperado.';
}
