/**
 * AppUtil - Shared utility functions used across JS modules.
 * @type object
 */
var AppUtil = {

  /**
   * Escape a string for safe insertion as HTML text content.
   * @param {string} str
   * @return {string}
   */
  escapeHtml: function (str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str || ''));
    return div.innerHTML;
  },

  /**
   * Escape a string for safe insertion into an HTML attribute.
   * @param {string} str
   * @return {string}
   */
  escapeAttr: function (str) {
    return this.escapeHtml(str).replace(/"/g, '&quot;');
  }
};
