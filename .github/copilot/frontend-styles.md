# Frontend Styles Guidance

## Build Pipeline

- Source SCSS lives in `assets/app/scss/`. Compiled output goes to `webroot/css/`.
- Source JS lives in `assets/app/js/`. Compiled output goes to `webroot/js/`.
- **Never edit** compiled files in `webroot/css/` or `webroot/js/` directly.
- After any change: `innkeeper exec gulp`, then `innkeeper sync from-vm` to pull artifacts.

## Bootstrap 5

This project uses **Bootstrap 5.3** (not Bootstrap 3 or 4). Use Bootstrap 5 classes:
- Layout: `d-flex`, `justify-content-between`, `align-items-center`, `gap-*`
- Grid: `container`, `row`, `col-md-6`, `g-3`
- Spacing: `mt-3`, `mb-0`, `px-4`, `py-2`
- Components: `card`, `btn`, `alert`, `badge`, `dropdown`, `modal`, `table`

Docs: [getbootstrap.com/docs/5.3](https://getbootstrap.com/docs/5.3/)

## ButterCream Plugin

[QueenCityCodeFactory/butter-cream](https://github.com/QueenCityCodeFactory/butter-cream) provides Bootstrap 5 form helpers for CakePHP 5. Use its helpers in templates:
```php
echo $this->Form->control('name');        // renders Bootstrap 5 form-floating or form-group
echo $this->Form->button('Save');         // renders btn btn-primary
```
Select controls automatically get the `enhanced-select` class (TomSelect). To disable enhanced selects on a specific control, pass `'enhancedSelect' => false`.

## Utility Classes

Before adding custom CSS or inline styles, check `assets/app/scss/helpers.scss` for existing utilities. Common helpers include spacing and visibility classes.

## Style Conventions

- Prefer **existing Bootstrap 5 utilities** over new CSS for spacing, alignment, display.
- When a new helper class is truly needed, add it to `helpers.scss` with a concise name and low specificity.
- Keep styles in the appropriate partial: form styles in `_form.scss`, button styles in `_buttons.scss`, etc.
- Do not scatter one-off styles in `main.scss` or inline `style=""` attributes.
- Use the existing style modules before writing new rules:
  - `_callout.scss` — callout components
  - `_form.scss` — form enhancements
  - `_card.scss` — card overrides
  - `_buttons.scss` — custom button styles
  - `_action-dropdown.scss` — action menus
  - `_poptart.scss` — toast notifications
  - `helpers.scss` — utility classes
  - `layout.scss` — page structure
  - `navigation.scss` — nav components
  - `_variables.scss` — theme variables and Bootstrap overrides

## JavaScript Conventions

- One module per file in `assets/app/js/`.
- **No jQuery** — use vanilla JavaScript and native DOM APIs.
- Bootstrap 5 JS components are accessed via their native API (e.g., `new bootstrap.Tooltip(el)`, `bootstrap.Modal.getInstance(el)`).
- No ES module imports — scripts are concatenated by Gulp.
- Use event delegation via `document.body.addEventListener` for dynamically added content.
- Use `fetch()` for AJAX requests (set `X-Requested-With: XMLHttpRequest` header for CakePHP compatibility).
- Use `URL` / `URLSearchParams` for query-string manipulation.
- Use `Intl.DateTimeFormat` and native `Date` for formatting — no moment.js.
- Escape user-supplied content before inserting into the DOM (`textContent` for text, dedicated `escapeHtml()`/`escapeAttr()` helpers for HTML strings).

### Key Libraries (bundled via Gulp)

| Library | Purpose | Notes |
|---------|---------|-------|
| Bootstrap 5.3 | Tooltip, Popover, Modal, Toast | Native JS API, no jQuery bridge |
| Popper.js 2 | Bootstrap positioning dependency | |
| TomSelect | Enhanced select dropdowns | Use `.enhanced-select` class; BS5 theme CSS included |
| Inputmask | Input masking (phone, date, etc.) | Vanilla mode: `Inputmask().mask(el)` |
| Font Awesome 7 | Icons | CSS + webfonts approach (not JS + SVG) |

### Global Objects

| Object | File | Purpose |
|--------|------|---------|
| `AppCore` | `app-core.js` | Tooltips, popovers, masks, enhanced selects initialization |
| `AjaxBind` | `ajax-pagination.js` | Re-init UI after AJAX content load |
| `AjaxPagination` | `ajax-pagination.js` | AJAX pagination and search |
| `ModalConfirm` | `modal-confirm.js` | Confirmation modals for postLink/link helpers |
| `PopTart` | `poptart.js` | Toast notifications (`PopTart.success()`, `.error()`, etc.) |
| `FormatTime` | `format-time.js` | UTC → local time conversion |
| `SessionMonitor` | `session-monitor.js` | Session timeout warnings and re-login |
