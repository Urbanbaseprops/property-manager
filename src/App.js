// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Contractors from './Contractors';

import Login from './Login';
import PropertyDashboard from './PropertyDashboard';
import Properties from './Properties';
import Repairs from './Repairs';
import Layout from './Layout';

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
        <Route path="/login" element={<Login />} />
        <Route element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<PropertyDashboard />} />
          <Route
  path="/contractors"
  element={user ? <Contractors /> : <Navigate to="/login" />}
/>

          <Route path="/properties" element={<Properties />} />
          <Route path="/repairs" element={<Repairs />} />
        </Route>
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;
