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
    <div className="flex min-h-screen">
      <aside className="w-64 bg-black text-white p-6 space-y-4 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold text-blue-400 mb-6">Urban Base Properties</h1>
          <nav className="space-y-3">
            <Link to="/dashboard" className="block text-blue-400 hover:text-white">🏠 Dashboard</Link>
            <Link to="/properties" className="block text-blue-400 hover:text-white">📋 Properties</Link>
            <Link to="/repairs" className="block text-blue-400 hover:text-white">🛠 Repairs</Link>
            <Link to="/tasks" className="block text-blue-400 hover:text-white">📝 Tasks</Link>
            <Link to="/contractors" className="block text-blue-400 hover:text-white">👷 Contractors</Link>
            <Link to="/certificates" className="block text-blue-400 hover:text-white">📄 Certificates</Link>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
        >
          Logout
        </button>
      </aside>

      <div className="flex-1 bg-gray-100">
        <main className="p-6 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
