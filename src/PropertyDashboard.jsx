// PropertyDashboard.jsx - Enhanced with toggle fix & rent amount display
import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function PropertyDashboard() {
  const [todayItems, setTodayItems] = useState([]);
  const [upcomingItems, setUpcomingItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    fetchTodayItems();
    fetchUpcoming();
    fetchTasks();
    fetchRepairs();
  }, []);

  const fetchTodayItems = async () => {
    const now = new Date();
    const today = now.getDate();
    const propSnap = await getDocs(collection(db, 'properties'));
    const allProps = propSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const filtered = allProps.filter(item =>
      parseInt(item.rentDueDate) === today || parseInt(item.landlordPaymentDueDate) === today
    );
    setTodayItems(filtered);
  };

  const fetchUpcoming = async () => {
    const tomorrow = new Date().getDate() + 1;
    const propSnap = await getDocs(collection(db, 'properties'));
    const allProps = propSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const filtered = allProps.filter(item =>
      parseInt(item.rentDueDate) === tomorrow || parseInt(item.landlordPaymentDueDate) === tomorrow
    );
    setUpcomingItems(filtered);
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

  const toggleStatus = async (id, field, currentValue) => {
    const ref = doc(db, 'properties', id);
    await updateDoc(ref, {
      [field]: !currentValue
    });
    fetchTodayItems();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">🏠 Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">📅 Due Today</h2>
          {todayItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded shadow mb-3">
              {parseInt(item.rentDueDate) === new Date().getDate() && (
                <div className="mb-2">
                  <strong>Incoming Rent:</strong> {item.tenant?.name} at {item.name} - £{item.tenant?.rent || item.tenantRent || 'N/A'}
                  <button
                    onClick={() => toggleStatus(item.id, 'tenantPaid', item.tenantPaid)}
                    className={`ml-4 px-2 py-1 text-white rounded ${item.tenantPaid ? 'bg-green-600' : 'bg-red-600'}`}
                  >
                    {item.tenantPaid ? 'Paid' : 'Mark Paid'}
                  </button>
                </div>
              )}
              {parseInt(item.landlordPaymentDueDate) === new Date().getDate() && (
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
          <h2 className="text-xl font-semibold mb-2">🔜 Tomorrow's Schedule</h2>
          {upcomingItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded shadow mb-3">
              {parseInt(item.rentDueDate) === new Date().getDate() + 1 && (
                <p><strong>Incoming:</strong> {item.tenant?.name} - £{item.tenant?.rent || item.tenantRent || 'N/A'}</p>
              )}
              {parseInt(item.landlordPaymentDueDate) === new Date().getDate() + 1 && (
                <p><strong>Outgoing:</strong> {item.landlord?.name} - £{item.landlordAmount || 'N/A'}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">🛠 Repairs Overview</h2>
        {repairs.slice(0, 3).map((repair) => (
          <div key={repair.id} className="bg-yellow-100 p-4 rounded shadow mb-3">
            <p><strong>{repair.property}</strong>: {repair.notes}</p>
            <p className="text-sm text-gray-600">Assigned to: {repair.contractor}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">📝 Your Tasks</h2>
        {tasks.slice(0, 3).map((task) => (
          <div key={task.id} className="bg-blue-100 p-4 rounded shadow mb-3">
            <p className="font-medium">{task.task}</p>
            <p className="text-sm text-gray-600">Date: {task.date?.toDate?.().toDateString?.() || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
