# AI Coding Guidelines Index

Detailed Copilot guidance lives under `.github/copilot/`. Start with the documents below:

- [General engineering guidance](copilot/general.md) — architecture, conventions, testing, anti-patterns
- [Innkeeper VM workflow](copilot/innkeeper.md) — running commands inside the VM, database connections
- [Migrations](copilot/migrations.md) — CakePHP/Phinx migration workflow, consolidation rules
- [Frontend styles guidance](copilot/frontend-styles.md) — SCSS patterns, Bootstrap 5, Gulp build

## Quick Reference (Critical Rules)

| Topic | Rule |
|-------|------|
| **Tech stack** | CakePHP 5.3, PHP 8.4+, MySQL 8.4, Bootstrap 5, Vanilla JS (no jQuery), TomSelect |
| **Run commands** | Use `innkeeper exec <command>` — runs in the `SHADOW_DEST` path inside the VM |
| **Subdirectory** | `innkeeper exec --dir <subdir> <command>` — runs in `SHADOW_DEST/<subdir>` |
| **VM name** | Discover with `innkeeper status` — do not hard-code |
| **Migrations** | All in `config/Migrations/`; extend `Migrations\BaseMigration` (never `AbstractMigration`); one migration per feature during dev — rollback & consolidate rather than adding more files; see [migrations guide](copilot/migrations.md) |
| **Assets** | Edit `assets/app/`, run `innkeeper exec gulp`, commit compiled `webroot/css`, `webroot/js`, `webroot/font` |
| **Database queries** | Read credentials from `config/app_local.php`; prefer macOS `mysql` CLI against `127.0.0.1`; fallback via `innkeeper exec` |
| **View templates** | Use ButterCream/Bootstrap 5 helpers from the `butter-cream` plugin |
| **Enums** | Use PHP 8.4 native backed enums in `src/Enum/`; implement `LabeledEnum` + `HasLabeledOptionsTrait` trait; use `Enum::options()` for form selects, `Enum::values()` for `inList()` validation |
| **Dates** | CakePHP 5 uses immutable date objects — use `\Cake\I18n\Date` for date-only, `\Cake\I18n\DateTime` for datetime |

---

Add new domain-specific instructions alongside these files and link them here so Copilot and contributors can discover them easily.
