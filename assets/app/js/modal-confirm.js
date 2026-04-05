/**
 * ModalConfirm - Bootstrap 5 confirmation modal dialogs.
 * Replaces the default browser confirm() with Bootstrap modals.
 * Works with ButterCream FormHelper::postLink and HtmlHelper::link.
 * @type object
 */
var ModalConfirm = {

  /**
   * Build a confirmation modal DOM string.
   * @param {object} opts {title, message, formName, href}
   * @return {string}
   */
  buildModal: function (opts) {
    var dataHref = opts.href ? ' data-href="' + AppUtil.escapeAttr(opts.href) + '"' : '';
    var dataFormName = opts.formName ? ' data-form-name="' + AppUtil.escapeAttr(opts.formName) + '"' : '';

    return '<div class="modal fade">' +
      '<div class="modal-dialog">' +
        '<div class="modal-content">' +
          '<div class="modal-header">' +
            '<h4 class="modal-title">' + AppUtil.escapeAttr(opts.title) + '</h4>' +
          '</div>' +
          '<div class="modal-body">' + AppUtil.escapeAttr(opts.message) + '</div>' +
          '<div class="modal-footer">' +
            '<button type="button" class="btn btn-default js-modal-button-close" data-bs-dismiss="modal">No</button>' +
            '<button type="button" class="btn btn-danger js-modal-button-submit"' + dataFormName + dataHref + '>Yes</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  },

  init: function () {
    var self = this;

    // Modal confirm trigger
    document.body.addEventListener('click', function (event) {
      var trigger = event.target.closest('.modal-confirm');
      if (!trigger) return;
      event.preventDefault();

      var formName = trigger.dataset.formName;
      var modalLink = trigger.dataset.modalLink;
      var modal = trigger.dataset.modal;
      var title = trigger.dataset.originalTitle || trigger.getAttribute('title') || 'Please Confirm!';
      var message = trigger.dataset.modalMessage || 'Are you sure you want to continue?';
      var link = modalLink ? trigger.getAttribute('href') : false;

      if (modal) {
        var html = self.buildModal({title: title, message: message, formName: formName, href: link});
        var wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        var modalEl = wrapper.firstChild;
        document.body.appendChild(modalEl);

        var bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();

        modalEl.addEventListener('hidden.bs.modal', function () {
          bsModal.dispose();
          modalEl.remove();
        });
        modalEl.addEventListener('shown.bs.modal', function () {
          var closeBtn = modalEl.querySelector('.js-modal-button-close');
          if (closeBtn) closeBtn.focus();
        });
      } else if (formName) {
        var form = document.querySelector('form[name="' + formName + '"]');
        if (form) form.submit();
      }

      trigger.blur();
    });

    // "Yes" button handler
    document.body.addEventListener('click', function (event) {
      var btn = event.target.closest('.js-modal-button-submit');
      if (!btn) return;
      event.preventDefault();

      var formName = btn.dataset.formName;
      var href = btn.dataset.href;
      if (formName) {
        var form = document.querySelector('form[name="' + formName + '"]');
        if (form) form.submit();
      } else if (href) {
        window.location.href = href;
      }

      var modalEl = btn.closest('.modal');
      if (modalEl) {
        var bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
      }
    });
  }
};
