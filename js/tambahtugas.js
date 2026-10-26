window.editingTaskId = null;

window.resetFormTambah = function() {
  const taskForm = document.getElementById('task-form');
  if (taskForm) taskForm.reset();
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) submitBtn.textContent = 'Tambah Tugas';
  window.editingTaskId = null;
};

window.prepareEditTask = function(id) {
  const tasks = Storage.getTasks();
  const task = tasks.find(t => t.id === id);
  if (task) {
    window.editingTaskId = id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-category').value = task.category;
    document.getElementById('task-priority').value = task.tag || 'Santai';
    document.getElementById('task-time').value = task.time ? task.time.replace(' WIB', '') : '';
    document.getElementById('submit-btn').textContent = 'Simpan Perubahan';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  if (!taskForm) return;

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const timeVal = document.getElementById('task-time').value;

    const taskData = {
      id: window.editingTaskId || Date.now().toString(),
      title: document.getElementById('task-title').value.trim(),
      category: document.getElementById('task-category').value,
      tag: document.getElementById('task-priority').value,
      time: timeVal ? `${timeVal} WIB` : '',
      completed: false,
      archived: false
    };

    Storage.saveTask(taskData);
    if (typeof renderApp === 'function') renderApp();
    window.resetFormTambah();
    window.switchView('view-hariini');
  });
});