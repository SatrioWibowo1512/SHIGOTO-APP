const STORAGE_KEY = 'shigoto_tasks_data';
const TEMPLATE_KEY = 'shigoto_templates_data';

const Storage = {
  // --- MANAJEMEN TUGAS ---
  getTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  saveTask(task) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => String(t.id) === String(task.id));
    if (index > -1) {
      tasks[index] = task;
    } else {
      tasks.push(task);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },

  toggleComplete(id) {
    const tasks = this.getTasks();
    const task = tasks.find(t => String(t.id) === String(id));
    if (task) {
      task.completed = !task.completed;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  },

  deleteTask(id) {
    let tasks = this.getTasks();
    tasks = tasks.filter(t => String(t.id) !== String(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },

  // --- MANAJEMEN TEMPLATE ---
  getTemplates() {
    try {
      const data = localStorage.getItem(TEMPLATE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  saveTemplate(tpl) {
    const templates = this.getTemplates();
    templates.push(tpl);
    localStorage.setItem(TEMPLATE_KEY, JSON.stringify(templates));
  },

  deleteTemplate(id) {
    let templates = this.getTemplates();
    templates = templates.filter(t => String(t.id) !== String(id));
    localStorage.setItem(TEMPLATE_KEY, JSON.stringify(templates));
  }
};