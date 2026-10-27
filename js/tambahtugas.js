window.editingTaskId = null;

// Helper Tanggal Lokal YYYY-MM-DD
function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Reset Form ke Kondisi Awal (Tambah Baru)
window.resetFormTambah = function() {
  const taskForm = document.getElementById('task-form');
  if (taskForm) taskForm.reset();
  
  const dateInput = document.getElementById('task-date');
  if (dateInput) dateInput.value = getLocalDateString();

  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) submitBtn.textContent = 'Tambah Tugas';
  
  window.editingTaskId = null;
};

// Siapkan Form untuk Mode Edit Tugas
window.prepareEditTask = function(id) {
  const tasks = Storage.getTasks();
  const task = tasks.find(t => t.id === id);
  if (task) {
    window.editingTaskId = id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-date').value = task.date || getLocalDateString();
    document.getElementById('task-category').value = task.category;
    document.getElementById('task-priority').value = task.tag || 'Santai';
    document.getElementById('task-time').value = task.time ? task.time.replace(' WIB', '') : '';
    document.getElementById('submit-btn').textContent = 'Simpan Perubahan';
  }
};

// Event Listener Submit Form Tambah / Edit
document.addEventListener('DOMContentLoaded', () => {
  window.resetFormTambah();

  const taskForm = document.getElementById('task-form');
  if (!taskForm) return;

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const timeVal = document.getElementById('task-time').value;
    const dateVal = document.getElementById('task-date').value || getLocalDateString();

    const taskData = {
      id: window.editingTaskId || Date.now().toString(),
      title: document.getElementById('task-title').value.trim(),
      date: dateVal,
      category: document.getElementById('task-category').value,
      tag: document.getElementById('task-priority').value,
      time: timeVal ? `${timeVal} WIB` : '',
      completed: false,
      archived: false
    };

    Storage.saveTask(taskData);

    // Otomatis arahkan fokus tanggal kalender ke tanggal tugas baru ini
    if (typeof window.setSelectedCalendarDate === 'function') {
      window.setSelectedCalendarDate(dateVal);
    }

    // Refresh tampilan Hari Ini & Jadwal secara serentak
    if (typeof window.refreshAllViews === 'function') {
      window.refreshAllViews();
    }

    window.resetFormTambah();
    window.switchView('view-hariini');

    // POP-UP NOTIFIKASI KUSTOM
    window.showCustomModal({
      title: 'Tugas Tersimpan!',
      message: 'Tugas baru berhasil ditambahkan ke jadwal kamu.',
      showCancel: false,
      onConfirm: () => {
        window.switchView('view-hariini');
      }
    });
  });
});