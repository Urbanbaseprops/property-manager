import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';

export default function Contractors() {
  const [contractors, setContractors] = useState([]);
  const [newContractor, setNewContractor] = useState({ name: '', details: '' });

  useEffect(() => {
    fetchContractors();
  }, []);

  const fetchContractors = async () => {
    const querySnapshot = await getDocs(collection(db, 'contractors'));
    const contractorList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setContractors(contractorList);
  };

  const saveContractor = async () => {
    if (!newContractor.name) return;
    const ref = doc(db, 'contractors', newContractor.name);
    await setDoc(ref, newContractor);
    setNewContractor({ name: '', details: '' });
    fetchContractors();
  };

  const editContractor = (contractor) => {
    setNewContractor(contractor);
  };

  const deleteContractor = async (name) => {
    const ref = doc(db, 'contractors', name);
    await deleteDoc(ref);
    fetchContractors();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">👷 Contractor Management</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Add / Edit Contractor</h2>
        <input
          type="text"
          placeholder="Contractor Name"
          className="border p-2 mb-2 w-full"
          value={newContractor.name}
          onChange={(e) => setNewContractor({ ...newContractor, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Contractor Details (Phone, Email, etc)"
          className="border p-2 mb-4 w-full"
          value={newContractor.details}
          onChange={(e) => setNewContractor({ ...newContractor, details: e.target.value })}
        />
        <button onClick={saveContractor} className="bg-blue-600 text-white px-4 py-2 rounded">
          Save Contractor
        </button>
      </div>

      <div className="grid gap-4">
        {contractors.map((contractor) => (
          <div key={contractor.name} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <div className="font-semibold text-lg">{contractor.name}</div>
              <div className="text-gray-600 text-sm">{contractor.details}</div>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => editContractor(contractor)}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => deleteContractor(contractor.name)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
