document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="mortgage-affordability"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form, locale: 'en-US', currency: 'USD' });

  engine.onCalculate = (v) => {
    const income = engine.parseNumber(v.income);
    const debt = engine.parseNumber(v.monthly_debt) || 0;
    const downPct = engine.parseNumber(v.down_payment) || 0;
    const rate = engine.parseNumber(v.rate);
    const years = engine.parseNumber(v.tenure) || 30;
    if (!income || !rate) return null;

    const monthlyIncome = income / 12;
    const maxHousing = monthlyIncome * 0.28;
    const maxTotalDebt = monthlyIncome * 0.36;
    const maxPayment = Math.min(maxHousing, maxTotalDebt - debt);
    if (maxPayment <= 0) return null;

    const months = years * 12;
    const r = rate / 12 / 100;
    const loanAmount = maxPayment * (Math.pow(1 + r, months) - 1) / (r * Math.pow(1 + r, months));
    const homePrice = loanAmount / (1 - downPct / 100);
    const downPayment = homePrice * (downPct / 100);

    UI.publishDashboard(engine, {
      primary: homePrice,
      metrics: [
        engine.formatCurrency(loanAmount),
        engine.formatCurrency(maxPayment) + '/mo',
        engine.formatCurrency(downPayment) + ' down'
      ],
      compare: engine.formatCurrency(homePrice),
      shareBadge: engine.formatCurrency(homePrice) + ' max',
      shareText: `I can afford up to ${engine.formatCurrency(homePrice)} based on ${engine.formatCurrency(income)}/yr income`,
      fieldDisplays: {
        income: engine.formatCurrency(income) + '/yr',
        rate: engine.formatPercent(rate, 2),
        tenure: years + ' years'
      },
      insights: [
        { icon: '🏠', text: `Max home price ≈ ${engine.formatCurrency(homePrice)} with ${downPct}% down (${engine.formatCurrency(downPayment)}).` },
        { icon: '📊', text: `28% rule allows ${engine.formatCurrency(maxHousing)}/mo housing; 36% total debt cap applied.` },
        { icon: '💳', text: `Monthly payment ≈ ${engine.formatCurrency(maxPayment)} (P&I only).` },
        { icon: '⚠️', text: 'Add taxes, insurance, and HOA for full monthly housing cost.' }
      ]
    });
    return { homePrice, loanAmount, maxPayment };
  };

  engine.init();
  engine.calculate();
});
