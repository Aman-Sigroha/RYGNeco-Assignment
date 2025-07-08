export const getUsername = () => localStorage.getItem('ptt_username');
export const setUsername = (username) => localStorage.setItem('ptt_username', username);

export const getTasks = (username) => {
  if (!username) return [];
  const tasks = localStorage.getItem(`ptt_tasks_${username}`);
  return tasks ? JSON.parse(tasks) : [];
};

export const setTasks = (username, tasks) => {
  if (!username) return;
  localStorage.setItem(`ptt_tasks_${username}`, JSON.stringify(tasks));
}; 