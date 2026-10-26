let currentIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.nav-item');
  const bottomNav = document.querySelector('.bottom-nav');
  const badge = document.getElementById('header-badge');
  const views = document.querySelectorAll('.page-view');

  window.switchView = function(targetId, isEdit = false) {
    const targetView = document.getElementById(targetId);
    let targetIndex = 0;

    navItems.forEach((item, index) => {
      if (item.getAttribute('data-target') === targetId) {
        targetIndex = index;
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (targetIndex === currentIndex && !isEdit) return;

    const currentView = views[currentIndex];
    const isForward = targetIndex > currentIndex;

    // Bersihkan class sebelumnya
    views.forEach(v => {
      v.className = 'page-view';
    });

    // Jalankan animasi di frame render berikutnya biar gak ada jeda putih
    requestAnimationFrame(() => {
      currentView.className = `page-view ${isForward ? 'slide-left-out' : 'slide-right-out'}`;
      targetView.className = `page-view active ${isForward ? 'slide-right-in' : 'slide-left-in'}`;
    });

    bottomNav.setAttribute('data-active', targetIndex);

    const badgeMap = {
      'view-hariini': 'HARI INI',
      'view-kalender': 'JADWAL',
      'view-tambah': isEdit ? 'EDIT' : 'FORM',
      'view-template': 'TEMPLATE',
      'view-arsip': 'ARSIP'
    };
    badge.textContent = badgeMap[targetId] || 'SHIGOTO';

    setTimeout(() => {
      views.forEach((v, idx) => {
        if (idx === targetIndex) {
          v.className = 'page-view active';
        } else {
          v.className = 'page-view';
        }
      });
    }, 280);

    currentIndex = targetIndex;
  };

  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      if (target === 'view-tambah') {
        window.resetFormTambah();
      }
      window.switchView(target);
    });
  });
});