import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

export default function Layout() {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate('/login');
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-black text-white p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold text-center text-white mb-6">Urban Base Properties</h1>
          <nav className="space-y-3">
            <Link to="/dashboard" className="block px-3 py-2 rounded hover:bg-blue-600 text-blue-300 hover:text-white">🏠 Dashboard</Link>
            <Link to="/properties" className="block px-3 py-2 rounded hover:bg-blue-600 text-blue-300 hover:text-white">📋 Properties</Link>
            <Link to="/repairs" className="block px-3 py-2 rounded hover:bg-blue-600 text-blue-300 hover:text-white">🛠 Repairs</Link>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
