# GitHub: CI/CD and protecting `master`

## What this repo does

- **`.github/workflows/ci.yml`** runs **`lint`** on every **pull request** and every **push** to `main` or `master`.
- On **push to `master` only**, after **`lint` succeeds**, it runs **`flyctl deploy --remote-only`** to your Fly.io app.

You must add a **`FLY_API_TOKEN`** to GitHub (see below).

---

## 1. GitHub secret: `FLY_API_TOKEN`

1. Install the [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/) locally and log in, **or** open [Fly.io user tokens](https://fly.io/user/personal_access_tokens).
2. Create a deploy token, e.g.:

   ```bash
   fly tokens create deploy -x 8760h
   ```

   (Or create a token in the Fly dashboard.)

3. In GitHub: **Repo → Settings → Secrets and variables → Actions → New repository secret**
   - **Name:** `FLY_API_TOKEN`
   - **Value:** the token string

Without this, the **deploy** job fails.

---

## 2. Avoid double deploys (Fly GitHub app vs Actions)

If you also connected this repo in the **Fly.io dashboard** (“GitHub integration” / deploy on push), **each push to `master` might deploy twice** (Fly + GitHub Actions).

Pick **one**:

- **Recommended:** Keep **GitHub Actions** (this workflow) and **turn off** automatic deploys from the Fly.io GitHub integration for this app, **or**
- Remove the **`deploy`** job from `ci.yml` and rely only on Fly’s integration.

---

## 3. Branch protection: merges only from you or approved by you

GitHub does not store branch rules in the repo; you set them in the UI. Suggested setup for **`master`**:

1. **Repo → Settings → Branches → Add branch protection rule**
2. **Branch name pattern:** `master`
3. Enable:
   - **Require a pull request before merging**
   - **Require approvals:** `1` (or more if you use a team)
   - **Require review from Code Owners**  
     This repo has **`.github/CODEOWNERS`** with `* @Sovereign-Greed`, so an owner must approve changes that touch those paths.
   - **Require status checks to pass before merging**  
     Add the **`lint`** check from the **“CI”** workflow (name may appear as `CI / lint` in the UI).
   - **Do not allow bypassing the above settings** (uncheck “Allow administrators to bypass” if you want rules to apply to you too — optional).

**Solo maintainer note:** GitHub often **does not let you approve your own PR**. Common approaches:

- Use a **second trusted account** as reviewer, or  
- Use **admin merge** only when appropriate, or  
- Adjust **Required approvals** to `0` but keep **required status checks** and **restrict who can push** to `master` (only your user).

Tune rules to match how you work.

---

## 4. Optional: manual approval before Fly deploy

To require **your approval before every production deploy** (separate from merge rules), use a [GitHub Environment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment) named e.g. `production` with **Required reviewers**, then add to the **`deploy`** job in `ci.yml`:

```yaml
environment: production
```

Create the environment under **Settings → Environments** and add yourself as a reviewer.

---

## 5. Deploy branch

The workflow deploys only on **`master`**. If your default branch is **`main`**, either:

- add `refs/heads/main` to the `deploy` job `if:` condition in `ci.yml`, or  
- keep **`master`** as the only deploy branch (matches your Fly GitHub connection).
