import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

export default function CreateTrip({ onSave, onCancel, initialData }) {
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      country: '',
      location: '',
      date: '',
      coverImage: '',
      description: '',
      gallery: []
    }
  );

  const [newGalleryImage, setNewGalleryImage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddGalleryImage = () => {
    if (newGalleryImage.trim() !== '') {
      setFormData({ ...formData, gallery: [...(formData.gallery || []), newGalleryImage] });
      setNewGalleryImage('');
    }
  };

  const handleRemoveGalleryImage = (indexToRemove) => {
    setFormData({ ...formData, gallery: formData.gallery.filter((_, index) => index !== indexToRemove) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tripData = {
      ...formData,
      id: initialData ? initialData.id : Date.now(),
      gallery: formData.gallery || []
    };
    onSave(tripData);
  };

  return (
    <main className="flex-grow max-w-3xl mx-auto px-4 py-12 w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 relative">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {initialData ? 'Editar Viaje' : 'Agregar Nuevo Viaje'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 p-2 rounded-full absolute top-6 right-6 sm:static">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Título del Viaje</label>
              <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Ej: Mi verano en la Toscana" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">País</label>
              <input required type="text" name="country" value={formData.country} onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Ej: Italia" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ciudad o Región</label>
              <input required type="text" name="location" value={formData.location} onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Ej: Florencia" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
              <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-700" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">URL Foto de Portada</label>
              <input required type="url" name="coverImage" value={formData.coverImage} onChange={handleChange} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="https://..." />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tu Experiencia</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows="5" className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" placeholder="Escribe aquí los mejores momentos de tu viaje..."></textarea>
            </div>

            <div className="sm:col-span-2 border-t border-gray-100 pt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fotos Adicionales (Galería)</label>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  type="url"
                  value={newGalleryImage}
                  onChange={(e) => setNewGalleryImage(e.target.value)}
                  className="flex-grow border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="https:// URL de tu foto extra..."
                />
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
                >
                  Agregar Foto
                </button>
              </div>

              {formData.gallery && formData.gallery.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  {formData.gallery.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden h-24 border border-gray-200 shadow-sm">
                      <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute top-1 right-1 bg-red-500/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center shadow-sm">
              <Save className="h-5 w-5 mr-2" /> {initialData ? 'Guardar Cambios' : 'Guardar Viaje'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
