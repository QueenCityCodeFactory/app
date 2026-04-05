/**
 * FormatTime - Converts UTC date/time strings in marked elements to local time.
 * Uses the native Intl.DateTimeFormat API — no external date library required.
 */
var FormatTime = {

  /**
   * Intl formatters — created once and reused.
   */
  _dateTimeFmt: new Intl.DateTimeFormat('en-US', {
    month: 'numeric', day: 'numeric', year: '2-digit',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
  }),
  _shortTimeFmt: new Intl.DateTimeFormat('en-US', {
    month: 'numeric', day: 'numeric', year: '2-digit',
    hour: 'numeric', minute: '2-digit'
  }),
  _shortDateFmt: new Intl.DateTimeFormat('en-US', {
    month: 'numeric', day: 'numeric', year: '2-digit'
  }),

  /**
   * Parse a UTC date string in "M/D/YY, h:mm AM" format.
   * @param {string} str The date string
   * @return {Date|null}
   */
  parseUTC: function (str) {
    if (!str) return null;
    var match = str.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}),?\s+(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (!match) return null;
    var month = parseInt(match[1], 10) - 1;
    var day = parseInt(match[2], 10);
    var year = 2000 + parseInt(match[3], 10);
    var hours = parseInt(match[4], 10);
    var minutes = parseInt(match[5], 10);
    var ampm = match[6].toLowerCase();
    if (ampm === 'pm' && hours !== 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    return new Date(Date.UTC(year, month, day, hours, minutes));
  },

  /**
   * Initialize — convert all marked elements. Safe to call repeatedly (idempotent).
   */
  init: function () {
    var self = this;

    document.querySelectorAll('p.time:not([data-formatted]), td.time:not([data-formatted])').forEach(function (el) {
      var date = self.parseUTC(el.textContent);
      if (date) {
        el.textContent = self._dateTimeFmt.format(date);
        el.setAttribute('data-formatted', '1');
      }
    });

    document.querySelectorAll('p.short-time:not([data-formatted]), td.short-time:not([data-formatted])').forEach(function (el) {
      var date = self.parseUTC(el.textContent);
      if (date) {
        el.textContent = self._shortTimeFmt.format(date);
        el.setAttribute('data-formatted', '1');
      }
    });

    document.querySelectorAll('p.short-date:not([data-formatted]), td.short-date:not([data-formatted])').forEach(function (el) {
      var date = self.parseUTC(el.textContent);
      if (date) {
        el.textContent = self._shortDateFmt.format(date);
        el.setAttribute('data-formatted', '1');
      }
    });
  }
};
