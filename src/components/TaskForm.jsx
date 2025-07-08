import { useState, useEffect } from 'react';

const PRIORITIES = ['Low', 'Medium', 'High'];

function TaskForm({ onSave, editingTask, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority || 'Medium');
      setDueDate(editingTask.dueDate || '');
      setTags(editingTask.tags ? editingTask.tags.join(', ') : '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDueDate('');
      setTags('');
    }
  }, [editingTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    onSave({
      ...editingTask,
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setDueDate('');
    setTags('');
    setError('');
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Task title *"
        value={title}
        onChange={e => setTitle(e.target.value)}
        autoFocus
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <div className="task-form-row">
        <label>
          Priority:
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label>
          Due Date:
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </label>
      </div>
      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={e => setTags(e.target.value)}
      />
      {error && <div className="error">{error}</div>}
      <div className="task-form-actions">
        <button type="submit">{editingTask ? 'Update' : 'Add'} Task</button>
        {editingTask && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

export default TaskForm; 