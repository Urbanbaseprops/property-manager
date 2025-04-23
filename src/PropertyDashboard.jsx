import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function PropertyDashboard() {
  const [displayItems, setDisplayItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItemsByDate(selectedDate);
  }, [selectedDate, allItems, filter, searchTerm]);

  const fetchItems = async () => {
    const querySnapshot = await getDocs(collection(db, 'properties'));
    const allProperties = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAllItems(allProperties);
  };

  const filterItemsByDate = (date) => {
    const day = date.getDate();
    const tomorrow = new Date(date);
    tomorrow.setDate(day + 1);
    const nextDay = tomorrow.getDate();

    const filtered = allItems.filter(item => {
      const matchRent = parseInt(item.rentDueDate) === day && (filter === 'all' || filter === 'tenant');
      const matchLandlord = parseInt(item.landlordPaymentDueDate) === day && (filter === 'all' || filter === 'landlord');
      const matchNextDayRent = parseInt(item.rentDueDate) === nextDay && filter === 'tenant';
      const matchNextDayLandlord = parseInt(item.landlordPaymentDueDate) === nextDay && filter === 'landlord';
      const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.tenant?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return (matchRent || matchLandlord || matchNextDayRent || matchNextDayLandlord) && matchesSearch;
    });

    setDisplayItems(filtered);
  };

  const toggleStatus = async (id, field, currentValue) => {
    const ref = doc(db, 'properties', id);
    await updateDoc(ref, {
      [field]: !currentValue
    });
    fetchItems();
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">📋 Urban Base Properties - Daily Overview</h1>

      <div className="mb-4">
        <Calendar onChange={setSelectedDate} value={selectedDate} className="rounded shadow border" />
      </div>

      <div className="flex gap-4 mb-4">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>All</button>
        <button onClick={() => setFilter('tenant')} className={`px-4 py-2 rounded ${filter === 'tenant' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Tenants</button>
        <button onClick={() => setFilter('landlord')} className={`px-4 py-2 rounded ${filter === 'landlord' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Landlords</button>
      </div>

      <input
        type="text"
        placeholder="Search by property or tenant name"
        className="mb-6 w-full p-2 border rounded"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {displayItems.length === 0 && (
        <p className="text-gray-600">No rent or payments due on selected date.</p>
      )}

      <div className="space-y-6">
        {displayItems.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded shadow border">
            {parseInt(item.rentDueDate) === selectedDate.getDate() && (
              <div className="mb-4">
                <div className="font-medium text-gray-700">
                  💰 Inbound Tenant Payment - <strong>{item.tenant?.name}</strong> at <strong>{item.name}</strong>
                </div>
                <button
                  onClick={() => toggleStatus(item.id, 'tenantPaid', item.tenantPaid)}
                  className={`mt-2 px-3 py-1 text-white rounded ${item.tenantPaid ? 'bg-green-600' : 'bg-red-600'}`}
                >
                  {item.tenantPaid ? 'Paid' : 'Mark Paid'}
                </button>
              </div>
            )}

            {parseInt(item.landlordPaymentDueDate) === selectedDate.getDate() && (
              <div>
                <div className="font-medium text-gray-700">
                  💼 Outgoing Landlord Payment - <strong>{item.landlord?.name}</strong> £{item.landlordAmount} for <strong>{item.name}</strong>
                </div>
                <button
                  onClick={() => toggleStatus(item.id, 'landlordPaid', item.landlordPaid)}
                  className={`mt-2 px-3 py-1 text-white rounded ${item.landlordPaid ? 'bg-green-600' : 'bg-red-600'}`}
                >
                  {item.landlordPaid ? 'Paid' : 'Mark Paid'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
