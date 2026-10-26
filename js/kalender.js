function getLocalDateString(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

let currentCalDate = new Date();
let selectedDateStr = getLocalDateString();

function renderCalendar() {
  const year = currentCalDate.getFullYear();
  const month = currentCalDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const monthYearEl = document.getElementById('calendar-month-year');
  if (monthYearEl) {
    monthYearEl.textContent = `${monthNames[month]} ${year}`;
  }

  const grid = document.getElementById('calendar-days-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const tasks = Storage.getTasks();
  const taskDates = new Set(tasks.map(t => t.date));

  // Tanggal bulan sebelumnya
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const cell = document.createElement('div');
    cell.className = 'day-cell other-month';
    cell.textContent = dayNum;
    grid.appendChild(cell);
  }

  // Tanggal bulan ini
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = (month + 1) < 10 ? `0${month + 1}` : month + 1;
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const cell = document.createElement('div');
    cell.className = 'day-cell';
    cell.textContent = day;

    if (dateStr === selectedDateStr) {
      cell.classList.add('active-selected');
    }

    if (taskDates.has(dateStr)) {
      const dot = document.createElement('div');
      dot.className = 'task-dot';
      cell.appendChild(dot);
    }

    cell.addEventListener('click', () => {
      selectedDateStr = dateStr;
      renderCalendar();
      renderCalendarTasks();
    });

    grid.appendChild(cell);
  }
}

function renderCalendarTasks() {
  const container = document.getElementById('calendar-tasks-list');
  const titleEl = document.getElementById('selected-date-title');
  if (!container) return;

  const [y, m, d] = selectedDateStr.split('-');
  if (titleEl) titleEl.textContent = `Tugas (${d}/${m}/${y})`;

  const tasks = Storage.getTasks().filter(t => t.date === selectedDateStr && !t.archived);

  if (tasks.length === 0) {
    container.innerHTML = `<p style="font-size: 0.85rem; color: #94a3b8; padding: 8px 0;">Tidak ada tugas pada tanggal ini.</p>`;
    return;
  }

  container.innerHTML = tasks.map(createTaskHTML).join('');
  attachCheckboxEvents();
}

document.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
  renderCalendarTasks();

  document.getElementById('prev-month-btn')?.addEventListener('click', () => {
    currentCalDate.setMonth(currentCalDate.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById('next-month-btn')?.addEventListener('click', () => {
    currentCalDate.setMonth(currentCalDate.getMonth() + 1);
    renderCalendar();
  });
});