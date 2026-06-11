# Deployment Guide — Online Calculators

**Production domain:** [https://online-calculators.com](https://online-calculators.com)

## GitHub Pages

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

```bash
bundle install
bundle exec jekyll build
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

**Plugins not working:** Only use GitHub Pages-whitelisted plugins (jekyll-feed, jekyll-sitemap, jekyll-seo-tag)
