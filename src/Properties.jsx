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
    <div>
      <h1 className="text-2xl font-bold mb-4">📅 Reminders for {format(selectedDate, 'MMMM d')}</h1>
      <div className="mb-6">
        <label className="block mb-2 font-medium">Select Date:</label>
        <input
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="p-2 border rounded"
        />
      </div>

      {dueToday.length === 0 && landlordDueToday.length === 0 ? (
        <p>No payments due on this date.</p>
      ) : (
        <div className="space-y-6">
          {dueToday.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">💸 Tenant Rent Due</h2>
              <ul className="space-y-2">
                {dueToday.map(item => (
                  <li key={item.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                    <div>🏠 <strong>{item.name}</strong> - £{item.rent} from <strong>{item.tenant?.name}</strong></div>
                    <button
                      onClick={() => toggleStatus(item.id, 'tenantPaid')}
                      className={`px-2 py-1 text-white rounded ${item.tenantPaid ? 'bg-green-600' : 'bg-red-600'}`}
                    >
                      {item.tenantPaid ? 'Paid' : 'Mark Paid'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {landlordDueToday.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">💼 Landlord Payments Due</h2>
              <ul className="space-y-2">
                {landlordDueToday.map(item => (
                  <li key={item.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                    <div>💼 Pay <strong>{item.landlord.name}</strong> £{item.landlordAmount} for <strong>{item.name}</strong></div>
                    <button
                      onClick={() => toggleStatus(item.id, 'landlordPaid')}
                      className={`px-2 py-1 text-white rounded ${item.landlordPaid ? 'bg-green-600' : 'bg-red-600'}`}
                    >
                      {item.landlordPaid ? 'Paid' : 'Mark Paid'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
