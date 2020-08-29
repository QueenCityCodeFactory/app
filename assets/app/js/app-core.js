/**
 * Load up all of the Necessary Objects for the Application
 */
$(function () {
    // Copied from Panda - classes not included are commented out
    AppCore.init();
    AjaxPagination.init();
    // ModalQuickView.init();
    ModalConfirm.init();
    ClearSearchForm.init();
    PaginationLimit.init();
    // QuickSave.init();
    // SessionMonitor.init();
    // Templates.init();
    // SelectOther.init();
    // EditableSelectOther.init();
    // FormNavigationAlert.init();
});

/**
 * AppCore Handlers and functions
 * @type object
 */
var AppCore = {

    /**
     * Load up all of the custom handlers
     */
    init: function (options) {
        var self = this;
        self.touchstart(options);
        self.popover(options);
        self.htmlPopover(options);
        self.mask(options);
        self.select2(options);
        self.textarea(options);
    },

    touchstart: function (options) {
        var self = this;
        // Need to attach this on ajax loaded content
        if (!("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch)) {
            $('[data-toggle="tooltip"]').tooltip();
        }
    },

    popover: function (options) {
        var self = this;
        $('[data-toggle="popover"]').popover();
    },

    htmlPopover: function (options) {
        var self = this;
        $('.html-popover').popover({
            content: function (a,b,c) {
                return $($(this).data('element')).html();
            },
            html: true
        });
    },

    mask: function (options) {
        var self = this;
        $(':input').inputmask();
    },

    select2: function (options) {
        var self = this;
        $('.select2-input-field').each(function (index) {
            var placeholder = $(this).attr('placeholder');
            $(this).select2({
                placeholder: placeholder,
                theme: 'bootstrap4'
            });
        });
    },

    textarea: function (options) {
        if (this.isInternetExplorer() > 0) {
            $('textarea').css('height', '500px');
        }
    },

    isInternetExplorer: function () {
        var userAgent = window.navigator.userAgent;
        var indexOfUserAgent = userAgent.indexOf('MSIE');

        if (indexOfUserAgent > 0) {
            return parseInt(userAgent.substring(indexOfUserAgent + 5, userAgent.indexOf(".", indexOfUserAgent)));
        } else if (!!window.navigator.userAgent.match(/Trident\/7\./)) {
            return 11;
        } else {
            return 0;
        }
    }
};
