#!/usr/bin/env ruby
# Generates assets/data/search-data.json for site search (avoids per-page Liquid loops).
# Usage: ruby scripts/generate_search_data.rb

require 'yaml'
require 'json'
require 'fileutils'
require 'date'

ROOT = File.expand_path('..', __dir__)

def load_yaml(path)
  YAML.load_file(path, permitted_classes: [Date, Time, Symbol], aliases: true)
end

calculators = load_yaml(File.join(ROOT, '_data', 'calculators.yml'))
categories = load_yaml(File.join(ROOT, '_data', 'categories.yml'))

payload = {
  'calculators' => calculators.map do |calc|
    {
      'title' => calc['title'],
      'slug' => calc['slug'],
      'category' => calc['category'],
      'description' => calc['description'],
      'keywords' => calc['keywords'],
      'url' => "/#{calc['category']}/#{calc['slug']}/"
    }
  end,
  'categories' => categories.map do |cat|
    {
      'title' => cat['title'],
      'slug' => cat['slug'],
      'description' => cat['description'],
      'url' => "/#{cat['slug']}/"
    }
  end
}

out = File.join(ROOT, 'assets', 'data', 'search-data.json')
FileUtils.mkdir_p(File.dirname(out))
File.write(out, JSON.pretty_generate(payload))
puts "Generated: #{out}"
