/**
 * ClearSearchForm - Clears out search forms and resubmits
 * @type object
 */
var ClearSearchForm = {

    init: function (options) {

        /**
         * Clears out general search forms fields and submits to reset!
         */
        $('body').on('click', '.clear-search-btn', function (event) {
            event.preventDefault();
            var searchForm = $(this).parents('form');
            searchForm.find("input[type=hidden]").not('[data-keep-value=1]').val('');
            searchForm.find("input[type=text]").not('[data-keep-value=1]').val('');
            searchForm.find("input[type=checkbox]").not('[data-keep-value=1]').removeAttr('checked');
            searchForm.find("select").not('[data-keep-value=1]').val('');
            if (searchForm.hasClass('ajax-search-form')) {
                var container = searchForm.data('update');
                var data = searchForm.serialize();
                var url = searchForm.data('url');
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
            } else {
                searchForm.submit();
            }
        });
    }
};
