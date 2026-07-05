// ==========================================================================
// ExpenseAI — User Session Loader
// Reads user data from localStorage and populates all UI elements
// ==========================================================================

(function () {
  // ── helpers ────────────────────────────────────────────────────────────
  function getUser() {
    try {
      return JSON.parse(localStorage.getItem('expenseai_user') || 'null');
    } catch (e) { return null; }
  }

  function getInitials(name) {
    if (!name) return '?';
    var parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function setVal(id, val) {
    var el = document.getElementById(id);
    if (el && val) el.value = val;
  }

  // ── populate UI ────────────────────────────────────────────────────────
  function applyUser(user) {
    if (!user) return;

    var initials = getInitials(user.name);
    var displayName = user.name || 'User';
    var displayEmail = user.email || user.mobile || '';
    var mobile = (user.mobile || '').replace(/^\+91/, '').trim();

    // Sidebar
    setText('sidebar-avatar', initials);
    setText('sidebar-name', displayName);
    setText('sidebar-email', displayEmail);

    // Settings — profile fields (values)
    setVal('set-name', displayName);
    setVal('set-mobile', mobile);
    setVal('set-email', user.email || '');

    // Settings — avatar initials
    setText('settings-avatar-display', initials);

    // Settings — 2FA mobile display
    if (mobile) {
      var formatted = mobile.replace(/(\d{5})(\d{5})/, '$1\u00a0$2');
      setText('set-2fa-mobile', formatted);
    }

    // Greeting on overview topbar
    var greetEl = document.querySelector('.topbar-title[data-greeting]');
    if (greetEl) {
      var firstName = (displayName || '').split(' ')[0];
      greetEl.textContent = 'Namaste, ' + firstName + '. Here\'s your ledger.';
    }
  }

  // ── Save profile changes from settings form ────────────────────────────
  window.saveUserProfile = function () {
    var user = getUser() || {};
    var nameEl   = document.getElementById('set-name');
    var mobileEl = document.getElementById('set-mobile');
    var emailEl  = document.getElementById('set-email');
    var panEl    = document.getElementById('set-pan');

    if (nameEl && nameEl.value.trim())   user.name   = nameEl.value.trim();
    if (emailEl && emailEl.value.trim()) user.email  = emailEl.value.trim();
    if (mobileEl && mobileEl.value.trim()) user.mobile = mobileEl.value.trim();
    if (panEl && panEl.value.trim())     user.pan    = panEl.value.trim();

    localStorage.setItem('expenseai_user', JSON.stringify(user));

    // Also update the stored users list so next sign-in works with new data
    var storedUsers = JSON.parse(localStorage.getItem('expenseai_users') || '[]');
    var idx = storedUsers.findIndex(function (u) {
      return u.email === user.email || u.mobile === user.mobile;
    });
    if (idx >= 0) {
      storedUsers[idx].name   = user.name;
      storedUsers[idx].email  = user.email;
      storedUsers[idx].mobile = user.mobile;
      localStorage.setItem('expenseai_users', JSON.stringify(storedUsers));
    }

    // Re-apply to all UI elements immediately
    applyUser(user);
  };

  // ── Logout ─────────────────────────────────────────────────────────────
  window.logoutUser = function () {
    localStorage.removeItem('expenseai_user');
    window.location.href = 'login.html';
  };

  // ── Patch saveSettings to also save profile ───────────────────────────
  // We wait for the DOM + other scripts to load, then wrap saveSettings
  window.addEventListener('load', function () {
    var _origSave = window.saveSettings;
    window.saveSettings = function () {
      saveUserProfile();          // save profile fields first
      if (_origSave) _origSave(); // then run currency/toast logic
    };
  });

  // ── Live update avatar & name as user types in settings ───────────────
  document.addEventListener('input', function (e) {
    if (e.target.id === 'set-name') {
      var val = e.target.value.trim();
      setText('settings-avatar-display', getInitials(val));
      // Also update sidebar live
      setText('sidebar-name', val || 'User');
      setText('sidebar-avatar', getInitials(val));
    }
    if (e.target.id === 'set-email') {
      setText('sidebar-email', e.target.value.trim());
    }
    if (e.target.id === 'set-mobile') {
      var m = e.target.value.trim().replace(/^\+91/, '');
      var formatted = m.replace(/(\d{5})(\d{5})/, '$1\u00a0$2');
      setText('set-2fa-mobile', formatted);
    }
  });

  // ── Run on DOM ready ───────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { applyUser(getUser()); });
  } else {
    applyUser(getUser());
  }
})();
