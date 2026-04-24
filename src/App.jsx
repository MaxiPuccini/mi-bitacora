import React, { useState } from 'react';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, db, appId } from './firebase/firebaseConfig';
import { mockTrips } from './data/mockTrips';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import TripDetail from './pages/TripDetail';
import CreateTrip from './pages/CreateTrip';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'detail' | 'create' | 'edit'
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [trips, setTrips] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);

  // Inicializar Autenticación
  React.useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Error de autenticación:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Leer datos de Firestore en tiempo real
  React.useEffect(() => {
    if (!user) return;

    const tripsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'trips');

    const unsubscribe = onSnapshot(tripsRef, (snapshot) => {
      const tripsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrips(tripsData);
      setLoading(false);
    }, (error) => {
      console.error("Error al obtener viajes:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Navegación
  const handleTripSelect = (id) => { setSelectedTripId(id); setCurrentView('detail'); window.scrollTo(0, 0); };
  const handleGoHome = () => { setCurrentView('home'); setSelectedTripId(null); window.scrollTo(0, 0); };
  const handleNewTripClick = () => { setCurrentView('create'); window.scrollTo(0, 0); };
  const handleEditTripClick = (id) => { setSelectedTripId(id); setCurrentView('edit'); window.scrollTo(0, 0); };

  const handleLoadMockTrips = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const tripsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'trips');
      for (const trip of mockTrips) {
        const { id, ...tripData } = trip;
        await addDoc(tripsRef, tripData);
      }
    } catch (error) {
      console.error("Error al cargar datos de prueba:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async (savedTrip) => {
    if (!user) return;
    const { id, ...tripData } = savedTrip;
    try {
      if (currentView === 'edit') {
        const tripRef = doc(db, 'artifacts', appId, 'users', user.uid, 'trips', id);
        await updateDoc(tripRef, tripData);
        setCurrentView('detail');
      } else {
        const tripsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'trips');
        await addDoc(tripsRef, tripData);
        setCurrentView('home');
      }
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleDeleteTrip = async (id) => {
    if (!user) return;
    try {
      const tripRef = doc(db, 'artifacts', appId, 'users', user.uid, 'trips', id);
      await deleteDoc(tripRef);
      setCurrentView('home');
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const activeTrip = trips.find(t => t.id === selectedTripId);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
      <Navbar
        onGoHome={handleGoHome}
        onNewTrip={handleNewTripClick}
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin(!isAdmin)}
      />

      {currentView === 'home' && (
        <Home trips={trips} onTripSelect={handleTripSelect} loading={loading} onLoadMockTrips={handleLoadMockTrips} />
      )}
      {currentView === 'detail' && (
        <TripDetail trip={activeTrip} onBack={handleGoHome} onEdit={handleEditTripClick} onDelete={handleDeleteTrip} isAdmin={isAdmin} />
      )}
      {currentView === 'create' && (
        <CreateTrip onSave={handleSaveTrip} onCancel={handleGoHome} />
      )}
      {currentView === 'edit' && (
        <CreateTrip initialData={activeTrip} onSave={handleSaveTrip} onCancel={() => setCurrentView('detail')} />
      )}

      <Footer />
    </div>
  );
}
