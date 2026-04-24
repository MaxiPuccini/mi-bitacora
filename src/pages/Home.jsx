import React, { useState } from 'react';
import { Search } from 'lucide-react';
import TripCard from '../components/TripCard';

export default function Home({ trips, onTripSelect, loading, onLoadMockTrips }) {
  const [searchTerm, setSearchTerm] = useState('');

  const sortedTrips = [...trips].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredTrips = sortedTrips.filter(trip =>
    trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTrips = trips.length;
  const uniqueCountries = new Set(trips.map(t => t.country.trim().toLowerCase())).size;

  return (
    <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            Mis aventuras por el mundo
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            Un espacio para recordar los lugares que visité, las historias que viví y las fotos que saqué en el camino.
          </p>
        </div>

        {totalTrips > 0 && (
          <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 overflow-hidden w-full sm:w-auto shrink-0">
            <div className="px-5 py-2 text-center border-r border-gray-100 flex-1">
              <p className="text-2xl font-black text-blue-600">{totalTrips}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Viajes</p>
            </div>
            <div className="px-5 py-2 text-center flex-1">
              <p className="text-2xl font-black text-blue-600">{uniqueCountries}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Países</p>
            </div>
          </div>
        )}
      </div>

      {totalTrips > 0 && (
        <div className="relative max-w-md mb-8 mx-auto sm:mx-0">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
            placeholder="Buscar por país, ciudad o título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">Cargando tus viajes desde la nube...</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">Aún no has agregado ningún viaje.</p>
          <button
            onClick={onLoadMockTrips}
            className="bg-blue-50 text-blue-600 px-6 py-2 rounded-full font-medium hover:bg-blue-100 transition-colors"
          >
            Cargar viajes de prueba
          </button>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No se encontraron viajes para "{searchTerm}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onClick={onTripSelect} />
          ))}
        </div>
      )}
    </main>
  );
}
