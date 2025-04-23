import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function PropertyDashboard() {
  const [todayItems, setTodayItems] = useState([]);

  useEffect(() => {
    fetchTodayItems();
  }, []);

  const fetchTodayItems = async () => {
    const now = new Date();
    const today = now.getDate();

    const querySnapshot = await getDocs(collection(db, 'properties'));
    const allProperties = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const filtered = allProperties.filter(item =>
      parseInt(item.rentDueDate) === today || parseInt(item.landlordPaymentDueDate) === today
    );

    setTodayItems(filtered);
  };

  const toggleStatus = async (id, field, currentValue) => {
    const ref = doc(db, 'properties', id);
    await updateDoc(ref, {
      [field]: !currentValue
    });
    fetchTodayItems();
  };

  return (
    <div className="p-6 bg-blue-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">📆 Due Today</h1>
      {todayItems.length === 0 && (
        <p className="text-gray-600">No rent or payments due today.</p>
      )}
      <div className="space-y-4">
        {todayItems.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded shadow">
            {parseInt(item.rentDueDate) === new Date().getDate() && (
              <div className="mb-4">
                <div>💰 Rent due from <strong>{item.tenant?.name}</strong> at <strong>{item.name}</strong></div>
                <button
                  onClick={() => toggleStatus(item.id, 'tenantPaid', item.tenantPaid)}
                  className={`mt-2 px-3 py-1 text-white rounded ${item.tenantPaid ? 'bg-green-600' : 'bg-red-600'}`}
                >
                  {item.tenantPaid ? 'Paid' : 'Mark Paid'}
                </button>
              </div>
            )}
            {parseInt(item.landlordPaymentDueDate) === new Date().getDate() && (
              <div>
                <div>💼 Pay <strong>{item.landlord?.name}</strong> £{item.landlordAmount} for <strong>{item.name}</strong></div>
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
