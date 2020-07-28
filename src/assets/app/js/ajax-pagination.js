/**
 * AjaxPagination - Bind event handlers needed for Ajax pagination for CakePHP.
 * Must use custom CakePHP Bake Scripts and Non-Stock templates and helpers
 * @type object
 */
var AjaxPagination = {

    /**
     * Let's init the object and bind the handlers
     */
    init: function (options) {

        var self = this;

        // Let's loop over all of the .ajax-pagination elements
        $('.ajax-pagination').each(function (index) {
            AppAjax.loadAjaxView($(this));
        });

        // Do some event handling on the click of any ajax links within element
        $('.ajax-pagination').on('click', '.ajax-pagination-link', function (event) {
            event.preventDefault();
            var url = $(this).attr('href');
            var container = $(this).data('update');
            var request = $.ajax({
                currentLink: true,
                dataType: "html",
                evalScripts: true,
                url: url
            });
            request.done(function (response) {
                $(container).html(response);
                AjaxBind.init();
            });
            request.fail(function (jqXHR, textStatus) {
                PopTart.error(textStatus);
            });
        });

        // Ajax element form submission (Ex. Search Form) for ajax paginated elements
        $('.ajax-pagination').on('submit', '.ajax-search-form', function (event) {
            event.preventDefault();
            var container = $(this).data('update');
            var data = $(this).serialize();
            var url = $(this).data('url');
            var request = $.ajax({
                currentLink: true,
                url: url,
                type: 'GET',
                data: data,
                dataType: "html",
                evalScripts: true
            });
            request.done(function (response) {
                $(container).html(response);
                AjaxBind.init();
            });
            request.fail(function (jqXHR, textStatus) {
                PopTart.error('We have encountered an error! Please refresh and try again!', 'Search Error');
            });
        });

        $('.ajax-pagination').on('change', '.ajax-set-pagination-limit', function (event) {
            var limit = $(this).val();
            var container = $(this).data('update');
            var url = $(this).data('url');
            var querystingRegex = /\?/i;
            var limitRegex = /(\?|&)limit=/i;

            if (!(url !== null && url !== '' && url !== undefined)) {
                return false;
            }

            if (!(limit !== null && limit !== '' && limit !== undefined)) {
                limit = 20;
            }

            if (limitRegex.exec(url) !== null) {
                url = url.replace(/([\?&])(limit=)[^&#]*/, '$1$2' + limit);
            } else {
                if (querystingRegex.exec(url) !== null) {
                    url = url + '&limit=' + limit;
                } else {
                    url = url + '?limit=' + limit;
                }
            }

            var request = $.ajax({
                currentLink: true,
                dataType: "html",
                evalScripts: true,
                url: url
            });
            request.done(function (response) {
                $(container).html(response);
                AjaxBind.init();
            });
            request.fail(function (jqXHR, textStatus) {
                PopTart.error(textStatus);
            });
        });
    }
};

/**
 * AppAjax - Common Ajax Helper Functions for the Custom App
 * @type object
 */
var AppAjax = {

    // Load some html content via ajax then bind handlers
    loadAjaxView: function (obj) {
        var id = obj.data('id');
        var url = obj.data('url');

        if (!(url !== null && url !== '' && url !== undefined)) {
            return false;
        }

        obj.load(url, function () {
            AjaxBind.init();
        });
    }
};

/**
 * AjaxBind will bind all event handlers that need reestablished for the content to work correctly.
 *
 * @type Object
 */
var AjaxBind = {

    /**
     * Load all event handlers
     */
    init: function (options) {
        var self = this;
        self.touchstart(options);
        self.popover(options);
        self.htmlPopover(options);
        self.mask(options);
        self.select2(options);
    },

    /**
     * Load just the touchstart handler
     */
    touchstart: function (options) {
        var self = this;
        AppCore.touchstart(options);
    },

    /**
     * Load just the popover handler
     */
    popover: function (options) {
        var self = this;
        AppCore.popover(options);
    },

    /**
     * Load just the html popover handler
     */
    htmlPopover: function (options) {
        var self = this;
        AppCore.htmlPopover(options);
    },

    /**
     * Load just the mask handler
     */
    mask: function (options) {
        var self = this;
        AppCore.mask(options);
    },

    select2: function (options) {
        AppCore.select2(options);
    }
};
