import TaskItem from './TaskItem.jsx';

function TaskList({ tasks, onToggle, onEdit, onDelete, onView }) {
  if (!tasks.length) {
    return <div className="empty-list">No tasks to show.</div>;
  }
  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
}

export default TaskList; 