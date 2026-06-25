#!/usr/bin/env ruby
# Generates _calculators/*.md from _data/calculators.yml
# Usage: ruby scripts/generate_pages.rb [--force]

require 'yaml'
require 'fileutils'
require 'date'

ROOT = File.expand_path('..', __dir__)

def load_yaml(path)
  YAML.load_file(path, permitted_classes: [Date, Time, Symbol], aliases: true)
end

DATA_FILE = File.join(ROOT, '_data', 'calculators.yml')
SEO_FILE = File.join(ROOT, '_data', 'seo.yml')
OUTPUT_DIR = File.join(ROOT, '_calculators')
FORCE = ARGV.include?('--force')

calculators = load_yaml(DATA_FILE)
seo_data = File.exist?(SEO_FILE) ? load_yaml(SEO_FILE) : {}
calc_seo = seo_data['calculators'] || {}
FileUtils.mkdir_p(OUTPUT_DIR)

calculators.each do |calc|
  filename = File.join(OUTPUT_DIR, "#{calc['slug']}.md")
  if File.exist?(filename) && !FORCE
    puts "Skipped (exists): #{filename}"
    next
  end

  permalink = "/#{calc['category']}/#{calc['slug']}/"
  keywords = calc['keywords'].is_a?(Array) ? calc['keywords'].join(', ') : calc['keywords']
  entry = calc_seo[calc['slug']] || {}
  seo_title = entry['seo_title'] || calc['seo_title'] || calc['title']
  last_mod = entry['last_modified_at'] || calc['last_updated'] || calc['date_added'] || Time.now.strftime('%Y-%m-%d')

  content = <<~MD
    ---
    layout: calculator
    title: #{calc['title']}
    seo_title: #{seo_title}
    slug: #{calc['slug']}
    category: #{calc['category']}
    permalink: #{permalink}
    description: #{calc['description']}
    calculator_type: #{calc['calculator_type']}
    formula: "#{calc['formula']}"
    keywords: #{keywords}
    last_updated: #{last_mod}
    last_modified_at: #{last_mod}
    ---

  MD

  File.write(filename, content)
  puts "Generated: #{filename}"
end

puts "Done. #{calculators.size} calculators processed."

# Keep LLM index in sync when pages are regenerated
llms_script = File.join(ROOT, 'scripts', 'generate_llms_txt.rb')
system('ruby', llms_script) if File.exist?(llms_script)
