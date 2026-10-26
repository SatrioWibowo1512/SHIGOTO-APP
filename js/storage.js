// localStorage.clear();

const STORAGE_KEY = 'shigoto_data';

const defaultTasks = [
  { id: '1', title: 'Selesaikan laporan tugas sekolah', category: 'Tugas', tag: 'Penting', time: '14:00 WIB', completed: false, archived: false },
  { id: '2', title: 'Latihan gitar lagu baru', category: 'Hobby', tag: 'Santai', time: '16:30 WIB', completed: false, archived: false },
  { id: '3', title: 'Latihan soal matematika', category: 'Latihan', tag: 'Sedang', time: '17:00 WIB', completed: false, archived: false },
  { id: '4', title: 'Jogging sore 30 menit', category: 'Latihan', tag: 'Sedang', time: '07:00 WIB', completed: true, archived: false },
  { id: '5', title: 'Beli kebutuhan harian', category: 'Lainnya', tag: 'Santai', time: '10:00 WIB', completed: true, archived: false }
];

window.Storage = {
  getTasks() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      this.saveTasks(defaultTasks);
      return defaultTasks;
    }
    return JSON.parse(data);
  },

  saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },

  toggleComplete(id) {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks(tasks);
    }
  },

  deleteTask(id) {
    let tasks = this.getTasks();
    tasks = tasks.filter(t => t.id !== id);
    this.saveTasks(tasks);
  },

  // Fungsi baru: Otomatis membedakan Tambah Baru vs Update
  saveTask(taskData) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === taskData.id);

    if (index > -1) {
      // Jika ID sudah ada -> Update
      tasks[index] = { ...tasks[index], ...taskData };
    } else {
      // Jika ID baru -> Tambah di paling atas
      tasks.unshift(taskData);
    }

    this.saveTasks(tasks);
  }
};