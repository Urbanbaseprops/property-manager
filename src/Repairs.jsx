import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function Repairs() {
  const [repairs, setRepairs] = useState([]);
  const [newRepair, setNewRepair] = useState({
    property: '',
    description: '',
    status: 'Pending'
  });

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    const querySnapshot = await getDocs(collection(db, 'repairs'));
    const repairList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRepairs(repairList);
  };

  const addRepair = async () => {
    if (!newRepair.property || !newRepair.description) return;
    const docRef = await addDoc(collection(db, 'repairs'), newRepair);
    setRepairs(prev => [...prev, { id: docRef.id, ...newRepair }]);
    setNewRepair({ property: '', description: '', status: 'Pending' });
  };

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, 'repairs', id), { status });
    fetchRepairs();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-800 mb-6">🛠 Repairs Log</h1>

      <div className="bg-gray-100 p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">➕ Log New Repair</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="p-2 border border-gray-300 rounded" placeholder="Property Address" value={newRepair.property} onChange={(e) => setNewRepair({ ...newRepair, property: e.target.value })} />
          <input className="p-2 border border-gray-300 rounded" placeholder="Repair Description" value={newRepair.description} onChange={(e) => setNewRepair({ ...newRepair, description: e.target.value })} />
        </div>
        <button onClick={addRepair} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
          Save Repair
        </button>
      </div>

      <h2 className="text-2xl font-bold text-blue-800 mb-4">📋 Repairs List</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repairs.map(repair => (
          <div key={repair.id} className="bg-white border p-4 rounded shadow">
            <h3 className="text-lg font-semibold text-blue-700">{repair.property}</h3>
            <p className="mb-2">{repair.description}</p>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm text-white ${repair.status === 'Completed' ? 'bg-green-600' : repair.status === 'Outstanding' ? 'bg-red-500' : 'bg-yellow-500'}`}>{repair.status}</span>
              <button onClick={() => updateStatus(repair.id, 'Pending')} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">Pending</button>
              <button onClick={() => updateStatus(repair.id, 'Outstanding')} className="bg-red-500 text-white px-2 py-1 rounded text-xs">Outstanding</button>
              <button onClick={() => updateStatus(repair.id, 'Completed')} className="bg-green-600 text-white px-2 py-1 rounded text-xs">Completed</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
