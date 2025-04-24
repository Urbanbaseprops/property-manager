// Certificates.jsx - Full form with issued date, expiry, and reference number
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [form, setForm] = useState({
    property: '',
    type: '',
    issued: '',
    expiry: '',
    reference: ''
  });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    const snapshot = await getDocs(collection(db, 'certificates'));
    setCertificates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleAdd = async () => {
    if (!form.property || !form.type || !form.issued || !form.expiry) return;
    await addDoc(collection(db, 'certificates'), form);
    setForm({ property: '', type: '', issued: '', expiry: '', reference: '' });
    fetchCertificates();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'certificates', id));
    fetchCertificates();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-800 mb-4">🏢 Property Certificates</h1>

      <div className="bg-white shadow p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Add New Certificate</h2>
        <input
          type="text"
          className="input border p-2 mb-2 w-full"
          placeholder="Property Name"
          value={form.property}
          onChange={(e) => setForm({ ...form, property: e.target.value })}
        />
        <select
          className="input border p-2 mb-2 w-full"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="">Select Type</option>
          <option value="EICR">EICR</option>
          <option value="Gas Safety">Gas Safety</option>
          <option value="EPC">EPC</option>
          <option value="License">License</option>
        </select>
        <input
          type="date"
          className="input border p-2 mb-2 w-full"
          value={form.issued}
          onChange={(e) => setForm({ ...form, issued: e.target.value })}
        />
        <input
          type="date"
          className="input border p-2 mb-2 w-full"
          value={form.expiry}
          onChange={(e) => setForm({ ...form, expiry: e.target.value })}
        />
        <input
          type="text"
          className="input border p-2 mb-2 w-full"
          placeholder="Reference Number"
          value={form.reference}
          onChange={(e) => setForm({ ...form, reference: e.target.value })}
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Add Certificate
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">All Certificates</h2>
        {certificates.map((cert) => (
          <div key={cert.id} className="bg-gray-100 p-4 rounded shadow mb-3">
            <p><strong>{cert.property}</strong> - {cert.type}</p>
            <p>Issued: {new Date(cert.issued).toLocaleDateString()}</p>
            <p>Expiry: {new Date(cert.expiry).toLocaleDateString()}</p>
            <p>Ref: {cert.reference}</p>
            <button
              onClick={() => handleDelete(cert.id)}
              className="text-red-600 hover:text-red-800 mt-2"
            >
              🗑 Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
