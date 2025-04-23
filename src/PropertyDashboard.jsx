import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

export default function PropertyDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dueToday, setDueToday] = useState([]);
  const [landlordDueToday, setLandlordDueToday] = useState([]);
  const [filter, setFilter] = useState('all');
  const [properties, setProperties] = useState([]);
  const [newProperty, setNewProperty] = useState({
    name: '',
    rent: '',
    rentDueDate: '',
    landlordPaymentDueDate: '',
    landlordAmount: '',
    landlord: { name: '', email: '', phone: '' },
    tenant: { name: '' },
    inspectionDate: '',
    certificates: [],
    notes: ''
  });

  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate('/login');
    });
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    filterByDate(selectedDate);
  }, [selectedDate, properties]);

  const fetchProperties = async () => {
    const querySnapshot = await getDocs(collection(db, "properties"));
    const propertyList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProperties(propertyList);
  };

  const addProperty = async () => {
    if (!newProperty.name || !newProperty.rent) return;

    try {
      const docRef = await addDoc(collection(db, "properties"), newProperty);
      setProperties(prev => [...prev, { id: docRef.id, ...newProperty }]);
    } catch (err) {
      console.error("Error saving to Firestore:", err);
    }

    setNewProperty({
      name: '', rent: '', rentDueDate: '', landlordPaymentDueDate: '', landlordAmount: '',
      landlord: { name: '', email: '', phone: '' }, tenant: { name: '' },
      inspectionDate: '', certificates: [], notes: ''
    });
  };

  const deleteProperty = async (id) => {
    await deleteDoc(doc(db, "properties", id));
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  const filterByDate = (date) => {
    const day = date.getDate().toString();
    const rentDue = properties.filter(prop => prop.rentDueDate.toString() === day);
    const landlordPayments = properties.filter(prop => prop.landlordPaymentDueDate.toString() === day);
    setDueToday(rentDue);
    setLandlordDueToday(landlordPayments);
  };

  const toggleStatus = (id, field) => {
    const updated = properties.map(p =>
      p.id === id ? { ...p, [field]: !p[field] } : p
    );
    setProperties(updated);
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-black text-white p-6 space-y-4 flex flex-col justify-between">
        <div>
          <img src="https://lh3.googleusercontent.com/p/AF1QipOKG9CgSDXhZAO8R8o_sXx9765ovXDJ31euRFa_=s680-w680-h510" alt="Logo" className="h-12 mb-6 rounded" />
          <nav className="space-y-3">
            <Link to="/dashboard" className="block text-blue-400 hover:text-white">🏠 Dashboard</Link>
            <Link to="/properties" className="block text-blue-400 hover:text-white">📋 Properties</Link>
          </nav>
        </div>
        <button onClick={handleLogout} className="mt-6 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded">Logout</button>
      </aside>

      <div className="flex-1 bg-gray-100">
        <main className="p-6 max-w-6xl mx-auto">
          {/* Content stays the same */}
        </main>
      </div>
    </div>
  );
}
