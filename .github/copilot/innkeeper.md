# Innkeeper VM Workflow

Use this guide when running commands for the local development environment. Development happens inside a Multipass VM managed by Innkeeper, so most tooling must execute in the guest.

> **No hard-coded values.** The VM name, database credentials, IP addresses, and database name all vary. Always discover them dynamically using the methods below.

## Discovering Runtime Values

| Value | How to discover |
|-------|----------------|
| **VM name** | `innkeeper status` |
| **VM IP** | `innkeeper ip` |
| **Host IP from VM** | Take the VM IP and replace the last octet with `.1` |
| **DB credentials** | Read `config/app_local.php` → `Datasources.default` |

## Running Commands on the VM

**Use `innkeeper exec` for all VM commands.** This runs the command inside the `SHADOW_DEST` path.

```bash
innkeeper exec gulp
innkeeper exec bin/cake migrations migrate
innkeeper exec composer install
innkeeper exec npm install
innkeeper exec vendor/bin/phpunit
```

For commands in a subdirectory:
```bash
innkeeper exec --dir plugins/MyPlugin npm run build
```

For commands with pipes or special characters, wrap in quotes:
```bash
innkeeper exec "tail -20 logs/error.log"
innkeeper exec "echo 'flush_all' | nc -N localhost 11211"
innkeeper exec "bin/cake migrations migrate -vvv"
```

> **Do not use `multipass exec` with long `bash -lc` strings.** `innkeeper exec` is the modern replacement — it handles the working directory and shell context automatically.

## What Runs Where

| macOS (Host) | VM (Guest via `innkeeper exec`) |
|-------------|-------------------------------|
| `git` commands | `composer install` / `update` |
| `innkeeper` / `multipass` | `npm install` / `update` |
| VS Code / file editing | `gulp` (asset compilation) |
| Docker management | `bin/cake` commands |
| `mysql` CLI (direct to Docker) | `vendor/bin/phpunit` |
| | Database migrations |

**Avoid** running composer, npm, gulp, or bin/cake on the host — they will fail or produce incompatible output.

## File Synchronization

- The Innkeeper file watcher automatically syncs host→VM when you save files.
- Use `innkeeper sync` to force a manual push.
- Use `innkeeper sync from-vm` to pull build artifacts (compiled CSS, JS, fonts) back to macOS.
- Excluded from sync: `node_modules`, `vendor`, `logs`, `tmp`, `.git`.

After building assets:
```bash
innkeeper exec gulp
innkeeper sync from-vm
git add webroot/css webroot/js webroot/font
```

## Database Connection Patterns

### Credentials

Always read from `config/app_local.php` → `Datasources.default`. Never hard-code values.

### From macOS (preferred for quick queries)

If using Docker MySQL on macOS:
```bash
mysql -h 127.0.0.1 -P <PORT> -u <USER> -p<PASS> <DB> -e "<QUERY>"
```

### From the VM

If the database is in Docker on macOS, use the `.1` gateway address:
```bash
innkeeper exec "mysql -h <HOST> -P <PORT> -u <USER> -p<PASS> <DB> -e '<QUERY>'"
```

If the database is in the VM:
```bash
innkeeper exec "mysql -u <USER> -p<PASS> <DB> -e '<QUERY>'"
```

### AI / Copilot Rules for Database Access

1. **Read credentials** from `config/app_local.php` before any `mysql` command.
2. **Discover the VM name** with `innkeeper status` before running commands.
3. **Prefer `mysql` on macOS** against `127.0.0.1` when using Docker MySQL.
4. **Use `-e "..."` for one-off queries** — avoid interactive sessions.
5. **Use CakePHP migrations** for schema changes — raw SQL only for inspecting data or debugging.

## Common Pitfalls

- **Running CLI tools on macOS**: They expect Linux paths and will fail on macOS.
- **Files not appearing in VM**: Run `innkeeper sync --force` or check `innkeeper watch status`.
