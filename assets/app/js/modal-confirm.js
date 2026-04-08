/* global AppUtil */
/**
 * ModalConfirm - Bootstrap 5 confirmation modal dialogs.
 * Replaces the default browser confirm() with Bootstrap modals.
 * Works with ButterCream FormHelper::postLink and HtmlHelper::link.
 */
const ModalConfirm = {

  /**
   * Build a confirmation modal DOM string.
   * @param {object} opts {title, message, formName, href}
   * @return {string}
   */
  buildModal(opts) {
    const dataHref = opts.href ? ' data-href="' + AppUtil.escapeAttr(opts.href) + '"' : '';
    const dataFormName = opts.formName ? ' data-form-name="' + AppUtil.escapeAttr(opts.formName) + '"' : '';

    const body = AppUtil.escapeHtml(opts.message);
    const footer = '<button type="button" class="btn btn-default js-modal-button-close" data-bs-dismiss="modal">No</button>' +
      '<button type="button" class="btn btn-danger js-modal-button-submit"' + dataFormName + dataHref + '>Yes</button>';

    return AppUtil.buildModal({title: opts.title, body: body, footer: footer});
  },

  init() {
    // Modal confirm trigger
    document.body.addEventListener('click', (event) => {
      const trigger = event.target.closest('.modal-confirm');
      if (!trigger) return;
      event.preventDefault();

      const formName = trigger.dataset.formName;
      const modalLink = trigger.dataset.modalLink;
      const modal = trigger.dataset.modal;
      const title = trigger.dataset.originalTitle || trigger.getAttribute('title') || 'Please Confirm!';
      const message = trigger.dataset.modalMessage || 'Are you sure you want to continue?';
      const link = modalLink ? trigger.getAttribute('href') : false;

      if (modal) {
        const html = this.buildModal({title: title, message: message, formName: formName, href: link});
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        const modalEl = wrapper.firstChild;
        document.body.appendChild(modalEl);

        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();

        modalEl.addEventListener('hidden.bs.modal', () => {
          bsModal.dispose();
          modalEl.remove();
        });
        modalEl.addEventListener('shown.bs.modal', () => {
          const closeBtn = modalEl.querySelector('.js-modal-button-close');
          if (closeBtn) closeBtn.focus();
        });
      } else if (formName) {
        const form = document.querySelector('form[name="' + CSS.escape(formName) + '"]');
        if (form) form.submit();
      }

      trigger.blur();
    });

    // "Yes" button handler
    document.body.addEventListener('click', (event) => {
      const btn = event.target.closest('.js-modal-button-submit');
      if (!btn) return;
      event.preventDefault();

      const formName = btn.dataset.formName;
      const href = btn.dataset.href;
      if (formName) {
        const form = document.querySelector('form[name="' + CSS.escape(formName) + '"]');
        if (form) form.submit();
      } else if (href) {
        window.location.href = href;
      }

      const modalEl = btn.closest('.modal');
      if (modalEl) {
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  ModalConfirm.init();
});
