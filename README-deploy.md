# Deploying librarifran-theme to GitHub

This repository contains a Jekyll site (Minimal Mistakes theme). These notes explain how to push the current local work to GitHub and enable GitHub Pages or use Actions artifacts.

1. Create a GitHub repository
   - On GitHub, create a new repo `mfgaede/librarifran-theme` (private or public).

2. Add a GitHub remote locally (only do this once):

```bash
# replace the URL below with your repo URL if different
git remote add github git@github.com:mfgaede/librarifran-theme.git
```

3. Prepare a branch and push

```bash
# commit any local changes first
git add -A
git commit -m "Prepare site for GitHub" || true
# create a branch for the work
git branch -M movie-layout-fixes
# push to GitHub
git push --set-upstream github movie-layout-fixes
```

4. Enable GitHub Pages (optional)
   - In the repo Settings > Pages: choose the branch (`movie-layout-fixes` or `master`) and the `/ (root)` folder to publish from.
   - Note: GitHub Pages expects a generated static site; you can either push the built `_site` directory to a `gh-pages` branch, or use Actions to build and deploy.

5. Using the included Actions workflow
   - The repository includes `.github/workflows/jekyll-ci.yml` which builds the site on push to `master` and uploads the `_site` build as an artifact.
   - You can modify the workflow to deploy to `gh-pages` automatically using a deploy action (I can add that if you want).

6. Security and credentials
   - Do not commit any secrets (passwords, SSH keys). Use repository Secrets and a deploy action when automating deploys.

If you'd like, I can:
- Push your current local commits to `movie-layout-fixes` on GitHub now (you'll need to confirm the remote URL), or
- Add an automated `gh-pages` deployment step to the workflow that uses a Personal Access Token stored in GitHub Secrets.
