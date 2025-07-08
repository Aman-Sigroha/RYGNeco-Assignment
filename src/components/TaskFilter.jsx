function TaskFilter({ filter, counts, onChange }) {
  const filters = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'completed', label: `Completed (${counts.completed})` },
    { key: 'pending', label: `Pending (${counts.pending})` },
  ];
  return (
    <div className="task-filter">
      {filters.map(f => (
        <button
          key={f.key}
          className={filter === f.key ? 'active' : ''}
          onClick={() => onChange(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export default TaskFilter; 