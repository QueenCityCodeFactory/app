/**
 * SessionMonitor - Tracks user activity, warns before session expiration,
 * and provides an in-page re-login modal.
 *
 * Modernized vanilla-JS port of the pups-2.0-core session monitor.
 * No jQuery, moment, jsrender, or jquery-countdown dependencies.
 *
 * Configuration is read from data attributes on the body element:
 *   data-session-timeout     — session length in minutes
 *   data-last-access-time    — unix timestamp of last server access
 *   data-session-username    — current user's username
 *   data-session-user-email  — current user's email
 *
 * @param {HTMLElement} container The body element
 */
var SessionMonitor = function (container) {
  this.container = container;
  this.lastPingTime = Math.floor(Date.now() / 1000);

  var bodyData = container.dataset;
  var timeoutMin = parseInt(bodyData.sessionTimeout, 10);
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

  this.startup();
};

SessionMonitor.prototype = {

  container: null,
  sessionLength: null,
  sessionTimeoutMinutes: null,
  sessionUserName: '',
  sessionUserEmail: '',
  lastAccessTime: null,
  lastPingTime: null,
  pingUrl: '/ping?session_timeout=extend',
  logoutUrl: '/logout',
  loginUrl: '/login',
  warningTimeoutID: null,
  expirationTimeoutID: null,
  countdownIntervalID: null,

  /**
   * Read the CSRF token from the cookie.
   * @return {string}
   */
  csrfToken: function () {
    var match = document.cookie.match('(^|;)\\s*csrfToken\\s*=\\s*([^;]+)');
    return match ? match.pop() : '';
  },

  startup: function () {
    this.bindHandlers();
  },

  bindHandlers: function () {
    var self = this;

    // Activity listeners — delegated on document
    var extendCb = function () { self.extend(); };
    document.addEventListener('mouseup', extendCb);
    document.addEventListener('keyup', extendCb);
    document.addEventListener('mousemove', extendCb);

    // Cross-tab sync via localStorage
    window.addEventListener('storage', function (event) {
      if (event.key !== 'lastAccessTime') return;
      var newValue = parseInt(localStorage.getItem('lastAccessTime'), 10);
      self.clearTimers();
      if (newValue === undefined || newValue === null || isNaN(newValue)) {
        self.loadLoginModal();
        return;
      }

      // Another tab pinged — clear modals and reset timers
      self.clearWarningModal();
      self.clearExpirationModal();
      self.setWarningTimeout();
      self.setExpirationTimeout();
    });

    // Start the timers
    self.setWarningTimeout();
    self.setExpirationTimeout();
  },

  /**
   * Minimum seconds between pings — throttles activity-based pinging.
   * @return {number}
   */
  minPingInterval: function () {
    if (this.sessionLength > 600) return 120;
    if (this.sessionLength > 300) return 60;
    return 5;
  },

  /**
   * Seconds before expiry to show the warning countdown.
   * @return {number}
   */
  timeBeforeWarning: function () {
    if (this.sessionTimeoutMinutes >= 10) return 180;
    if (this.sessionTimeoutMinutes >= 5) return 60;
    return 15;
  },

  clearTimers: function () {
    window.clearTimeout(this.warningTimeoutID);
    window.clearTimeout(this.expirationTimeoutID);
    if (this.countdownIntervalID) {
      window.clearInterval(this.countdownIntervalID);
      this.countdownIntervalID = null;
    }
  },

  /**
   * Warning fires (sessionLength - timeBeforeWarning) seconds from now.
   */
  setWarningTimeout: function () {
    var self = this;
    var timeout = (self.sessionLength - self.timeBeforeWarning()) * 1000;
    self.warningTimeoutID = window.setTimeout(function () {
      self.onWarning();
    }, timeout);
  },

  /**
   * Expiration fires sessionLength seconds from now.
   */
  setExpirationTimeout: function () {
    var self = this;
    var timeout = self.sessionLength * 1000;
    self.expirationTimeoutID = window.setTimeout(function () {
      self.onTimeout();
    }, timeout);
  },

  logout: function () {
    localStorage.setItem('lastAccessTime', null);
    window.location.href = this.logoutUrl;
  },

  onWarning: function () {
    this.loadWarningModal();
  },

  onTimeout: function () {
    this.loadLoginModal();
  },

  /**
   * Called on user activity. Pings server if enough time has passed.
   * Skipped when the login modal is showing — the session is expired and
   * pinging would race with the modal's own login request.
   */
  extend: function () {
    if (document.getElementById('session-expired-modal')) return;
    var now = Math.floor(Date.now() / 1000);
    if ((now - this.lastPingTime) > this.minPingInterval()) {
      this.reset(now);
    }
  },

  /**
   * Ping the server and reset all timers on success.
   */
  reset: function (now) {
    var self = this;
    self.lastPingTime = now;

    self.ping(function (timestamp) {
      self.clearTimers();
      localStorage.setItem('lastAccessTime', timestamp);
      self.lastAccessTime = timestamp;
      if (timestamp !== false && timestamp !== null && timestamp !== undefined) {
        self.setWarningTimeout();
        self.setExpirationTimeout();
      } else {
        self.loadLoginModal();
      }
    });
  },

  /**
   * POST to the ping endpoint. Returns timestamp on success, false on 403, null on error.
   */
  ping: function (callback) {
    fetch(this.pingUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': this.csrfToken()
      }
    })
    .then(function (response) {
      if (response.status === 403) return { _result: false };
      if (!response.ok) return { _result: null };
      return response.json();
    })
    .then(function (data) {
      if (!data) { callback(null); return; }
      if (data._result === false) { callback(false); return; }
      if (data._result === null) { callback(null); return; }
      if (data.timestamp !== undefined) { callback(data.timestamp); return; }
      callback(null);
    })
    .catch(function () {
      callback(null);
    });
  },

  /**
   * Build a Bootstrap 5 modal HTML string.
   * @param {object} opts
   * @return {string}
   */
  buildModal: function (opts) {
    var backdrop = opts.staticBackdrop ? ' data-bs-backdrop="static" data-bs-keyboard="false"' : '';
    var idAttr = opts.id ? ' id="' + opts.id + '"' : '';
    return '<div' + idAttr + ' class="modal fade"' + backdrop + '>' +
      '<div class="modal-dialog">' +
        '<div class="modal-content">' +
          '<div class="modal-header">' +
            '<h4 class="modal-title">' + opts.title + '</h4>' +
          '</div>' +
          '<div class="modal-body">' + opts.body + '</div>' +
          '<div class="modal-footer">' + opts.footer + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  },

  clearWarningModal: function () {
    var el = document.getElementById('session-warning-modal');
    if (!el) return;
    if (this.countdownIntervalID) {
      window.clearInterval(this.countdownIntervalID);
      this.countdownIntervalID = null;
    }
    var instance = bootstrap.Modal.getInstance(el);
    if (instance) instance.dispose();
    var backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
    el.remove();
  },

  clearExpirationModal: function () {
    var el = document.getElementById('session-expired-modal');
    if (!el) return;
    var instance = bootstrap.Modal.getInstance(el);
    if (instance) instance.dispose();
    var wrapper = document.querySelector('.main-wrapper');
    if (wrapper) wrapper.classList.remove('blur');
    // Remove the backdrop manually since dispose() doesn't always clean it up
    var backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
    el.remove();
  },

  loadLoginModal: function () {
    var self = this;
    if (document.getElementById('session-expired-modal')) return;
    self.clearWarningModal();

    var body = '<div id="expired-alert-message" class="alert alert-danger">Your session has expired due to inactivity.</div>' +
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

    var footer = '<button id="session-expired-modal-logout-btn" type="button" class="btn btn-danger">Logout <i class="fa-solid fa-sign-out-alt"></i></button>' +
      '<button id="session-expired-modal-login-btn" type="button" class="btn btn-success"><i class="fa-solid fa-sign-in-alt"></i> Login</button>';

    var html = self.buildModal({
      id: 'session-expired-modal',
      title: 'Login to Continue',
      body: body,
      footer: footer,
      staticBackdrop: true
    });
    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    var modalEl = wrapper.firstChild;
    document.body.appendChild(modalEl);

    new bootstrap.Modal(modalEl, {backdrop: 'static', keyboard: false}).show();

    modalEl.addEventListener('shown.bs.modal', function () {
      var wrapper = document.querySelector('.main-wrapper');
      if (wrapper) wrapper.classList.add('blur');
    });

    document.getElementById('session-expired-modal-logout-btn').addEventListener('click', function (e) {
      e.preventDefault();
      self.logout();
    });
    document.getElementById('session-expired-modal-login-btn').addEventListener('click', function (e) {
      e.preventDefault();
      self.login();
    });
    modalEl.addEventListener('keypress', function (e) {
      if (e.key === 'Enter' && e.target.closest('input')) {
        e.preventDefault();
        self.login();
      }
    });
  },

  /**
   * AJAX login from the expired modal.
   */
  login: function () {
    var self = this;
    var alertEl = document.getElementById('expired-alert-message');
    var usernameInput = document.getElementById('expired-username');
    var passwordInput = document.getElementById('expired-password');

    var successfulLogin = function () {
      var now = Math.floor(Date.now() / 1000);
      self.lastPingTime = now;
      self.lastAccessTime = now;
      self.clearTimers();
      self.clearExpirationModal();
      localStorage.setItem('lastAccessTime', now);
      self.setWarningTimeout();
      self.setExpirationTimeout();
    };

    var unsuccessfulLogin = function (message) {
      if (alertEl) alertEl.textContent = message;
      if (usernameInput) usernameInput.value = '';
      if (passwordInput) passwordInput.value = '';
    };

    var userName = (usernameInput ? usernameInput.value : '').trim();
    if (userName !== self.sessionUserName && userName !== self.sessionUserEmail) {
      unsuccessfulLogin('Username or Email does not match the last logged in user for this page. Only the original user can log back in to this page.');
      return;
    }

    fetch(self.loginUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': self.csrfToken()
      },
      body: 'email=' + encodeURIComponent(userName) + '&password=' + encodeURIComponent(passwordInput.value)
    })
    .then(function (response) {
      if (!response.ok) throw new Error('Request failed');
      return response.json();
    })
    .then(function (data) {
      if (data.response.success === true) {
        successfulLogin();
      } else {
        unsuccessfulLogin(data.response.message);
      }
    })
    .catch(function () {
      if (alertEl) alertEl.textContent = 'An error occurred, please try again!';
    });
  },

  /**
   * Format remaining seconds as "MM min SS sec".
   * @param {number} totalSeconds
   * @return {string}
   */
  formatCountdown: function (totalSeconds) {
    if (totalSeconds < 0) totalSeconds = 0;
    var min = Math.floor(totalSeconds / 60);
    var sec = totalSeconds % 60;
    return String(min).padStart(2, '0') + ' min ' + String(sec).padStart(2, '0') + ' sec';
  },

  /**
   * Show the warning modal with a live countdown.
   */
  loadWarningModal: function () {
    var self = this;
    if (document.getElementById('session-warning-modal')) return;
    if (document.getElementById('session-expired-modal')) return;

    var remaining = self.timeBeforeWarning();

    var body = 'Your session will expire in <span id="session-remaining-time">' +
      self.formatCountdown(remaining) + '</span> due to inactivity.';

    var footer = '<button id="session-warning-modal-logout-btn" type="button" class="btn btn-danger">Logout <i class="fa-solid fa-sign-out-alt"></i></button>' +
      '<button id="session-warning-modal-continue-btn" type="button" class="btn btn-success">Stay Logged In</button>';

    var html = self.buildModal({
      id: 'session-warning-modal',
      title: 'Your session is about to expire',
      body: body,
      footer: footer,
      staticBackdrop: true
    });
    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    var modalEl = wrapper.firstChild;
    document.body.appendChild(modalEl);

    new bootstrap.Modal(modalEl, {backdrop: 'static', keyboard: false}).show();

    var countdownEl = document.getElementById('session-remaining-time');
    self.countdownIntervalID = window.setInterval(function () {
      remaining--;
      if (countdownEl) countdownEl.textContent = self.formatCountdown(remaining);
      if (remaining <= 0) {
        window.clearInterval(self.countdownIntervalID);
        self.countdownIntervalID = null;
      }
    }, 1000);

    document.getElementById('session-warning-modal-logout-btn').addEventListener('click', function (e) {
      e.preventDefault();
      self.logout();
    });
    document.getElementById('session-warning-modal-continue-btn').addEventListener('click', function (e) {
      e.preventDefault();
      self.clearWarningModal();
      self.reset(Math.floor(Date.now() / 1000));
    });
  }
};

document.addEventListener('DOMContentLoaded', function () {
  var body = document.body;
  if (body.classList.contains('session-monitor')) {
    new SessionMonitor(body);
  } else if (body.dataset.lastAccessTime) {
    localStorage.setItem('lastAccessTime', parseInt(body.dataset.lastAccessTime, 10));
  }
});
