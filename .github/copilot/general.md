# AI Coding Instructions

## System Overview
This is a CakePHP 5 application skeleton from Willetts Technology, designed as a universal starting point for new projects. It includes Ansible-provisioned Multipass VMs for local development via Innkeeper.

> **Project status:** Application skeleton / starting template. No application-specific models, controllers, or database schema exist yet. Code generation (baking) and new feature work will build on this skeleton.

### Tech Stack
- **CakePHP 5.3** — PHP 8.4+
- **MySQL 8.4+** — database
- **Nginx** — web server with PHP-FPM
- **Ubuntu 24.04 / 26.04** — VM guest OS
- **Bootstrap 5.3** — via [ButterCream](https://github.com/QueenCityCodeFactory/butter-cream) plugin
- **Vanilla JS** — no jQuery; use native DOM APIs, fetch, Bootstrap 5 JS API
- **TomSelect** — enhanced select dropdowns (replaces Select2)
- **Font Awesome 7** — icons (CSS + webfonts)
- **Gulp 5** — SCSS/JS build pipeline
- **Innkeeper 3.2** — Multipass VM management CLI
- **Ansible** — VM provisioning

## Code Conventions

- **Standards** — Follow PSR-12 alongside CakePHP's coding standard. Run `composer cs-check` / `composer cs-fix`.
- **Naming** — Prefer fully descriptive names for variables, properties, tables, and columns. Avoid abbreviations. Database objects should honor CakePHP naming conventions to preserve ORM magic.
- **Whitespace & Indentation** — Spaces only, never tabs. Match existing indentation:
  - PHP: 4 spaces
  - YAML (Ansible): 2 spaces
  - SCSS/CSS/JS/HTML: 2 spaces (check file first)
  - Remove trailing whitespace. End files with a single newline.
- **Framework Utilities** — Use CakePHP helpers and utilities (`Hash`, `Collection`, `DateTime`, behaviors) before raw PHP equivalents.

## Architecture Patterns

### Application Structure
This is a standard CakePHP 5 application (not plugin-based). Application code lives in:
- `src/Controller/` — request handling
- `src/Model/Table/` — ORM table classes
- `src/Model/Entity/` — entity classes
- `src/Model/Behavior/` — reusable model behaviors
- `src/Enum/` — PHP 8.4 native backed enums
- `src/View/` — view classes and helpers
- `src/Middleware/` — HTTP middleware
- `templates/` — view templates (.php files)
- `config/` — configuration, routes, migrations

### CakePHP 5 Patterns
```php
// Entities: typed properties and virtual fields
class Example extends Entity
{
    protected array $_virtual = ['display_name'];

    protected function _getDisplayName(): string
    {
        return $this->name . ' — ' . $this->created->format('M j, Y');
    }
}

// Tables: validation, finders, behaviors
class ExamplesTable extends Table
{
    public function initialize(array $config): void
    {
        parent::initialize($config);
        $this->setTable('examples');
        $this->setDisplayField('name');
        $this->setPrimaryKey('id');
        $this->addBehavior('Timestamp');
    }

    public function validationDefault(Validator $validator): Validator
    {
        $validator->scalar('name')->requirePresence('name', 'create');
        return $validator;
    }
}
```

### Database Schema Conventions
- **Auto-increment integers** for primary keys (CakePHP 5 default)
- **`created` / `modified`** timestamps on all tables (use Timestamp behavior)
- **Nullable columns** require explicit `'null' => true, 'default' => null` in migrations
- **Snake_case** for table names and column names
- **Migrations must extend `Migrations\BaseMigration`** — never `AbstractMigration` (see [migrations guide](migrations.md))

### Enums
Use PHP 8.4 native backed enums in `src/Enum/`. All enums should implement `LabeledEnum` and use the `HasLabeledOptionsTrait` trait:

```php
use App\Enum\LabeledEnum;
use App\Enum\HasLabeledOptionsTrait;

enum Priority: string implements LabeledEnum
{
    use HasLabeledOptionsTrait;

    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
    case Critical = 'critical';

    public function label(): string
    {
        return match ($this) {
            self::Low => 'Low',
            self::Medium => 'Medium',
            self::High => 'High',
            self::Critical => 'Critical',
        };
    }
}
```

**Usage patterns:**
- **Form selects:** `$this->Form->control('priority', ['options' => Priority::options()])` — returns `[value => label]`
- **Validation:** `->inList(Priority::values())` — returns flat array of values
- **Display:** `Priority::from($value)->label()` — human-readable label
- **Badge colors:** Enums like `Priority` and `Status` include a `color()` method returning Bootstrap color names

**Existing enums:** `Priority`, `Status`, `UsState`, `CanadianProvince`

## Development Workflows

### Running Commands
```bash
# Use innkeeper exec for all VM commands
innkeeper exec composer install
innkeeper exec npm install
innkeeper exec gulp
innkeeper exec bin/cake migrations migrate
innkeeper exec vendor/bin/phpunit

# Interactive shell when needed
innkeeper ssh
```

### Database Operations
```bash
innkeeper exec bin/cake migrations migrate        # run pending migrations
innkeeper exec bin/cake migrations status          # check status
innkeeper exec bin/cake migrations rollback        # rollback last migration
innkeeper exec "bin/cake bake migration CreateExamples"  # generate migration
```

### Frontend Build
```bash
innkeeper exec gulp    # compile SCSS + bundle JS + install fonts
```

### Testing & Quality
```bash
innkeeper exec vendor/bin/phpunit    # run tests
innkeeper exec "composer cs-check"   # check coding standards
innkeeper exec "composer cs-fix"     # auto-fix standards
```

### Baking (Code Generation)
```bash
innkeeper exec "bin/cake bake model Examples"
innkeeper exec "bin/cake bake controller Examples"
innkeeper exec "bin/cake bake template Examples"
```

## Frontend Guidelines

- Use **Bootstrap 5** classes and patterns — do not introduce Bootstrap 3 or 4 markup.
- The ButterCream plugin provides Bootstrap 5 form helpers for CakePHP templates.
- Edit source files in `assets/app/scss/` and `assets/app/js/`, never `webroot/` directly.
- Run `innkeeper exec gulp` after any SCSS or JS changes.
- Check `assets/app/scss/helpers.scss` for existing utility classes before adding custom CSS.

## Common Anti-Patterns to Avoid

### DON'T: Run Build Tools on macOS
```bash
# WRONG — will fail or create incompatible artifacts
gulp
npm run build
composer install

# RIGHT — always run in the VM
innkeeper exec gulp
innkeeper exec "composer install"
```

### DON'T: Skip Migrations for Schema Changes
```bash
# WRONG
mysql> ALTER TABLE examples ADD COLUMN price DECIMAL(10,2);

# RIGHT
innkeeper exec "bin/cake bake migration AddPriceToExamples"
# Edit the migration file, then:
innkeeper exec bin/cake migrations migrate
```

### DON'T: Create Migration Bloat During Development
```bash
# WRONG — multiple uncommitted migrations for the same feature
20260401120000_CreateExamples.php
20260401130000_AddMoreExampleColumns.php
20260401140000_FixExampleColumnType.php

# RIGHT — roll back, consolidate, re-run
innkeeper exec bin/cake migrations rollback
# Edit the single migration file
innkeeper exec bin/cake migrations migrate
```

### DON'T: Edit Compiled Assets
```bash
# WRONG — editing webroot files directly
vim webroot/css/app.css

# RIGHT — edit sources and rebuild
vim assets/app/scss/_buttons.scss
innkeeper exec gulp
innkeeper sync from-vm
```

### DON'T: Hard-Code Database Credentials
```php
// WRONG
$connection = ['host' => '192.168.64.1', 'password' => 'secret'];

// RIGHT — credentials come from config/app_local.php
// Read them dynamically when needed for CLI commands
```
