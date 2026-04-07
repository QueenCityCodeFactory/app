# Frontend Assets

The project uses a **Gulp 5** pipeline to compile SCSS, bundle JavaScript, and install font files. Source assets live in `assets/app/` and compile to `webroot/`.

## Build Command

```bash
innkeeper exec gulp
```

This is the canonical command. The `npm run build` script also invokes Gulp. Always run inside the VM.

### When to Run Gulp

- After editing any `.scss` file in `assets/app/scss/`
- After editing any `.js` file in `assets/app/js/`
- After updating Node dependencies that ship CSS or JS (Bootstrap, Font Awesome, TomSelect, etc.)
- After a fresh `npm install`

## Pipeline Overview

```
assets/app/scss/main.scss  →  webroot/css/app.css + app.min.css
assets/app/js/*.js         →  webroot/js/app.js + app.min.js
node_modules/ fonts        →  webroot/font/
```

| Task | What It Does |
|------|-------------|
| **buildStyles** | Compiles SCSS, applies autoprefixer, merges with vendor CSS (TomSelect, FA), outputs `app.css` + minified `app.min.css` |
| **buildScripts** | Lints custom JS via JSHint, concatenates vendor + app scripts, outputs `app.js` + minified `app.min.js` via terser |
| **installFonts** | Copies Font Awesome webfont files to `webroot/font/` |

## Source Structure

### SCSS (`assets/app/scss/`)

| File / Partial | Purpose |
|---------------|---------|
| `main.scss` | Entry point — imports Bootstrap, all partials |
| `_variables.scss` | Theme variables (colors, spacing, Bootstrap overrides) |
| `helpers.scss` | Utility classes |
| `layout.scss` | Page layout and sticky footer |
| `navigation.scss` | Nav bar and sidebar styles |
| `_form.scss` | Form control enhancements |
| `_buttons.scss` | Custom button styles |
| `_card.scss` | Card component overrides |
| `_callout.scss` | Bootstrap-style callout component |
| `_action-dropdown.scss` | Action menu dropdowns |
| `_poptart.scss` | Toast notification styles |
| `_filters.scss` | Filter drawer component |
| `_animations.scss` | CSS animations |
| `_map-overrides.scss` | Sass map overrides for Bootstrap |
| `_button-group.scss` | Button group styles |
| `error.scss` | Error page styles |
| `login.scss` | Login page styles |
| `pdf.scss` | PDF-specific print styles |
| `template/` | Template-specific SCSS partials |

### JavaScript (`assets/app/js/`)

| Module | Purpose |
|--------|---------|
| `ajax-pagination.js` | AJAX-powered pagination, search forms, and page-limit selects |
| `app-core.js` | Core initialization (tooltips, popovers, masks, TomSelect) |
| `app-util.js` | Shared utility functions (escapeHtml, escapeAttr) |
| `bulk-select.js` | Table row select-all / bulk action checkboxes |
| `clipboard.js` | Clipboard copy functionality |
| `dark-mode.js` | Bootstrap 5.3 light/dark/auto theme toggle |
| `dependent-selects.js` | Cascading AJAX-powered dependent dropdowns |
| `format-time.js` | UTC→local time formatting via Intl.DateTimeFormat |
| `modal-confirm.js` | Bootstrap 5 confirmation modal dialogs |
| `poptart.js` | Toast notifications |
| `session-monitor.js` | Session timeout monitoring and re-login |
| `tmp-file-upload.js` | Temporary file upload handling |

## Vendor Libraries (via npm)

| Package | Version | Purpose | Docs |
|---------|---------|---------|------|
| [Bootstrap](https://getbootstrap.com/docs/5.3/) | 5.3.x | UI framework | [Docs](https://getbootstrap.com/docs/5.3/) |
| [Font Awesome](https://fontawesome.com/) | 7.x | Icons (CSS + webfonts) | [Icons](https://fontawesome.com/icons) |
| [TomSelect](https://tom-select.js.org/) | 2.x | Enhanced select dropdowns | [Docs](https://tom-select.js.org/) |
| [Inputmask](https://robinherbots.github.io/Inputmask/) | 5.x | Input masking (phone, date, etc.) | [Docs](https://robinherbots.github.io/Inputmask/) |
| [Popper.js](https://popper.js.org/) | 2.x | Tooltip/popover positioning (Bootstrap dep) | [Docs](https://popper.js.org/) |

### CakePHP ButterCream Plugin

[QueenCityCodeFactory/butter-cream](https://github.com/QueenCityCodeFactory/butter-cream) provides Bootstrap 5 form helpers, layout templates, and UI components for CakePHP 5. It is the primary bridge between CakePHP's `FormHelper` and Bootstrap 5 markup.

## Committing Compiled Assets

The compiled files in `webroot/css/`, `webroot/js/`, and `webroot/font/` are committed to the repository. After running Gulp:

```bash
innkeeper sync from-vm                         # pull compiled files to host
git add webroot/css webroot/js webroot/font
git commit -m "Rebuild frontend assets"
```

> **Never edit files in `webroot/css/` or `webroot/js/` directly.** Always edit sources in `assets/app/` and recompile.

## Coding Guidelines

- Use **Bootstrap 5** classes and patterns — don't introduce custom CSS when a Bootstrap utility exists.
- Check `helpers.scss` for existing utility classes before adding inline styles or new selectors.
- Keep SCSS specificity low — prefer classes over nested selectors.
- New styles should go in the appropriate partial (e.g., form styles in `_form.scss`, not `main.scss`).
- Stick to the existing JavaScript module pattern — one file per feature in `assets/app/js/`.
