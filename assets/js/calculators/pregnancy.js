document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="pregnancy"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });

  const lmpGroup = form.querySelector('#lmp-group');
  const conceptionGroup = form.querySelector('#conception-group');
  const methodEl = form.querySelector('#method');
  const lmpEl = form.querySelector('#lmp_date');

  if (lmpEl && !lmpEl.value) {
    const d = new Date();
    d.setDate(d.getDate() - 84);
    lmpEl.value = d.toISOString().slice(0, 10);
  }

  methodEl?.addEventListener('change', () => {
    const isLmp = methodEl.value === 'lmp';
    lmpGroup.hidden = !isLmp;
    conceptionGroup.hidden = isLmp;
    engine.calculate();
  });

  engine.onCalculate = (v) => {
    const method = v.method || 'lmp';
    const cycle = engine.parseNumber(v.cycle_length) || 28;
    const ref = v.reference_date ? new Date(v.reference_date) : new Date();
    ref.setHours(0, 0, 0, 0);

    let startDate;
    let dueDays;

    if (method === 'conception') {
      if (!v.conception_date) return null;
      startDate = parseDate(v.conception_date);
      dueDays = 266;
    } else {
      if (!v.lmp_date) return null;
      startDate = parseDate(v.lmp_date);
      dueDays = 280 + (cycle - 28);
    }

    if (!startDate || isNaN(startDate.getTime())) return null;

    const dueDate = addDays(startDate, dueDays);
    const gestDays = method === 'conception'
      ? daysBetween(startDate, ref) + 14
      : daysBetween(startDate, ref);

    if (gestDays < 0) return null;

    const weeks = Math.floor(gestDays / 7);
    const days = gestDays % 7;
    const daysLeft = daysBetween(ref, dueDate);
    const trimester = weeks < 13 ? 'First Trimester' : weeks < 28 ? 'Second Trimester' : 'Third Trimester';
    const progress = Math.min(100, Math.max(0, (gestDays / 280) * 100));
    const weekStr = `${weeks} weeks, ${days} days`;

    const milestones = [
      { label: 'Week 8', balance: 'Heartbeat may be detectable', growth: 'Early development', milestone: '❤️' },
      { label: 'Week 12', balance: 'End of first trimester', growth: 'Risk drops significantly', milestone: '🌱' },
      { label: 'Week 20', balance: 'Anatomy scan period', growth: 'Halfway milestone', milestone: '👶' },
      { label: 'Week 28', balance: 'Third trimester begins', growth: 'Rapid growth phase', milestone: '📈' },
      { label: 'Week 37', balance: 'Early term', growth: 'Baby nearly full-term', milestone: '✅' },
      { label: 'Due Date', balance: formatDate(dueDate), growth: 'Estimated delivery', milestone: '🎉' }
    ].filter((m) => {
      const w = parseInt(m.label.replace(/\D/g, ''), 10);
      return m.label === 'Due Date' || w <= weeks + 4;
    });

    UI.publishDashboard(engine, {
      primary: weekStr,
      metrics: [
        formatDate(dueDate),
        trimester,
        daysLeft >= 0 ? daysLeft + ' days left' : Math.abs(daysLeft) + ' days past due'
      ],
      compare: weekStr,
      shareBadge: 'Due ' + formatDate(dueDate),
      shareText: `I'm ${weekStr} pregnant — due date ${formatDate(dueDate)}!`,
      timeline: milestones,
      goalValue: progress,
      fieldDisplays: {
        method: method === 'lmp' ? 'LMP' : 'Conception',
        cycle_length: cycle + ' days',
        reference_date: formatDate(ref)
      },
      insights: [
        { icon: '📅', text: `Estimated due date: ${formatDate(dueDate)} (Naegele's rule${method === 'lmp' && cycle !== 28 ? ', cycle adjusted' : ''}).` },
        { icon: '🤰', text: `You are in your ${trimester.toLowerCase()} — ${engine.formatNumber(progress, 0)}% of a typical 40-week pregnancy.` },
        { icon: '⏳', text: daysLeft >= 0 ? `${daysLeft} days until your due date.` : `${Math.abs(daysLeft)} days past your due date — consult your provider.` },
        { icon: '⚕️', text: 'This is an estimate only. Ultrasound dating and prenatal care from your doctor are essential.' }
      ]
    });

    return { weeks, days, dueDate, trimester, daysLeft, gestDays };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: () => '12 weeks pregnant',
    apply: (d, f) => {
      if (d.method) {
        const m = f.querySelector('#method');
        if (m) { m.value = d.method; m.dispatchEvent(new Event('change', { bubbles: true })); }
      }
      if (d.lmp_date) {
        const el = f.querySelector('#lmp_date');
        if (el) { el.value = d.lmp_date; el.dispatchEvent(new Event('input', { bubbles: true })); }
      }
      engine.calculate();
    }
  });

  function parseDate(str) {
    const d = new Date(str + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }

  function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  }

  function daysBetween(a, b) {
    const utc = (d) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.floor((utc(b) - utc(a)) / 86400000);
  }

  function formatDate(d) {
    return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }
});
