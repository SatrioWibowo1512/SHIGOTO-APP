let activeFilter = 'Semua';
let activePriority = 'Semua';

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

window.refreshAllViews = function() {
  if (typeof window.renderApp === 'function') window.renderApp();
  if (typeof window.renderCalendar === 'function') window.renderCalendar();
  if (typeof window.renderCalendarTasks === 'function') window.renderCalendarTasks();
};

function renderDate() {
  const today = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = today.toLocaleDateString('id-ID', options);
  
  const dateElement = document.getElementById('current-date');
  if (dateElement) {
    dateElement.textContent = formattedDate;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderDate();
  renderApp();
  setupCategoryFilters();
  setupPriorityFilter();
});

window.renderApp = function() {
  const todayStr = getLocalDateString();
  const tasks = Storage.getTasks().filter(t => {
    const isToday = !t.date || t.date === todayStr;
    return !t.archived && isToday;
  });

  updateProgress(tasks);
  renderTasks(tasks);
};

function updateProgress(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const percentEl = document.querySelector('.progress-percent');
  const detailEl = document.querySelector('.progress-detail');
  const fillEl = document.querySelector('.progress-bar-fill');

  if (percentEl) percentEl.textContent = `${percent}%`;
  if (detailEl) detailEl.textContent = `${completed} dari ${total} tugas selesai`;
  if (fillEl) fillEl.style.width = `${percent}%`;
}

function renderTasks(tasks) {
  const activeListContainer = document.getElementById('active-tasks-list');
  const completedListContainer = document.getElementById('completed-tasks-list');

  if (!activeListContainer || !completedListContainer) return;

  const filtered = tasks.filter(t => {
    const matchCategory = activeFilter === 'Semua' || t.category.toLowerCase() === activeFilter.toLowerCase();
    const matchPriority = activePriority === 'Semua' || (t.tag && t.tag.toLowerCase() === activePriority.toLowerCase());
    return matchCategory && matchPriority;
  });

  const activeTasks = filtered.filter(t => !t.completed);
  const completedTasks = filtered.filter(t => t.completed);

  activeListContainer.innerHTML = activeTasks.length > 0 
    ? activeTasks.map(createTaskHTML).join('') 
    : `<p style="font-size: 0.85rem; color: #94a3b8; padding: 8px 0;">Tidak ada tugas pada filter ini.</p>`;

  completedListContainer.innerHTML = completedTasks.map(createTaskHTML).join('');

  attachCheckboxEvents();
}

// Helper Cek Tugas Terlewat
function isTaskOverdue(task) {
  if (task.completed || !task.date) return false;

  const todayStr = getLocalDateString();
  if (task.date < todayStr) return true;

  if (task.date === todayStr && task.time) {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const timeClean = task.time.replace(' WIB', '').trim();
    const [h, m] = timeClean.split(':').map(Number);
    
    if (!isNaN(h) && !isNaN(m)) {
      const taskMins = h * 60 + m;
      if (taskMins < currentMins) return true;
    }
  }

  return false;
}

// Update fungsi createTaskHTML
function createTaskHTML(task) {
  const overdue = isTaskOverdue(task);

  return `
    <div class="task-card ${task.completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}">
      <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
      <div class="task-info">
        <p class="task-title">${task.title}</p>
        <div class="task-meta">
          ${overdue ? `<span class="tag tag-overdue">Terlewat</span>` : ''}
          <span class="time-text">${task.time || ''}</span>
          <span class="tag tag-${task.category.toLowerCase()}">${task.category}</span>
          ${task.tag ? `<span class="tag tag-${task.tag.toLowerCase()}">${task.tag}</span>` : ''}
        </div>
      </div>

      <div class="task-menu-container">
        <button class="task-menu-btn" data-id="${task.id}">⋮</button>
        <div class="task-dropdown" id="dropdown-${task.id}">
          <button class="task-dropdown-item edit-btn" data-id="${task.id}">
            <svg class="dropdown-icon" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            <span>Edit</span>
          </button>
          <button class="task-dropdown-item delete-btn" data-id="${task.id}">
            <svg class="dropdown-icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function attachCheckboxEvents() {
  document.querySelectorAll('#view-hariini .task-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-id');
      Storage.toggleComplete(id);
      window.refreshAllViews();
    });
  });

  document.querySelectorAll('#view-hariini .task-menu-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-id');
      const dropdown = document.getElementById(`dropdown-${id}`);

      document.querySelectorAll('.task-dropdown').forEach(d => {
        if (d !== dropdown) d.classList.remove('show');
      });

      if (dropdown) dropdown.classList.toggle('show');
    });
  });

  document.querySelectorAll('#view-hariini .edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (typeof window.prepareEditTask === 'function') {
        window.prepareEditTask(id);
      }
      if (typeof window.switchView === 'function') {
        window.switchView('view-tambah', true);
      }
    });
  });

  document.querySelectorAll('#view-hariini .delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      Storage.deleteTask(id);
      window.refreshAllViews();
    });
  });
}

document.addEventListener('click', () => {
  document.querySelectorAll('.task-dropdown').forEach(d => d.classList.remove('show'));
});

function setupCategoryFilters() {
  document.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      const target = e.currentTarget;
      target.classList.add('active');

      activeFilter = target.textContent.trim();
      renderApp();
    });
  });
}

function setupPriorityFilter() {
  const prioritySelect = document.getElementById('priority-filter');
  if (prioritySelect) {
    prioritySelect.addEventListener('change', (e) => {
      activePriority = e.target.value;
      renderApp();
    });
  }
}