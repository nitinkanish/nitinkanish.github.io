document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="loan-payoff"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form, locale: 'en-IN', currency: 'INR' });
  UI.bindSliders(form);

  engine.onCalculate = (v) => {
    const P = engine.parseNumber(v.principal);
    const annualRate = engine.parseNumber(v.rate);
    const months = engine.parseNumber(v.tenure);
    const extra = engine.parseNumber(v.extra) || 0;
    if (!P || !annualRate || !months) return null;

    const base = amortize(P, annualRate, months, 0);
    const withExtra = amortize(P, annualRate, months, extra);
    const monthsSaved = base.months - withExtra.months;
    const interestSaved = base.totalInterest - withExtra.totalInterest;

    UI.publishDashboard(engine, {
      primary: monthsSaved + ' mo saved',
      metrics: [
        engine.formatCurrency(interestSaved),
        withExtra.months + ' mo payoff',
        engine.formatCurrency(withExtra.emi) + '/mo'
      ],
      compare: engine.formatCurrency(interestSaved) + ' saved',
      shareBadge: monthsSaved + ' months sooner',
      shareText: `Extra ₹${extra}/mo saves ${monthsSaved} months and ${engine.formatCurrency(interestSaved)} interest!`,
      timeline: [
        { label: 'Original', balance: base.months + ' months', growth: engine.formatCurrency(base.totalInterest) + ' interest', milestone: '📅' },
        { label: 'With Extra', balance: withExtra.months + ' months', growth: engine.formatCurrency(withExtra.totalInterest) + ' interest', milestone: '✅' },
        { label: 'You Save', balance: monthsSaved + ' months', growth: engine.formatCurrency(interestSaved), milestone: '💰' }
      ],
      insights: [
        { icon: '💰', text: `Save ${engine.formatCurrency(interestSaved)} in interest with ₹${engine.formatNumber(extra, 0)} extra/month.` },
        { icon: '⏱️', text: `Loan paid off ${monthsSaved} months (${(monthsSaved / 12).toFixed(1)} years) sooner.` },
        { icon: '📉', text: `New payoff: ${withExtra.months} months vs ${base.months} months originally.` },
        { icon: '💡', text: extra > 0 ? 'Even small extra payments compound into large savings.' : 'Add an extra payment amount to see savings.' }
      ]
    });
    return { monthsSaved, interestSaved };
  };

  engine.init();
  engine.calculate();

  function amortize(P, annualRate, maxMonths, extra) {
    const r = annualRate / 12 / 100;
    const emi = P * r * Math.pow(1 + r, maxMonths) / (Math.pow(1 + r, maxMonths) - 1);
    let balance = P;
    let totalInterest = 0;
    let m = 0;
    while (balance > 0.01 && m < maxMonths * 2) {
      m++;
      const interest = balance * r;
      let principal = emi - interest + extra;
      if (principal > balance) principal = balance;
      totalInterest += interest;
      balance -= principal;
    }
    return { months: m, totalInterest, emi: emi + extra };
  }
});
