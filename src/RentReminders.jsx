// RentReminders.jsx
import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function RentReminders() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const querySnapshot = await getDocs(collection(db, 'properties'));
    const props = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProperties(props);
  };

  const sendWhatsApp = (tenant) => {
    const message = `Hello ${tenant.tenantName},\n\nYour rent of £${tenant.tenantRent} for ${tenant.name} is due soon.\n\nPlease send proof of payment once made.\n\nThank you,\nUrban Base Properties.`;
    window.open(`https://wa.me/${tenant.tenantContact}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const sendEmail = (tenant) => {
    const subject = `Rent Due Reminder - ${tenant.name}`;
    const body = `Hello ${tenant.tenantName},\n\nThis is a reminder that your rent of £${tenant.tenantRent} for ${tenant.name} is due soon.\n\nPlease send proof of payment once made.\n\nThank you,\nUrban Base Properties.`;
    window.location.href = `mailto:${tenant.tenantContact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const checkContractStatus = (contractEndDate) => {
    const now = new Date();
    const expiryDate = new Date(contractEndDate);

    const diff = (expiryDate - now) / (1000 * 60 * 60 * 24); // days difference

    if (diff < 0) return 'expired'; // contract already expired
    if (diff <= 30) return 'expiring'; // contract expiring within 30 days
    return 'active';
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">📩 Rent Reminders & Contract Expiry</h1>

      <div className="grid grid-cols-1 gap-6">
        {properties.map((tenant) => {
          const contractStatus = checkContractStatus(tenant.contractEndDate);

          return (
            <div
              key={tenant.id}
              className={`p-4 rounded shadow ${
                contractStatus === 'expired' ? 'bg-red-100 border border-red-400' :
                contractStatus === 'expiring' ? 'bg-yellow-100 border border-yellow-400' :
                'bg-green-100 border border-green-400'
              }`}
            >
              <h2 className="text-xl font-semibold">{tenant.tenantName}</h2>
              <p><strong>Property:</strong> {tenant.name}</p>
              <p><strong>Rent Amount:</strong> £{tenant.tenantRent}</p>
              <p><strong>Contract Ends:</strong> {tenant.contractEndDate || 'N/A'}</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => sendEmail(tenant)}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                  📩 Send Email
                </button>
                <button
                  onClick={() => sendWhatsApp(tenant)}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                >
                  💬 WhatsApp
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
