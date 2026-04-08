/**
 * AppUtil - Shared utility functions used across JS modules.
 */
const AppUtil = {

  /**
   * Escape a string for safe insertion as HTML text content.
   * @param {string} str
   * @return {string}
   */
  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/'/g, '&#039;')
      .replace(/"/g, '&quot;');
  },

  /**
   * Escape a string for safe insertion into an HTML attribute.
   * @param {string} str
   * @return {string}
   */
  escapeAttr(str) {
    return this.escapeHtml(str);
  },

  /**
   * Read the CSRF token from the cookie.
   * @return {string}
   */
  csrfToken() {
    const match = document.cookie.match('(^|;)\\s*csrfToken\\s*=\\s*([^;]+)');
    return match ? match.pop() : '';
  },

  /**
   * Build a Bootstrap 5 modal HTML string.
   * Title is auto-escaped; body and footer are raw HTML (caller must escape user content).
   * @param {object} opts {id, title, body, footer, staticBackdrop}
   * @return {string}
   */
  buildModal(opts) {
    const backdrop = opts.staticBackdrop ? ' data-bs-backdrop="static" data-bs-keyboard="false"' : '';
    const idAttr = opts.id ? ' id="' + this.escapeAttr(opts.id) + '"' : '';

    return '<div' + idAttr + ' class="modal fade"' + backdrop + '>' +
      '<div class="modal-dialog">' +
        '<div class="modal-content">' +
          '<div class="modal-header">' +
            '<h4 class="modal-title">' + this.escapeHtml(opts.title) + '</h4>' +
          '</div>' +
          '<div class="modal-body">' + (opts.body || '') + '</div>' +
          '<div class="modal-footer">' + (opts.footer || '') + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }
};
