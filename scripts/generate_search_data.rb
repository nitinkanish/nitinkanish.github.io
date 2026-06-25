#!/usr/bin/env ruby
# Generates assets/data/search-data.json for site search (avoids per-page Liquid loops).
# Usage: ruby scripts/generate_search_data.rb

require 'yaml'
require 'json'
require 'fileutils'

ROOT = File.expand_path('..', __dir__)
calculators = YAML.unsafe_load_file(File.join(ROOT, '_data', 'calculators.yml'))
categories = YAML.unsafe_load_file(File.join(ROOT, '_data', 'categories.yml'))

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
  end + [
    {
      'title' => 'World Time Zone Converter',
      'slug' => 'time-zone-converter',
      'category' => 'time',
      'description' => 'Convert time between countries and cities — live clocks and meeting planner',
      'keywords' => ['time zone converter', 'world clock', 'kenya mexico time'],
      'url' => '/time/'
    }
  ],
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
