# Willetts Technology CakePHP Application Skeleton

![Build Status](https://github.com/cakephp/app/actions/workflows/ci.yml/badge.svg?branch=5.x)
[![PHPStan](https://img.shields.io/badge/PHPStan-level%208-brightgreen.svg?style=flat-square)](https://github.com/phpstan/phpstan)

A custom application skeleton for creating applications with [CakePHP](https://cakephp.org) 5.x, enhanced with Willetts Technology's development tools and customizations.

This skeleton builds upon [cakephp/app](https://github.com/cakephp/app) with additional features for streamlined development and deployment.

## Custom Features & Enhancements

### ButterCream Plugin
This skeleton includes [QueenCityCodeFactory/butter-cream](https://github.com/QueenCityCodeFactory/butter-cream), a custom CakePHP plugin providing Bootstrap 5 integration and theme components.

### Development Environment
- **Ansible provisioning** - Complete Ansible playbooks and roles for automated development environment setup
- **Pre-configured services**:
  - PHP 8.2+ with FPM
  - Nginx web server with SSL support
  - MySQL database
  - Memcached
  - Mailpit (email testing)
  - Node.js with NVM
  - wkhtmltopdf for PDF generation
  - Chrony for time synchronization

### Frontend Asset Pipeline
- **Gulp-based build system** - Automated SCSS compilation, JavaScript bundling, and asset optimization
- **Modern frontend stack**:
  - Bootstrap 5.3+
  - Font Awesome 6.5+
  - jQuery 3.7+
  - Select2 with Bootstrap 5 theme
  - Moment.js with timezone support
  - Inputmask

### Custom JavaScript Modules
Pre-built JavaScript utilities in `assets/app/js/`:
- `ajax-pagination.js` - AJAX-based pagination
- `app-core.js` - Core application JavaScript
- `clear-search-form.js` - Search form reset functionality
- `clipboard.js` - Clipboard operations
- `format-time.js` - Time formatting utilities
- `modal-confirm.js` - Confirmation modals
- `pagination-limit.js` - Pagination limit controls
- `poptart.js` - Toast notifications
- `session-monitor.js` - Session timeout monitoring
- `tmp-file-upload.js` - Temporary file upload handling

### Custom SCSS Components
Organized styles in `assets/app/scss/`:
- Action dropdowns
- Button groups and custom buttons
- Callouts and cards
- Form enhancements
- Navigation components
- PDF-specific styles
- Responsive layout system
- Template-specific styles

### Additional Configuration
- US States configuration file (`config/states.php`)
- Enhanced .gitignore for development environment
- Self-signed certificate generation script
- Crontab management
- Development-specific SSL configuration

The framework source code can be found here: [cakephp/cakephp](https://github.com/cakephp/cakephp).

## Installation

### Quick Start (Standard CakePHP)

1. Download [Composer](https://getcomposer.org/doc/00-intro.md) or update `composer self-update`.
2. Clone this repository or use it as a template.

### Development Environment Setup (Ansible)

This skeleton includes a complete Ansible provisioning system for setting up a standardized development environment:

1. Ensure you have Ansible installed on your host machine
2. Configure your inventory in `ansible/inventories/development/`
3. Run the Ansible playbook:
   ```bash
   ansible-playbook ansible/playbooks/development.yml
   ```

The Ansible setup will configure all necessary services, install dependencies, and prepare your development environment.

### Frontend Assets

After installation, build the frontend assets:

```bash
npm install
npm run build
```

This will compile SCSS, bundle JavaScript, and copy necessary assets to the webroot.

### Running the Application

You can now either use your machine's webserver to view the default home page, or start
up the built-in webserver with:

```bash
bin/cake server -p 8765
```

Then visit `http://localhost:8765` to see the welcome page.

## Development

### Building Assets

The project uses Gulp for asset compilation. Available commands:

```bash
npm run build       # Build all assets (SCSS, JS, fonts)
```

Gulp tasks handle:
- SCSS compilation with autoprefixing and minification
- JavaScript linting, concatenation, and uglification
- Source map generation
- Font file installation
- Asset watching for development

### Cron Jobs

Crontab management is handled through Ansible. Application-specific cron jobs should be placed in `cron.d/` directory.

## Differences from Upstream CakePHP/app

This skeleton maintains compatibility with upstream CakePHP/app while adding:

1. **Ansible Infrastructure** - Complete development environment automation
2. **Frontend Tooling** - Gulp build system with modern JavaScript/CSS pipeline
3. **ButterCream Plugin** - Bootstrap 5 integration and UI components
4. **Custom Components** - Reusable JavaScript modules and SCSS components
5. **Enhanced Configuration** - Additional config files for common use cases (states, etc.)
6. **Development Tools** - SSL certificate generation, improved .gitignore
7. **Service Integration** - Pre-configured Mailpit, Memcached, wkhtmltopdf

To update from upstream:
```bash
git fetch upstream 5.x
git merge upstream/5.x
```

Review and resolve any conflicts, particularly in:
- `composer.json` (dependencies)
- `config/` files (configuration)
- `templates/layout/default.php` (layout customizations)

## Configuration

Read and edit the environment specific `config/app_local.php` and set up the
`'Datasources'` and any other configuration relevant for your application.
Other environment agnostic settings can be changed in `config/app.php`.

### Additional Configuration Files

- `config/states.php` - US state listings for dropdown/select menus
- `development.openssl.cnf` - OpenSSL configuration for development SSL certificates
- `ansible.cfg` - Ansible configuration for development provisioning

## Layout

This skeleton uses [Bootstrap 5](https://getbootstrap.com/) instead of the default Milligram framework. Bootstrap is integrated via the ButterCream plugin and custom SCSS components in `assets/app/scss/`.

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

- **PHP**: 8.2 or higher
- **CakePHP**: 5.3+
- **Node.js**: 14+ (for asset compilation)
- **Composer**: Latest version

## Credits

- Built on [CakePHP](https://cakephp.org)
- Customized by [Willetts Technology, Inc.](https://www.willettstech.com)
- Maintained by [QueenCityCodeFactory](https://github.com/QueenCityCodeFactory)
