var PopTart = {
    containerId: 'poptart-container',

    toastType: {
        danger: {
            class: 'danger',
            icon: 'fas fa-skull-crossbones'
        },
        error: {
            class: 'danger',
            icon: 'fas fa-dumpster-fire'
        },
        info: {
            class: 'info',
            icon: 'fas fa-info-circle'
        },
        success: {
            class: 'success',
            icon: 'far fa-check-circle'
        },
        warning: {
            class: 'warning',
            icon: 'fas fa-exclamation-triangle'
        },
        primary: {
            class: 'primary',
            icon: 'fas fa-bullhorn'
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
        var toastElement = $('<div class="toast ml-auto" role="alert" aria-live="assertive" aria-atomic="true"></div>');
        var headerElement;
        var bodyElement;

        if (options && options.hasOwnProperty('title') && options.title) {
            headerElement = $('<div class="toast-header"></div>');
            var titleElement = $('<strong class="mr-auto">' + options.title + '</strong>');
            var buttonElement = $('<button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close"><span aria-hidden="true">&times;</span></button>');

            if (options.hasOwnProperty('icon') && options.icon) {
                headerElement.append('<span class="mr-2"><em class="' + options.icon + '"></em></span>');
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
