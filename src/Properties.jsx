// src/Properties.jsx
import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [newProperty, setNewProperty] = useState({
    name: '',
    tenantName: '',
    tenantContact: '',
    tenantRent: '',
    rentDueDate: '',
    landlordName: '',
    landlordAmount: '',
    landlordPaymentDueDate: '',
    contractStart: '',
    contractEnd: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const snapshot = await getDocs(collection(db, 'properties'));
    setProperties(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      const propertyRef = doc(db, 'properties', editingId);
      await updateDoc(propertyRef, newProperty);
    } else {
      await addDoc(collection(db, 'properties'), newProperty);
    }
    setNewProperty({
      name: '',
      tenantName: '',
      tenantContact: '',
      tenantRent: '',
      rentDueDate: '',
      landlordName: '',
      landlordAmount: '',
      landlordPaymentDueDate: '',
      contractStart: '',
      contractEnd: ''
    });
    setEditingId(null);
    fetchProperties();
  };

  const handleEdit = (property) => {
    setNewProperty({
      name: property.name,
      tenantName: property.tenantName || '',
      tenantContact: property.tenantContact || '',
      tenantRent: property.tenantRent || '',
      rentDueDate: property.rentDueDate || '',
      landlordName: property.landlordName || '',
      landlordAmount: property.landlordAmount || '',
      landlordPaymentDueDate: property.landlordPaymentDueDate || '',
      contractStart: property.contractStart || '',
      contractEnd: property.contractEnd || ''
    });
    setEditingId(property.id);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'properties', id));
    fetchProperties();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">🏠 Properties</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-8 space-y-4">
        <input
          className="w-full p-2 border rounded"
          placeholder="Property Name/Address"
          value={newProperty.name}
          onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
          required
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Tenant Name"
          value={newProperty.tenantName}
          onChange={(e) => setNewProperty({ ...newProperty, tenantName: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Tenant Contact (Phone or Email)"
          value={newProperty.tenantContact}
          onChange={(e) => setNewProperty({ ...newProperty, tenantContact: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          type="number"
          placeholder="Tenant Rent Amount (£)"
          value={newProperty.tenantRent}
          onChange={(e) => setNewProperty({ ...newProperty, tenantRent: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          type="number"
          placeholder="Tenant Rent Due Day (1-31)"
          value={newProperty.rentDueDate}
          onChange={(e) => setNewProperty({ ...newProperty, rentDueDate: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Landlord Name"
          value={newProperty.landlordName}
          onChange={(e) => setNewProperty({ ...newProperty, landlordName: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          type="number"
          placeholder="Landlord Amount (£)"
          value={newProperty.landlordAmount}
          onChange={(e) => setNewProperty({ ...newProperty, landlordAmount: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          type="number"
          placeholder="Landlord Payment Due Day (1-31)"
          value={newProperty.landlordPaymentDueDate}
          onChange={(e) => setNewProperty({ ...newProperty, landlordPaymentDueDate: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          type="date"
          placeholder="Contract Start Date"
          value={newProperty.contractStart}
          onChange={(e) => setNewProperty({ ...newProperty, contractStart: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          type="date"
          placeholder="Contract End Date"
          value={newProperty.contractEnd}
          onChange={(e) => setNewProperty({ ...newProperty, contractEnd: e.target.value })}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          {editingId ? 'Update Property' : 'Add Property'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{property.name}</h2>
            <p className="text-sm text-gray-600">Tenant: {property.tenantName || 'N/A'} ({property.tenantContact || 'N/A'})</p>
            <p className="text-sm text-gray-600">Tenant Rent: £{property.tenantRent || 'N/A'} due on {property.rentDueDate}</p>
            <p className="text-sm text-gray-600">Landlord: {property.landlordName || 'N/A'} - £{property.landlordAmount || 'N/A'}</p>
            <p className="text-sm text-gray-600">Contract: {property.contractStart || 'N/A'} ➔ {property.contractEnd || 'N/A'}</p>

            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => handleEdit(property)}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(property.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
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
