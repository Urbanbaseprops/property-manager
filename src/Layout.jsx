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
      <aside className="w-64 bg-black text-white p-4 flex flex-col justify-between">
        <div>
          <img
            src="https://lh3.googleusercontent.com/p/AF1QipOKG9CgSDXhZAO8R8o_sXx9765ovXDJ31euRFa_=s680-w680-h510"
            alt="Logo"
            className="h-10 mb-4 mx-auto rounded"
          />
          <nav className="space-y-2">
            <Link to="/dashboard" className="block px-3 py-2 rounded hover:bg-blue-700 text-blue-300 hover:text-white">🏠 Dashboard</Link>
            <Link to="/properties" className="block px-3 py-2 rounded hover:bg-blue-700 text-blue-300 hover:text-white">📋 Properties</Link>
            <Link to="/repairs" className="block px-3 py-2 rounded hover:bg-blue-700 text-blue-300 hover:text-white">🛠 Repairs</Link>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
