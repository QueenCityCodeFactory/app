var PopTart = {
    containerId: 'poptart-container',

    toastType: {
        danger: {
            class: 'danger',
            icon: 'fa-solid fa-skull-crossbones'
        },
        error: {
            class: 'danger',
            icon: 'fa-solid fa-dumpster-fire'
        },
        info: {
            class: 'info',
            icon: 'fa-solid fa-info-circle'
        },
        success: {
            class: 'success',
            icon: 'far fa-check-circle'
        },
        warning: {
            class: 'warning',
            icon: 'fa-solid fa-exclamation-triangle'
        },
        primary: {
            class: 'primary',
            icon: 'fa-solid fa-bullhorn'
        }
    },

    danger: function(message, title, options) {
        return this.notify({
            type: this.toastType.danger.class,
            icon: this.toastType.danger.icon,
            message: message,
            options: options,
            title: title
        });
    },
    error: function(message, title, options) {
        return this.notify({
            type: this.toastType.error.class,
            icon: this.toastType.error.icon,
            message: message,
            options: options,
            title: title
        });
    },
    info: function(message, title, options) {
        return this.notify({
            type: this.toastType.info.class,
            icon: this.toastType.info.icon,
            message: message,
            options: options,
            title: title
        });
    },
    success: function(message, title, options) {
        return this.notify({
            type: this.toastType.success.class,
            icon: this.toastType.success.icon,
            message: message,
            options: options,
            title: title
        });
    },
    warning: function(message, title, options) {
        return this.notify({
            type: this.toastType.warning.class,
            icon: this.toastType.warning.icon,
            message: message,
            options: options,
            title: title
        });
    },
    primary: function(message, title, options) {
        return this.notify({
            type: this.toastType.primary.class,
            icon: this.toastType.primary.icon,
            message: message,
            options: options,
            title: title
        });
    },
    notify: function(options) {
        var container = this.getContainer();
        var toastElement = $('<div class="toast" role="alert" aria-live="assertive" aria-atomic="true"></div>');
        var headerElement;
        var bodyElement;

        if (options && options.hasOwnProperty('title') && options.title) {
            headerElement = $('<div class="toast-header"></div>');
            var titleElement = $('<strong class="me-auto">' + options.title + '</strong>');
            var buttonElement = $('<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>');

            if (options.hasOwnProperty('icon') && options.icon) {
                headerElement.append('<span class="me-2"><em class="' + options.icon + '"></em></span>');
            }

            headerElement.append(titleElement);
            headerElement.append(buttonElement);
        }

        if (options && options.hasOwnProperty('message') && options.message) {
            bodyElement = $('<div class="toast-body">' + options.message + '</div>');
        }

        if (options && options.hasOwnProperty('type')) {
            toastElement.addClass('bg-' + options.type);
        }

        toastElement.addClass('text-white');

        if (headerElement) {
            toastElement.append(headerElement);
        }
        if (bodyElement) {
            toastElement.append(bodyElement);
        }

        container.append(toastElement);

        toastElement
            .toast({
                delay: 10000
            })
            .toast('show');

        toastElement.on('click', function (event) {
            event.preventDefault();
            $(this).toast('hide');
        });

        toastElement.on('hidden.bs.toast', function () {
            var parent = $(this).parent();
            $(this).remove();
            if (parent.children().length === 0) {
                parent.remove();
            }
        });
    },
    getContainer: function() {
        var container = $('#' + this.containerId);
        if (container.length === 0) {
            container = $('<div id="' + this.containerId + '"></div>');
            $('body').prepend(container);
        }

        return container;
    }
};
