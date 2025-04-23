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
    contractorDetails: '',
    dateReported: '',
    tenantContact: '',
    status: 'pending',
    photoUrl: ''
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
    setNewRepair({
      property: '',
      notes: '',
      contractor: '',
      contractorDetails: '',
      dateReported: '',
      tenantContact: '',
      status: 'pending',
      photoUrl: ''
    });
    fetchRepairs();
  };

  const updateRepair = async (id, field, value) => {
    const ref = doc(db, 'repairs', id);
    await updateDoc(ref, { [field]: value });
    fetchRepairs();
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">🔧 Repairs Management</h1>

      <div className="bg-white p-4 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Repair</h2>
        <input type="text" placeholder="Property Address" className="border p-2 mb-2 w-full" value={newRepair.property} onChange={(e) => setNewRepair({ ...newRepair, property: e.target.value })} />
        <textarea placeholder="Repair Notes" className="border p-2 mb-2 w-full" value={newRepair.notes} onChange={(e) => setNewRepair({ ...newRepair, notes: e.target.value })} />
        <input type="text" placeholder="Contractor Name" className="border p-2 mb-2 w-full" value={newRepair.contractor} onChange={(e) => setNewRepair({ ...newRepair, contractor: e.target.value })} />
        <input type="text" placeholder="Contractor Contact Details" className="border p-2 mb-2 w-full" value={newRepair.contractorDetails} onChange={(e) => setNewRepair({ ...newRepair, contractorDetails: e.target.value })} />
        <input type="date" placeholder="Date Reported" className="border p-2 mb-2 w-full" value={newRepair.dateReported} onChange={(e) => setNewRepair({ ...newRepair, dateReported: e.target.value })} />
        <input type="text" placeholder="Tenant Contact Info" className="border p-2 mb-2 w-full" value={newRepair.tenantContact} onChange={(e) => setNewRepair({ ...newRepair, tenantContact: e.target.value })} />
        <input type="text" placeholder="Photo URL (optional)" className="border p-2 mb-2 w-full" value={newRepair.photoUrl} onChange={(e) => setNewRepair({ ...newRepair, photoUrl: e.target.value })} />
        <select className="border p-2 mb-2 w-full" value={newRepair.status} onChange={(e) => setNewRepair({ ...newRepair, status: e.target.value })}>
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button onClick={handleAddRepair} className="bg-blue-600 text-white px-4 py-2 rounded">Add Repair</button>
      </div>

      <div className="space-y-6">
        {repairs.map((repair) => (
          <div key={repair.id} className="bg-white p-4 rounded shadow border">
            <div className="font-semibold mb-1">🏠 {repair.property}</div>
            <input className="border p-2 mb-2 w-full" value={repair.notes} onChange={(e) => updateRepair(repair.id, 'notes', e.target.value)} />
            <input className="border p-2 mb-2 w-full" value={repair.contractor} onChange={(e) => updateRepair(repair.id, 'contractor', e.target.value)} />
            <input className="border p-2 mb-2 w-full" value={repair.contractorDetails} onChange={(e) => updateRepair(repair.id, 'contractorDetails', e.target.value)} />
            <input className="border p-2 mb-2 w-full" type="date" value={repair.dateReported} onChange={(e) => updateRepair(repair.id, 'dateReported', e.target.value)} />
            <input className="border p-2 mb-2 w-full" value={repair.tenantContact} onChange={(e) => updateRepair(repair.id, 'tenantContact', e.target.value)} />
            {repair.photoUrl && <img src={repair.photoUrl} alt="Repair" className="mb-2 max-w-sm" />}
            <select className="border p-2 mb-2 w-full" value={repair.status} onChange={(e) => updateRepair(repair.id, 'status', e.target.value)}>
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