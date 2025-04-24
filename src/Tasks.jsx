// Tasks.jsx - User Task Management
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

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    const q = query(collection(db, 'tasks'), where('assignedTo', '==', user.email));
    const querySnapshot = await getDocs(q);
    const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTasks(list);
  };

  const handleAdd = async () => {
    if (!newTask) return;
    await addDoc(collection(db, 'tasks'), {
      task: newTask,
      completed: false,
      assignedTo: user.email,
      createdAt: new Date()
    });
    setNewTask('');
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

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">📝 My Tasks</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New task..."
          className="border p-2 rounded w-full"
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </div>

      {tasks.length === 0 && <p className="text-gray-600">No tasks for today.</p>}

      <ul className="space-y-4">
        {tasks.map(task => (
          <li
            key={task.id}
            className={`p-4 rounded shadow flex justify-between items-center ${
              task.completed ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <span className={`${task.completed ? 'line-through' : ''}`}>{task.task}</span>
            <div className="space-x-2">
              <button
                onClick={() => toggleComplete(task.id, task.completed)}
                className={`px-3 py-1 rounded text-white ${task.completed ? 'bg-yellow-600' : 'bg-green-600'}`}
              >
                {task.completed ? 'Undo' : 'Complete'}
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