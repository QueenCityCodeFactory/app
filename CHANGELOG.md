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

### Fixed
- Static return type declarations
- Pagination issue
- Use statement corrections
- Test fixes
- Deprecation warnings

### Removed
- Legacy code and unused assets
- Old Vagrant provisioning configuration
- Deprecated cron files (replaced by cron template system)
- Legacy CSS files (`fonts.css`, `home.css`, `milligram.min.css`, `normalize.min.css`)

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
