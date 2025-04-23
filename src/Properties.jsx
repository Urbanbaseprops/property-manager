import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [newProperty, setNewProperty] = useState({
    name: '',
    rent: '',
    rentDueDate: '',
    landlordPaymentDueDate: '',
    landlordAmount: '',
    landlord: { name: '', email: '', phone: '' },
    tenant: { name: '' },
    inspectionDate: '',
    certificates: [],
    notes: ''
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const querySnapshot = await getDocs(collection(db, 'properties'));
    const propertyList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProperties(propertyList);
  };

  const addProperty = async () => {
    if (!newProperty.name || !newProperty.rent) return;

    try {
      const docRef = await addDoc(collection(db, 'properties'), newProperty);
      setProperties(prev => [...prev, { id: docRef.id, ...newProperty }]);
    } catch (err) {
      console.error('Error saving to Firestore:', err);
    }

    setNewProperty({
      name: '', rent: '', rentDueDate: '', landlordPaymentDueDate: '', landlordAmount: '',
      landlord: { name: '', email: '', phone: '' }, tenant: { name: '' },
      inspectionDate: '', certificates: [], notes: ''
    });
  };

  const deleteProperty = async (id) => {
    await deleteDoc(doc(db, 'properties', id));
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📋 Property Management</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">➕ Add New Property</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="p-2 border rounded" placeholder="Property Address" value={newProperty.name} onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Tenant Name" value={newProperty.tenant.name} onChange={(e) => setNewProperty({ ...newProperty, tenant: { ...newProperty.tenant, name: e.target.value } })} />
          <input className="p-2 border rounded" placeholder="Tenant Rent Amount" value={newProperty.rent} onChange={(e) => setNewProperty({ ...newProperty, rent: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Tenant Rent Due Date (e.g. 1)" value={newProperty.rentDueDate} onChange={(e) => setNewProperty({ ...newProperty, rentDueDate: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Landlord Name" value={newProperty.landlord.name} onChange={(e) => setNewProperty({ ...newProperty, landlord: { ...newProperty.landlord, name: e.target.value } })} />
          <input className="p-2 border rounded" placeholder="Landlord Amount Due" value={newProperty.landlordAmount} onChange={(e) => setNewProperty({ ...newProperty, landlordAmount: e.target.value })} />
          <input className="p-2 border rounded" placeholder="Landlord Payment Due Date (e.g. 2)" value={newProperty.landlordPaymentDueDate} onChange={(e) => setNewProperty({ ...newProperty, landlordPaymentDueDate: e.target.value })} />
        </div>
        <button onClick={addProperty} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Save Property
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4">🏠 All Properties</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((property) => (
          <div key={property.id} className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-2">{property.name}</h3>
            <p><strong>Tenant:</strong> {property.tenant?.name}</p>
            <p><strong>Rent:</strong> £{property.rent} due on the {property.rentDueDate} of each month</p>
            <p><strong>Landlord:</strong> {property.landlord?.name}</p>
            <p><strong>Payment to Landlord:</strong> £{property.landlordAmount} due on the {property.landlordPaymentDueDate} of each month</p>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => deleteProperty(property.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
