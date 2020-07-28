/**
 * ModalConfirm - Used a confirmation boxes instead of standard javascript confirm.
 * Used with Custom CakePHP helpers for Twitter Bootstrap.
 * @type {Object}
 */
var ModalConfirm = {

    /**
     * Let's Bind our handlers
     */
    init: function (options) {

        /**
         * CakePHP Custom Helper FormHelper::postLink && HtmlHelper::link
         * Need these event bindings for modal confirmation messages. It replaces
         * the default vanilla javascript confirm that was built into the original
         * CakePHP helpers
         */
        $('body').on('click', '.modal-confirm', function (event) {
            event.preventDefault();
            var formName = $(this).data('form-name');
            var modalLink = $(this).data('modal-link');
            var modal = $(this).data('modal');
            var link = false;
            var content = null;
            var title = $(this).data('original-title');
            var message = $(this).data('modal-message');
            var dataHref = '';
            var dataFormName = '';

            // if title is not set look for title attr
            if (!title) {
                title = $(this).attr('title');
            }

            // if title still not set, set a default
            if (!title) {
                title = 'Please Confirm!';
            }

            // Set the link
            if (modalLink) {
                link = $(this).attr('href');
            }

            // Set default message
            if (!message) {
                message = 'Are you sure you want to continue?';
            }

            // Modal must be set to 1
            if (modal) {
                if (link) {
                    dataHref = ' data-href="' + link + '"';
                }
                if (formName) {
                    dataFormName = ' data-form-name="' + formName + '"';
                }
                content = $.templates('#modal-template').render({
                    title: title,
                    html: message,
                    buttons: [
                        {
                            button: '<button type="button" class="btn btn-default js-modal-button-close" data-dismiss="modal">No</button>'
                        },
                        {
                            button: '<button type="button" class="btn btn-danger js-modal-button-submit"' + dataFormName + dataHref + '>Yes</button>'
                        }
                    ]
                });
                $(content).modal('show').on('hidden.bs.modal', function (event) {
                    $(this).remove();
                }).on('shown.bs.modal', function (event) {
                    $('.js-modal-button-close').focus();
                });
            } else if (formName) {
                $('form[name="' + $(this).data('form-name') + '"]').submit();
            }

            $(this).blur();
        });

        /**
         * This is the event binding for the "Yes" button for the modal confirmation
         */
        $('body').on('click', '.js-modal-button-submit', function (event) {
            event.preventDefault();
            var formName = $(this).data('form-name');
            var href = $(this).data('href');
            if (formName) {
                $('form[name="' + $(this).data('form-name') + '"]').submit();
            } else if (href) {
                $(location).attr('href', href);
            }
            $(this).closest('.modal').modal('hide');
        });
    }
};
