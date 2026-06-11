#!/usr/bin/env ruby
# Generates _calculators/*.md from _data/calculators.yml
# Usage: ruby scripts/generate_pages.rb [--force]

require 'yaml'
require 'fileutils'

ROOT = File.expand_path('..', __dir__)
DATA_FILE = File.join(ROOT, '_data', 'calculators.yml')
OUTPUT_DIR = File.join(ROOT, '_calculators')
FORCE = ARGV.include?('--force')

calculators = YAML.load_file(DATA_FILE)
FileUtils.mkdir_p(OUTPUT_DIR)

calculators.each do |calc|
  filename = File.join(OUTPUT_DIR, "#{calc['slug']}.md")
  if File.exist?(filename) && !FORCE
    puts "Skipped (exists): #{filename}"
    next
  end

  permalink = "/#{calc['category']}/#{calc['slug']}/"
  keywords = calc['keywords'].is_a?(Array) ? calc['keywords'].join(', ') : calc['keywords']

  content = <<~MD
    ---
    layout: calculator
    title: #{calc['title']}
    slug: #{calc['slug']}
    category: #{calc['category']}
    permalink: #{permalink}
    description: #{calc['description']}
    calculator_type: #{calc['calculator_type']}
    formula: "#{calc['formula']}"
    keywords: #{keywords}
    last_updated: #{calc['date_added']}
    ---

  MD

  File.write(filename, content)
  puts "Generated: #{filename}"
end

puts "Done. #{calculators.size} calculators processed."
