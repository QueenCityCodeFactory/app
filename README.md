# Willetts Technology CakePHP Application Skeleton

![Build Status](https://github.com/cakephp/app/actions/workflows/ci.yml/badge.svg?branch=5.x)
[![PHPStan](https://img.shields.io/badge/PHPStan-level%208-brightgreen.svg?style=flat-square)](https://github.com/phpstan/phpstan)

A custom application skeleton for creating applications with [CakePHP](https://cakephp.org) 5.x, enhanced with Willetts Technology's development tools and customizations.

This skeleton builds upon [cakephp/app](https://github.com/cakephp/app) with additional features for streamlined development and deployment.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [CakePHP 5.3](https://book.cakephp.org/5/en/index.html) (PHP 8.4+) |
| **Database** | MySQL 8.4+ |
| **Web Server** | Nginx with PHP-FPM |
| **Frontend** | [Bootstrap 5.3](https://getbootstrap.com/docs/5.3/) via [ButterCream](https://github.com/QueenCityCodeFactory/butter-cream) plugin |
| **Icons** | [Font Awesome 7](https://fontawesome.com/) (CSS + webfonts) |
| **JS Libraries** | Vanilla JS (no jQuery), TomSelect, Inputmask |
| **Build Tool** | [Gulp 5](https://gulpjs.com/) (SCSS compilation, JS bundling, font installation) |
| **Dev VM** | [Multipass](https://multipass.run/) via [Innkeeper](https://git.willettstech.com/tools/innkeeper) |
| **Provisioning** | Ansible playbooks (`ansible/playbooks/development.yml`) |
| **Dev Services** | Memcached, Mailpit (email testing), Chrony, SSL (self-signed) |

## Custom Features & Enhancements

### ButterCream Plugin
This skeleton includes [QueenCityCodeFactory/butter-cream](https://github.com/QueenCityCodeFactory/butter-cream), a custom CakePHP plugin providing Bootstrap 5 integration and theme components.

### Development Environment
- **Innkeeper / Ansible provisioning** - Complete playbooks and roles for automated development environment setup
- **Pre-configured services**: PHP 8.4+ with FPM, Nginx with SSL, MySQL, Memcached, Mailpit, Node.js (NVM), Chrony

### Frontend Asset Pipeline
- **Gulp 5 build system** - Automated SCSS compilation, JavaScript bundling, and asset optimization
- **Modern frontend stack**: Bootstrap 5.3+, Font Awesome 7, TomSelect, Inputmask
- **No jQuery** - All JavaScript is vanilla JS using native DOM APIs and Bootstrap 5 APIs

### Custom JavaScript Modules
Pre-built JavaScript utilities in `assets/app/js/`:
- `ajax-pagination.js` - AJAX pagination, search forms, clear buttons, page-limit selects
- `app-core.js` - Core initialization (tooltips, popovers, masks, TomSelect, FormatTime)
- `app-util.js` - Shared utilities (HTML/attribute escaping)
- `bulk-select.js` - Table row select-all / bulk action checkboxes
- `clipboard.js` - Clipboard API wrapper
- `dark-mode.js` - Bootstrap 5.3 light/dark/auto theme toggle
- `dependent-selects.js` - Cascading AJAX-powered dependent dropdowns
- `format-time.js` - UTC-to-local time conversion using `Intl.DateTimeFormat`
- `modal-confirm.js` - Bootstrap 5 confirmation modals for CakePHP helpers
- `poptart.js` - Bootstrap 5 toast notification system
- `session-monitor.js` - Session timeout monitoring with in-page re-login
- `tmp-file-upload.js` - Temporary file upload with progress bars

### Enums (`src/Enum/`)
PHP 8.4 native backed enums with a shared `LabeledEnum` interface and `HasLabeledOptions` trait:
- `Priority` - low, medium, high, critical (with Bootstrap badge colors)
- `Status` - draft, active, inactive, archived (with Bootstrap badge colors)
- `UsState` - All 50 US states + DC
- `CanadianProvince` - All 13 Canadian provinces and territories

Enums provide `options()` for Form select helpers, `values()` for `inList()` validation, and `label()`/`color()` for display.

### Custom SCSS Components
Organized styles in `assets/app/scss/`:
- Action dropdowns, button groups, custom buttons (xs sizes, square buttons)
- Callouts, cards, form enhancements, navigation
- Filter drawer, responsive layout, PDF-specific styles
- Template-specific styles

### Additional Configuration
- Enhanced .gitignore for development environment
- Crontab management
- Development-specific SSL configuration

The framework source code can be found here: [cakephp/cakephp](https://github.com/cakephp/cakephp).

## Quick Start

See [docs/development-environment.md](docs/development-environment.md) for full setup instructions.

1. Clone this repository and configure:
   ```bash
   cp config/app_local.example.php config/app_local.php
   ```
2. Launch the development environment:
   ```bash
   innkeeper up
   ```
3. Install dependencies and build assets:
   ```bash
   innkeeper exec composer install
   innkeeper exec npm install
   innkeeper exec gulp
   ```

### Frontend Assets

Build with Gulp:

```bash
innkeeper exec gulp            # Build all (lint, compile, fonts, cache-bust)
innkeeper exec gulp styles     # Rebuild CSS only
innkeeper exec gulp scripts    # Lint + rebuild JS only
innkeeper exec gulp fonts      # Reinstall font files
innkeeper exec gulp watch      # Build then watch for changes
```

## Documentation

- [docs/development-environment.md](docs/development-environment.md) - Local setup walkthrough
- [docs/database.md](docs/database.md) - Database configuration (Docker / VM MySQL)
- [docs/frontend-assets.md](docs/frontend-assets.md) - Gulp pipeline, SCSS, JS, vendor libraries
- [docs/innkeeper.md](docs/innkeeper.md) - Innkeeper CLI reference
- [docs/migrations.md](docs/migrations.md) - Migration creation, consolidation, cleanup
- [CHANGELOG.md](CHANGELOG.md) - Version history and notable changes

## Configuration

Read and edit the environment specific `config/app_local.php` and set up the
`'Datasources'` and any other configuration relevant for your application.
Other environment agnostic settings can be changed in `config/app.php`.

The layout includes:
- Responsive navigation
- Custom button styles and components
- Card and callout components
- Form enhancements
- PDF-optimized styles
- Mobile-responsive design

## Maintenance

### Updating

Since this skeleton includes custom modifications on top of the upstream CakePHP/app,
updates should be done carefully:

1. Fetch the latest upstream changes:
   ```bash
   git fetch upstream 5.x
   ```

2. Review the changes before merging:
   ```bash
   git log HEAD..upstream/5.x
   ```

3. Merge upstream changes:
   ```bash
   git merge upstream/5.x
   ```

4. Test thoroughly, particularly:
   - Custom controller and view modifications
   - ButterCream plugin compatibility
   - Asset compilation
   - Ansible playbooks

### Dependencies

- **PHP**: 8.4 or higher
- **CakePHP**: 5.3+
- **Node.js**: 20+ (managed via NVM in the VM)
- **Composer**: Latest version

## Credits

- Built on [CakePHP](https://cakephp.org)
- Customized by [Willetts Technology, Inc.](https://www.willettstech.com)
- Maintained by [QueenCityCodeFactory](https://github.com/QueenCityCodeFactory)
