import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import PropertyDashboard from './PropertyDashboard';
import Properties from './Properties';
import Repairs from './Repairs';
import Tasks from './Tasks';
import Contractors from './Contractors';
import Certificates from './Certificates';
import RentReminders from './RentReminders'; // <-- new page
import Login from './Login';
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
        <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route path="dashboard" element={<PropertyDashboard />} />
          <Route path="properties" element={<Properties />} />
          <Route path="repairs" element={<Repairs />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="contractors" element={<Contractors />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="reminders" element={<RentReminders />} /> {/* New rent reminders page */}
          <Route index element={<Navigate to="dashboard" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
