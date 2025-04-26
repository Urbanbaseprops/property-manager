// PropertyDashboard.jsx - updated with WhatsApp & Email buttons
import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function PropertyDashboard() {
  const [todayItems, setTodayItems] = useState([]);

  useEffect(() => {
    fetchTodayItems();
  }, []);

  const fetchTodayItems = async () => {
    const now = new Date();
    const today = now.getDate();
    const propSnap = await getDocs(collection(db, 'properties'));
    const allProps = propSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const filtered = allProps.filter(item =>
      parseInt(item.rentDueDate) === today
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

  const sendWhatsApp = (tenant) => {
    const message = `Hello ${tenant.tenantName},\n\nThis is a reminder that your rent of £${tenant.tenantRent} for ${tenant.name} is due today.\n\nPlease send proof of payment once made.\n\nThank you,\nUrban Base Properties.`;
    window.open(`https://wa.me/${tenant.tenantContact}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const sendEmail = (tenant) => {
    const subject = `Rent Due Reminder - ${tenant.name}`;
    const body = `Hello ${tenant.tenantName},\n\nThis is a reminder that your rent of £${tenant.tenantRent} for ${tenant.name} is due today.\n\nPlease send proof of payment once made.\n\nThank you,\nUrban Base Properties.`;
    window.location.href = `mailto:${tenant.tenantContact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">🏠 Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">📅 Rent Due Today</h2>
          {todayItems.map((tenant) => (
            <div key={tenant.id} className="bg-white p-4 rounded shadow mb-3">
              <div className="mb-2">
                <strong>{tenant.tenantName}</strong> owes £{tenant.tenantRent} for {tenant.name}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => toggleStatus(tenant.id, 'tenantPaid', tenant.tenantPaid)}
                  className={`px-3 py-1 text-white rounded ${tenant.tenantPaid ? 'bg-green-600' : 'bg-red-600'}`}
                >
                  {tenant.tenantPaid ? 'Paid' : 'Mark Paid'}
                </button>
                <button
                  onClick={() => sendEmail(tenant)}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                  📩 Email
                </button>
                <button
                  onClick={() => sendWhatsApp(tenant)}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                >
                  💬 WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
