#!/usr/bin/env ruby
# Generates llms.txt and llms-full.txt per https://llmstxt.org/
# Usage: ruby scripts/generate_llms_txt.rb
#
# Run after updating _data/calculators.yml or when adding categories/pages.

require 'yaml'
require 'fileutils'
require 'time'
require 'date'

ROOT = File.expand_path('..', __dir__)

def load_yaml(path)
  YAML.load_file(path, permitted_classes: [Date, Time, Symbol], aliases: true)
end

CONFIG = load_yaml(File.join(ROOT, '_config.yml'))
CALCULATORS = load_yaml(File.join(ROOT, '_data', 'calculators.yml'))
CATEGORIES = load_yaml(File.join(ROOT, '_data', 'categories.yml'))
SEO = File.exist?(File.join(ROOT, '_data', 'seo.yml')) ? load_yaml(File.join(ROOT, '_data', 'seo.yml')) : {}
CALC_SEO = SEO['calculators'] || {}
CAT_SEO = SEO['categories'] || {}

SITE_URL = (CONFIG['url'] || 'https://online-calculators.com').chomp('/')
SITE_TITLE = CONFIG['title'] || 'Online Calculators'
SITE_DESC = (CONFIG['description'] || '').strip.gsub(/\s+/, ' ')
LEGAL = CONFIG['legal'] || {}
SOCIAL = CONFIG['social'] || {}
GENERATED_AT = Time.now.utc.strftime('%Y-%m-%d')

def abs(path)
  path = "/#{path}" unless path.start_with?('/')
  "#{SITE_URL}#{path}"
end

def calc_url(calc)
  abs("/#{calc['category']}/#{calc['slug']}/")
end

def category_url(slug)
  abs("/#{slug}/")
end

def grouped_calculators
  CALCULATORS.group_by { |c| c['category'] }
end

def category_title(slug)
  cat = CATEGORIES.find { |c| c['slug'] == slug }
  cat ? cat['title'] : slug.split('-').map(&:capitalize).join(' ')
end

def category_description(slug)
  cat = CATEGORIES.find { |c| c['slug'] == slug }
  (cat && cat['description']) ? cat['description'].strip.gsub(/\s+/, ' ') : ''
end

# --- llms.txt (curated index per llmstxt.org) ---

llms = []
llms << "# #{SITE_TITLE}"
llms << ''
llms << "> #{SITE_DESC} Free, instant, no signup. Built as a static Jekyll site on GitHub Pages at #{SITE_URL}."
llms << ''
llms << 'This file helps AI agents and developers understand Online Calculators: what we offer, where to link users, and which pages contain authoritative calculator logic. All tools run client-side in the browser; results are estimates, not professional advice.'
llms << ''
llms << '- **Primary audience:** people searching for free EMI, BMI, GST, pregnancy due date, mortgage, and unit conversion tools.'
llms << '- **URL pattern:** `/{category}/{calculator-slug}/` (e.g. `/health/pregnancy-calculator/`).'
llms << "- **Full catalog:** #{abs('/llms-full.txt')} — complete list with formulas, types, and metadata."
llms << "- **Sitemap:** #{abs('/sitemap.xml')}"
llms << "- **Repository:** #{SOCIAL['github'] || 'https://github.com/nitinkanish/nitinkanish.github.io'}"
llms << "- **Last generated:** #{GENERATED_AT}"
llms << ''

# Curated shortlist for agents with limited context (max 8, scored by prominence)
featured = CALCULATORS.sort_by do |c|
  score = 0
  score += 4 if c['trending']
  score += 2 if c['popular']
  score += 1 if c['featured']
  [-score, c['date_added'].to_s]
end.first(8)
unless featured.empty?
  llms << '## Featured Calculators'
  llms << ''
  featured.uniq { |c| c['slug'] }.each do |calc|
    seo = CALC_SEO[calc['slug']] || {}
    note = calc['description'].strip.gsub(/\s+/, ' ')
    note += " Formula: #{calc['formula']}." if calc['formula']
    llms << "- [#{calc['title']}](#{calc_url(calc)}): #{note}"
  end
  llms << ''
end

grouped_calculators.keys.sort.each do |slug|
  calcs = grouped_calculators[slug]
  llms << "## #{category_title(slug)}"
  llms << ''
  desc = category_description(slug)
  llms << "_#{desc}_" unless desc.empty?
  llms << '' unless desc.empty?
  calcs.each do |calc|
    seo = CALC_SEO[calc['slug']] || {}
    note = calc['description'].strip.gsub(/\s+/, ' ')
    note += " Formula: #{calc['formula']}." if calc['formula']
    llms << "- [#{calc['title']}](#{calc_url(calc)}): #{note}"
  end
  llms << "- [#{category_title(slug)} (category hub)](#{category_url(slug)}): Browse all #{slug} tools."
  llms << ''
end

llms << '## Site Pages'
llms << ''
llms << "- [Home](#{abs('/')}): Search and browse all calculators."
llms << "- [All Categories](#{abs('/categories/')}): Category directory."
llms << ''
llms << "- [About](#{abs('/about/')}): Mission and team."
llms << ''

llms << '## Optional'
llms << ''
llms << 'Secondary pages — safe to skip when context is limited.'
llms << ''
llms << "- [Privacy Policy](#{abs('/privacy-policy/')}): Data collection, cookies, and GA4 (consent-based)."
llms << "- [Terms of Service](#{abs('/terms-of-service/')}): Usage terms and disclaimers."
llms << "- [Cookie Policy](#{abs('/cookie-policy/')}): Cookie categories and consent."
llms << "- [Sitemap](#{abs('/sitemap.xml')}): XML sitemap for crawlers."
llms << "- [Complete LLM catalog](#{abs('/llms-full.txt')}): Full machine-readable site index with formulas and calculator types."
llms << ''

File.write(File.join(ROOT, 'llms.txt'), llms.join("\n"))
puts "Generated: #{File.join(ROOT, 'llms.txt')}"

# --- llms-full.txt (comprehensive context for agents) ---

full = []
full << "# #{SITE_TITLE} — Full Catalog"
full << ''
full << "> Machine-readable index of all calculators, categories, and site metadata. Generated #{GENERATED_AT}. Canonical site: #{SITE_URL}"
full << ''
full << '## Site Metadata'
full << ''
full << "- name: #{SITE_TITLE}"
full << "- url: #{SITE_URL}"
full << "- description: #{SITE_DESC}"
full << "- operator: #{LEGAL['operator'] || CONFIG.dig('author', 'name')}"
full << "- contact: #{LEGAL['email'] || CONFIG.dig('author', 'email')}"
full << "- github: #{SOCIAL['github']}"
full << "- linkedin: #{SOCIAL['linkedin']}"
full << "- stack: Jekyll, GitHub Pages, vanilla JavaScript (client-side calculators), SCSS, PWA"
full << "- analytics: Google Analytics 4 (G-BJLB2TWL8B), loaded only after cookie consent"
full << ''

full << '## Architecture (for contributors)'
full << ''
full << '- Calculator definitions: `_data/calculators.yml`'
full << '- Dashboard copy: `_data/dashboard_pages.yml`'
full << '- SEO titles: `_data/seo.yml`'
full << '- Long-form content: `_data/calc_content.yml`'
full << '- Related links: `_data/calc_relations.yml`'
full << '- Forms: `_includes/calc-forms/{type}.html`'
full << '- Logic: `assets/js/calculators/{type}.js`'
full << '- Layout: `_layouts/calculator.html` (15-section dashboard)'
full << '- Regenerate pages: `ruby scripts/generate_pages.rb --force`'
full << "- Regenerate llms files: `ruby scripts/generate_llms_txt.rb`"
full << ''

full << '## Categories'
full << ''
CATEGORIES.each do |cat|
  seo = CAT_SEO[cat['slug']] || {}
  full << "### #{cat['title']}"
  full << "- slug: #{cat['slug']}"
  full << "- url: #{category_url(cat['slug'])}"
  full << "- description: #{cat['description'].strip.gsub(/\s+/, ' ')}" if cat['description']
  full << "- seo_title: #{seo['seo_title']}" if seo['seo_title']
  full << ''
end

full << '## Calculators'
full << ''
CALCULATORS.each do |calc|
  seo = CALC_SEO[calc['slug']] || {}
  full << "### #{calc['title']}"
  full << "- slug: #{calc['slug']}"
  full << "- url: #{calc_url(calc)}"
  full << "- category: #{calc['category']}"
  full << "- calculator_type: #{calc['calculator_type']}"
  full << "- description: #{calc['description'].strip.gsub(/\s+/, ' ')}"
  full << "- formula: #{calc['formula']}" if calc['formula']
  full << "- keywords: #{Array(calc['keywords']).join(', ')}" if calc['keywords']
  full << "- seo_title: #{seo['seo_title']}" if seo['seo_title']
  full << "- meta_description: #{seo['meta_description']}" if seo['meta_description']
  full << "- featured: #{calc['featured']}" if calc.key?('featured')
  full << "- popular: #{calc['popular']}" if calc.key?('popular')
  full << ''
end

full << '## Disclaimers'
full << ''
full << '- Health calculators (BMI, BMR, calorie, pregnancy) provide estimates only — not medical advice.'
full << '- Finance calculators (EMI, SIP, FD, mortgage) are projections — verify with your bank or advisor.'
full << '- GST calculator targets Indian tax slabs; mortgage calculator uses US-style amortization.'
full << '- No personal data is stored server-side; calculations run in the user browser.'
full << ''

File.write(File.join(ROOT, 'llms-full.txt'), full.join("\n"))
puts "Generated: #{File.join(ROOT, 'llms-full.txt')}"
