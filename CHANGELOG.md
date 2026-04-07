# Changelog

All notable changes to the Willetts Technology CakePHP Application Skeleton will be documented in this file.

## [Unreleased] — since 5.3.1

### Added
- Example migration (`CreateExampleTables`) demonstrating project-management domain schema
- Example seed (`ExampleSeed`) for populating test data
- Innkeeper-based development environment replacing Vagrant
- Self-signed SSL certificate generation script
- Ansible roles for Chrony, Mailpit, and Memcached
- Cron template system for managing scheduled tasks
- AI/Copilot coding instructions (`.github/copilot/`)
- Developer documentation (`docs/`) for database, frontend assets, innkeeper, and migrations
- **Enum system** — PHP 8.4 native backed enums with `LabeledEnum` interface and `HasLabeledOptionsTrait` trait (`src/Enum/`)
  - `Priority` enum (low, medium, high, critical) with `color()` for Bootstrap badges
  - `Status` enum (draft, active, inactive, archived) with `color()` for Bootstrap badges
  - `UsState` enum (all 50 states + DC)
  - `CanadianProvince` enum (all 13 provinces/territories)
- New JS modules: `bulk-select.js` (table row select-all), `dark-mode.js` (Bootstrap 5.3 theme toggle), `dependent-selects.js` (cascading AJAX dropdowns)
- `.jshintrc` configuration for JS linting

### Changed
- Modernized provisioning to use Innkeeper (Multipass) instead of Vagrant
- Updated Ansible roles and playbooks for Ubuntu 24.04/26.04
- Switched PDF generation away from WkHtmlToPdf
- Updated to Font Awesome 7 CSS classes
- Updated Bootstrap 5 JavaScript for compatibility
- Bumped `ramsey/composer-install` GitHub Action from 3 to 4
- Bumped CakePHP Migrations plugin to 5.x (`Migrations\BaseMigration`)
- Updated CakePHP version constraint in `composer.json`
- Dropped PHP 8.2 from CI matrix
- Updated README with full tech stack documentation
- Customized `app_name` configuration
- TomSelect `enhancedSelects()` now uses `select.enhanced-select` selector to avoid re-initializing TomSelect wrapper `<div>`s that inherit the `enhanced-select` class
- TomSelect init supports `remove_button` plugin for multi-select elements
- Silenced Sass deprecation warnings in Gulp build (`legacy-js-api`, `import`, `if-function`, `global-builtin`, `color-functions`)

### Fixed
- Static return type declarations
- Pagination issue
- Use statement corrections
- Test fixes
- Deprecation warnings
- **TomSelect `trim` error** — AJAX-loaded content re-running `AppCore.init()` would match TomSelect wrapper `<div>` elements (which inherit the `enhanced-select` class from the original `<select>`), causing `init_textbox` to call `.trim()` on `undefined` (`div.value`). Fixed by scoping the selector to `select.enhanced-select:not(.tomselected)`.
- **AJAX init errors shown as PopTart toasts** — JavaScript errors thrown during `AppCore.init()` after AJAX content injection were caught by the Promise `.catch()` and displayed as error toasts instead of appearing in the console. Wrapped `AppCore.init()` in try/catch inside `fetchAndInject` so init errors log to `console.error` with full stack traces.
- `session-monitor.js` replaced optional chaining (`?.`) with explicit null checks for broader browser compatibility

### Removed
- Legacy code and unused assets
- Old Vagrant provisioning configuration
- Deprecated cron files (replaced by cron template system)
- Legacy CSS files (`fonts.css`, `home.css`, `milligram.min.css`, `normalize.min.css`)
- `config/states.php` — replaced by `src/Enum/UsState.php`

### Security
- Moved Host Header Injection check to dedicated middleware

## [5.3.1] — 2026-02-12

### Changed
- Updated dependency constraints
- Moved Host Header Injection check to middleware
- Updated CakePHP version constraint in `composer.json`
- Bumped migrations to 5.x
- Fixed wrong domain used as example
- Added generic type annotation to `AppView`

## [5.3.0] — 2026-01-09

Initial release based on CakePHP 5.3 with Willetts Technology customizations.
