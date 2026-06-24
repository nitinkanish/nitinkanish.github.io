/**
 * Time zone converter — IANA zones via Intl API
 * Used on /time/{from}-to-{to}/ routes and /time/ hub
 */
(function () {
  'use strict';

  const routeEl = document.getElementById('tz-route-data');
  const hubEl = document.getElementById('tz-hub-data');
  if (!routeEl && !hubEl) return;

  const route = routeEl ? JSON.parse(routeEl.textContent) : null;
  const hub = hubEl ? JSON.parse(hubEl.textContent) : null;

  if (route) initRoutePage(route);
  if (hub) initHubPage(hub);

  function initRoutePage(route) {
    const fromTz = route.from.timezone;
    const toTz = route.to.timezone;
    const fromName = route.from.name;
    const toName = route.to.name;

    const els = {
      timeFrom: document.getElementById('tz-time-from'),
      timeTo: document.getElementById('tz-time-to'),
      dateFrom: document.getElementById('tz-date-from'),
      dateTo: document.getElementById('tz-date-to'),
      offsetFrom: document.getElementById('tz-offset-from'),
      offsetTo: document.getElementById('tz-offset-to'),
      diffBadge: document.getElementById('tz-diff-badge'),
      arrowDiff: document.getElementById('tz-arrow-diff'),
      lastUpdated: document.getElementById('tz-last-updated'),
      tableBody: document.getElementById('tz-comparison-body'),
      meetingSlots: document.getElementById('tz-meeting-slots'),
      convertDate: document.getElementById('tz-input-date'),
      convertTime: document.getElementById('tz-input-time'),
      convertResult: document.getElementById('tz-convert-result'),
      convertResultValue: document.getElementById('tz-convert-result-value')
    };

    tick();
    setInterval(tick, 1000);
    buildComparisonTable(fromTz, toTz, fromName, toName, els.tableBody);
    renderMeetingSlots(fromTz, toTz, fromName, toName, els.meetingSlots);

    if (els.convertDate && els.convertTime) {
      const now = new Date();
      els.convertDate.value = formatDateInput(now, fromTz);
      els.convertTime.value = formatTimeInput(now, fromTz);
      ['change', 'input'].forEach((ev) => {
        els.convertDate.addEventListener(ev, () => convertSpecific(fromTz, toTz, toName, els));
        els.convertTime.addEventListener(ev, () => convertSpecific(fromTz, toTz, toName, els));
      });
      convertSpecific(fromTz, toTz, toName, els);
    }

    function tick() {
      const now = new Date();
      updateClock(now, fromTz, els.timeFrom, els.dateFrom, els.offsetFrom);
      updateClock(now, toTz, els.timeTo, els.dateTo, els.offsetTo);

      const diffH = getOffsetDiffHours(now, fromTz, toTz);
      const diffText = formatDiff(diffH, toName, fromName);
      if (els.diffBadge) els.diffBadge.textContent = diffText;
      if (els.arrowDiff) els.arrowDiff.textContent = formatDiffShort(diffH);
      if (els.lastUpdated) {
        els.lastUpdated.textContent = 'Updated ' + formatClock(now, fromTz) + ' ' + fromName;
      }
    }
  }

  function initHubPage(hub) {
    const fromSelect = document.getElementById('tz-hub-from');
    const toSelect = document.getElementById('tz-hub-to');
    const goBtn = document.getElementById('tz-hub-go');
    const preview = document.getElementById('tz-hub-preview');
    if (!fromSelect || !toSelect) return;

    hub.locations.forEach((loc) => {
      [fromSelect, toSelect].forEach((sel) => {
        const opt = document.createElement('option');
        opt.value = loc.slug;
        opt.textContent = loc.label || loc.name;
        sel.appendChild(opt);
      });
    });

    fromSelect.value = hub.locations[0]?.slug || '';
    toSelect.value = hub.locations[1]?.slug || '';

    function updatePreview() {
      const from = hub.locations.find((l) => l.slug === fromSelect.value);
      const to = hub.locations.find((l) => l.slug === toSelect.value);
      if (!from || !to || !preview) return;
      const now = new Date();
      const diffH = getOffsetDiffHours(now, from.timezone, to.timezone);
      preview.innerHTML = `
        <div class="tz-hub-preview-clocks">
          <div><strong>${escapeHtml(from.name)}</strong><br><span id="tz-hub-from-time">${formatClock(now, from.timezone)}</span></div>
          <div class="tz-hub-preview-diff">${formatDiffShort(diffH)}</div>
          <div><strong>${escapeHtml(to.name)}</strong><br><span id="tz-hub-to-time">${formatClock(now, to.timezone)}</span></div>
        </div>`;
    }

    updatePreview();
    setInterval(updatePreview, 1000);
    fromSelect.addEventListener('change', updatePreview);
    toSelect.addEventListener('change', updatePreview);

    if (goBtn) {
      goBtn.addEventListener('click', () => {
        const f = fromSelect.value;
        const t = toSelect.value;
        if (f === t) return;
        window.location.href = '/time/' + f + '-to-' + t + '/';
      });
    }
  }

  function updateClock(now, tz, timeEl, dateEl, offsetEl) {
    if (!timeEl) return;
    const parts = getParts(now, tz);
    timeEl.textContent = `${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;
    timeEl.setAttribute('datetime', now.toISOString());
    if (dateEl) {
      dateEl.textContent = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }).format(now);
    }
    if (offsetEl) {
      offsetEl.textContent = 'UTC' + formatOffset(getOffsetMinutes(now, tz));
    }
  }

  function convertSpecific(fromTz, toTz, toName, els) {
    if (!els.convertDate?.value || !els.convertTime?.value) return;
    const [y, m, d] = els.convertDate.value.split('-').map(Number);
    const [hh, mm] = els.convertTime.value.split(':').map(Number);
    const utcGuess = Date.UTC(y, m - 1, d, hh, mm);
    const adjusted = resolveWallTime(utcGuess, fromTz, hh, mm);
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: toTz,
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
    }).format(adjusted);
    els.convertResult.hidden = false;
    els.convertResultValue.textContent = formatted + ' (' + toName + ')';
  }

  function buildComparisonTable(fromTz, toTz, fromName, toName, tbody) {
    if (!tbody) return;
    const now = new Date();
    const rows = [];
    for (let h = 0; h < 24; h += 2) {
      const d = resolveWallTime(now.getTime(), fromTz, h, 0);
      const toFormatted = new Intl.DateTimeFormat('en-US', {
        timeZone: toTz, hour: 'numeric', minute: '2-digit', hour12: true
      }).format(d);
      const fromFormatted = formatHour12(h);
      const diffH = getOffsetDiffHours(d, fromTz, toTz);
      rows.push(`<tr><td>${fromFormatted}</td><td>${toFormatted}</td><td>${formatDiffShort(diffH)}</td></tr>`);
    }
    tbody.innerHTML = rows.join('');
  }

  function renderMeetingSlots(fromTz, toTz, fromName, toName, container) {
    if (!container) return;
    const now = new Date();
    const slots = [];
    for (let h = 6; h <= 20; h++) {
      const d = resolveWallTime(now.getTime(), fromTz, h, 0);
      const fromH = getParts(d, fromTz).hour;
      const toH = getParts(d, toTz).hour;
      if (fromH >= 9 && fromH < 17 && toH >= 9 && toH < 17) {
        slots.push({
          from: formatHour12(h),
          to: new Intl.DateTimeFormat('en-US', { timeZone: toTz, hour: 'numeric', minute: '2-digit', hour12: true }).format(d)
        });
      }
    }
    if (slots.length === 0) {
      container.innerHTML = '<p class="tz-no-slots">No overlapping 9–5 business hours today. Try early morning or evening in one zone.</p>';
      return;
    }
    container.innerHTML = slots.slice(0, 6).map((s) =>
      `<div class="tz-meeting-slot"><span>${fromName}: <strong>${s.from}</strong></span><span>${toName}: <strong>${s.to}</strong></span></div>`
    ).join('');
  }

  function getParts(date, tz) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const p = {};
    fmt.formatToParts(date).forEach((x) => { if (x.type !== 'literal') p[x.type] = x.value; });
    return {
      year: +p.year, month: +p.month, day: +p.day,
      hour: +p.hour, minute: +p.minute, second: +p.second
    };
  }

  function getOffsetMinutes(date, tz) {
    const p = getParts(date, tz);
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    return Math.round((asUtc - date.getTime()) / 60000);
  }

  function getOffsetDiffHours(date, fromTz, toTz) {
    return (getOffsetMinutes(date, toTz) - getOffsetMinutes(date, fromTz)) / 60;
  }

  function formatOffset(minutes) {
    const sign = minutes >= 0 ? '+' : '-';
    const abs = Math.abs(minutes);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return m ? `${sign}${h}:${pad(m)}` : `${sign}${h}`;
  }

  function formatDiff(hours, toName, fromName) {
    if (Math.abs(hours) < 0.01) return `${toName} is the same time as ${fromName}`;
    const abs = Math.abs(hours);
    const h = Math.floor(abs);
    const m = Math.round((abs - h) * 60);
    const part = m ? `${h}h ${m}m` : `${h} hour${h !== 1 ? 's' : ''}`;
    return hours > 0
      ? `${toName} is ${part} ahead of ${fromName}`
      : `${toName} is ${part} behind ${fromName}`;
  }

  function formatDiffShort(hours) {
    if (Math.abs(hours) < 0.01) return 'Same time';
    const sign = hours > 0 ? '+' : '−';
    const abs = Math.abs(hours);
    const h = Math.floor(abs);
    const m = Math.round((abs - h) * 60);
    return m ? `${sign}${h}h ${m}m` : `${sign}${h}h`;
  }

  function formatClock(date, tz) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
    }).format(date);
  }

  function formatDateInput(date, tz) {
    const p = getParts(date, tz);
    return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
  }

  function formatTimeInput(date, tz) {
    const p = getParts(date, tz);
    return `${pad(p.hour)}:${pad(p.minute)}`;
  }

  function formatHour12(h) {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:00 ${ampm}`;
  }

  function resolveWallTime(baseMs, tz, hour, minute) {
    const p = getParts(new Date(baseMs), tz);
    let guess = Date.UTC(p.year, p.month - 1, p.day, hour, minute);
    for (let i = 0; i < 3; i++) {
      const off = getOffsetMinutes(new Date(guess), tz);
      guess = Date.UTC(p.year, p.month - 1, p.day, hour, minute) - off * 60000;
    }
    return new Date(guess);
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
})();
