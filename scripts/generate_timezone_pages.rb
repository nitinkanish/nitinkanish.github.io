#!/usr/bin/env ruby
# Generates _time/*.md route pages from _data/timezone_locations.yml
# Usage: ruby scripts/generate_timezone_pages.rb [--force]

require 'yaml'
require 'json'
require 'fileutils'

ROOT = File.expand_path('..', __dir__)
LOCATIONS_FILE = File.join(ROOT, '_data', 'timezone_locations.yml')
OUTPUT_DIR = File.join(ROOT, '_time')
FORCE = ARGV.include?('--force')
SITE_URL = 'https://online-calculators.com'

locations = YAML.load_file(LOCATIONS_FILE)
hubs = locations.select { |l| l['hub'] != false }
by_slug = hubs.each_with_object({}) { |l, h| h[l['slug']] = l }

FileUtils.mkdir_p(OUTPUT_DIR)

def route_slug(from, to)
  "#{from['slug']}-to-#{to['slug']}"
end

def title_for(from, to)
  "#{from['name']} Time to #{to['name']} Time Converter"
end

def seo_title_for(from, to)
  "#{from['name']} to #{to['name']} Time Converter — Live Time Zone Difference"
end

def description_for(from, to)
  "Convert #{from['name']} time to #{to['name']} time instantly. " \
  "See live clocks, current time difference, best meeting hours, and a 24-hour " \
  "comparison between #{from['timezone']} and #{to['timezone']}."
end

def keywords_for(from, to)
  [
    "#{from['name'].downcase} to #{to['name'].downcase} time",
    "#{from['name'].downcase} #{to['name'].downcase} time converter",
    "time difference #{from['name'].downcase} #{to['name'].downcase}",
    "#{from['name'].downcase} time zone",
    "#{to['name'].downcase} time now",
    'world clock converter'
  ].join(', ')
end

def faqs_for(from, to)
  from_dst = from['dst'] ? 'observes daylight saving time (DST); offsets may shift seasonally' : 'does not observe daylight saving time'
  to_dst = to['dst'] ? 'observes daylight saving time (DST); offsets may shift seasonally' : 'does not observe daylight saving time'

  [
    {
      'question' => "What is the time difference between #{from['name']} and #{to['name']}?",
      'answer' => "The offset depends on the date because some regions use DST. #{from['name']} uses #{from['timezone']} (#{from_dst}). #{to['name']} uses #{to['timezone']} (#{to_dst}). Use the live converter above for the exact difference right now."
    },
    {
      'question' => "What time is it in #{to['name']} when it is noon in #{from['name']}?",
      'answer' => "Enter any time in the #{from['name']} clock on this page to see the equivalent in #{to['name']}. Noon in #{from['name']} is a common reference point for scheduling international calls."
    },
    {
      'question' => "How do I schedule a meeting between #{from['name']} and #{to['name']}?",
      'answer' => "Look for overlapping business hours (typically 9:00–17:00 local time in each zone). Our meeting-time helper highlights windows when both locations are within standard working hours."
    },
    {
      'question' => "Does the converter account for daylight saving time?",
      'answer' => 'Yes. Times are computed with the IANA time zone database via your browser, so DST changes are reflected automatically.'
    },
    {
      'question' => "What time zone is #{from['name']} in?",
      'answer' => "#{from['name']} is in the #{from['timezone']} time zone (#{from['region']}), with a standard UTC offset of #{from['utc_offset']}."
    },
    {
      'question' => "What time zone is #{to['name']} in?",
      'answer' => "#{to['name']} is in the #{to['timezone']} time zone (#{to['region']}), with a standard UTC offset of #{to['utc_offset']}."
    }
  ]
end

def intro_for(from, to)
  <<~MD.strip
    Planning a call, flight, or remote meeting between **#{from['name']}** and **#{to['name']}**? This free time zone converter shows the **live local time** in both places, the **current offset**, and a **24-hour side-by-side view** so you can compare schedules at a glance.

    #{from['name']} follows **#{from['timezone']}** (#{from['region']}). #{to['name']} follows **#{to['timezone']}** (#{to['region']}). Because #{from['dst'] ? "#{from['name']} adjusts clocks for daylight saving" : "#{from['name']} stays on a fixed offset year-round"} and #{to['dst'] ? "#{to['name']} uses seasonal DST" : "#{to['name']} does not use DST"}, the hour difference between them **can change during the year**—always check the live result above before booking.

    ## How to convert #{from['name']} time to #{to['name']} time

    1. View the **current time** in each location at the top of the converter.
    2. Read the **time difference** badge (hours ahead or behind).
    3. Use **Convert a specific time** to translate any hour from #{from['name']} to #{to['name']}.
    4. Scroll the **24-hour comparison table** to find overlapping business hours.

    ## Why use an online #{from['name']} to #{to['name']} clock?

    Manual UTC math is error-prone when DST rules differ. Our tool uses your browser's built-in internationalization APIs with official IANA zones—no install, no signup, and results update every second. Bookmark this page for quick reference whenever you coordinate across #{from['region']} and #{to['region']}.
  MD
end

count = 0
hubs.each do |from|
  hubs.each do |to|
    next if from['slug'] == to['slug']

    slug = route_slug(from, to)
    filename = File.join(OUTPUT_DIR, "#{slug}.md")
    if File.exist?(filename) && !FORCE
      next
    end

    faqs = faqs_for(from, to)
    faq_yaml = faqs.map do |f|
      "    - question: \"#{f['question'].gsub('"', '\\"')}\"\n      answer: \"#{f['answer'].gsub('"', '\\"')}\""
    end.join("\n")

    content = <<~MD
      ---
      layout: timezone
      title: #{title_for(from, to)}
      seo_title: #{seo_title_for(from, to)}
      slug: #{slug}
      from_slug: #{from['slug']}
      to_slug: #{to['slug']}
      from_name: #{from['name']}
      to_name: #{to['name']}
      from_label: #{from['label']}
      to_label: #{to['label']}
      from_timezone: #{from['timezone']}
      to_timezone: #{to['timezone']}
      from_region: #{from['region']}
      to_region: #{to['region']}
      description: #{description_for(from, to)}
      keywords: #{keywords_for(from, to)}
      last_modified_at: #{Time.now.utc.strftime('%Y-%m-%d')}
      faqs:
      #{faq_yaml}
      ---

      #{intro_for(from, to)}
    MD

    File.write(filename, content)
    count += 1
    puts "Generated: #{filename}" if count <= 5 || count % 100 == 0
  end
end

# Manifest for hub page + search
manifest = {
  'locations' => hubs.map { |l| l.slice('slug', 'name', 'label', 'timezone', 'region', 'utc_offset', 'dst') },
  'routes' => hubs.flat_map do |from|
    hubs.map do |to|
      next if from['slug'] == to['slug']
      {
        'slug' => route_slug(from, to),
        'url' => "/time/#{route_slug(from, to)}/",
        'title' => title_for(from, to),
        'from' => from['slug'],
        'to' => to['slug']
      }
    end.compact
  end
}

manifest_dir = File.join(ROOT, 'assets', 'data')
FileUtils.mkdir_p(manifest_dir)
File.write(File.join(manifest_dir, 'timezone-routes.json'), JSON.pretty_generate(manifest))
puts "Generated: assets/data/timezone-routes.json (#{manifest['routes'].size} routes)"
puts "Done. #{count} new/updated pages (#{hubs.size} hubs → #{hubs.size * (hubs.size - 1)} routes)."

# Regenerate llms index if script exists
llms_script = File.join(ROOT, 'scripts', 'generate_llms_txt.rb')
system('ruby', llms_script) if File.exist?(llms_script)
