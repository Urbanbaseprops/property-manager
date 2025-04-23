// src/App.js
import Properties from './Properties';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Login from './Login';
import PropertyDashboard from './PropertyDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
      <Route
  path="/properties"
  element={user ? <Properties /> : <Navigate to="/login" />}
/>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={user ? <PropertyDashboard /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;
import Properties from './Properties'; // Add this at the top

<Route
  path="/properties"
  element={user ? <Properties /> : <Navigate to="/login" />}
/>

