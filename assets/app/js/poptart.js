/**
 * PopTart - Toast notification system using Bootstrap 5 native Toast API.
 * All content is text-escaped to prevent XSS.
 */
const PopTart = {
  containerId: 'poptart-container',

  toastType: {
    danger:  {class: 'danger',  icon: 'fa-solid fa-skull-crossbones'},
    error:   {class: 'danger',  icon: 'fa-solid fa-dumpster-fire'},
    info:    {class: 'info',    icon: 'fa-solid fa-info-circle'},
    success: {class: 'success', icon: 'far fa-check-circle'},
    warning: {class: 'warning', icon: 'fa-solid fa-exclamation-triangle'},
    primary: {class: 'primary', icon: 'fa-solid fa-bullhorn'}
  },

  danger(message, title) {
    return this.notify({type: this.toastType.danger.class, icon: this.toastType.danger.icon, message: message, title: title});
  },
  error(message, title) {
    return this.notify({type: this.toastType.error.class, icon: this.toastType.error.icon, message: message, title: title});
  },
  info(message, title) {
    return this.notify({type: this.toastType.info.class, icon: this.toastType.info.icon, message: message, title: title});
  },
  success(message, title) {
    return this.notify({type: this.toastType.success.class, icon: this.toastType.success.icon, message: message, title: title});
  },
  warning(message, title) {
    return this.notify({type: this.toastType.warning.class, icon: this.toastType.warning.icon, message: message, title: title});
  },
  primary(message, title) {
    return this.notify({type: this.toastType.primary.class, icon: this.toastType.primary.icon, message: message, title: title});
  },

  notify(options) {
    if (!options || (!options.message && !options.title)) return;
    const container = this.getContainer();
    const toast = document.createElement('div');
    toast.className = 'toast text-white';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    if (options.type) {
      toast.classList.add('bg-' + options.type);
    }

    if (options.title) {
      const header = document.createElement('div');
      header.className = 'toast-header';
      if (options.icon) {
        const iconSpan = document.createElement('span');
        iconSpan.className = 'me-2';
        const iconEl = document.createElement('em');
        iconEl.className = options.icon;
        iconSpan.appendChild(iconEl);
        header.appendChild(iconSpan);
      }
      const strong = document.createElement('strong');
      strong.className = 'me-auto';
      strong.textContent = options.title;
      header.appendChild(strong);
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'btn-close';
      closeBtn.setAttribute('data-bs-dismiss', 'toast');
      closeBtn.setAttribute('aria-label', 'Close');
      header.appendChild(closeBtn);
      toast.appendChild(header);
    }

    if (options.message) {
      const body = document.createElement('div');
      body.className = 'toast-body';
      body.textContent = options.message;
      toast.appendChild(body);
    }

    container.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, {delay: 10000});
    bsToast.show();

    toast.addEventListener('click', () => {
      bsToast.hide();
    });

    toast.addEventListener('hidden.bs.toast', () => {
      const parent = toast.parentNode;
      toast.remove();
      if (parent && parent.children.length === 0) {
        parent.remove();
      }
    });
  },

  getContainer() {
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      document.body.prepend(container);
    }
    return container;
  }
};
