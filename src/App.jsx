import React, { useState, useEffect } from 'react';
import {
  MapPin, Calendar, ArrowLeft, Plane, Globe, Camera,
  Plus, Save, X, Edit2, Trash2, AlertTriangle, Search,
  Shield, Eye, Upload, Loader2, LogOut
} from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase/firebaseConfig';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import UsersPage from './pages/UsersPage';

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
    if (mode === 'register' && form.password !== form.confirm) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.email, form.password, form.displayName.trim());
    } catch (err) { setError(mapError(err.code)); }
    finally { setLoading(false); }
  }

  const inputCls = "w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfdfe] px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 w-full max-w-md">
        <div className="flex items-center mb-8">
          <Plane className="h-8 w-8 text-blue-600 mr-2" />
          <span className="font-bold text-xl text-gray-900">Mi Bitácora</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-1">
          {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
        </h2>
        <p className="text-gray-400 text-sm mb-8">
          {mode === 'login' ? 'Ingresá para ver tu bitácora.' : 'Registrate para empezar.'}
        </p>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm mb-6">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && <input required placeholder="Nombre completo" className={inputCls} value={form.displayName} onChange={set('displayName')} />}
          <input required type="email" placeholder="Email" className={inputCls} value={form.email} onChange={set('email')} />
          <input required type="password" placeholder="Contraseña" className={inputCls} value={form.password} onChange={set('password')} />
          {mode === 'register' && <input required type="password" placeholder="Confirmar contraseña" className={inputCls} value={form.confirm} onChange={set('confirm')} />}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center">
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (mode === 'login' ? 'Ingresar' : 'Registrarse')}
          </button>
        </form>
        <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
          className="w-full mt-4 text-sm text-blue-600 hover:underline">
          {mode === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Ingresá'}
        </button>
      </div>
    </div>
  );
}

// ── NAVBAR ─────────────────────────────────────────────────
function Navbar({ onGoHome, onNewTrip, onUsers, isAdmin }) {
  const { logout } = useAuth();
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={onGoHome}>
            <Plane className="h-8 w-8 text-blue-600 mr-2" />
            <span className="font-bold text-xl text-gray-900 tracking-tight">Mi Bitácora</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`hidden sm:flex items-center text-xs font-bold px-3 py-1 rounded-full border ${isAdmin ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
              {isAdmin ? <Shield className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              {isAdmin ? 'Admin' : 'Viajero'}
            </span>
            {isAdmin && (
              <>
                <button onClick={onUsers} className="hidden sm:flex items-center text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                  <Shield className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Usuarios</span>
                </button>
                <button onClick={onNewTrip} className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 flex items-center shadow-sm">
                  <Plus className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Nuevo Viaje</span>
                </button>
              </>
            )}
            <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors" title="Cerrar sesión">
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
  <div onClick={() => onClick(trip.id)} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full">
    <div className="relative h-48 overflow-hidden bg-gray-100">
      <img src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000&auto=format&fit=crop'} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm">{trip.country}</div>
    </div>
    <div className="p-5 flex flex-col flex-grow">
      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{trip.title}</h3>
      <div className="flex items-center text-gray-500 text-sm mb-2"><MapPin className="h-4 w-4 mr-1 shrink-0" /><span className="truncate">{trip.location}</span></div>
      <div className="flex items-center text-gray-500 text-sm mb-4"><Calendar className="h-4 w-4 mr-1 shrink-0" /><span>{formatDate(trip.date)}</span></div>
      <p className="text-gray-600 text-sm line-clamp-2 mt-auto">{trip.description}</p>
    </div>
  </div>
);

// ── HOME ───────────────────────────────────────────────────
const Home = ({ trips, onTripSelect, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = [...trips].sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.country.toLowerCase().includes(searchTerm.toLowerCase()));
  const uniqueCountries = new Set(trips.map(t => t.country.trim().toLowerCase())).size;

  return (
    <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Mis Aventuras</h1>
          <p className="text-lg text-gray-500">Explora mis recuerdos y destinos alrededor del mundo.</p>
        </div>
        {trips.length > 0 && (
          <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 w-full md:w-auto">
            <div className="px-6 py-2 text-center border-r border-gray-100 flex-1">
              <p className="text-2xl font-black text-blue-600">{trips.length}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Viajes</p>
            </div>
            <div className="px-6 py-2 text-center flex-1">
              <p className="text-2xl font-black text-blue-600">{uniqueCountries}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Países</p>
            </div>
          </div>
        )}
      </div>
      {trips.length > 0 && (
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Buscar por título o país..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      )}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20"><Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" /><p className="text-gray-500 font-medium">Sincronizando...</p></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200"><Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500 text-lg">No se encontraron viajes.</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(trip => <TripCard key={trip.id} trip={trip} onClick={onTripSelect} />)}
        </div>
      )}
    </main>
  );
};

// ── TRIP DETAIL ────────────────────────────────────────────
const TripDetail = ({ trip, onBack, onEdit, onDelete, isAdmin }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  if (!trip) return null;
  return (
    <main className="flex-grow bg-white w-full">
      <div className="relative h-[50vh] min-h-[400px] w-full bg-gray-900">
        <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-10">
          <button onClick={onBack} className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white"><ArrowLeft className="h-6 w-6" /></button>
          {isAdmin && (
            <div className="flex gap-2">
              <button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg flex items-center"><Edit2 className="h-4 w-4 mr-2" />Editar</button>
              <button onClick={() => setShowDeleteModal(true)} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg flex items-center"><Trash2 className="h-4 w-4 mr-2" />Eliminar</button>
            </div>
          )}
        </div>
        <div className="absolute bottom-10 left-0 w-full px-6 md:px-12 max-w-5xl mx-auto">
          <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-tighter mb-4 inline-block">{trip.country}</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">{trip.title}</h1>
          <div className="flex flex-wrap gap-6 text-gray-200 font-medium">
            <span className="flex items-center"><MapPin className="h-5 w-5 mr-2 text-blue-400" />{trip.location}</span>
            <span className="flex items-center"><Calendar className="h-5 w-5 mr-2 text-blue-400" />{formatDate(trip.date)}</span>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">{trip.description}</div>
        {trip.gallery?.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center"><Camera className="h-6 w-6 mr-3 text-blue-600" />Momentos Capturados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {trip.gallery.map((img, i) => <div key={i} className="rounded-3xl overflow-hidden h-72 shadow-xl group"><img src={img} alt="Galería" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /></div>)}
            </div>
          </div>
        )}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center"><MapPin className="h-6 w-6 mr-3 text-blue-600" />Mapa del Destino</h2>
          <div className="w-full h-96 rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
            <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen src={`https://maps.google.com/maps?q=${encodeURIComponent(trip.location + ', ' + trip.country)}&t=&z=12&ie=UTF8&iwloc=&output=embed`} />
          </div>
        </div>
      </div>
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
const CreateTrip = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData || { title: '', country: '', location: '', date: '', coverImage: '', description: '', gallery: [] });
  const [imageFile, setImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file) => {
    const fileRef = ref(storage, `viajes/${Date.now()}-${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let coverUrl = formData.coverImage;
      if (imageFile) coverUrl = await uploadFile(imageFile);
      const galleryUrls = [...formData.gallery];
      for (const file of galleryFiles) galleryUrls.push(await uploadFile(file));
      onSave({ ...formData, coverImage: coverUrl, gallery: galleryUrls });
    } catch (err) { console.error('Error al subir archivos:', err); }
    finally { setUploading(false); }
  };

  const inputCls = "w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none";
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
                <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:border-blue-200 transition-all">
                  <Upload className="h-5 w-5 mr-2" /><span className="text-sm">{imageFile ? imageFile.name : 'Seleccionar Archivo'}</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-2">Tu Relato</label><textarea required rows="6" className={`${inputCls} resize-none`} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Contanos qué descubriste..." /></div>
            <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-2">Fotos de Galería</label><input type="file" multiple accept="image/*" className="w-full bg-gray-50 border-0 rounded-2xl p-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={e => setGalleryFiles(Array.from(e.target.files))} /></div>
          </div>
          <div className="flex justify-end pt-6">
            <button disabled={uploading} type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-700 disabled:opacity-50 flex items-center shadow-xl">
              {uploading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
              {initialData ? 'Guardar Cambios' : 'Publicar Viaje'}
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
    const tripsRef = collection(db, 'users', user.uid, 'trips');
    const unsub = onSnapshot(tripsRef, (snap) => {
      setTrips(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTripsLoading(false);
    }, () => setTripsLoading(false));
    return unsub;
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#fcfdfe]"><Loader2 className="h-10 w-10 text-blue-500 animate-spin" /></div>;
  }

  if (!user || !profile) return <LoginPage />;

  const handleSave = async (data) => {
    const { id, ...rest } = data;
    const tripsRef = collection(db, 'users', user.uid, 'trips');
    if (currentView === 'edit') {
      await updateDoc(doc(db, 'users', user.uid, 'trips', id), rest);
      setCurrentView('detail');
    } else {
      await addDoc(tripsRef, rest);
      setCurrentView('home');
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'users', user.uid, 'trips', id));
    setCurrentView('home');
  };

  const activeTrip = trips.find(t => t.id === selectedTripId);

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfdfe] font-sans">
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
