import React, { useState, useEffect } from 'react';
import { 
  MapPin, Calendar, ArrowLeft, Plane, Globe, Camera, 
  Plus, Save, X, Edit2, Trash2, AlertTriangle, Search, 
  Shield, Eye, Upload, Loader2 
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, collection, onSnapshot, addDoc, 
  updateDoc, deleteDoc, doc 
} from 'firebase/firestore';
import { 
  getStorage, ref, uploadBytes, getDownloadURL 
} from 'firebase/storage';

// ==========================================
// CONFIGURACIÓN DE FIREBASE
// ==========================================
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Inicializamos Storage
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// ==========================================
// UTILS
// ==========================================
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', options);
};

// ==========================================
// COMPONENTES DE UI
// ==========================================

const Navbar = ({ onGoHome, onNewTrip, isAdmin, onToggleAdmin }) => (
  <nav className="bg-white shadow-sm sticky top-0 z-50">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <div 
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onGoHome}
        >
          <Plane className="h-8 w-8 text-blue-600 mr-2" />
          <span className="font-bold text-xl text-gray-900 tracking-tight">Mi Bitácora</span>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={onToggleAdmin}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200"
          >
            {isAdmin ? <Eye className="h-4 w-4 sm:mr-1" /> : <Shield className="h-4 w-4 sm:mr-1" />}
            <span className="hidden sm:inline">{isAdmin ? 'Ver como Público' : 'Modo Admin'}</span>
          </button>
          
          {isAdmin && (
            <button 
              onClick={onNewTrip}
              className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
            >
              <Plus className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Nuevo Viaje</span>
            </button>
          )}
        </div>
      </div>
    </div>
  </nav>
);

const TripCard = ({ trip, onClick }) => (
  <div 
    onClick={() => onClick(trip.id)}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full"
  >
    <div className="relative h-48 overflow-hidden bg-gray-100">
      <img 
        src={trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000&auto=format&fit=crop'} 
        alt={trip.title} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
        {trip.country}
      </div>
    </div>
    <div className="p-5 flex flex-col flex-grow">
      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{trip.title}</h3>
      <div className="flex items-center text-gray-500 text-sm mb-2">
        <MapPin className="h-4 w-4 mr-1 shrink-0" />
        <span className="truncate">{trip.location}</span>
      </div>
      <div className="flex items-center text-gray-500 text-sm mb-4">
        <Calendar className="h-4 w-4 mr-1 shrink-0" />
        <span>{formatDate(trip.date)}</span>
      </div>
      <p className="text-gray-600 text-sm line-clamp-2 mt-auto">
        {trip.description}
      </p>
    </div>
  </div>
);

// ==========================================
// PÁGINAS
// ==========================================

const Home = ({ trips, onTripSelect, loading, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const sortedTrips = [...trips].sort((a, b) => new Date(b.date) - new Date(a.date));
  const filteredTrips = sortedTrips.filter(trip => 
    trip.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    trip.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTrips = trips.length;
  const uniqueCountries = new Set(trips.map(t => t.country.trim().toLowerCase())).size;

  return (
    <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Mis Aventuras</h1>
          <p className="text-lg text-gray-500">Explora mis recuerdos y destinos alrededor del mundo.</p>
        </div>
        
        {totalTrips > 0 && (
          <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 w-full md:w-auto">
            <div className="px-6 py-2 text-center border-r border-gray-100 flex-1">
              <p className="text-2xl font-black text-blue-600">{totalTrips}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Viajes</p>
            </div>
            <div className="px-6 py-2 text-center flex-1">
              <p className="text-2xl font-black text-blue-600">{uniqueCountries}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Países</p>
            </div>
          </div>
        )}
      </div>

      {totalTrips > 0 && (
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título o país..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Sincronizando con la nube...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No se encontraron viajes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map(trip => (
            <TripCard key={trip.id} trip={trip} onClick={onTripSelect} />
          ))}
        </div>
      )}
    </main>
  );
};

const TripDetail = ({ trip, onBack, onEdit, onDelete, isAdmin }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  if (!trip) return null;

  return (
    <main className="flex-grow bg-white w-full">
      <div className="relative h-[50vh] min-h-[400px] w-full bg-gray-900">
        <img 
          src={trip.coverImage} 
          alt={trip.title} 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-10">
          <button onClick={onBack} className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all">
            <ArrowLeft className="h-6 w-6" />
          </button>
          
          {isAdmin && (
            <div className="flex gap-2">
              <button onClick={() => onEdit(trip.id)} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg transition-all flex items-center">
                <Edit2 className="h-4 w-4 mr-2" /> Editar
              </button>
              <button onClick={() => setShowDeleteModal(true)} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg transition-all flex items-center">
                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
              </button>
            </div>
          )}
        </div>

        <div className="absolute bottom-10 left-0 w-full px-6 md:px-12 max-w-5xl mx-auto">
          <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-tighter mb-4 inline-block">
            {trip.country}
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">{trip.title}</h1>
          <div className="flex flex-wrap gap-6 text-gray-200 font-medium">
            <span className="flex items-center"><MapPin className="h-5 w-5 mr-2 text-blue-400" /> {trip.location}</span>
            <span className="flex items-center"><Calendar className="h-5 w-5 mr-2 text-blue-400" /> {formatDate(trip.date)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
          {trip.description}
        </div>

        {trip.gallery && trip.gallery.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <Camera className="h-6 w-6 mr-3 text-blue-600" /> Momentos Capturados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {trip.gallery.map((img, i) => (
                <div key={i} className="rounded-3xl overflow-hidden h-72 shadow-xl border border-gray-100 group">
                  <img src={img} alt="Galería" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <MapPin className="h-6 w-6 mr-3 text-blue-600" /> Mapa del Destino
          </h2>
          <div className="w-full h-96 rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
            <iframe
              width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen
              src={`https://maps.google.com/maps?q=${encodeURIComponent(trip.location + ', ' + trip.country)}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
            ></iframe>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Confirmas la eliminación?</h3>
            <p className="text-gray-500 mb-8">Esta acción borrará permanentemente el viaje "{trip.title}" de tu bitácora.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-2xl font-bold transition-colors text-gray-700">Cancelar</button>
              <button onClick={() => onDelete(trip.id)} className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-2xl font-bold transition-colors text-white">Eliminar Ahora</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

const CreateTrip = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    title: '', country: '', location: '', date: '', coverImage: '', description: '', gallery: []
  });
  const [imageFile, setImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file) => {
    if (!file) return null;
    const fileRef = ref(storage, `viajes/${Date.now()}-${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let coverUrl = formData.coverImage;
      if (imageFile) {
        coverUrl = await uploadFile(imageFile);
      }

      const galleryUrls = [...formData.gallery];
      for (const file of galleryFiles) {
        const url = await uploadFile(file);
        if (url) galleryUrls.push(url);
      }

      onSave({ ...formData, coverImage: coverUrl, gallery: galleryUrls });
    } catch (err) {
      console.error("Error al subir archivos:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="flex-grow max-w-4xl mx-auto px-4 py-12 w-full">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black text-gray-900">{initialData ? 'Editar Aventura' : 'Nueva Aventura'}</h2>
          <button onClick={onCancel} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Título del Viaje</label>
              <input required className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ej: Mi verano en los Alpes" />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">País</label>
              <input required className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} placeholder="Ej: Suiza" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Ubicación Específica</label>
              <input required className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Ej: Zermatt" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Fecha del Viaje</label>
              <input required type="date" className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Foto de Portada</label>
              <div className="relative group cursor-pointer">
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setImageFile(e.target.files[0])} />
                <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:border-blue-200 transition-all">
                  <Upload className="h-5 w-5 mr-2" />
                  <span className="text-sm truncate">{imageFile ? imageFile.name : 'Seleccionar Archivo'}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Tu Relato</label>
              <textarea required rows="6" className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Cuéntanos qué descubriste..." />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Fotos de Galería</label>
              <input type="file" multiple accept="image/*" className="w-full bg-gray-50 border-0 rounded-2xl p-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={e => setGalleryFiles(Array.from(e.target.files))} />
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button disabled={uploading} type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl disabled:opacity-50 flex items-center">
              {uploading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
              {initialData ? 'Guardar Cambios' : 'Publicar Viaje'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

// ==========================================
// MAIN APP
// ==========================================
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [trips, setTrips] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { console.error(err); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const tripsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'trips');
    return onSnapshot(tripsRef, (snap) => {
      setTrips(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
  }, [user]);

  const handleSave = async (data) => {
    const { id, ...rest } = data;
    const tripsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'trips');
    if (currentView === 'edit') {
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'trips', id), rest);
      setCurrentView('detail');
    } else {
      await addDoc(tripsRef, rest);
      setCurrentView('home');
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'trips', id));
    setCurrentView('home');
  };

  const activeTrip = trips.find(t => t.id === selectedTripId);

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfdfe] font-sans selection:bg-blue-100">
      <Navbar 
        isAdmin={isAdmin} 
        onToggleAdmin={() => setIsAdmin(!isAdmin)} 
        onGoHome={() => setCurrentView('home')} 
        onNewTrip={() => setCurrentView('create')} 
      />
      {currentView === 'home' && <Home trips={trips} loading={loading} isAdmin={isAdmin} onTripSelect={id => { setSelectedTripId(id); setCurrentView('detail'); }} />}
      {currentView === 'detail' && <TripDetail trip={activeTrip} isAdmin={isAdmin} onBack={() => setCurrentView('home')} onEdit={() => setCurrentView('edit')} onDelete={handleDelete} />}
      {currentView === 'create' && <CreateTrip onSave={handleSave} onCancel={() => setCurrentView('home')} />}
      {currentView === 'edit' && <CreateTrip initialData={activeTrip} onSave={handleSave} onCancel={() => setCurrentView('detail')} />}
      
      <footer className="mt-auto py-12 border-t border-gray-100 bg-white text-center">
        <p className="text-gray-400 text-sm font-medium">Hecho con ❤️ para viajeros aventureros.</p>
      </footer>
    </div>
  );
}