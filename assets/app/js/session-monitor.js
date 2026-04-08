/* global AppUtil */
/**
 * SessionMonitor - Tracks user activity, warns before session expiration,
 * and provides an in-page re-login modal.
 *
 * Configuration is read from data attributes on the body element:
 *   data-session-timeout     — session length in minutes
 *   data-last-access-time    — unix timestamp of last server access
 *   data-session-username    — current user's username
 *   data-session-user-email  — current user's email
 */
class SessionMonitor {
  constructor(container) {
    this.container = container;
    this.lastPingTime = Math.floor(Date.now() / 1000);
    this.pingUrl = '/ping?session_timeout=extend';
    this.logoutUrl = '/logout';
    this.loginUrl = '/login';
    this.warningTimeoutID = null;
    this.expirationTimeoutID = null;
    this.countdownIntervalID = null;
    this.lastAccessTime = null;

    const bodyData = container.dataset;
    const timeoutMin = parseInt(bodyData.sessionTimeout, 10);
    this.sessionLength = timeoutMin ? timeoutMin * 60 : 900;
    this.sessionTimeoutMinutes = timeoutMin || 15;
    this.sessionUserName = bodyData.sessionUsername || '';
    this.sessionUserEmail = bodyData.sessionUserEmail || '';

    if (this.lastAccessTime === null) {
      if (bodyData.lastAccessTime) {
        this.lastAccessTime = parseInt(bodyData.lastAccessTime, 10);
      } else {
        this.lastAccessTime = this.lastPingTime;
      }
      localStorage.setItem('lastAccessTime', this.lastAccessTime);
    }

    this.bindHandlers();
  }

  bindHandlers() {
    // Activity listeners — throttle mousemove to avoid excessive calls
    const extendCb = () => { this.extend(); };
    let lastMoveTime = 0;
    document.addEventListener('mouseup', extendCb);
    document.addEventListener('keyup', extendCb);
    document.addEventListener('mousemove', () => {
      const now = Date.now();
      if (now - lastMoveTime < 1000) return;
      lastMoveTime = now;
      this.extend();
    });

    // Cross-tab sync via localStorage
    window.addEventListener('storage', (event) => {
      if (event.key !== 'lastAccessTime') return;
      const newValue = parseInt(localStorage.getItem('lastAccessTime'), 10);
      this.clearTimers();
      if (newValue === undefined || newValue === null || isNaN(newValue)) {
        this.loadLoginModal();
        return;
      }

      // Another tab pinged — clear modals and reset timers
      this.clearWarningModal();
      this.clearExpirationModal();
      this.setWarningTimeout();
      this.setExpirationTimeout();
    });

    // Start the timers
    this.setWarningTimeout();
    this.setExpirationTimeout();
  }

  /**
   * Minimum seconds between pings — throttles activity-based pinging.
   * @return {number}
   */
  minPingInterval() {
    if (this.sessionLength > 600) return 120;
    if (this.sessionLength > 300) return 60;
    return 5;
  }

  /**
   * Seconds before expiry to show the warning countdown.
   * @return {number}
   */
  timeBeforeWarning() {
    if (this.sessionTimeoutMinutes >= 10) return 180;
    if (this.sessionTimeoutMinutes >= 5) return 60;
    return 15;
  }

  clearTimers() {
    window.clearTimeout(this.warningTimeoutID);
    window.clearTimeout(this.expirationTimeoutID);
    if (this.countdownIntervalID) {
      window.clearInterval(this.countdownIntervalID);
      this.countdownIntervalID = null;
    }
  }

  /**
   * Warning fires (sessionLength - timeBeforeWarning) seconds from now.
   */
  setWarningTimeout() {
    const timeout = (this.sessionLength - this.timeBeforeWarning()) * 1000;
    this.warningTimeoutID = window.setTimeout(() => {
      this.onWarning();
    }, timeout);
  }

  /**
   * Expiration fires sessionLength seconds from now.
   */
  setExpirationTimeout() {
    const timeout = this.sessionLength * 1000;
    this.expirationTimeoutID = window.setTimeout(() => {
      this.onTimeout();
    }, timeout);
  }

  logout() {
    localStorage.setItem('lastAccessTime', null);
    window.location.href = this.logoutUrl;
  }

  onWarning() {
    this.loadWarningModal();
  }

  onTimeout() {
    this.loadLoginModal();
  }

  /**
   * Called on user activity. Pings server if enough time has passed.
   * Skipped when the login modal is showing — the session is expired and
   * pinging would race with the modal's own login request.
   */
  extend() {
    if (document.getElementById('session-expired-modal')) return;
    const now = Math.floor(Date.now() / 1000);
    if ((now - this.lastPingTime) > this.minPingInterval()) {
      this.reset(now);
    }
  }

  /**
   * Ping the server and reset all timers on success.
   */
  reset(now) {
    this.lastPingTime = now;

    this.ping((timestamp) => {
      this.clearTimers();
      localStorage.setItem('lastAccessTime', timestamp);
      this.lastAccessTime = timestamp;
      if (timestamp !== false && timestamp !== null && timestamp !== undefined) {
        this.setWarningTimeout();
        this.setExpirationTimeout();
      } else {
        this.loadLoginModal();
      }
    });
  }

  /**
   * POST to the ping endpoint. Returns timestamp on success, false on 403, null on error.
   */
  ping(callback) {
    fetch(this.pingUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': AppUtil.csrfToken()
      }
    })
    .then((response) => {
      if (response.status === 403) return { _result: false };
      if (!response.ok) return { _result: null };
      return response.json();
    })
    .then((data) => {
      if (!data) { callback(null); return; }
      if (data._result === false) { callback(false); return; }
      if (data._result === null) { callback(null); return; }
      if (data.timestamp !== undefined) { callback(data.timestamp); return; }
      callback(null);
    })
    .catch(() => {
      callback(null);
    });
  }

  clearWarningModal() {
    const el = document.getElementById('session-warning-modal');
    if (!el) return;
    if (this.countdownIntervalID) {
      window.clearInterval(this.countdownIntervalID);
      this.countdownIntervalID = null;
    }
    const instance = bootstrap.Modal.getInstance(el);
    if (instance) instance.dispose();
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
    el.remove();
  }

  clearExpirationModal() {
    const el = document.getElementById('session-expired-modal');
    if (!el) return;
    const instance = bootstrap.Modal.getInstance(el);
    if (instance) instance.dispose();
    const wrapper = document.querySelector('.main-wrapper');
    if (wrapper) wrapper.classList.remove('blur');
    // Remove the backdrop manually since dispose() doesn't always clean it up
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
    el.remove();
  }

  loadLoginModal() {
    if (document.getElementById('session-expired-modal')) return;
    this.clearWarningModal();

    const body = '<div id="expired-alert-message" class="alert alert-danger">Your session has expired due to inactivity.</div>' +
      '<div class="mb-3">' +
        '<label class="form-label" for="expired-username">Username or Email</label>' +
        '<div class="input-group">' +
          '<span class="input-group-text"><i class="fa fa-at"></i></span>' +
          '<input type="text" name="username" autocomplete="off" id="expired-username" class="form-control">' +
        '</div>' +
      '</div>' +
      '<div class="mb-3">' +
        '<label class="form-label" for="expired-password">Password</label>' +
        '<div class="input-group">' +
          '<span class="input-group-text"><i class="fa fa-key"></i></span>' +
          '<input type="password" name="password" autocomplete="off" id="expired-password" class="form-control">' +
        '</div>' +
      '</div>';

    const footer = '<button id="session-expired-modal-logout-btn" type="button" class="btn btn-danger">Logout <i class="fa-solid fa-sign-out-alt"></i></button>' +
      '<button id="session-expired-modal-login-btn" type="button" class="btn btn-success"><i class="fa-solid fa-sign-in-alt"></i> Login</button>';

    const html = AppUtil.buildModal({
      id: 'session-expired-modal',
      title: 'Login to Continue',
      body: body,
      footer: footer,
      staticBackdrop: true
    });
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    const modalEl = wrapper.firstChild;
    document.body.appendChild(modalEl);

    new bootstrap.Modal(modalEl, {backdrop: 'static', keyboard: false}).show();

    modalEl.addEventListener('shown.bs.modal', () => {
      const mainWrapper = document.querySelector('.main-wrapper');
      if (mainWrapper) mainWrapper.classList.add('blur');
    });

    document.getElementById('session-expired-modal-logout-btn').addEventListener('click', (e) => {
      e.preventDefault();
      this.logout();
    });
    document.getElementById('session-expired-modal-login-btn').addEventListener('click', (e) => {
      e.preventDefault();
      this.login();
    });
    modalEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.target.closest('input')) {
        e.preventDefault();
        this.login();
      }
    });
  }

  /**
   * AJAX login from the expired modal.
   */
  login() {
    const alertEl = document.getElementById('expired-alert-message');
    const usernameInput = document.getElementById('expired-username');
    const passwordInput = document.getElementById('expired-password');

    const successfulLogin = () => {
      const now = Math.floor(Date.now() / 1000);
      this.lastPingTime = now;
      this.lastAccessTime = now;
      this.clearTimers();
      this.clearExpirationModal();
      localStorage.setItem('lastAccessTime', now);
      this.setWarningTimeout();
      this.setExpirationTimeout();
    };

    const unsuccessfulLogin = (message) => {
      if (alertEl) alertEl.textContent = message;
      if (usernameInput) usernameInput.value = '';
      if (passwordInput) passwordInput.value = '';
    };

    const userName = (usernameInput ? usernameInput.value : '').trim();
    if (userName !== this.sessionUserName && userName !== this.sessionUserEmail) {
      unsuccessfulLogin('Username or Email does not match the last logged in user for this page. Only the original user can log back in to this page.');
      return;
    }

    fetch(this.loginUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': AppUtil.csrfToken()
      },
      body: 'email=' + encodeURIComponent(userName) + '&password=' + encodeURIComponent(passwordInput.value)
    })
    .then((response) => {
      if (!response.ok) throw new Error('Request failed');
      return response.json();
    })
    .then((data) => {
      if (data.response.success === true) {
        successfulLogin();
      } else {
        unsuccessfulLogin(data.response.message);
      }
    })
    .catch(() => {
      if (alertEl) alertEl.textContent = 'An error occurred, please try again!';
    });
  }

  /**
   * Format remaining seconds as "MM min SS sec".
   * @param {number} totalSeconds
   * @return {string}
   */
  formatCountdown(totalSeconds) {
    if (totalSeconds < 0) totalSeconds = 0;
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return String(min).padStart(2, '0') + ' min ' + String(sec).padStart(2, '0') + ' sec';
  }

  /**
   * Show the warning modal with a live countdown.
   */
  loadWarningModal() {
    if (document.getElementById('session-warning-modal')) return;
    if (document.getElementById('session-expired-modal')) return;

    let remaining = this.timeBeforeWarning();

    const body = 'Your session will expire in <span id="session-remaining-time">' +
      this.formatCountdown(remaining) + '</span> due to inactivity.';

    const footer = '<button id="session-warning-modal-logout-btn" type="button" class="btn btn-danger">Logout <i class="fa-solid fa-sign-out-alt"></i></button>' +
      '<button id="session-warning-modal-continue-btn" type="button" class="btn btn-success">Stay Logged In</button>';

    const html = AppUtil.buildModal({
      id: 'session-warning-modal',
      title: 'Your session is about to expire',
      body: body,
      footer: footer,
      staticBackdrop: true
    });
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    const modalEl = wrapper.firstChild;
    document.body.appendChild(modalEl);

    new bootstrap.Modal(modalEl, {backdrop: 'static', keyboard: false}).show();

    const countdownEl = document.getElementById('session-remaining-time');
    this.countdownIntervalID = window.setInterval(() => {
      remaining--;
      if (countdownEl) countdownEl.textContent = this.formatCountdown(remaining);
      if (remaining <= 0) {
        window.clearInterval(this.countdownIntervalID);
        this.countdownIntervalID = null;
      }
    }, 1000);

    document.getElementById('session-warning-modal-logout-btn').addEventListener('click', (e) => {
      e.preventDefault();
      this.logout();
    });
    document.getElementById('session-warning-modal-continue-btn').addEventListener('click', (e) => {
      e.preventDefault();
      this.clearWarningModal();
      this.reset(Math.floor(Date.now() / 1000));
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  if (body.classList.contains('session-monitor')) {
    new SessionMonitor(body);
  } else if (body.dataset.lastAccessTime) {
    localStorage.setItem('lastAccessTime', parseInt(body.dataset.lastAccessTime, 10));
  }
});
