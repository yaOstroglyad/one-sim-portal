# Releasing Guide

## Automatic Versioning

Version is **automatically bumped** on every push to `release` branch.

### How It Works

```
Push to release → CI determines version type → Bumps package.json → Creates git tag → Deploys
```

### Version Types

| Type | When | Example |
|------|------|---------|
| **PATCH** | Default (bug fixes, small changes) | 1.0.3 → 1.0.4 |
| **MINOR** | New features | 1.0.3 → 1.1.0 |
| **MAJOR** | Breaking changes | 1.0.3 → 2.0.0 |

## Usage

### Standard Release (PATCH)

Just push or merge PR — version bumps automatically:

```bash
git push origin release
# 1.0.3 → 1.0.4
```

### Minor Release (new feature)

Add `[MINOR]` to commit message or PR title:

```bash
git commit -m "[MINOR] Add user export feature"
git push origin release
# 1.0.3 → 1.1.0
```

### Major Release (breaking change)

Add `[MAJOR]` to commit message or PR title:

```bash
git commit -m "[MAJOR] New authentication API"
git push origin release
# 1.0.3 → 2.0.0
```

## CI Pipeline

```
┌──────────┐
│ 🏷️ Version│  ← Only on push to release
└────┬─────┘
     │
┌────┴─────┐
│ 📦 Install│
└────┬─────┘
     │
┌────┴────┬────────┐
│         │        │
▼         ▼        │
🧪 Test   🔨 Build  │  ← Parallel
│         │        │
└────┬────┘        │
     │             │
     ▼             │
┌──────────┐       │
│ 🐳 Docker│ ◄─────┘
└────┬─────┘
     │
     ▼
┌──────────┐
│ 🚀 Deploy│
└──────────┘
```

## Git Tags

Every release creates a git tag:

```bash
git tag              # List all versions
git show v1.0.4      # Show specific release
```

## FAQ

**Q: What if I forget to add [MINOR] or [MAJOR]?**
A: It defaults to PATCH. You can always do another release.

**Q: Can I skip versioning?**
A: Add `[skip ci]` to commit message to skip entire pipeline.

**Q: Where is the version stored?**
A: In `package.json` — CI updates it automatically.

**Q: What about PR to main?**
A: No version bump. Version only changes on push to `release`.
