import { useState, useEffect } from 'react';
import * as taskApi from '../../api/task.api.js';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await taskApi.getTasks();
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (data) => {
    const res = await taskApi.createTask(data);
    setTasks(prev => [...prev, res.data]);
    return res.data;
  };

  const updateTask = async (id, data) => {
    const res = await taskApi.updateTask(id, data);
    setTasks(prev => prev.map(task => task._id === id ? res.data : task));
    return res.data;
  };

  const deleteTask = async (id) => {
    await taskApi.deleteTask(id);
    setTasks(prev => prev.filter(task => task._id !== id));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}