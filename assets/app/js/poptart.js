/**
 * PopTart - Toast notification system using Bootstrap 5 native Toast API.
 * All content is text-escaped to prevent XSS.
 * @type object
 */
var PopTart = {
  containerId: 'poptart-container',

  toastType: {
    danger:  {class: 'danger',  icon: 'fa-solid fa-skull-crossbones'},
    error:   {class: 'danger',  icon: 'fa-solid fa-dumpster-fire'},
    info:    {class: 'info',    icon: 'fa-solid fa-info-circle'},
    success: {class: 'success', icon: 'far fa-check-circle'},
    warning: {class: 'warning', icon: 'fa-solid fa-exclamation-triangle'},
    primary: {class: 'primary', icon: 'fa-solid fa-bullhorn'}
  },

  danger: function (message, title, options) {
    return this.notify({type: this.toastType.danger.class, icon: this.toastType.danger.icon, message: message, title: title});
  },
  error: function (message, title, options) {
    return this.notify({type: this.toastType.error.class, icon: this.toastType.error.icon, message: message, title: title});
  },
  info: function (message, title, options) {
    return this.notify({type: this.toastType.info.class, icon: this.toastType.info.icon, message: message, title: title});
  },
  success: function (message, title, options) {
    return this.notify({type: this.toastType.success.class, icon: this.toastType.success.icon, message: message, title: title});
  },
  warning: function (message, title, options) {
    return this.notify({type: this.toastType.warning.class, icon: this.toastType.warning.icon, message: message, title: title});
  },
  primary: function (message, title, options) {
    return this.notify({type: this.toastType.primary.class, icon: this.toastType.primary.icon, message: message, title: title});
  },

  notify: function (options) {
    if (!options || (!options.message && !options.title)) return;
    var container = this.getContainer();
    var toast = document.createElement('div');
    toast.className = 'toast text-white';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    if (options.type) {
      toast.classList.add('bg-' + options.type);
    }

    if (options.title) {
      var header = document.createElement('div');
      header.className = 'toast-header';
      if (options.icon) {
        var iconSpan = document.createElement('span');
        iconSpan.className = 'me-2';
        var iconEl = document.createElement('em');
        iconEl.className = options.icon;
        iconSpan.appendChild(iconEl);
        header.appendChild(iconSpan);
      }
      var strong = document.createElement('strong');
      strong.className = 'me-auto';
      strong.textContent = options.title;
      header.appendChild(strong);
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'btn-close';
      closeBtn.setAttribute('data-bs-dismiss', 'toast');
      closeBtn.setAttribute('aria-label', 'Close');
      header.appendChild(closeBtn);
      toast.appendChild(header);
    }

    if (options.message) {
      var body = document.createElement('div');
      body.className = 'toast-body';
      body.textContent = options.message;
      toast.appendChild(body);
    }

    container.appendChild(toast);

    var bsToast = new bootstrap.Toast(toast, {delay: 10000});
    bsToast.show();

    toast.addEventListener('click', function () {
      bsToast.hide();
    });

    toast.addEventListener('hidden.bs.toast', function () {
      var parent = toast.parentNode;
      toast.remove();
      if (parent && parent.children.length === 0) {
        parent.remove();
      }
    });
  },

  getContainer: function () {
    var container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      document.body.prepend(container);
    }
    return container;
  }
};
