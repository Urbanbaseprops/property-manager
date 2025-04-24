// Tasks.jsx - Enhanced Task Management with Calendar and Editing
import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingId, setEditingId] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    const q = query(collection(db, 'tasks'));
    const querySnapshot = await getDocs(q);
    const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTasks(list);
  };

  const handleAdd = async () => {
    if (!newTask || !assignedTo) return;
    if (editingId) {
      const ref = doc(db, 'tasks', editingId);
      await updateDoc(ref, {
        task: newTask,
        assignedTo,
        date: selectedDate,
      });
    } else {
      await addDoc(collection(db, 'tasks'), {
        task: newTask,
        completed: false,
        assignedTo,
        date: selectedDate,
        createdAt: new Date()
      });
    }
    setNewTask('');
    setAssignedTo('');
    setEditingId(null);
    fetchTasks();
  };

  const toggleComplete = async (id, completed) => {
    const ref = doc(db, 'tasks', id);
    await updateDoc(ref, { completed: !completed });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    const ref = doc(db, 'tasks', id);
    await deleteDoc(ref);
    fetchTasks();
  };

  const editTask = (task) => {
    setNewTask(task.task);
    setAssignedTo(task.assignedTo);
    setSelectedDate(task.date ? new Date(task.date.toDate()) : new Date());
    setEditingId(task.id);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">📝 Task Manager</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Task description"
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder="Assign to (email or name)"
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="mb-4">
        <Calendar value={selectedDate} onChange={setSelectedDate} />
      </div>

      <button onClick={handleAdd} className="mb-6 bg-blue-600 text-white px-4 py-2 rounded">
        {editingId ? 'Update Task' : 'Add Task'}
      </button>

      {tasks.length === 0 && <p className="text-gray-600">No tasks available.</p>}

      <ul className="space-y-4">
        {tasks
          .filter(task => {
            const taskDate = task.date ? new Date(task.date.seconds * 1000).toDateString() : null;
            return !taskDate || taskDate === selectedDate.toDateString();
          })
          .map(task => (
            <li
              key={task.id}
              className={`p-4 rounded shadow flex justify-between items-center ${
                task.completed ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <div>
                <p className={`font-semibold ${task.completed ? 'line-through' : ''}`}>{task.task}</p>
                <p className="text-sm text-gray-600">Assigned to: {task.assignedTo}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => toggleComplete(task.id, task.completed)}
                  className={`px-3 py-1 rounded text-white ${task.completed ? 'bg-yellow-600' : 'bg-green-600'}`}
                >
                  {task.completed ? 'Undo' : 'Complete'}
                </button>
                <button
                  onClick={() => editTask(task)}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </li>
        ))}
      </ul>
    </div>
  );
}
