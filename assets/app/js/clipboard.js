/**
 * Clipboard - Copy text to the system clipboard using the modern Clipboard API.
 * @type object
 */
var Clipboard = {

  /**
   * Copy text to the clipboard.
   * @param {string} text The text to copy
   * @return {Promise}
   */
  copyToClipboard: function (text) {
    return navigator.clipboard.writeText(text);
  }
};
