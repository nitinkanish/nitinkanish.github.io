document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="date-difference"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });

  const endEl = form.querySelector('#end_date');
  if (endEl && !endEl.value) endEl.value = new Date().toISOString().slice(0, 10);

  engine.onCalculate = (v) => {
    const start = new Date(v.start_date + 'T00:00:00');
    const end = v.end_date ? new Date(v.end_date + 'T00:00:00') : new Date();
    end.setHours(0, 0, 0, 0);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    let from = start;
    let to = end;
    const reversed = from > to;
    if (reversed) { from = end; to = start; }

    let totalDays = Math.floor((to - from) / 86400000);
    if (v.inclusive) totalDays += 1;

    let years = to.getFullYear() - from.getFullYear();
    let months = to.getMonth() - from.getMonth();
    let days = to.getDate() - from.getDate();

    if (days < 0) {
      months--;
      days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const weeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;
    const breakdown = `${years}y ${months}m ${days}d`;

    UI.publishDashboard(engine, {
      primary: engine.formatNumber(totalDays, 0) + ' days',
      metrics: [
        breakdown,
        weeks + ' weeks',
        engine.formatNumber(totalDays / 30.44, 1) + ' months (avg)'
      ],
      compare: breakdown,
      shareBadge: totalDays + ' days',
      shareText: `${totalDays} days between ${formatDate(from)} and ${formatDate(to)}`,
      fieldDisplays: {
        start_date: formatDate(start),
        end_date: formatDate(end)
      },
      insights: [
        { icon: '📅', text: `Exact span: ${breakdown} (${totalDays.toLocaleString()} days).` },
        { icon: '📆', text: `That's ${weeks} full weeks and ${remainingDays} extra day${remainingDays !== 1 ? 's' : ''}.` },
        { icon: reversed ? '↩️' : '➡️', text: reversed ? 'End date is before start date — showing absolute difference.' : 'Calculating forward from start to end date.' },
        { icon: '⏱️', text: `Approximately ${engine.formatNumber(totalDays / 365.25, 2)} years on the calendar.` }
      ]
    });

    return { totalDays, years, months, days, weeks };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: () => '90 days',
    apply: (d, f) => {
      if (d.start_date) setDate(f, 'start_date', d.start_date);
      if (d.end_date) setDate(f, 'end_date', d.end_date);
      engine.calculate();
    }
  });

  function formatDate(d) {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function setDate(f, id, val) {
    const el = f.querySelector('#' + id);
    if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
  }
});
