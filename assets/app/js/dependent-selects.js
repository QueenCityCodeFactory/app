/**
 * Dependent Selects — Cascading dropdown support.
 *
 * When a select with `[data-depends-on]` attribute is present, this module
 * watches the parent select for changes and fetches filtered options via AJAX.
 *
 * Usage in PHP template:
 * ```php
 * echo $this->Form->control('state_id', ['options' => $states]);
 * echo $this->Form->control('city_id', [
 *     'data-depends-on' => 'state_id',
 *     'data-depends-url' => '/cities/by-state',
 * ]);
 * ```
 *
 * The URL will be called as: GET /cities/by-state?state_id={value}
 * Expected JSON response: [{"value": 1, "text": "City Name"}, ...]
 */
const DependentSelects = {
  init() {
    document.querySelectorAll('[data-depends-on]').forEach((child) => {
      if (child.dataset._dependsBound) return;
      child.dataset._dependsBound = '1';

      const parentName = child.dataset.dependsOn;
      const url = child.dataset.dependsUrl;
      if (!parentName || !url) return;

      // Find parent by name attribute (CakePHP form names use bracket notation)
      const parent = document.querySelector(
        `[name="${parentName}"], [name$="[${parentName}]"]`
      );
      if (!parent) return;

      parent.addEventListener('change', () => {
        DependentSelects.load(child, url, parentName, parent.value);
      });
    });
  },

  load(child, url, paramName, paramValue) {
    // Clear current options
    const placeholder = child.querySelector('option[value=""]');
    child.innerHTML = '';
    if (placeholder) {
      child.appendChild(placeholder);
    }

    if (!paramValue) return;

    const separator = url.includes('?') ? '&' : '?';
    const fullUrl = `${url}${separator}${encodeURIComponent(paramName)}=${encodeURIComponent(paramValue)}`;

    fetch(fullUrl, {
      headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then((response) => response.json())
      .then((data) => {
        data.forEach((item) => {
          const opt = document.createElement('option');
          opt.value = item.value;
          opt.textContent = item.text;
          child.appendChild(opt);
        });

        // If TomSelect is active on this element, refresh it
        if (child.tomselect) {
          child.tomselect.clearOptions();
          child.tomselect.addOptions(
            data.map((item) => ({ value: item.value, text: item.text }))
          );
          child.tomselect.refreshOptions(false);
        }
      })
      .catch((err) => {
        console.error('DependentSelects: Failed to load options', err);
      });
  },
};

document.addEventListener('DOMContentLoaded', () => DependentSelects.init());
document.addEventListener('ajax:pagination:complete', () => DependentSelects.init());
