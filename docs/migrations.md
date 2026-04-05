# Migrations

This project uses [CakePHP Migrations](https://book.cakephp.org/migrations/4/en/index.html) (powered by Phinx) for all database schema changes.

## Basics

All migrations live in `config/Migrations/`. File naming: `YYYYMMDDHHMMSS_DescriptiveName.php`.

```bash
# Check current status
innkeeper exec bin/cake migrations status

# Run all pending migrations
innkeeper exec bin/cake migrations migrate

# Rollback the last migration
innkeeper exec bin/cake migrations rollback

# Rollback to a specific version
innkeeper exec "bin/cake migrations rollback -t <TIMESTAMP>"
```

## Creating a Migration

```bash
# Generate a migration file
innkeeper exec "bin/cake bake migration CreateExamples"
innkeeper exec "bin/cake bake migration AddPriceToExamples"
```

Edit the generated file in `config/Migrations/`, then run it:

```bash
innkeeper exec bin/cake migrations migrate
```

### Naming Conventions

Migration class names should clearly describe the change:
- `CreateExamples` — new table
- `AddPriceToExamples` — adding column(s)
- `RemoveDeprecatedColumnsFromExamples` — removing columns
- `AddIndexToExamplesCreatedDate` — adding an index

## Consolidation During Development

**This is the most important rule.** When working on a feature that hasn't been committed yet, do **not** keep adding new migration files for incremental changes to the same tables. Instead: roll back, edit the existing migration, and re-run.

### Why

- Each migration is permanent once committed. During development, they are disposable.
- Multiple small migrations touching the same tables create bloat and a confusing history.
- One clean migration per logical feature is easier to review and reason about.

### Workflow

You create `20260401120000_CreateExamples.php`. Later you realize you need two more columns.

**Wrong — adding a second migration:**
```
20260401120000_CreateExamples.php          ← creates table
20260401150000_AddMoreColumnsToExamples.php ← adds 2 columns
```

**Right — consolidate into one:**
```bash
# 1. Roll back
innkeeper exec "bin/cake migrations rollback -t <timestamp_before_first>"

# 2. Edit the original migration to include all columns

# 3. Re-run
innkeeper exec bin/cake migrations migrate
```

### When Separate Migrations Are Appropriate

- The first migration has already been **committed / merged / deployed** — never edit a shipped migration.
- The changes are **logically unrelated** (e.g., one for Users, another for Products).
- You are intentionally splitting a large change for **incremental deployment**.

## Cleaning Up Ghost Phinxlog Entries

A "ghost" entry appears when a migration file is deleted **without rolling it back first**. `bin/cake migrations status` shows it as `** MISSING **`.

### Prevention

Always roll back before deleting:
1. `innkeeper exec bin/cake migrations rollback`
2. Delete or edit the migration file
3. Re-run if needed

### Cleanup

If a ghost does occur, remove the row from the `phinxlog` table:

```bash
mysql -h 127.0.0.1 -P <PORT> -u <USER> -p<PASS> <DB> \
  -e "DELETE FROM phinxlog WHERE migration_name = 'GhostMigrationClassName';"
```

(Adjust connection details to match your `config/app_local.php`.)

## Summary Rules

1. **One migration per logical feature** during development — consolidate before committing.
2. **Roll back → edit → re-run** for uncommitted migrations.
3. **Never edit a committed / deployed migration.**
4. **Always roll back before deleting** a migration file to avoid ghost phinxlog entries.
5. **Name migrations descriptively** — the class name should summarize the change.
