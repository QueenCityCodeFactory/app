var SessionMonitor = function($element, options) {
  this.container = $element;
  this.lastPingTime = moment().unix();

  if (this.sessionLength === null || this.sessionLength === undefined || this.sessionLength === '') {
      if (window.sessionTimeout !== null && window.sessionTimeout !== undefined && window.sessionTimeout !== '') {
          this.sessionLength = parseInt(window.sessionTimeout) * 60;
      } else {
          this.sessionLength = 900; // 15 Minutes AKA 900 Seconds
      }
  }

  if (this.lastAccessTime === null || this.lastAccessTime === undefined || this.lastAccessTime === '') {
      if (window.lastAccessTime !== null && window.lastAccessTime !== undefined && window.lastAccessTime !== '') {
          this.lastAccessTime = parseInt(window.lastAccessTime);
      } else {
          this.lastAccessTime = this.lastPingTime;
      }

      localStorage.setItem('lastAccessTime', this.lastAccessTime);
  }

  this.startup();
};

SessionMonitor.prototype = {

  /**
   * The container
   * @type jQuery Object
   */
  container: null,

  /**
   * What selectors to listen on for the activity events for the ping
   */
  listeningSelectors: [':input', '.main-wrapper'],

  /**
   * What events to listen to for the ping
   */
  activityEvents: 'mouseup keyup mousemove',

  /**
   * How long is the session in seconds
   */
  sessionLength: null,

  /**
   * The last time the server was accessed
   */
  lastAccessTime: null,

  /**
   * When we last pinged the server
   */
  lastPingTime: null,

  /**
   * The url to ping to see if the session is still alive. It also extends the session
   */
  pingUrl: '/ping?session_timeout=extend',

  /**
   * The logout URL
   */
  logoutUrl: '/logout',

  /**
   * The login URL
   */
  loginUrl: '/login',

  /**
   * The setTimeout Object for warnings
   */
  warningTimeoutID: null,

  /**
   * The setTimeout Object for expirations
   */
  expirationTimeoutID: null,

  /**
   * The function that starts it all
   * @return void
   */
  startup: function () {
      this.bindHandlers();
  },

  /**
   * Bind the handlers
   * @return void
   */
  bindHandlers: function () {
      var self = this;
      var extendCallBack = function (event) {
          self.extend.bind(self)(); // Bind self to this, then call extend
      };
      // Let's only ping the session on certain events
      $(self.listeningSelectors.join(', ')).on(self.activityEvents, extendCallBack);

      // Listen for changes to the localStorage for the lastAccessTime
      $(window).on('storage', function (event) {
          var storageEvent = event.originalEvent;
          var now = moment().unix();
          if (storageEvent.key == 'lastAccessTime') {
              var newValue = parseInt(localStorage.getItem('lastAccessTime'));
              self.clearTimers.bind(self)();
              if (newValue === undefined || newValue === null || newValue === 'null' || isNaN(newValue)) {
                  self.loadLoginModal.bind(self)();
              }
              if (newValue < (now + self.sessionLength)) {
                  // clear any old modals
                  self.clearWarningModal.bind(self)();
                  self.clearExpirationModal.bind(self)();

                  // Reset the timers
                  self.setWarningTimeout.bind(self)();
                  self.setExpirationTimeout.bind(self)();
              }
          }
      });

      // Set the timers
      self.setWarningTimeout();
      self.setExpirationTimeout();
  },

  /**
   * How often we are pinging the server - 1 minute
   * @return int
   */
  minPingInterval: function () {
      var self = this;
      if (self.sessionLength > 600) {
          return 120; // 2 minutes
      }
      if (self.sessionLength > 300) {
          return 60; // 1 minute
      }

      return 5; // 5 Seconds
  },

  /**
   * When to show the warning message - 3 minutes before
   * @return int
   */
  timeBeforeWarning: function () {
      var self = this;
      if (window.sessionTimeout >= 10) {
          return 180; // 3 Minutes
      }
      if (window.sessionTimeout >= 5) {
          return 60; // 1 minute
      }

      return 15; // 15 Seconds
  },

  /**
   * Clear the timers
   * @return void
   */
  clearTimers: function () {
      window.clearTimeout(this.warningTimeoutID);
      window.clearTimeout(this.expirationTimeoutID);
  },

  /**
   * Set the Warning Timer
   */
  setWarningTimeout: function () {
      var self = this;
      var timeout = (self.sessionLength - self.timeBeforeWarning()) * 1000; // Convert to milliseconds by multiplying by 1000
      self.warningTimeoutID = window.setTimeout(function () {
          self.onWarning.bind(self)();
      }, timeout);
  },

  /**
   * Set the Expiration Timer
   */
  setExpirationTimeout: function () {
      var self = this;
      var timeout = self.sessionLength * 1000; // Convert to milliseconds by multiplying by 1000
      self.expirationTimeoutID = window.setTimeout(function () {
          self.onTimeout.bind(self)();
      }, timeout);
  },

  /**
   * Logout Method - Redirects to logout url
   * @return void
   */
  logout: function () {
      var self = this;
      localStorage.setItem('lastAccessTime', null);
      window.location.href = self.logoutUrl;
  },

  /**
   * OnWarning Method Calls any warning code
   * @return void
   */
  onWarning: function () {
      var self = this;
      self.loadWarningModal();
  },

  /**
   * OnTimeout - The session has expired, handle any actions here
   * @return void
   */
  onTimeout: function () {
      var self = this;
      self.onBeforeTimeout();
      self.loadLoginModal();
  },

  /**
   * Called before time out happens. Auto save could be added here.
   * @return void
   */
  onBeforeTimeout: function () {
      var self = this;
  },

  /**
   * Extend the session if after min interval
   * @return void
   */
  extend: function () {
      var self = this;
      var now = moment().unix();
      var timeSinceLastPing = now - self.lastPingTime;
      if (timeSinceLastPing > self.minPingInterval()) {
          self.reset(now);
      }
  },

  /**
   * Reset the timers
   * @return void
   */
  reset: function (now) {
      var self = this;
      self.lastPingTime = now;

      var callback = function (timestamp) {
          self.clearTimers.bind(self)();
          localStorage.setItem('lastAccessTime', timestamp);
          self.lastAccessTime = timestamp;
          if (timestamp !== false && timestamp !== null && timestamp !== undefined) {
              self.setWarningTimeout.bind(self)();
              self.setExpirationTimeout.bind(self)();
          } else {
              self.loadLoginModal.bind(self)();
          }
      };

      self.ping(callback);
  },

  /**
   * Ping the webserver to keep session alive
   * @return void
   */
  ping: function (callback) {
      var request = $.ajax({
          type: 'POST',
          url: this.pingUrl,
          dataType: 'json'
      });

      request.done(function (response) {
          callback(response.timestamp);
      });

      request.fail(function (jqXHR, textStatus) {
          var lastAccessTime = null;
          if (jqXHR.status === 403) {
              lastAccessTime = false;
          }
          callback(lastAccessTime);
      });
  },

  /**
   * Clear the warning modal
   * @return void
   */
  clearWarningModal: function () {
      var warningModal = $('#session-warning-modal');
      if (warningModal.length > 0) {
          warningModal.modal('hide').on('hidden.bs.modal', function () {
              $('body').off('click', '#session-warning-modal-continue-btn');
              $('body').off('click', '#session-warning-modal-logout-btn');
              $(this).remove();
          });
      }
  },

  /**
   * Clear the expiration modal
   * @return void
   */
  clearExpirationModal: function () {
      var expiredModal = $('#session-expired-modal');
      if (expiredModal.length > 0) {
          expiredModal.modal('hide').on('hidden.bs.modal', function (event) {
              $('.main-wrapper').removeClass('blur');
              $('body').removeClass('modal-open');
              $('body').off('keypress', '#session-expired-modal input');
              $('body').off('click', '#session-expired-modal-login-btn');
              $('body').off('click', '#session-expired-modal-logout-btn');
              $(this).remove();
          });
      }
  },

  /**
   * Load the login modal for when session expires
   * @return void
   */
  loadLoginModal: function () {
      var self = this;

      // Only continue if the modal is not there.
      if ($('#session-expired-modal').length > 0) {
          return;
      }

      // Make sure the warning modal has been removed
      self.clearWarningModal();

      var content = $.templates('#modal-template').render({
          id: 'session-expired-modal',
          title: 'Login to Continue',
          html: false,
          buttons: [
              {
                  button: '<button id="session-expired-modal-logout-btn" type="button" class="btn btn-danger">Logout <i class="fas fa-sign-out-alt"></i></button>'
              },
              {
                  button: '<button id="session-expired-modal-login-btn" type="button" class="btn btn-success"><i class="fas fa-sign-in-alt"></i> Login</button>'
              }
          ],
          login: true,
          closeButton: false
      });

      $('body').append(content);
      $('#session-expired-modal').modal({
          "backdrop": "static",
          "keyboard": false,
          "show": true
      }).on('shown.bs.modal', function (event) {
          $('.main-wrapper').addClass('blur');
          $('body').addClass('modal-open');
      });
      $('body').off('click', '#session-expired-modal-logout-btn');
      $('body').on('click', '#session-expired-modal-logout-btn', function (event) {
          event.preventDefault();
          self.logout.bind(self)();
      });
      $('body').off('click', '#session-expired-modal-login-btn');
      $('body').on('click', '#session-expired-modal-login-btn', function (event) {
          event.preventDefault();
          self.login.bind(self)();
      });
      $('body').off('keypress', '#session-expired-modal input');
      $('body').on('keypress', '#session-expired-modal input', function (event) {
          if (event.keyCode == 13) {
              event.preventDefault();
              self.login.bind(self)();
          }
      });
  },

  /**
   * Login Request Via Ajax
   * @return void
   */
  login: function () {
      var self = this;

      var successfulLogin = function(){
          self.lastPingTime = moment().unix();
          self.clearExpirationModal.bind(self)();
          self.reset.bind(self)(moment().unix());
      };

      var unsuccessfulLogin = function(message){
          $("#expired-alert-message").html(message);
          $('#expired-username').val('');
          $('#expired-password').val('');
      };

      var userName = $('#expired-username').val().trim();
      if (userName !== window.sessionUserName && userName !== window.sessionUserEmail) {
          unsuccessfulLogin('Username or Email does not match the last logged in user for this page. Only the original user can log back in to this page.');
          return;
      }
      var request = $.ajax({
          type: 'POST',
          url: self.loginUrl,
          dataType: 'json',
          data: {
              email: $('#expired-username').val(),
              password: $('#expired-password').val()
          }
      });

      request.done(function (response) {
          if (response.response.success === true && response.response.tfa === true) {
              $("#expired-alert-message").html('Two Factor Authentication needed; Please scan card');
              toastr.info('Two Factor Authentication needed; Please scan card');
              var tfa = new TwoFactorAuth(
                  function successFn(data) {
                      toastr.success('Card has been scanned');
                      $.ajax({
                          type: 'POST',
                          url: self.loginUrl,
                          dataType: 'json',
                          data: {
                              email: $('#expired-username').val(),
                              password: $('#expired-password').val(),
                              two_factor_auth_id: data.number
                          }
                      })
                      .done(function(data){
                          if (data.response.success === true) {
                              successfulLogin.bind(self)();
                          } else {
                              unsuccessfulLogin.bind(self)(data.response.message);
                          }
                      })
                      .fail(function(){
                          $("#expired-alert-message").html('Two Factor Authentication Request Failed');
                      });
                  },
                  toastr.error
              );
              tfa.setId();
          } else if (response.response.success === true) {
              successfulLogin.bind(self)();
          } else {
              unsuccessfulLogin.bind(self)(response.response.message);
          }
      });

      request.fail(function (jqXHR, textStatus) {
          $('#expired-alert-message').html('An error occurred, please try again!');
      });
  },

  /**
   * Load the Warning Modal with Handlers
   * @return void
   */
  loadWarningModal: function () {
      var self = this;

      // Only continue if the modal is not there.
      if ($('#session-warning-modal').length > 0) {
          return;
      }

      var expiredModal = $('#session-expired-modal');
      var content = null;
      var countdownDate = null;

      // Don't show the warning modal if expired modal is present
      if (!(expiredModal !== null && expiredModal !== undefined && expiredModal !== '' && expiredModal.length !== 0)) {
          content = $.templates('#modal-template').render({
              id: 'session-warning-modal',
              title: 'Your session is about to expire',
              html: 'Your session will expire in <span id="session-remaining-time">3 min 00 sec</span> due to inactivity.',
              buttons: [
                  {
                      button: '<button id="session-warning-modal-logout-btn" type="button" class="btn btn-danger">Logout <i class="fas fa-sign-out-alt"></i></button>'
                  },
                  {
                      button: '<button id="session-warning-modal-continue-btn" type="button" class="btn btn-success">Stay Logged In</button>'
                  }
              ],
              closeButton: false
          });
          $('body').append(content);
          $('#session-warning-modal').modal({
              "backdrop": "static",
              "keyboard": false,
              "show": true
          });

          countdownDate = moment().add(self.timeBeforeWarning(), 'seconds').toDate();

          $('#session-remaining-time').countdown(countdownDate, function (event) {
              $(this).html(event.strftime('%M min %S sec'));
          });
          $('body').on('click', '#session-warning-modal-logout-btn', function (event) {
              event.preventDefault();
              self.logout.bind(self)();
          });
          $('body').on('click', '#session-warning-modal-continue-btn', function (event) {
              event.preventDefault();

              // Destroy the modal
              self.clearWarningModal.bind(self)();

              // Keep the session alive
              self.reset.bind(self)(moment().unix());
          });
      }
  }
};

$(function() {
  var sessionMonitorElement = $('body.session-monitor');
  if (sessionMonitorElement.length !== 0 && sessionMonitorElement !== undefined && sessionMonitorElement !== null && sessionMonitorElement !== '') {
      var sessionMonitor = new SessionMonitor(sessionMonitorElement);
  } else if (window.lastAccessTime !== null && window.lastAccessTime !== undefined && window.lastAccessTime !== '') {
      localStorage.setItem('lastAccessTime', parseInt(window.lastAccessTime));
  }
});
