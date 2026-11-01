document.addEventListener('DOMContentLoaded', () => {
  const listView = document.getElementById('template-list-view');
  const formView = document.getElementById('template-form-view');
  const showAddBtn = document.getElementById('show-add-template-btn');
  const cancelBtn = document.getElementById('cancel-template-btn');

  const recurrenceType = document.getElementById('recurrence-type');
  const daysGroup = document.getElementById('days-selector-group');
  const dateGroup = document.getElementById('date-selector-group');
  const durationGroup = document.getElementById('duration-group');
  const templateForm = document.getElementById('template-form');

  if (!templateForm) return;

  // RENDER AWAL
  if (typeof Storage !== 'undefined' && typeof Storage.getTemplates === 'function') {
    renderSavedTemplates();
  }

  // SAKELAR BUKA FORM TEMPLATE BARU
  if (showAddBtn) {
    showAddBtn.addEventListener('click', () => {
      if (listView) listView.style.display = 'none';
      if (formView) formView.style.display = 'block';
    });
  }

  // SAKELAR KEMBALI KE DAFTAR TEMPLATE
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (formView) formView.style.display = 'none';
      if (listView) listView.style.display = 'block';
      templateForm.reset();
    });
  }

  // PERULANGAN JADWAL
  if (recurrenceType) {
    recurrenceType.addEventListener('change', () => {
      const val = recurrenceType.value;
      if (val === 'harian') {
        if (daysGroup) daysGroup.style.display = 'block';
        if (dateGroup) dateGroup.style.display = 'none';
        if (durationGroup) durationGroup.style.display = 'block';
      } else if (val === 'mingguan') {
        if (daysGroup) daysGroup.style.display = 'block';
        if (dateGroup) dateGroup.style.display = 'none';
        if (durationGroup) durationGroup.style.display = 'none';
      } else if (val === 'bulanan') {
        if (daysGroup) daysGroup.style.display = 'none';
        if (dateGroup) dateGroup.style.display = 'block';
        if (durationGroup) durationGroup.style.display = 'none';
      }
    });
  }

  // SIMPAN TEMPLATE
  templateForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const selectedDays = Array.from(document.querySelectorAll('.day-pill input:checked')).map(cb => parseInt(cb.value));
    const type = recurrenceType ? recurrenceType.value : 'harian';

    if ((type === 'harian' || type === 'mingguan') && selectedDays.length === 0) {
      if (typeof window.showCustomModal === 'function') {
        window.showCustomModal({
          title: 'Pilih Hari',
          message: 'Mohon pilih minimal satu hari rutin!',
          showCancel: false
        });
      }
      return;
    }

    const titleInput = document.getElementById('template-title');
    const categoryInput = document.getElementById('template-category');
    const priorityInput = document.getElementById('template-priority');
    const timeInput = document.getElementById('template-time');
    const monthlyDateInput = document.getElementById('monthly-date');
    const durationInput = document.getElementById('repeat-duration');

    const newTemplate = {
      id: Date.now().toString(),
      title: titleInput ? titleInput.value.trim() : 'Rutinitas Baru',
      category: categoryInput ? categoryInput.value : 'Tugas',
      priority: priorityInput ? priorityInput.value : 'Santai',
      time: timeInput ? timeInput.value : '',
      type: type,
      days: selectedDays,
      monthlyDate: monthlyDateInput ? (parseInt(monthlyDateInput.value) || 1) : 1,
      duration: durationInput ? (parseInt(durationInput.value) || 7) : 7
    };

    if (typeof Storage !== 'undefined' && typeof Storage.saveTemplate === 'function') {
      Storage.saveTemplate(newTemplate);
      renderSavedTemplates();
    }

    templateForm.reset();

    // POP UP
    if (formView) formView.style.display = 'none';
    if (listView) listView.style.display = 'block';

    if (typeof window.showCustomModal === 'function') {
      window.showCustomModal({
        title: 'Template Disimpan!',
        message: 'Template baru berhasil disimpan. Kamu bisa langsung mengkliknya di daftar template.',
        showCancel: false
      });
    }
  });
});

// RENDET TEMPLATE TERSIMPAN
function renderSavedTemplates() {
  const container = document.getElementById('saved-templates-list');
  if (!container) return;

  if (typeof Storage === 'undefined' || typeof Storage.getTemplates !== 'function') {
    container.innerHTML = `<p style="font-size: 0.85rem; color: #94a3b8; padding: 4px 0;">Modul storage belum siap.</p>`;
    return;
  }

  const templates = Storage.getTemplates();

  if (!templates || templates.length === 0) {
    container.innerHTML = `<p style="font-size: 0.85rem; color: #94a3b8; padding: 4px 0;">Belum ada template tersimpan.</p>`;
    return;
  }

  container.innerHTML = templates.map(tpl => `
    <div class="template-card" data-id="${tpl.id}">
      <div class="template-info">
        <span class="template-title">${tpl.title}</span>
        <div class="template-meta">
          <span class="tpl-badge tpl-badge-type">${tpl.type}</span>
          <span class="tpl-badge">${tpl.category}</span>
          ${tpl.time ? `<span class="tpl-time">🕒 ${tpl.time} WIB</span>` : ''}
        </div>
      </div>
      <button class="delete-tpl-btn" data-id="${tpl.id}" title="Hapus Template">
        <svg class="delete-tpl-icon" viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  `).join('');

  // GUNAKAN TEMPLATE
  container.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.delete-tpl-btn')) return;

      const id = card.getAttribute('data-id');
      const tpl = Storage.getTemplates().find(t => t.id === id);

      if (tpl) {
        if (typeof window.showCustomModal === 'function') {
          window.showCustomModal({
            title: 'Gunakan Template?',
            message: `Ingin menambahkan tugas "${tpl.title}" secara otomatis ke dalam jadwal?`,
            showCancel: true,
            onConfirm: () => {
              applyTemplateTasks(tpl);
            }
          });
        }
      }
    });
  });

  // HAPUS TEMPLATE
  container.querySelectorAll('.delete-tpl-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const tpl = Storage.getTemplates().find(t => t.id === id);
      const tplTitle = tpl ? tpl.title : 'template ini';

      if (typeof window.showCustomModal === 'function') {
        window.showCustomModal({
          title: 'Hapus Template?',
          message: `Apakah kamu yakin ingin menghapus template "${tplTitle}"?`,
          showCancel: true,
          onConfirm: () => {
            Storage.deleteTemplate(id);
            renderSavedTemplates();
          }
        });
      } else {
        Storage.deleteTemplate(id);
        renderSavedTemplates();
      }
    });
  });
}

// GENERATE TUGAS TEMPLATE
function applyTemplateTasks(tpl) {
  const targetDates = [];
  const today = new Date();

  if (tpl.type === 'harian') {
    for (let i = 0; i < tpl.duration; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      if (tpl.days.includes(d.getDay())) {
        targetDates.push(formatLocalDate(d));
      }
    }
  } else if (tpl.type === 'mingguan') {
    for (let i = 0; i < 28; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      if (tpl.days.includes(d.getDay())) {
        targetDates.push(formatLocalDate(d));
      }
    }
  } else if (tpl.type === 'bulanan') {
    let year = today.getFullYear();
    let month = today.getMonth();

    for (let i = 0; i < 12; i++) {
      const lastDayOfM = new Date(year, month + 1, 0).getDate();
      const validDay = Math.min(tpl.monthlyDate, lastDayOfM);
      const d = new Date(year, month, validDay);
      targetDates.push(formatLocalDate(d));

      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }
  }

  targetDates.forEach(dateStr => {
    const taskData = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: tpl.title,
      date: dateStr,
      category: tpl.category,
      tag: tpl.priority,
      time: tpl.time ? `${tpl.time} WIB` : '',
      completed: false,
      archived: false
    };
    Storage.saveTask(taskData);
  });

  if (typeof window.refreshAllViews === 'function') {
    window.refreshAllViews();
  }

  if (typeof window.showCustomModal === 'function') {
    window.showCustomModal({
      title: 'Berhasil!',
      message: `${targetDates.length} tugas "${tpl.title}" berhasil ditambahkan ke jadwal kamu!`,
      showCancel: false,
      onConfirm: () => {
        window.switchView('view-kalender');
      }
    });
  }
}

function formatLocalDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}