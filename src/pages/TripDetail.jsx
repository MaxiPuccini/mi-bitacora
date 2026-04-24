import React, { useState } from 'react';
import { MapPin, Calendar, ArrowLeft, Camera, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

export default function TripDetail({ trip, onBack, onEdit, onDelete, isAdmin }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!trip) return null;

  return (
    <main className="flex-grow bg-white w-full relative">
      <div className="relative h-[40vh] min-h-[300px] w-full bg-gray-200">
        <img
          src={trip.coverImage}
          alt={trip.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000&auto=format&fit=crop'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <button
          onClick={onBack}
          className="absolute top-6 left-4 sm:left-8 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all flex items-center justify-center z-10"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => onEdit(trip.id)}
              className="absolute top-6 right-4 sm:right-8 bg-blue-600/90 hover:bg-blue-700 backdrop-blur-md px-4 py-2 rounded-full text-white transition-all flex items-center z-10 font-medium text-sm shadow-sm"
            >
              <Edit2 className="h-4 w-4 mr-2" /> Editar
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="absolute top-16 right-4 sm:right-8 mt-2 bg-red-500/90 hover:bg-red-600 backdrop-blur-md px-4 py-2 rounded-full text-white transition-all flex items-center z-10 font-medium text-sm shadow-sm"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
            </button>
          </>
        )}

        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 max-w-4xl mx-auto">
          <div className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
            {trip.country}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-2 shadow-sm">
            {trip.title}
          </h1>
          <div className="flex flex-wrap items-center text-gray-200 text-sm sm:text-base gap-4">
            <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {trip.location}</span>
            <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> {formatDate(trip.date)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
        <div className="prose prose-lg prose-blue text-gray-700 whitespace-pre-line">
          <p className="leading-relaxed text-lg">{trip.description}</p>
        </div>

        {trip.gallery && trip.gallery.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Camera className="h-6 w-6 mr-2 text-blue-600" /> Galería
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trip.gallery.map((img, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden h-64 shadow-sm border border-gray-100 bg-gray-100">
                  <img src={img} alt={`Galería ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <MapPin className="h-6 w-6 mr-2 text-blue-600" /> Ubicación en el Mapa
          </h3>
          <div className="w-full h-80 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-100">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${encodeURIComponent(trip.location + ', ' + trip.country)}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
            ></iframe>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar viaje?</h3>
              <p className="text-gray-500 mb-6">
                Estás a punto de borrar "{trip.title}". Esta acción no se puede deshacer.
              </p>
              <div className="flex w-full space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { setShowDeleteModal(false); onDelete(trip.id); }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
