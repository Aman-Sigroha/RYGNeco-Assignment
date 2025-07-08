function TaskItem({ task, onToggle, onEdit, onDelete, onView }) {
  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
  const truncatedDesc = task.description && task.description.length > 100
    ? task.description.slice(0, 100) + '...'
    : task.description;
  return (
    <div
      className={`task-item${task.completed ? ' completed' : ''} ${task.priority ? task.priority.toLowerCase() : ''}`}
      onClick={e => {
        // Only trigger onView if not clicking Edit/Delete
        if (!e.target.closest('.task-actions')) onView(task);
      }}
      style={{ cursor: 'pointer' }}
      tabIndex={0}
      aria-label={`View details for task: ${task.title}`}
    >
      <div className="task-main">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={e => { e.stopPropagation(); onToggle(task.id); }}
          aria-label={task.completed ? 'Mark as pending' : 'Mark as completed'}
        />
        <div className="task-info">
          <div className="task-title-row">
            <div className="task-title">{task.title}</div>
            <span className={`priority-badge ${task.priority?.toLowerCase()}`}>{task.priority || 'Medium'}</span>
            {isOverdue && <span className="overdue-badge">Overdue</span>}
          </div>
          {truncatedDesc && <div className="task-desc">{truncatedDesc}</div>}
          <div className="task-meta">
            <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
            {task.dueDate && <span> | Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
          </div>
          {task.tags && task.tags.length > 0 && (
            <div className="task-tags">
              {task.tags.map((tag, i) => (
                <span className="tag-badge" key={i}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="task-actions">
        <button onClick={e => { e.stopPropagation(); onEdit(task); }} aria-label="Edit task">Edit</button>
        <button onClick={e => { e.stopPropagation(); onDelete(task.id); }} aria-label="Delete task">Delete</button>
      </div>
    </div>
  );
}

export default TaskItem; 