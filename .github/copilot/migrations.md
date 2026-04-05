# CakePHP Phinx Migrations

Guidelines for creating and managing database migrations in this project.

## Basics

- All migrations live in `config/Migrations/`.
- File naming: `YYYYMMDDHHMMSS_DescriptiveName.php` (timestamp prefix + PascalCase class).
- Run migrations inside the VM:
  ```bash
  innkeeper exec bin/cake migrations migrate
  ```
- Check status: `innkeeper exec bin/cake migrations status`
- Rollback last: `innkeeper exec bin/cake migrations rollback`
- Rollback to specific: `innkeeper exec "bin/cake migrations rollback -t <TIMESTAMP>"`

## Consolidate During Development — Don't Create Migration Bloat

**This is the most important rule for AI assistants.**

When working on a feature that hasn't been committed yet, **do not keep adding new migrations** for incremental changes to the same tables. Instead:

1. **Roll back** the in-progress migration(s).
2. **Edit or replace** the migration file to include all changes in one file.
3. **Re-run** the migration.

### Why

- Each migration is permanent once committed and deployed. During development, they are disposable.
- Multiple small migrations that touch the same tables create bloat.
- A single, well-named migration per logical feature is easier to review, roll back, and reason about.

### Workflow Example

You create `20260401120000_CreateExamples.php` that creates a table. Later you realize two more columns are needed.

**Wrong** — creating a second migration:
```
20260401120000_CreateExamples.php           ← creates table
20260401150000_AddMoreExampleColumns.php    ← adds 2 columns
```

**Right** — consolidate into one:
```bash
# 1. Roll back
innkeeper exec "bin/cake migrations rollback -t <timestamp_before_first>"

# 2. Edit the original migration to include everything

# 3. Re-run
innkeeper exec bin/cake migrations migrate
```

### When to Create Separate Migrations

- The first migration has been **committed / merged / deployed** — never edit a shipped migration.
- The changes are **logically unrelated** (e.g. one for Users, another for Products).

## Cleaning Up Ghost Phinxlog Entries

Ghost entries happen when a migration file is deleted **without rolling it back first**. `bin/cake migrations status` shows it as `** MISSING **`.

**Prevention:** Always roll back before deleting:
1. `innkeeper exec bin/cake migrations rollback`
2. Delete or edit the migration file
3. Re-run if needed

**Cleanup:** Remove the ghost row from phinxlog:
```bash
mysql -h 127.0.0.1 -P <PORT> -u <USER> -p<PASS> <DB> \
  -e "DELETE FROM phinxlog WHERE migration_name = '<ClassName>';"
```

Read credentials from `config/app_local.php` — see [innkeeper.md](innkeeper.md#database-connection-patterns).

## AI / Copilot Rules Summary

1. **One migration per logical feature** during development. Consolidate before committing.
2. **Ask before creating a new migration** if one already exists for the same feature.
3. **Ask the user before rolling back** — rollbacks alter the database.
4. **Always roll back before deleting** a migration file.
5. **Roll back → edit → re-run** is the preferred workflow for uncommitted migrations.
6. **Never edit a migration that has been committed or deployed.**
7. **Name migrations descriptively** (e.g. `CreateUserAccounts`, not `UpdateTables3`).
