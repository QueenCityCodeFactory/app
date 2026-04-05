# Database Setup

This project supports two database configurations for local development. Both use MySQL 8.4+.

## Option A — Docker MySQL on macOS (Recommended)

Run MySQL in a Docker container on the host. The database survives VM rebuilds and is directly accessible from macOS tools.

### Create the Container

> This is an example. Adjust names, credentials, and ports for your project.

```bash
docker run -d --name myapp-mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=myapp \
  -e MYSQL_USER=myapp \
  -e MYSQL_PASSWORD=myapp \
  -p 3307:3306 \
  mysql:8.4
```

### Determine the Host IP

The VM needs to reach the macOS host where Docker runs:

```bash
innkeeper ip
# Example output: 192.168.64.21
# Host IP = replace last octet with .1 → 192.168.64.1
```

### Configure `config/app_local.php`

```php
'Datasources' => [
    'default' => [
        'host' => '192.168.64.1',    // ← host IP from VM's perspective
        'port' => 3307,              // ← Docker mapped port
        'username' => 'myapp',
        'password' => 'myapp',
        'database' => 'myapp',
    ],
],
```

### Connecting from macOS

```bash
# MySQL CLI
mysql -h 127.0.0.1 -P 3307 -u myapp -pmyapp myapp

# Or any GUI client (TablePlus, DBeaver, MySQL Workbench, etc.):
#   Host: 127.0.0.1
#   Port: 3307
#   User/Password: as configured
```

No SSH tunnel needed — Docker exposes MySQL directly on the host.

### Connecting from the VM

The app connects using the `host` value in `app_local.php` (the `.1` gateway address). You can also test manually:

```bash
innkeeper exec "mysql -h 192.168.64.1 -P 3307 -u myapp -pmyapp myapp -e 'SELECT 1'"
```

## Option B — MySQL Inside the VM

The `mysql_server` Ansible role installs MySQL directly in the guest VM. This is simpler to set up but the database is lost if you `innkeeper destroy`.

### Configuration

`config/app_local.php`:
```php
'Datasources' => [
    'default' => [
        'host' => 'localhost',
        'username' => 'myapp',
        'password' => 'myapp',
        'database' => 'myapp',
    ],
],
```

### Connecting from macOS

Since the database is inside the VM, you need an SSH tunnel:

```bash
# Terminal 1: open the tunnel
ssh -L 3306:localhost:3306 ubuntu@$(innkeeper ip)

# Terminal 2: connect through the tunnel
mysql -h 127.0.0.1 -P 3306 -u myapp -pmyapp myapp
```

Or configure your GUI client with SSH tunneling:
- **SSH Host:** output of `innkeeper ip`
- **SSH User:** `ubuntu`
- **SSH Key:** `~/.ssh/id_rsa`
- **MySQL Host:** `127.0.0.1`
- **MySQL Port:** `3306`

## How to Tell Which Option You're Using

Check `config/app_local.php`:

| `host` value | `port` | Meaning |
|-------------|--------|---------|
| `192.168.x.1` (or similar) with port `3307+` | Non-default | Docker on macOS |
| `localhost` or `127.0.0.1` | `3306` (default) | MySQL in VM |

## Running Queries

### From macOS (preferred for quick queries)

```bash
# Read credentials from config/app_local.php, then:
mysql -h 127.0.0.1 -P 3307 -u myapp -pmyapp myapp -e "SHOW TABLES;"
```

> No space between `-p` and the password.

### From the VM

```bash
innkeeper exec "mysql -u myapp -pmyapp myapp -e 'SHOW TABLES;'"
```

### Imports and Exports

```bash
# Export
mysqldump -h 127.0.0.1 -P 3307 -u myapp -pmyapp myapp > dump.sql

# Import
mysql -h 127.0.0.1 -P 3307 -u myapp -pmyapp myapp < dump.sql
```

## Best Practices

- **Prefer CakePHP migrations** for all schema changes — never make direct `ALTER TABLE` statements for structural changes.
- **Read credentials from `config/app_local.php`** — never hard-code database connection details in scripts or commands.
- **Use Docker (Option A)** for persistence across VM rebuilds.
