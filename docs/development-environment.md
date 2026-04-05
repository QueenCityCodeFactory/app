# Development Environment

Complete guide for setting up and running the application locally.

## Prerequisites

| Tool | Purpose | Install |
|------|---------|---------|
| **Multipass** | VM manager (runs Ubuntu guests) | [multipass.run](https://multipass.run/) |
| **Innkeeper 3.2+** | Wrapper CLI for Multipass + Ansible | [git.willettstech.com/tools/innkeeper](https://git.willettstech.com/tools/innkeeper) |
| **Docker** | Runs MySQL on the host (recommended) | [docker.com](https://www.docker.com/) |
| **SSH key pair** | VM access and Ansible | `~/.ssh/id_rsa` + `id_rsa.pub` |
| **watchman** (recommended) | File watcher for host→VM sync | `brew install watchman` |

## First-Time Setup

### 1. Clone the Repository

```bash
git clone <repo-url> myapp
cd myapp
```

### 2. Create Configuration Files

```bash
cp .innkeeper.env.example .innkeeper.env
cp config/app_local.example.php config/app_local.php
cp ansible/inventories/development/group_vars/all.yml.example ansible/inventories/development/group_vars/all.yml
```

Review `.innkeeper.env` — defaults are sensible for most setups. Update `all.yml` with your project name and settings.

### 3. Launch the VM

```bash
innkeeper up
```

On first run, Innkeeper will:
1. Create a Multipass VM
2. Mount the project directory into the VM
3. Rsync files to the runtime directory (`SHADOW_DEST`)
4. Run the Ansible playbook (`ansible/playbooks/development.yml`) to install PHP 8.4, Nginx, Node.js, Memcached, Mailpit, etc.
5. Start the file watcher (host→VM sync)
6. Add local domain to `/etc/hosts`

This takes several minutes the first time. Subsequent starts are fast.

### 4. Set Up the Database

See [database.md](database.md) for full details. The quick Docker approach:

```bash
docker run -d --name myapp-mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=myapp \
  -e MYSQL_USER=myapp \
  -e MYSQL_PASSWORD=myapp \
  -p 3307:3306 mysql:8.4
```

Then update `config/app_local.php` with the correct host IP (see [database.md](database.md)).

### 5. Install Dependencies

```bash
innkeeper exec composer install
innkeeper exec npm install
```

> **Important:** Always install dependencies via `innkeeper exec`, never directly on macOS. The VM has the correct PHP version, Node version, and Linux paths.

### 6. Build Frontend Assets

```bash
innkeeper exec gulp
```

### 7. Verify

Open the configured local domain in your browser. Accept the self-signed certificate warning. You should see the CakePHP default home page.

## Daily Workflow

```bash
# Start of day — resume the VM
innkeeper up

# Edit files in VS Code on macOS (file watcher syncs to VM automatically)

# Run any command on the VM
innkeeper exec <command>

# After changing SCSS or JS
innkeeper exec gulp

# After changing database schema
innkeeper exec bin/cake migrations migrate

# Pull build artifacts from VM
innkeeper sync from-vm

# End of day
innkeeper suspend
```

## Re-Provisioning

After changing Ansible playbooks or roles:

```bash
innkeeper provision                         # full playbook
innkeeper provision --tags nginx            # just one role
innkeeper reload --provision                # restart + provision
```

## Destroy and Rebuild

```bash
innkeeper destroy --purge
innkeeper up
innkeeper exec composer install
innkeeper exec npm install
innkeeper exec gulp
```
