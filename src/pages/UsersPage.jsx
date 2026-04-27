import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { Shield, User, Loader2, ChevronLeft, Check } from 'lucide-react';

export default function UsersPage({ onBack }) {
  const { user: currentUser } = useAuth();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(null); // uid del que se está guardando

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleRole(uid, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setSaving(uid);
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Error al cambiar rol:', err);
    } finally {
      setSaving(null);
    }
  }

  return (
    <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full">

      {/* Header */}
      <div className="mb-8">
        <button onClick={onBack} className="flex items-center text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" /> Volver
        </button>
        <h1 className="text-3xl font-black text-gray-900 mb-1">Gestión de Usuarios</h1>
        <p className="text-gray-400 text-sm">Cambiá el rol de cada usuario. Los cambios aplican al próximo inicio de sesión.</p>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No hay usuarios registrados.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Usuario</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:table-cell">Email</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Rol</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Acción</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const isCurrentUser = u.id === currentUser?.uid;
                const isAdmin       = u.role === 'admin';
                const isSaving      = saving === u.id;

                return (
                  <tr key={u.id} className={`border-b border-gray-50 last:border-0 ${isCurrentUser ? 'bg-blue-50/40' : 'hover:bg-gray-50'} transition-colors`}>
                    {/* Nombre */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {(u.displayName ?? u.email ?? '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">
                            {u.displayName ?? '—'}
                            {isCurrentUser && <span className="ml-2 text-[10px] font-bold text-blue-400 uppercase">Vos</span>}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-400">{u.email}</span>
                    </td>

                    {/* Badge rol */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                        isAdmin
                          ? 'bg-purple-50 border-purple-200 text-purple-700'
                          : 'bg-blue-50 border-blue-200 text-blue-700'
                      }`}>
                        {isAdmin ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        {isAdmin ? 'Admin' : 'Viajero'}
                      </span>
                    </td>

                    {/* Botón cambiar rol */}
                    <td className="px-6 py-4 text-center">
                      {isCurrentUser ? (
                        <span className="text-xs text-gray-300">—</span>
                      ) : (
                        <button
                          onClick={() => toggleRole(u.id, u.role)}
                          disabled={isSaving}
                          className={`text-xs font-bold px-4 py-2 rounded-full border transition-all disabled:opacity-50 ${
                            isAdmin
                              ? 'border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                              : 'border-purple-200 text-purple-600 hover:bg-purple-50'
                          }`}
                        >
                          {isSaving
                            ? <Loader2 className="h-3 w-3 animate-spin inline" />
                            : isAdmin ? 'Quitar admin' : 'Hacer admin'
                          }
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-300 text-center mt-6">
        Los administradores pueden crear, editar y eliminar viajes.
      </p>
    </main>
  );
}
