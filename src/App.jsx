import { useState, useEffect, useRef } from 'react';
import Login from './components/Login.jsx';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';
import TaskFilter from './components/TaskFilter.jsx';
import { getUsername, getTasks, setTasks } from './utils/localStorage.js';
import './styles/App.css';

function getInitialDarkMode() {
  return localStorage.getItem('ptt_dark') === 'true' || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

function TaskDetailsModal({ task, onClose, onEdit, onDelete, onToggle }) {
  const modalRef = useRef(null);
  // Keyboard: close on Esc, focus trap
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);
  useEffect(() => {
    // Focus first button
    if (modalRef.current) {
      const btn = modalRef.current.querySelector('button, [tabindex]:not([tabindex="-1"])');
      if (btn) btn.focus();
    }
  }, []);
  if (!task) return null;
  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
  return (
    <div className="modal-task-form-bg modal-fade-in" onClick={onClose}>
      <div className="modal-task-form-card modal-scale-in" onClick={e => e.stopPropagation()} ref={modalRef}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">&#10006;</button>
        <h2 style={{marginTop:0}}>{task.title}</h2>
        <div style={{marginBottom:'1em'}}>
          <span className={`priority-badge ${task.priority?.toLowerCase()}`}>{task.priority || 'Medium'}</span>
          {isOverdue && <span className="overdue-badge">Overdue</span>}
          <span style={{marginLeft:'1em', fontWeight:500}}>{task.completed ? '✅ Completed' : '⏳ Pending'}</span>
        </div>
        <div style={{marginBottom:'1em', whiteSpace:'pre-line', wordBreak:'break-word', overflowWrap:'break-word', maxWidth:'100%', overflow:'auto'}}>{task.description || <span style={{color:'#888'}}>No description</span>}</div>
        <div className="task-meta" style={{marginBottom:'1em'}}>
          <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
          {task.dueDate && <span> | Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
        </div>
        {task.tags && task.tags.length > 0 && (
          <div className="task-tags" style={{marginBottom:'1em'}}>
            {task.tags.map((tag, i) => (
              <span className="tag-badge" key={i}>{tag}</span>
            ))}
          </div>
        )}
        <div style={{display:'flex', gap:'0.7em', marginTop:'1.5em'}}>
          <button className="task-form-btn" onClick={() => onEdit(task)}><span role="img" aria-label="Edit">✏️</span> Edit</button>
          <button className="task-form-btn" onClick={() => onToggle(task.id)}>{task.completed ? <><span role="img" aria-label="Mark as Pending">⏳</span> Mark as Pending</> : <><span role="img" aria-label="Mark as Complete">✅</span> Mark as Complete</>}</button>
          <button className="task-form-btn delete" onClick={() => onDelete(task.id)}><span role="img" aria-label="Delete">🗑️</span> Delete</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ task, onCancel, onConfirm }) {
  if (!task) return null;
  return (
    <div className="modal-task-form-bg modal-fade-in" onClick={onCancel}>
      <div className="modal-task-form-card modal-scale-in" onClick={e => e.stopPropagation()} style={{maxWidth: 340, minWidth: 0, width: '90vw', textAlign: 'center'}}>
        <button className="modal-close-btn" onClick={onCancel} aria-label="Cancel">&#10006;</button>
        <h2 style={{marginTop:0, marginBottom:'1.2em'}}>Delete Task?</h2>
        <div style={{marginBottom:'1.2em', color:'#d32f2f', fontWeight:600}}>
          Are you sure you want to delete <span style={{fontWeight:700}}>{task.title}</span>?
        </div>
        <div style={{display:'flex', gap:'1em', justifyContent:'center'}}>
          <button className="task-form-btn" onClick={onCancel}>Cancel</button>
          <button className="task-form-btn delete" onClick={() => onConfirm(task.id)}><span role="img" aria-label="Delete">🗑️</span> Delete</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [username, setUsername] = useState(getUsername());
  const [tasks, setTasksState] = useState(() => getTasks(getUsername()));
  const [filter, setFilter] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState('');
  const [dark, setDark] = useState(getInitialDarkMode());
  const [tagFilter, setTagFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [detailsTask, setDetailsTask] = useState(null);
  const [confirmDeleteTask, setConfirmDeleteTask] = useState(null);

  useEffect(() => {
    setUsername(getUsername());
  }, []);

  useEffect(() => {
    if (username) {
      setTasksState(getTasks(username));
    }
  }, [username]);

  useEffect(() => {
    if (username) setTasks(username, tasks);
  }, [tasks, username]);

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('ptt_dark', dark);
  }, [dark]);

  if (!username) {
    return <Login onLogin={setUsername} />;
  }

  // Task CRUD
  const handleSaveTask = (task) => {
    if (task.id) {
      setTasksState(tasks.map(t => t.id === task.id ? { ...t, ...task } : t));
      setEditingTask(null);
    } else {
      const newTask = {
        ...task,
        id: Date.now(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTasksState([newTask, ...tasks]);
    }
    setShowForm(false);
  };

  const handleToggle = (id) => {
    setTasksState(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    setDetailsTask(null);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
    setDetailsTask(null);
  };

  const handleDelete = (id) => {
    const task = tasks.find(t => t.id === id);
    setConfirmDeleteTask(task);
  };
  const confirmDelete = (id) => {
    setTasksState(tasks.filter(t => t.id !== id));
    if (editingTask && editingTask.id === id) setEditingTask(null);
    setDetailsTask(null);
    setConfirmDeleteTask(null);
  };
  const cancelDelete = () => setConfirmDeleteTask(null);

  // Filtering
  let filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'completed') return t.completed;
    if (filter === 'pending') return !t.completed;
    return true;
  });

  // Search
  if (search.trim()) {
    filteredTasks = filteredTasks.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
    );
  }

  // Tag/category filter
  const allTags = Array.from(new Set(tasks.flatMap(t => t.tags || [])));
  if (tagFilter) {
    filteredTasks = filteredTasks.filter(t => t.tags && t.tags.includes(tagFilter));
  }

  const counts = {
    all: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
  };

  return (
    <div className="app-container">
      <header>
        <h1>Welcome, {username}!</h1>
        <div style={{ display: 'flex', gap: '0.5em', alignItems: 'center' }}>
          <button className="logout-btn" onClick={() => { localStorage.removeItem('ptt_username'); setUsername(null); }}>Logout</button>
          <button className="logout-btn" onClick={() => setDark(d => !d)}>{dark ? 'Light Mode' : 'Dark Mode'}</button>
        </div>
      </header>
      <div style={{ display: 'flex', gap: '0.5em', marginBottom: '1em' }}>
        <input
          type="search"
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '0.6em', borderRadius: 6, border: '1px solid #d0d7de' }}
        />
        {allTags.length > 0 && (
          <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} style={{ borderRadius: 6, padding: '0.6em' }}>
            <option value="">All Tags</option>
            {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
          </select>
        )}
      </div>
      <TaskFilter filter={filter} counts={counts} onChange={setFilter} />
      <TaskList
        tasks={filteredTasks}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={task => { setDetailsTask(task); setShowForm(false); }}
      />
      {/* Floating Action Button (FAB) */}
      <button
        className={`fab-add-task${showForm ? ' open' : ''}`}
        onClick={() => { setShowForm(f => !f); setEditingTask(null); setDetailsTask(null); }}
        aria-label={showForm ? 'Close Add Task' : 'Add Task'}
      >
        {showForm ? <span style={{fontSize:'1.5em'}}>&#10005;</span> : <span style={{fontSize:'2em', fontWeight:700}}>+</span>}
        </button>
      {/* Modal Add Task Form */}
      {showForm && (
        <div className="modal-task-form-bg" onClick={() => { setShowForm(false); setEditingTask(null); }}>
          <div className="modal-task-form-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => { setShowForm(false); setEditingTask(null); }} aria-label="Close">&#10005;</button>
            <TaskForm onSave={handleSaveTask} editingTask={editingTask} onCancel={() => { setShowForm(false); setEditingTask(null); }} />
          </div>
        </div>
      )}
      {/* Modal Task Details */}
      {detailsTask && (
        <TaskDetailsModal
          task={detailsTask}
          onClose={() => setDetailsTask(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      )}
      {/* Custom Confirm Delete Modal */}
      {confirmDeleteTask && (
        <ConfirmDeleteModal
          task={confirmDeleteTask}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}
      </div>
  );
}

export default App;
