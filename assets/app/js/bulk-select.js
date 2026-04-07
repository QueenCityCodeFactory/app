/**
 * Bulk Select — Select-all / select-row checkboxes for tables.
 *
 * Handles the `[data-check-all]` header checkbox to toggle all
 * `.bulk-check` row checkboxes in the same table.
 */
const BulkSelect = {
  init() {
    document.querySelectorAll('[data-check-all]').forEach((master) => {
      if (master.dataset._bulkBound) return;
      master.dataset._bulkBound = '1';

      const table = master.closest('table');
      if (!table) return;

      master.addEventListener('change', () => {
        table.querySelectorAll('.bulk-check').forEach((cb) => {
          cb.checked = master.checked;
        });
      });

      // Update master when individual checkboxes change
      table.addEventListener('change', (e) => {
        if (e.target.classList.contains('bulk-check')) {
          const all = table.querySelectorAll('.bulk-check');
          const checked = table.querySelectorAll('.bulk-check:checked');
          master.checked = all.length === checked.length;
          master.indeterminate = checked.length > 0 && checked.length < all.length;
        }
      });
    });
  },
};

document.addEventListener('DOMContentLoaded', () => BulkSelect.init());
// Re-init after AJAX content injection
document.addEventListener('ajax:pagination:complete', () => BulkSelect.init());
