document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.renderArsip === 'function') {
    window.renderArsip();
  }
});

window.renderArsip = function() {
  renderOverallProgress();
  renderArchiveList();
};

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Cek status apakah tugas terlewat
function checkIsOverdue(task) {
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

// 1. STATISTIK PRODUKTIVITAS KESELURUHAN
function renderOverallProgress() {
  if (typeof Storage === 'undefined' || typeof Storage.getTasks !== 'function') return;

  const tasks = Storage.getTasks();
  const total = tasks.length;
  const completed = tasks.filter(t => Boolean(t.completed)).length;
  const overdueCount = tasks.filter(t => checkIsOverdue(t)).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const percentEl = document.getElementById('overall-percent-text');
  const barEl = document.getElementById('overall-progress-bar');
  const detailEl = document.getElementById('overall-detail-text');

  if (percentEl) percentEl.textContent = `${percent}%`;
  if (barEl) barEl.style.width = `${percent}%`;
  if (detailEl) {
    detailEl.textContent = `${completed} selesai, ${overdueCount} terlewat (dari ${total} total tugas)`;
  }
}

// 2. RENDER FOLDER BULAN (ACCORDION)
function renderArchiveList() {
  const container = document.getElementById('archive-month-groups');
  if (!container) return;

  if (typeof Storage === 'undefined' || typeof Storage.getTasks !== 'function') return;

  const allTasks = Storage.getTasks();

  // Ambil tugas yang SELESAI atau TERLEWAT
  const archiveTasks = allTasks.filter(t => Boolean(t.completed) || checkIsOverdue(t));

  if (archiveTasks.length === 0) {
    container.innerHTML = `<p style="font-size: 0.85rem; color: #94a3b8; padding: 16px 0; text-align: center;">Belum ada riwayat tugas selesai atau terlewat.</p>`;
    return;
  }

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Kelompokkan Tugas: MonthKey -> DateKey -> Tasks
  const grouped = {};

  archiveTasks.forEach(task => {
    let d = new Date();
    if (task.date) {
      const parts = task.date.split('-');
      if (parts.length === 3) {
        d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
    }

    const year = d.getFullYear();
    const monthIdx = d.getMonth();
    const monthKey = `${monthNames[monthIdx]} ${year}`;

    const dayName = dayNames[d.getDay()];
    const dateNum = d.getDate();
    const dateKey = `${dayName}, ${dateNum} ${monthNames[monthIdx]} ${year}`;

    if (!grouped[monthKey]) grouped[monthKey] = {};
    if (!grouped[monthKey][dateKey]) grouped[monthKey][dateKey] = [];

    grouped[monthKey][dateKey].push(task);
  });

  let html = '';

  for (const monthKey in grouped) {
    let monthCompletedCount = 0;
    let monthOverdueCount = 0;

    for (const dateKey in grouped[monthKey]) {
      grouped[monthKey][dateKey].forEach(t => {
        if (t.completed) monthCompletedCount++;
        else if (checkIsOverdue(t)) monthOverdueCount++;
      });
    }

    html += `
      <div class="archive-month-folder">
        <div class="archive-month-header">
          <div class="archive-month-info">
            <span class="archive-month-title">
              <svg class="archive-folder-icon" viewBox="0 0 24 24">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              ${monthKey}
            </span>
            <div class="archive-month-badges">
              ${monthCompletedCount > 0 ? `<span class="stat-pill completed">✓ ${monthCompletedCount} Selesai</span>` : ''}
              ${monthOverdueCount > 0 ? `<span class="stat-pill overdue">⚠️ ${monthOverdueCount} Terlewat</span>` : ''}
            </div>
          </div>
          <span class="archive-month-arrow">▼</span>
        </div>

        <div class="archive-month-content">
    `;

    for (const dateKey in grouped[monthKey]) {
      html += `
        <div class="archive-day-group">
          <span class="archive-day-label">${dateKey}</span>
      `;

      grouped[monthKey][dateKey].forEach(task => {
        const isOverdue = checkIsOverdue(task);
        const isDone = Boolean(task.completed);

        html += `
          <div class="archive-task-card">
            <div class="archive-task-info">
              <span class="archive-task-title ${isDone ? 'completed-title' : ''}">${task.title}</span>
              <div class="archive-task-meta">
                ${isDone ? '<span class="tag stat-pill completed">Selesai</span>' : ''}
                ${isOverdue ? '<span class="tag stat-pill overdue">Terlewat</span>' : ''}
                ${task.time ? `<span>🕒 ${task.time}</span>` : ''}
                <span class="tag tag-${task.category ? task.category.toLowerCase() : 'tugas'}">${task.category || 'Tugas'}</span>
              </div>
            </div>
            <button class="delete-archive-btn" data-id="${task.id}" title="Hapus dari Arsip">
              <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        `;
      });

      html += `</div>`;
    }

    html += `
        </div>
      </div>
    `;
  }

  container.innerHTML = html;

  // Event Klik Folder Bulan (Accordion Expand / Collapse)
  container.querySelectorAll('.archive-month-header').forEach(header => {
    header.addEventListener('click', () => {
      const folder = header.closest('.archive-month-folder');
      folder.classList.toggle('open');
    });
  });

  // Event Hapus dari Arsip
  container.querySelectorAll('.delete-archive-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const task = Storage.getTasks().find(t => String(t.id) === String(id));
      const title = task ? task.title : 'tugas ini';

      if (typeof window.showCustomModal === 'function') {
        window.showCustomModal({
          title: 'Hapus Arsip?',
          message: `Apakah kamu yakin ingin menghapus "${title}" dari arsip riwayat?`,
          showCancel: true,
          onConfirm: () => {
            Storage.deleteTask(id);
            if (typeof window.refreshAllViews === 'function') {
              window.refreshAllViews();
            }
          }
        });
      } else {
        Storage.deleteTask(id);
        if (typeof window.refreshAllViews === 'function') {
          window.refreshAllViews();
        }
      }
    });
  });
}