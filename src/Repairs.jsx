import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc
} from 'firebase/firestore';

export default function Repairs() {
  const [repairs, setRepairs] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newContractor, setNewContractor] = useState({ name: '', details: '' });
  const [newRepair, setNewRepair] = useState({
    property: '',
    notes: '',
    contractor: '',
    contractorDetails: '',
    dateReported: '',
    tenantContact: '',
    status: 'pending',
    photo: null
  });

  useEffect(() => {
    fetchRepairs();
    fetchContractors();
  }, []);

  const fetchRepairs = async () => {
    const querySnapshot = await getDocs(collection(db, 'repairs'));
    const repairList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRepairs(repairList);
  };

  const fetchContractors = async () => {
    const querySnapshot = await getDocs(collection(db, 'contractors'));
    const contractorList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setContractors(contractorList);
  };

  const handleAddContractor = async () => {
    if (newContractor.name && newContractor.details) {
      const contractorRef = doc(db, 'contractors', newContractor.name);
      await setDoc(contractorRef, newContractor);
      setNewContractor({ name: '', details: '' });
      fetchContractors();
    }
  };

  const handleContractorChange = (value) => {
    const selected = contractors.find(c => c.name === value);
    setNewRepair({
      ...newRepair,
      contractor: selected?.name || '',
      contractorDetails: selected?.details || ''
    });
  };

  const handleAddRepair = async () => {
    if (!newRepair.property || !newRepair.notes) return;

    let photoUrl = '';
    if (newRepair.photo) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        photoUrl = reader.result;
        await addDoc(collection(db, 'repairs'), { ...newRepair, photoUrl });
        fetchRepairs();
      };
      reader.readAsDataURL(newRepair.photo);
    } else {
      await addDoc(collection(db, 'repairs'), { ...newRepair, photoUrl });
      fetchRepairs();
    }

    setNewRepair({
      property: '',
      notes: '',
      contractor: '',
      contractorDetails: '',
      dateReported: '',
      tenantContact: '',
      status: 'pending',
      photo: null
    });
  };

  const updateRepair = async (id, field, value) => {
    const ref = doc(db, 'repairs', id);
    await updateDoc(ref, { [field]: value });
    fetchRepairs();
  };

  const deleteRepair = async (id) => {
    const ref = doc(db, 'repairs', id);
    await deleteDoc(ref);
    fetchRepairs();
  };

  const handleSendToContractor = (repair) => {
    const message = `Repair Job Assigned\nProperty: ${repair.property}\nNotes: ${repair.notes}\nTenant Contact: ${repair.tenantContact}\nDate Reported: ${repair.dateReported}`;
    const phoneNumber = repair.contractorDetails.match(/(07\d{9})/); // UK format
    if (phoneNumber) {
      const whatsappUrl = `https://wa.me/44${phoneNumber[0].slice(1)}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert('No valid phone number found for WhatsApp message.');
    }
  };

  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch =
      repair.property.toLowerCase().includes(search.toLowerCase()) ||
      repair.contractor.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || repair.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    if (status === 'completed') return 'bg-green-200';
    if (status === 'in progress') return 'bg-yellow-200';
    return 'bg-red-200';
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">🔧 Repairs Management</h1>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search repairs..."
          className="p-2 border rounded w-1/2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="p-2 border rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="bg-white p-4 rounded shadow mb-8">
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
          placeholder="Contractor Details"
          className="border p-2 mb-2 w-full"
          value={newContractor.details}
          onChange={(e) => setNewContractor({ ...newContractor, details: e.target.value })}
        />
        <button onClick={handleAddContractor} className="bg-green-600 text-white px-4 py-2 rounded">Save Contractor</button>
      </div>

      <div className="bg-white p-4 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Repair</h2>
        <input type="text" placeholder="Property Address" className="border p-2 mb-2 w-full" value={newRepair.property} onChange={(e) => setNewRepair({ ...newRepair, property: e.target.value })} />
        <textarea placeholder="Repair Notes" className="border p-2 mb-2 w-full" value={newRepair.notes} onChange={(e) => setNewRepair({ ...newRepair, notes: e.target.value })} />
        <select className="border p-2 mb-2 w-full" value={newRepair.contractor} onChange={(e) => handleContractorChange(e.target.value)}>
          <option value="">Select Contractor</option>
          {contractors.map((c, idx) => (
            <option key={idx} value={c.name}>{c.name}</option>
          ))}
        </select>
        <input type="text" placeholder="Contractor Contact Details" className="border p-2 mb-2 w-full" value={newRepair.contractorDetails} readOnly />
        <input type="date" placeholder="Date Reported" className="border p-2 mb-2 w-full" value={newRepair.dateReported} onChange={(e) => setNewRepair({ ...newRepair, dateReported: e.target.value })} />
        <input type="text" placeholder="Tenant Contact Info" className="border p-2 mb-2 w-full" value={newRepair.tenantContact} onChange={(e) => setNewRepair({ ...newRepair, tenantContact: e.target.value })} />
        <input type="file" className="border p-2 mb-2 w-full" accept="image/*" onChange={(e) => setNewRepair({ ...newRepair, photo: e.target.files[0] })} />
        <select className="border p-2 mb-2 w-full" value={newRepair.status} onChange={(e) => setNewRepair({ ...newRepair, status: e.target.value })}>
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button onClick={handleAddRepair} className="bg-blue-600 text-white px-4 py-2 rounded">Add Repair</button>
      </div>

      <div className="space-y-6">
        {filteredRepairs.map((repair) => (
          <div key={repair.id} className={`p-4 rounded shadow border ${getStatusColor(repair.status)}`}>
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
            <div className="flex gap-2">
              <button onClick={() => handleSendToContractor(repair)} className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800">
                📤 Send to Contractor
              </button>
              <button onClick={() => deleteRepair(repair.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
