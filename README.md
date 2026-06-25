# Online Calculators — SEO-Optimized Calculator Website

A production-ready Jekyll calculator website designed for GitHub Pages. Fast, modern, mobile-first, and built to scale to 10,000+ calculators

**Live URL:** [https://online-calculators.com](https://online-calculators.com)

## Features

- **15+ example calculators** — EMI, SIP, BMI, GST, converters, and more
- **Data-driven architecture** — `_data/calculators.yml` powers search, categories, and internal linking
- **Auto page generator** — `ruby scripts/generate_pages.rb` creates calculator collection pages
- **Enterprise SEO** — JSON-LD schemas, Open Graph, Twitter Cards, sitemap, canonical URLs
- **Instant search** — Live autocomplete with keyboard navigation
- **PWA ready** — Service worker, manifest, offline support
- **Dark mode** — System preference + manual toggle
- **WCAG 2.1** — Skip links, ARIA labels, focus states, screen reader support
- **No Node.js** — Pure Jekyll, HTML, SCSS, JavaScript

## Quick Start

```bash
# Install dependencies
bundle install

# Serve locally
bundle exec jekyll serve

# Build for production
bundle exec jekyll build
```

Visit `http://localhost:4000`

## Project Structure

```
├── _calculators/          # Calculator pages (auto-generated)
├── _categories/           # Category landing pages
├── _data/
│   ├── calculators.yml    # Master calculator registry
│   ├── categories.yml     # Category definitions
│   └── calc_content.yml   # SEO content (intro, examples, steps)
├── _includes/
│   ├── calc-forms/        # Calculator form templates
│   ├── schema/            # JSON-LD structured data
│   ├── header.html
│   ├── footer.html
│   └── seo.html
├── _layouts/
│   ├── calculator.html    # Reusable calculator layout
│   ├── category.html
│   └── post.html
├── _posts/                # Blog articles
├── _sass/                 # SCSS architecture
├── assets/
│   ├── css/main.scss
│   └── js/
│       ├── calculator-engine.js
│       ├── main.js
│       └── calculators/   # Per-calculator logic
├── scripts/
│   └── generate_pages.rb  # YAML → Jekyll pages generator
├── _config.yml
├── CNAME
├── manifest.json
├── sw.js
└── robots.txt
```

## Adding a New Calculator

1. Add entry to `_data/calculators.yml`:

```yaml
- title: My Calculator
  slug: my-calculator
  category: finance
  description: Calculate something useful.
  keywords: [my calculator]
  calculator_type: my-calc
  formula: "result = a + b"
  date_added: 2025-06-11
```

2. Create form template `_includes/calc-forms/my-calc.html`
3. Add case to `_includes/calc-form.html`
4. Create JS logic `assets/js/calculators/my-calc.js`
5. Add SEO content to `_data/calc_content.yml` (optional)
6. Run `ruby scripts/generate_pages.rb`

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for GitHub Pages, custom domain, and Cloudflare setup.

## Performance Targets

- Lighthouse Performance: 100
- Accessibility: 100
- Best Practices: 100
- SEO: 100

## License

MIT
