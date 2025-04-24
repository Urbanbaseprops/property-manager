// src/Certificates.jsx
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [form, setForm] = useState({
    property: '',
    type: '',
    expiry: '',
  });

  const fetchCertificates = async () => {
    const snapshot = await getDocs(collection(db, 'certificates'));
    setCertificates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!form.property || !form.type || !form.expiry) return;
    await addDoc(collection(db, 'certificates'), {
      ...form,
      expiry: new Date(form.expiry)
    });
    setForm({ property: '', type: '', expiry: '' });
    fetchCertificates();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📄 Property Certificates</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-2">➕ Add New Certificate</h2>
        <input
          name="property"
          placeholder="Property Name"
          value={form.property}
          onChange={handleChange}
          className="border p-2 mr-2"
        />
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="border p-2 mr-2"
        >
          <option value="">Select Type</option>
          <option value="EICR">EICR</option>
          <option value="Gas Safety">Gas Safety</option>
          <option value="EPC">EPC</option>
          <option value="License">License</option>
        </select>
        <input
          type="date"
          name="expiry"
          value={form.expiry}
          onChange={handleChange}
          className="border p-2 mr-2"
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>

      <div>
        <h2 className="font-semibold mb-2">📋 All Certificates</h2>
        <ul className="space-y-2">
          {certificates.map((cert) => (
            <li key={cert.id} className="bg-gray-100 p-3 rounded shadow">
              {cert.property} - {cert.type} -{" "}
              {new Date(cert.expiry.seconds * 1000).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
