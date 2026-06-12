---
layout: default
title: Cookie Policy
seo_title: Cookie Policy
description: Learn how Online Calculators uses cookies, local storage, and how to manage your preferences.
permalink: /cookie-policy/
last_modified_at: 2025-06-11
---

<header class="page-header">
  <div class="container container-narrow">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li><a href="{{ '/' | relative_url }}">Home</a></li>
        <li aria-current="page">Cookie Policy</li>
      </ol>
    </nav>
    <h1>Cookie Policy</h1>
    <p class="page-lead">Last updated: {{ site.time | date: "%B %d, %Y" }}</p>
  </div>
</header>

<div class="container container-narrow prose legal-prose">
  <p>This Cookie Policy explains how <strong>{{ site.title }}</strong>, operated by <strong>{{ site.legal.operator }}</strong>, uses cookies and similar technologies on <a href="{{ site.legal.website }}">{{ site.legal.website }}</a>.</p>

  <h2>What Are Cookies?</h2>
  <p>Cookies are small text files stored on your device when you visit a website. We also use <strong>local storage</strong> for similar purposes (e.g., saving your theme or cookie choice).</p>

  <h2>Types of Cookies We Use</h2>

  <h3>1. Strictly Necessary (Essential)</h3>
  <p>These are required for the website to function. They do not require consent under most privacy laws.</p>
  <table class="legal-table">
    <thead><tr><th>Name</th><th>Purpose</th><th>Duration</th></tr></thead>
    <tbody>
      <tr><td><code>oc_cookie_consent</code></td><td>Stores your cookie consent choice (local storage)</td><td>1 year</td></tr>
      <tr><td><code>theme</code></td><td>Remembers light/dark mode preference (local storage)</td><td>Until cleared</td></tr>
    </tbody>
  </table>

  <h3>2. Analytics (Optional — requires consent)</h3>
  <p>Only activated if you click <strong>Accept</strong> on our cookie banner.</p>
  <table class="legal-table">
    <thead><tr><th>Provider</th><th>Cookies</th><th>Purpose</th><th>Duration</th></tr></thead>
    <tbody>
      <tr><td>Google Analytics 4</td><td><code>_ga</code>, <code>_ga_*</code></td><td>Anonymous usage statistics, page views, events</td><td>Up to 2 years</td></tr>
    </tbody>
  </table>
  <p>See <a href="https://policies.google.com/technologies/cookies" rel="noopener noreferrer">Google's cookie information</a> and <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener noreferrer">Google Analytics Opt-out</a>.</p>

  <h3>3. Service Worker / PWA Cache</h3>
  <p>If you install or use our site offline, cached files may be stored locally on your device to improve performance. No personal data is stored in the cache.</p>

  <h2>Managing Your Preferences</h2>
  <ul>
    <li><strong>Cookie banner:</strong> Choose Accept or Reject when you first visit</li>
    <li><strong>Change your mind:</strong> Clear site data in your browser settings to see the banner again</li>
    <li><strong>Browser controls:</strong> Most browsers let you block or delete cookies in settings</li>
  </ul>

  <h2>Do Not Track</h2>
  <p>Some browsers send "Do Not Track" signals. We honor rejected analytics consent and do not load Google Analytics when you decline cookies.</p>

  <h2>Updates</h2>
  <p>We may update this Cookie Policy when we add or change technologies. Check the date above for the latest version.</p>

  <h2>Contact</h2>
  <p>
    <strong>{{ site.legal.operator }}</strong><br>
    {{ site.legal.address }}<br>
    Email: <a href="mailto:{{ site.legal.email }}">{{ site.legal.email }}</a>
  </p>
  <p>See also our <a href="{{ '/privacy-policy/' | relative_url }}">Privacy Policy</a> and <a href="{{ '/terms-of-service/' | relative_url }}">Terms of Service</a>.</p>
</div>
