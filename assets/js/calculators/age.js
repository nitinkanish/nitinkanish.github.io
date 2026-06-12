document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="age"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });

  engine.onCalculate = (v) => {
    const birth = new Date(v.birthdate);
    const end = v.enddate ? new Date(v.enddate) : new Date();
    if (isNaN(birth.getTime())) return null;

    let years = end.getFullYear() - birth.getFullYear();
    let months = end.getMonth() - birth.getMonth();
    let days = end.getDate() - birth.getDate();

    if (days < 0) { months--; days += new Date(end.getFullYear(), end.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }

    const totalDays = Math.floor((end - birth) / (1000 * 60 * 60 * 24));
    const totalMonths = years * 12 + months;

    const nextBirthday = new Date(end.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= end) nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    const daysToBirthday = Math.ceil((nextBirthday - end) / (1000 * 60 * 60 * 24));

    const ageStr = `${years}y ${months}m ${days}d`;

    UI.publishDashboard(engine, {
      primary: ageStr,
      metrics: [
        engine.formatNumber(totalDays, 0) + ' days',
        engine.formatNumber(totalMonths, 0) + ' months',
        daysToBirthday + ' days away'
      ],
      compare: ageStr,
      shareBadge: years + ' years old',
      shareText: `I'm exactly ${ageStr} old — calculate your exact age!`,
      insights: [
        { icon: '🎂', text: `You've lived ${engine.formatNumber(totalDays, 0)} days (${engine.formatNumber(totalMonths, 0)} months).` },
        { icon: '📅', text: `Next birthday in ${daysToBirthday} days.` },
        { icon: '🌍', text: `Born on ${birth.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.` },
        { icon: '⏳', text: `That's roughly ${engine.formatNumber(totalDays / 365.25, 1)} years on the calendar.` }
      ]
    });

    return { years, months, days, totalDays };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: () => 'Exact age',
    apply: (d, f) => {
      const el = f.querySelector('#birthdate');
      if (el && d.birthdate) { el.value = d.birthdate; el.dispatchEvent(new Event('input', { bubbles: true })); }
      engine.calculate();
    }
  });
});
