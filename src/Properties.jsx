import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

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
  const [editingProperty, setEditingProperty] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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

    resetForm();
  };

  const deleteProperty = async (id) => {
    await deleteDoc(doc(db, 'properties', id));
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  const startEdit = (property) => {
    setEditingProperty(property);
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (!editingProperty) return;

    try {
      await updateDoc(doc(db, 'properties', editingProperty.id), editingProperty);
      fetchProperties();
    } catch (err) {
      console.error('Error updating property:', err);
    }

    setIsEditing(false);
    setEditingProperty(null);
  };

  const resetForm = () => {
    setNewProperty({
      name: '', rent: '', rentDueDate: '', landlordPaymentDueDate: '', landlordAmount: '',
      landlord: { name: '', email: '', phone: '' }, tenant: { name: '' },
      inspectionDate: '', certificates: [], notes: ''
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-blue-800 mb-6">📋 Property Management</h1>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4 text-blue-700">➕ Add New Property</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="p-2 border border-blue-300 rounded" placeholder="Property Address" value={newProperty.name} onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })} />
          <input className="p-2 border border-blue-300 rounded" placeholder="Tenant Name" value={newProperty.tenant.name} onChange={(e) => setNewProperty({ ...newProperty, tenant: { ...newProperty.tenant, name: e.target.value } })} />
          <input className="p-2 border border-blue-300 rounded" placeholder="Tenant Rent Amount" value={newProperty.rent} onChange={(e) => setNewProperty({ ...newProperty, rent: e.target.value })} />
          <input className="p-2 border border-blue-300 rounded" placeholder="Tenant Rent Due Date (e.g. 1)" value={newProperty.rentDueDate} onChange={(e) => setNewProperty({ ...newProperty, rentDueDate: e.target.value })} />
          <input className="p-2 border border-blue-300 rounded" placeholder="Landlord Name" value={newProperty.landlord.name} onChange={(e) => setNewProperty({ ...newProperty, landlord: { ...newProperty.landlord, name: e.target.value } })} />
          <input className="p-2 border border-blue-300 rounded" placeholder="Landlord Amount Due" value={newProperty.landlordAmount} onChange={(e) => setNewProperty({ ...newProperty, landlordAmount: e.target.value })} />
          <input className="p-2 border border-blue-300 rounded" placeholder="Landlord Payment Due Date (e.g. 2)" value={newProperty.landlordPaymentDueDate} onChange={(e) => setNewProperty({ ...newProperty, landlordPaymentDueDate: e.target.value })} />
        </div>
        <button onClick={addProperty} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-md">
          💾 Save Property
        </button>
      </div>

      <h2 className="text-2xl font-bold text-blue-800 mb-4">🏠 All Properties</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="bg-white border border-blue-100 p-5 rounded-xl shadow hover:shadow-lg transition duration-300">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">{property.name}</h3>
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
                onClick={() => startEdit(property)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {isEditing && editingProperty && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">✏️ Edit Property</h2>
            <input className="w-full mb-2 p-2 border rounded" value={editingProperty.name} onChange={(e) => setEditingProperty({ ...editingProperty, name: e.target.value })} />
            <input className="w-full mb-2 p-2 border rounded" value={editingProperty.tenant.name} onChange={(e) => setEditingProperty({ ...editingProperty, tenant: { ...editingProperty.tenant, name: e.target.value } })} />
            <input className="w-full mb-2 p-2 border rounded" value={editingProperty.rent} onChange={(e) => setEditingProperty({ ...editingProperty, rent: e.target.value })} />
            <input className="w-full mb-2 p-2 border rounded" value={editingProperty.rentDueDate} onChange={(e) => setEditingProperty({ ...editingProperty, rentDueDate: e.target.value })} />
            <input className="w-full mb-2 p-2 border rounded" value={editingProperty.landlord.name} onChange={(e) => setEditingProperty({ ...editingProperty, landlord: { ...editingProperty.landlord, name: e.target.value } })} />
            <input className="w-full mb-2 p-2 border rounded" value={editingProperty.landlordAmount} onChange={(e) => setEditingProperty({ ...editingProperty, landlordAmount: e.target.value })} />
            <input className="w-full mb-4 p-2 border rounded" value={editingProperty.landlordPaymentDueDate} onChange={(e) => setEditingProperty({ ...editingProperty, landlordPaymentDueDate: e.target.value })} />
            <div className="flex justify-end gap-4">
              <button onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
              <button onClick={saveEdit} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
