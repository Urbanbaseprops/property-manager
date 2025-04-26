// src/PropertyDashboard.jsx
import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { db } from './firebase';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function PropertyDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [itemsDue, setItemsDue] = useState([]);
  const [expiringCerts, setExpiringCerts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [repairs, setRepairs] = useState([]);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    fetchAllData();
  }, [selectedDate]);

  const fetchAllData = async () => {
    await fetchItemsDue();
    await fetchTasks();
    await fetchRepairs();
    await fetchExpiringCertificates();
  };

  const fetchItemsDue = async () => {
    const selectedDay = selectedDate.getDate();
    const propSnap = await getDocs(collection(db, 'properties'));
    const allProps = propSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const filtered = allProps.filter(item =>
      parseInt(item.rentDueDate) === selectedDay || parseInt(item.landlordPaymentDueDate) === selectedDay
    );
    setItemsDue(filtered);
  };

  const fetchTasks = async () => {
    const q = query(collection(db, 'tasks'), where('assignedTo', '==', user?.email));
    const snapshot = await getDocs(q);
    setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchRepairs = async () => {
    const snapshot = await getDocs(collection(db, 'repairs'));
    setRepairs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchExpiringCertificates = async () => {
    const snapshot = await getDocs(collection(db, 'certificates'));
    const now = new Date();
    const upcoming = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(cert => {
      const expiryDate = cert.expiry?.seconds ? new Date(cert.expiry.seconds * 1000) : new Date(cert.expiry);
      const diff = (expiryDate - now) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    });
    setExpiringCerts(upcoming);
  };

  const toggleStatus = async (id, field, currentValue) => {
    const ref = doc(db, 'properties', id);
    await updateDoc(ref, {
      [field]: !currentValue
    });
    fetchItemsDue();
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800">🏠 Dashboard Overview</h1>
        <div className="mt-4 md:mt-0">
          <Calendar value={selectedDate} onChange={setSelectedDate} className="rounded shadow-lg" />
        </div>
      </div>

      {expiringCerts.length > 0 && (
        <div className="bg-red-100 border border-red-400 p-4 rounded mb-6">
          <h2 className="text-lg font-semibold text-red-700 mb-2">⚠️ Certificates Expiring Soon</h2>
          {expiringCerts.map(cert => (
            <div key={cert.id} className="mb-2">
              <strong>{cert.property}</strong> - {cert.type}<br />
              Expiry: {new Date(cert.expiry?.seconds * 1000).toLocaleDateString()} | 
              Issued: {new Date(cert.issued?.seconds * 1000).toLocaleDateString()}<br />
              Ref: {cert.reference || 'N/A'}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">📅 Rents / Payments on {selectedDate.toDateString()}</h2>
          {itemsDue.length === 0 && (
            <p className="text-gray-500">Nothing due on this day.</p>
          )}
          {itemsDue.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded shadow mb-3">
              {parseInt(item.rentDueDate) === selectedDate.getDate() && (
                <div className="mb-2">
                  <strong>Incoming Rent:</strong> {item.tenant?.name} - £{item.tenant?.rent || item.tenantRent || 'N/A'}
                  <button
                    onClick={() => toggleStatus(item.id, 'tenantPaid', item.tenantPaid)}
                    className={`ml-4 px-2 py-1 text-white rounded ${item.tenantPaid ? 'bg-green-600' : 'bg-red-600'}`}
                  >
                    {item.tenantPaid ? 'Paid' : 'Mark Paid'}
                  </button>
                </div>
              )}
              {parseInt(item.landlordPaymentDueDate) === selectedDate.getDate() && (
                <div>
                  <strong>Outgoing to Landlord:</strong> {item.landlord?.name} - £{item.landlordAmount || 'N/A'}
                  <button
                    onClick={() => toggleStatus(item.id, 'landlordPaid', item.landlordPaid)}
                    className={`ml-4 px-2 py-1 text-white rounded ${item.landlordPaid ? 'bg-green-600' : 'bg-red-600'}`}
                  >
                    {item.landlordPaid ? 'Paid' : 'Mark Paid'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">🛠 Repairs for {selectedDate.toDateString()}</h2>
          {repairs.length === 0 && (
            <p className="text-gray-500">No repairs listed.</p>
          )}
          {repairs.slice(0, 5).map((repair) => (
            <div key={repair.id} className="bg-yellow-100 p-4 rounded shadow mb-3">
              <p><strong>{repair.property}</strong>: {repair.notes}</p>
              <p className="text-sm text-gray-600">Assigned to: {repair.contractor}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">📝 Your Tasks</h2>
        {tasks.length === 0 && (
          <p className="text-gray-500">No tasks for you yet!</p>
        )}
        {tasks.slice(0, 5).map((task) => (
          <div key={task.id} className="bg-blue-100 p-4 rounded shadow mb-3">
            <p className="font-medium">{task.task}</p>
            <p className="text-sm text-gray-600">Date: {task.date?.toDate?.().toDateString?.() || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
