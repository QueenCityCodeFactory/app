/**
 * AppAjax - Shared AJAX helper for fetching HTML and injecting into containers.
 * Closes Bootstrap dropdowns inside the target before replacement to avoid orphans.
 * Calls AppCore.init() after injection to rebind tooltips, popovers, masks, etc.
 * @type object
 */
var AppAjax = {

  /**
   * Fetch HTML from a URL, inject into a container, and rebind handlers.
   * @param {string} url The URL to fetch
   * @param {HTMLElement} container The element to inject HTML into
   * @param {string} [errorMessage] Optional error message (defaults to status text)
   */
  fetchAndInject: function (url, container, errorMessage) {
    // Dismiss any open Bootstrap dropdowns inside the container before replacing
    container.querySelectorAll('.dropdown-menu.show').forEach(function (menu) {
      var toggle = menu.parentElement.querySelector('[data-bs-toggle="dropdown"]');
      if (toggle) {
        var instance = bootstrap.Dropdown.getInstance(toggle);
        if (instance) instance.hide();
      }
    });

    fetch(url, {headers: {'X-Requested-With': 'XMLHttpRequest'}})
      .then(function (response) {
        if (!response.ok) throw new Error(response.statusText);
        return response.text();
      })
      .then(function (html) {
        container.innerHTML = html;
        AppCore.init();
      })
      .catch(function (err) {
        PopTart.error(errorMessage || err.message);
      });
  },

  /**
   * Build a full URL from a base URL and a FormData/form element, merging params.
   * @param {string} baseUrl The base URL (may already have query params)
   * @param {HTMLFormElement} form The form to serialize
   * @return {string}
   */
  buildFormUrl: function (baseUrl, form) {
    var url = new URL(baseUrl, window.location.origin);
    new FormData(form).forEach(function (value, key) {
      url.searchParams.set(key, value);
    });
    return url.toString();
  },

  /**
   * Load HTML content via fetch into an element that carries a data-url attribute.
   * @param {HTMLElement} el The element to load content into
   */
  loadAjaxView: function (el) {
    var url = el.dataset.url;
    if (!url) return;
    this.fetchAndInject(url, el);
  }
};

/**
 * AjaxPagination - Delegated event handlers for AJAX pagination, search forms,
 * clear buttons, and page-limit selects. Works in both standalone and relatedData contexts.
 * @type object
 */
var AjaxPagination = {

  /**
   * Initialize: load deferred views and bind delegated handlers on document.body.
   */
  init: function () {
    // Load initial ajax-pagination views
    document.querySelectorAll('.ajax-pagination').forEach(function (el) {
      AppAjax.loadAjaxView(el);
    });

    // Pagination link click (AJAX)
    document.body.addEventListener('click', function (event) {
      var link = event.target.closest('.ajax-pagination .ajax-pagination-link');
      if (!link) return;
      event.preventDefault();
      var url = link.getAttribute('href');
      var container = document.querySelector(link.dataset.update);
      if (!url || !container) return;

      AppAjax.fetchAndInject(url, container);
    });

    // Search/filter form submission (AJAX)
    document.body.addEventListener('submit', function (event) {
      var form = event.target.closest('.ajax-pagination .ajax-search-form');
      if (!form) return;
      event.preventDefault();
      var container = document.querySelector(form.dataset.update);
      var url = form.dataset.url;
      if (!url || !container) return;

      AppAjax.fetchAndInject(AppAjax.buildFormUrl(url, form), container);
    });

    // Page-limit change (AJAX variant)
    document.body.addEventListener('change', function (event) {
      var select = event.target.closest('.ajax-pagination .ajax-set-pagination-limit');
      if (!select) return;
      var container = document.querySelector(select.dataset.update);
      var url = select.dataset.url;
      if (!url || !container) return;

      var urlObj = new URL(url, window.location.origin);
      urlObj.searchParams.set('limit', select.value || '20');

      AppAjax.fetchAndInject(urlObj.toString(), container);
    });

    // Page-limit change (non-AJAX, full page reload)
    document.body.addEventListener('change', function (event) {
      var select = event.target.closest('.set-pagination-limit');
      if (!select) return;

      var base = select.dataset.url || window.location.href;
      var url = new URL(base, window.location.origin);
      url.searchParams.set('limit', select.value || '20');
      window.location = url.toString();
    });

    // Clear search/filter button
    document.body.addEventListener('click', function (event) {
      var btn = event.target.closest('.clear-search-btn');
      if (!btn) return;
      event.preventDefault();

      var form = btn.closest('form');
      if (!form) return;

      // AJAX form inside a paginated container: reload the container's
      // original data-url directly. This resets filters while preserving
      // FK/scope params without depending on form-field options being loaded.
      if (form.classList.contains('ajax-search-form')) {
        var ajaxContainer = form.closest('.ajax-pagination');
        if (ajaxContainer && ajaxContainer.dataset.url) {
          var container = form.dataset.update
            ? document.querySelector(form.dataset.update)
            : ajaxContainer;
          if (container) {
            AppAjax.fetchAndInject(ajaxContainer.dataset.url, container);
            return;
          }
        }
      }

      // Non-AJAX fallback: clear fields and submit normally
      form.querySelectorAll('input:not([data-keep-value="1"])').forEach(function (el) {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else if (el.type !== 'submit' && el.type !== 'button') {
          el.value = '';
        }
      });
      form.querySelectorAll('select:not([data-keep-value="1"])').forEach(function (el) {
        if (el.tomselect) {
          el.tomselect.clear();
        } else {
          el.value = '';
        }
      });

      form.submit();
    });
  }
};
