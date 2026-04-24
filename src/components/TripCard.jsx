import React from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

export default function TripCard({ trip, onClick }) {
  return (
    <div
      onClick={() => onClick(trip.id)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={trip.coverImage}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000&auto=format&fit=crop'; }}
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
}
