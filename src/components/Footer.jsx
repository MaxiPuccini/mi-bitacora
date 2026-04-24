import React from 'react';
import { Globe, Camera } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
        <p className="text-gray-500 text-sm mb-4 sm:mb-0">
          © {new Date().getFullYear()} Mi Bitácora de Viajes.
        </p>
        <div className="flex space-x-4">
          <Globe className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
          <Camera className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
        </div>
      </div>
    </footer>
  );
}
