import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc
} from 'firebase/firestore';

export default function Repairs() {
  const [repairs, setRepairs] = useState([]);
  const [newRepair, setNewRepair] = useState({
    property: '',
    notes: '',
    contractor: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    const querySnapshot = await getDocs(collection(db, 'repairs'));
    const repairList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRepairs(repairList);
  };

  const handleAddRepair = async () => {
    if (!newRepair.property || !newRepair.notes) return;
    await addDoc(collection(db, 'repairs'), newRepair);
    setNewRepair({ property: '', notes: '', contractor: '', status: 'pending' });
    fetchRepairs();
  };

  const updateRepair = async (id, field, value) => {
    const ref = doc(db, 'repairs', id);
    await updateDoc(ref, { [field]: value });
    fetchRepairs();
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">🔧 Repair Management</h1>

      <div className="bg-white p-4 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Repair</h2>
        <input
          type="text"
          placeholder="Property Address"
          className="border p-2 mb-2 w-full"
          value={newRepair.property}
          onChange={(e) => setNewRepair({ ...newRepair, property: e.target.value })}
        />
        <textarea
          placeholder="Repair Notes"
          className="border p-2 mb-2 w-full"
          value={newRepair.notes}
          onChange={(e) => setNewRepair({ ...newRepair, notes: e.target.value })}
        />
        <input
          type="text"
          placeholder="Assigned Contractor"
          className="border p-2 mb-2 w-full"
          value={newRepair.contractor}
          onChange={(e) => setNewRepair({ ...newRepair, contractor: e.target.value })}
        />
        <select
          className="border p-2 mb-2 w-full"
          value={newRepair.status}
          onChange={(e) => setNewRepair({ ...newRepair, status: e.target.value })}
        >
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button onClick={handleAddRepair} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Repair
        </button>
      </div>

      <div className="space-y-6">
        {repairs.map((repair) => (
          <div key={repair.id} className="bg-white p-4 rounded shadow border">
            <div className="font-semibold mb-1">🏠 {repair.property}</div>
            <div className="text-gray-700 mb-1">📝 Notes: {repair.notes}</div>
            <div className="text-gray-700 mb-1">👷 Contractor: {repair.contractor || 'Not assigned'}</div>
            <div className="text-gray-700 mb-2">📌 Status: <strong>{repair.status}</strong></div>

            <textarea
              className="border p-2 mb-2 w-full"
              value={repair.notes}
              onChange={(e) => updateRepair(repair.id, 'notes', e.target.value)}
            />
            <select
              className="border p-2 mb-2 w-full"
              value={repair.status}
              onChange={(e) => updateRepair(repair.id, 'status', e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
