export const getUsername = () => localStorage.getItem('ptt_username');
export const setUsername = (username) => localStorage.setItem('ptt_username', username);

export const getTasks = () => {
  const tasks = localStorage.getItem('ptt_tasks');
  return tasks ? JSON.parse(tasks) : [];
};

export const setTasks = (tasks) => {
  localStorage.setItem('ptt_tasks', JSON.stringify(tasks));
}; 