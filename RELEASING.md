# Releasing Guide

## Automatic Versioning

Version is **automatically bumped** only when a **PR is merged** to `release` branch.

> **Direct push** to release does NOT bump version — only deploys with existing version.

### How It Works

```
PR merged to release → CI detects merge → Bumps package.json → Creates git tag → Deploys
Direct push to release → NO version bump → Deploys with current version
```

### Version Types

| Type | When | Example |
|------|------|---------|
| **PATCH** | Default (bug fixes, small changes) | 1.0.3 → 1.0.4 |
| **MINOR** | New features | 1.0.3 → 1.1.0 |
| **MAJOR** | Breaking changes | 1.0.3 → 2.0.0 |

## Usage

### Standard Release (PATCH)

Create PR to `release` and merge — version bumps automatically:

```bash
# Create PR from feature branch
git checkout -b feature/my-feature
# ... make changes ...
git push origin feature/my-feature
# Create PR to release → Merge → 1.0.3 → 1.0.4
```

### Minor Release (new feature)

Add `[MINOR]` to PR title:

```
PR title: "[MINOR] Add user export feature"
# After merge: 1.0.3 → 1.1.0
```

### Major Release (breaking change)

Add `[MAJOR]` to PR title:

```
PR title: "[MAJOR] New authentication API"
# After merge: 1.0.3 → 2.0.0
```

### Direct Push (hotfix, no version bump)

Direct push deploys without changing version:

```bash
git push origin release
# Deploys current version, NO version bump
```

## CI Pipeline

```
┌──────────┐
│ 🏷️ Version│  ← Only on PR merge to release
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

### Workflow Files

Pipeline is split into reusable workflows:

| File | Purpose | Timeout |
|------|---------|---------|
| `docker-image.yml` | Main orchestrator | - |
| `_version.yml` | Version bump (release only) | 10 min |
| `_install.yml` | npm ci + cache | 15 min |
| `_test.yml` | Jest tests | 10 min |
| `_build.yml` | Production build | 15 min |
| `_docker.yml` | Docker build & push | 15 min |
| `_deploy.yml` | Kubernetes deploy | 10 min |

### Pipeline Features

- **Concurrency control** — cancels in-progress runs for the same branch
- **Caching** — `node_modules` cached by `package-lock.json` hash
- **Fallback install** — test/build jobs install deps if cache miss
- **Docker tags** — version tag always, `latest` tag only on release
- **Optimized checkout** — `fetch-depth: 50` for version history

## Git Tags

Every release creates a git tag:

```bash
git tag              # List all versions
git show v1.0.4      # Show specific release
```

## CI/CD Configuration

### Secrets

| Secret | Purpose |
|--------|---------|
| `PAT_TOKEN` | Push version commits to protected release branch |
| `AWS_ACCESS_KEY_ID` | EKS deployment |
| `AWS_SECRET_ACCESS_KEY` | EKS deployment |

### PAT_TOKEN

CI uses a Personal Access Token to push version commits to protected `release` branch.

| Setting | Value |
|---------|-------|
| Secret name | `PAT_TOKEN` |
| Location | Repository Settings → Secrets → Actions |
| Expiration | **30/01/2027** (1 year) |
| Scopes | `repo` |

⚠️ **Token expires in 1 year.** Renew before expiration to avoid CI failures.

### Renewing PAT_TOKEN

1. https://github.com/settings/tokens
2. Generate new token (classic) with `repo` scope
3. Update secret in Repository Settings → Secrets → Actions → `PAT_TOKEN`

## Deploy Environments

| Branch | Environment | When |
|--------|-------------|------|
| `main` | test | push, PR |
| `release` | release | push |
| PR to main/release | test | PR |

## FAQ

**Q: What if I forget to add [MINOR] or [MAJOR]?**
A: It defaults to PATCH. You can always do another release.

**Q: Can I skip versioning?**
A: Add `[skip ci]` to commit message to skip entire pipeline.

**Q: Where is the version stored?**
A: In `package.json` — CI updates it automatically.

**Q: What about PR to main?**
A: No version bump. Version only changes when PR is merged to `release`.

**Q: What about direct push to release?**
A: No version bump. Direct push deploys with the current version (useful for hotfixes).

**Q: CI failed with "protected branch" error?**
A: Check if `PAT_TOKEN` is valid and not expired.

**Q: Why did tests/build fail with "module not found"?**
A: Cache miss occurred. Check if `package-lock.json` changed. Fallback install should handle this automatically.

**Q: What happens if multiple developers push to release simultaneously?**
A: CI handles this automatically:
1. Concurrency control cancels older runs
2. Version job does `git rebase` to sync with any concurrent version commits
3. If rebase conflict occurs, CI fails with clear error — just pull and push again

**Q: CI failed with "Rebase conflict with concurrent version bump"?**
A: Another developer's version commit conflicted. Run:
```bash
git pull --rebase origin release
git push origin release
```
