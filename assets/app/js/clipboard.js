/**
 * Clipboard - Copy text to the system clipboard using the modern Clipboard API.
 */
const Clipboard = {

  /**
   * Copy text to the clipboard.
   * @param {string} text The text to copy
   * @return {Promise}
   */
  copyToClipboard(text) {
    return navigator.clipboard.writeText(text);
  }
};
