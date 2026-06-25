# Deployment Guide — Online Calculators

**Production domain:** [https://online-calculators.com](https://online-calculators.com)

## GitHub Pages

### Recommended: GitHub Actions (this repo)

Use GitHub Actions so builds use Ruby 3.3 and `github-pages` v232.

**Important:** SourceTree (and some OAuth tokens) cannot push files under `.github/workflows/` without the `workflow` scope. Add the workflow on GitHub.com instead:

1. Push your code to `main` (no `.github/workflows/` in the repo)
2. On GitHub: **Add file → Create new file**
3. Path: `.github/workflows/pages.yml`
4. Paste the contents of `scripts/github-pages-workflow.yml` from this repo
5. Commit on `main`
6. Go to **Settings → Pages**
7. Under **Build and deployment**, set **Source** to **GitHub Actions**
8. Under **Custom domain**, enter `online-calculators.com`
9. Enable **Enforce HTTPS**

The workflow runs `bundle exec jekyll build` on Ruby 3.3 with `github-pages` v232.

### Legacy: Deploy from branch

Only use this if you are not using the Actions workflow. You may see bundler warnings if `Gemfile.lock` does not match the Pages-hosted gem set.

1. Push this repository to GitHub
2. Go to **Settings → Pages**
3. Source: **Deploy from branch** → `main` → `/ (root)`
4. Under **Custom domain**, enter `online-calculators.com`
5. Enable **Enforce HTTPS**

The `CNAME` file in the repository root is already set to `online-calculators.com`.

## DNS Configuration

Configure these records at your domain registrar (or Cloudflare):

| Type  | Name | Value                    |
|-------|------|--------------------------|
| A     | @    | 185.199.108.153          |
| A     | @    | 185.199.109.153          |
| A     | @    | 185.199.110.153          |
| A     | @    | 185.199.111.153          |
| CNAME | www  | your-username.github.io    |

For apex domain (`online-calculators.com`), use the A records above pointing to GitHub Pages IPs.

## Cloudflare Setup

1. Add `online-calculators.com` to Cloudflare
2. Set SSL/TLS to **Full (strict)**
3. Enable:
   - Auto Minify (HTML, CSS, JS)
   - Brotli compression
   - Always Use HTTPS
4. Page Rules (optional):
   - Cache static assets: `*/assets/*` → Cache Level: Cache Everything

## Site Configuration

The following are already configured in `_config.yml`:

```yaml
title: Online Calculators
url: "https://online-calculators.com"
baseurl: ""
```

`robots.txt` sitemap URL: `https://online-calculators.com/sitemap.xml`

## Build Locally Before Deploy

Requires **Ruby 3.3+** (see `.ruby-version`). On macOS with Homebrew Ruby:

```bash
/opt/homebrew/opt/ruby/bin/bundle install
/opt/homebrew/opt/ruby/bin/bundle exec jekyll build
# Output in _site/
```

## Pre-Deploy Checklist

- [x] `url` set to `https://online-calculators.com` in `_config.yml`
- [x] `CNAME` file contains `online-calculators.com`
- [x] Sitemap URL in `robots.txt` updated
- [ ] DNS records configured at registrar
- [ ] Custom domain verified in GitHub Pages settings
- [ ] HTTPS enforced
- [ ] Add Google Analytics ID if needed
- [ ] Test all calculators locally
- [ ] Run Lighthouse audit

## Troubleshooting

**SCSS not compiling:** Ensure `assets/css/main.scss` has Jekyll front matter (`---`)

**404 on calculator pages:** Verify `category` field in calculator front matter matches permalink

**Custom domain not working:** Allow up to 24 hours for DNS propagation; verify A/CNAME records

**GitHub Actions build fails (jekyll-build-pages):** Do not use the default `actions/jekyll-build-pages` workflow for this site. Use `scripts/github-pages-workflow.yml` instead (`bundle exec jekyll build` on `ubuntu-latest`). Also ensure `_config.yml` limits `jekyll-feed` to posts only (see below).

**jekyll-feed / Invalid Date in feed.xml:** `_config.yml` must limit the feed to posts only:

```yaml
feed:
  collections:
    posts:
      path: ""
```

**Push rejected (workflow scope):** GitHub blocks OAuth apps without `workflow` scope from pushing `.github/workflows/*`. Keep the workflow template in `scripts/github-pages-workflow.yml` and create `.github/workflows/pages.yml` on GitHub.com (see above). Or re-authorize SourceTree / use a PAT with `repo` + `workflow` scopes.

**Bundler / github-pages version mismatch:** Update `Gemfile` to `github-pages ~> 232` and run `bundle update github-pages` on Ruby 3.3+. Deploy via **GitHub Actions** when possible.

**Plugins not working:** Only use GitHub Pages-whitelisted plugins (jekyll-feed, jekyll-sitemap, jekyll-seo-tag)
