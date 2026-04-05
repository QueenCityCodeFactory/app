# Innkeeper Reference

[Innkeeper](https://git.willettstech.com/tools/innkeeper) (v3.2) is a CLI wrapper around Multipass that manages the development VM, file synchronization, Ansible provisioning, and host networking.

## Key Concepts

- **VM name:** Set in `.innkeeper.env`
- **Mount path:** Multipass SSHFS mount of the host project directory (read source for sync)
- **Shadow path:** rsync'd copy where PHP/Nginx/Node actually run (the runtime directory)
- **Local domain:** Configured via `ALIASES` in `.innkeeper.env` (SSL, resolved via `/etc/hosts`)

> **Always run application commands in the shadow directory**, never in the mount path. The mount has poor I/O performance for build tools.

## Command Reference

### Lifecycle

| Command | Description |
|---------|-------------|
| `innkeeper up` | Launch VM, provision if first run, start file watcher |
| `innkeeper suspend` | Stop VM gracefully, remove `/etc/hosts` entries |
| `innkeeper reload` | Restart VM (add `--provision` to re-run Ansible, `--tags TAG` to scope) |
| `innkeeper destroy` | Delete VM (add `--purge` to also remove `.innkeeper/` runtime files) |

### Provisioning

| Command | Description |
|---------|-------------|
| `innkeeper provision` | Run the Ansible playbook without restarting |
| `innkeeper provision --tags nginx` | Run only the `nginx` role |
| `innkeeper provision --tags "nginx,php"` | Run multiple roles |
| `innkeeper init` | Initialize a project with `.innkeeper.env` and templates |

### Running Commands on the VM

**`innkeeper exec`** is the primary way to run commands without opening an interactive shell:

```bash
innkeeper exec gulp                                   # run in SHADOW_DEST
innkeeper exec bin/cake migrations migrate            # CakePHP CLI
innkeeper exec composer install                       # install PHP deps
innkeeper exec npm install                            # install Node deps
innkeeper exec --dir plugins/MyPlugin npm run build   # run in a subdirectory
innkeeper exec "tail -20 logs/error.log"              # commands with pipes/quotes
innkeeper exec "echo 'flush_all' | nc -N localhost 11211"  # memcached flush
```

> `innkeeper run` is an alias for `innkeeper exec`.

**`innkeeper ssh`** opens an interactive shell when you need to run multiple commands.

### File Synchronization

| Command | Description |
|---------|-------------|
| `innkeeper sync` | Push files from host → VM |
| `innkeeper sync from-vm` | Pull files from VM → host |
| `innkeeper sync --force` | Full sync with checksums |
| `innkeeper sync --dry-run` | Preview what would change |
| `innkeeper sync --all` | Ignore rsync excludes (sync everything) |
| `innkeeper sync --path vendor` | Sync only a specific subdirectory |
| `innkeeper sync from-vm --dry-run` | Preview VM → host changes |
| `innkeeper sync from-vm vendor` | Pull only `vendor/` from VM |

**Excluded by default:** `node_modules`, `vendor`, `logs`, `tmp`, `.git` — these are managed inside the VM.

### File Watcher

| Command | Description |
|---------|-------------|
| `innkeeper watch start` | Start the background host→VM watcher |
| `innkeeper watch stop` | Stop the watcher |
| `innkeeper watch status` | Check watcher status |
| `innkeeper watch backend` | Show active backend (watchman or fswatch) |
| `innkeeper watch kill` | Kill rogue watch processes |
| `innkeeper watch kill-all` | Aggressively kill all watch processes |

> `innkeeper up` starts the watcher automatically. Use `innkeeper up --no-sync` to skip it.

**watchman** (recommended) is more stable than fswatch on macOS. Install: `brew install watchman`.

### Reverse Watcher (VM → Host)

For automatically pulling build artifacts (compiled CSS/JS) from the VM:

| Command | Description |
|---------|-------------|
| `innkeeper reverse-watch start` | Start reverse watcher |
| `innkeeper reverse-watch stop` | Stop reverse watcher |
| `innkeeper reverse-watch status` | Check reverse watcher status |
| `innkeeper reverse-watch log` | Show log (add `-f` to follow) |
| `innkeeper reverse-watch remove` | Stop and remove script from VM |

### Networking & Info

| Command | Description |
|---------|-------------|
| `innkeeper ip` | Print the VM's current IP address |
| `innkeeper hosts` | Update `/etc/hosts` with VM aliases |
| `innkeeper hosts remove` | Remove host entries |
| `innkeeper status` | Show VM state, watcher status, and host entries |
| `innkeeper version` | Show Innkeeper version |

## Typical Workflows

### Deploy a code change (host→VM)

Edit files on macOS → file watcher syncs automatically. If watcher is off:
```bash
innkeeper sync
```

### Pull build artifacts after compilation

```bash
innkeeper exec gulp               # build inside VM
innkeeper sync from-vm            # pull webroot/css, webroot/js, webroot/font back
git add webroot/css webroot/js webroot/font
```

Or use the reverse watcher for automatic pull:
```bash
innkeeper reverse-watch start
```

### Re-provision after Ansible changes

```bash
innkeeper provision               # run full playbook
# or
innkeeper provision --tags nginx  # just the nginx role
# or
innkeeper reload --provision      # restart VM + full provision
```

### Destroy and rebuild

```bash
innkeeper destroy --purge
innkeeper up
innkeeper exec composer install
innkeeper exec npm install
innkeeper exec gulp
```

## What Runs Where

| macOS (Host) | VM (Guest) |
|-------------|------------|
| `git` commands | `composer install` / `update` |
| `innkeeper` / `multipass` | `npm install` / `update` |
| VS Code / IDE | `gulp` (asset compilation) |
| File editing | `bin/cake` commands |
| Docker management | `vendor/bin/phpunit` |
| | Database migrations |
| | Nginx / PHP-FPM / Memcached |

> **Never** run `composer`, `npm`, `gulp`, or `bin/cake` directly on macOS. They expect Linux paths and the VM's PHP/Node versions.
