import React from 'react';
import { Plane, Plus, Eye, Shield } from 'lucide-react';

export default function Navbar({ onGoHome, onNewTrip, isAdmin, onToggleAdmin }) {
  return (
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
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={onToggleAdmin}
              className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200"
              title="Simular vista de visitante o administrador"
            >
              {isAdmin ? <Eye className="h-4 w-4 sm:mr-1" /> : <Shield className="h-4 w-4 sm:mr-1" />}
              <span className="hidden sm:inline">{isAdmin ? 'Ver como Público' : 'Modo Admin'}</span>
            </button>

            {isAdmin && (
              <button
                onClick={onNewTrip}
                className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Nuevo Viaje</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
