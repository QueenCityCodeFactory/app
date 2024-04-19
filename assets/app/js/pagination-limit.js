/**
 * Pagination Limit
 * @type object
 */
var PaginationLimit = {

    /**
     * Let's init the object and bind the handlers
     */
    init: function (options) {

        var self = this;

        $('body').on('change', '.set-pagination-limit', function (event) {
            var limit = $(this).val();
            var url = $(this).data('url');
            var querystingRegex = /\?/i;
            var limitRegex = /(\?|&)limit=/i;

            if (!(url !== null && url !== '' && url !== undefined)) {
                url = window.location.href;
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

            window.location = url;
        });
    }
};
