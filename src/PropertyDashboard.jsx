import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

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

    console.log("Saving to Firebase:", newProperty);
    try {
      const docRef = await addDoc(collection(db, "properties"), newProperty);
      console.log("✅ Added to Firestore:", docRef.id);
      setProperties(prev => [...prev, { id: docRef.id, ...newProperty }]);
    } catch (err) {
      console.error("❌ Error saving to Firestore:", err);
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
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-black text-white flex items-center px-6 py-4 shadow">
        <img src="/logo.png" alt="Logo" className="h-10 w-auto mr-3" />
        <h1 className="text-xl font-bold text-blue-400">Property Management Dashboard</h1>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <div className="bg-white shadow rounded p-6 mb-10 w-full">
          <h2 className="text-xl font-bold mb-4 text-blue-700 border-b pb-2">➕ Add New Property</h2>

          <label className="block font-semibold text-sm text-gray-700">Property Address</label>
          <input type="text" className="border p-2 w-full mb-4 rounded" value={newProperty.name} onChange={e => setNewProperty({ ...newProperty, name: e.target.value })} />

          <h3 className="text-lg font-semibold text-blue-600 mt-6 mb-2">Tenant Info</h3>
          <label className="block font-semibold text-sm text-gray-700">Tenant Name</label>
          <input type="text" className="border p-2 w-full mb-2 rounded" value={newProperty.tenant.name} onChange={e => setNewProperty({ ...newProperty, tenant: { ...newProperty.tenant, name: e.target.value } })} />

          <label className="block font-semibold text-sm text-gray-700">Rent Amount (£)</label>
          <input type="number" className="border p-2 w-full mb-2 rounded" value={newProperty.rent} onChange={e => setNewProperty({ ...newProperty, rent: parseFloat(e.target.value) })} />

          <label className="block font-semibold text-sm text-gray-700">Rent Due Day (e.g. 1 for 1st)</label>
          <input type="number" className="border p-2 w-full mb-4 rounded" value={newProperty.rentDueDate} onChange={e => setNewProperty({ ...newProperty, rentDueDate: e.target.value })} />

          <h3 className="text-lg font-semibold text-blue-600 mt-6 mb-2">Landlord Info</h3>
          <label className="block font-semibold text-sm text-gray-700">Landlord Name</label>
          <input type="text" className="border p-2 w-full mb-2 rounded" value={newProperty.landlord.name} onChange={e => setNewProperty({ ...newProperty, landlord: { ...newProperty.landlord, name: e.target.value } })} />

          <label className="block font-semibold text-sm text-gray-700">Amount Due to Landlord (£)</label>
          <input type="number" className="border p-2 w-full mb-2 rounded" value={newProperty.landlordAmount} onChange={e => setNewProperty({ ...newProperty, landlordAmount: parseFloat(e.target.value) })} />

          <label className="block font-semibold text-sm text-gray-700">Payment Due Day (e.g. 3 for 3rd)</label>
          <input type="number" className="border p-2 w-full mb-4 rounded" value={newProperty.landlordPaymentDueDate} onChange={e => setNewProperty({ ...newProperty, landlordPaymentDueDate: e.target.value })} />

          <button onClick={addProperty} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
            Add Property
          </button>
        </div>

        {/* Daily Rent and Payment View */}
        <div className="bg-white shadow rounded p-6 w-full">
          <h2 className="text-xl font-bold mb-4 text-blue-700 border-b pb-2">📅 What’s Due Today ({format(selectedDate, 'd MMM yyyy')})</h2>

          <h3 className="text-md font-semibold text-blue-600 mt-4 mb-2">Tenant Payments Due</h3>
          {dueToday.length === 0 ? <p className="text-gray-500">No rent due today.</p> : (
            <ul className="space-y-2">
              {dueToday.map(item => (
                <li key={item.id} className="flex justify-between items-center border p-2 rounded">
                  <div>🏠 <strong>{item.tenant.name}</strong> owes £{item.rent} for <strong>{item.name}</strong></div>
                  <button onClick={() => toggleStatus(item.id, 'rentPaid')} className={`px-2 py-1 text-white rounded ${item.rentPaid ? 'bg-green-600' : 'bg-red-600'}`}>
                    {item.rentPaid ? 'Paid' : 'Mark Paid'}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <h3 className="text-md font-semibold text-blue-600 mt-6 mb-2">Landlord Payments Due</h3>
          {landlordDueToday.length === 0 ? <p className="text-gray-500">No landlord payments due today.</p> : (
            <ul className="space-y-2">
              {landlordDueToday.map(item => (
                <li key={item.id} className="flex justify-between items-center border p-2 rounded">
                  <div>💼 Pay <strong>{item.landlord.name}</strong> £{item.landlordAmount} for <strong>{item.name}</strong></div>
                  <button onClick={() => toggleStatus(item.id, 'landlordPaid')} className={`px-2 py-1 text-white rounded ${item.landlordPaid ? 'bg-green-600' : 'bg-red-600'}`}>
                    {item.landlordPaid ? 'Paid' : 'Mark Paid'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}