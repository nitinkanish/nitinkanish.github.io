document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="fd"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form, locale: 'en-IN', currency: 'INR' });

  UI.bindSliders(form);
  UI.bindChips(form);

  engine.onCalculate = (v) => {
    const P = engine.parseNumber(v.principal);
    const rate = engine.parseNumber(v.rate);
    const years = engine.parseNumber(v.years);
    const n = engine.parseNumber(v.compound) || 4;
    if (!P || !rate || !years) return null;

    const amount = P * Math.pow(1 + rate / 100 / n, n * years);
    const interest = amount - P;
    const effective = (Math.pow(amount / P, 1 / years) - 1) * 100;

    const yearlyData = [];
    for (let y = 1; y <= years; y++) {
      const bal = P * Math.pow(1 + rate / 100 / n, n * y);
      yearlyData.push({ year: y, balance: bal, invested: P, gains: bal - P, amount: bal });
    }

    const milestones = [1, Math.ceil(years / 2), years].filter((y, i, a) => a.indexOf(y) === i).map((y) => {
      const bal = yearlyData[y - 1].balance;
      return {
        label: 'Year ' + y,
        balance: engine.formatCurrency(bal),
        growth: '+' + engine.formatNumber(((bal - P) / P) * 100, 1) + '%',
        milestone: bal >= P * 2 ? '💰 Doubled principal' : '📈 Growing safely'
      };
    });

    UI.publishDashboard(engine, {
      primary: amount,
      metrics: [
        engine.formatCurrency(P),
        engine.formatCurrency(interest),
        engine.formatPercent(effective, 2) + ' p.a.'
      ],
      compare: engine.formatCurrency(amount),
      shareBadge: engine.formatCurrency(interest) + ' interest',
      shareText: `My FD matures at ${engine.formatCurrency(amount)} in ${years} years`,
      timeline: milestones,
      goalValue: amount,
      yearlyData,
      chartValueFn: UI.financeChartFn,
      fieldDisplays: {
        principal: engine.formatCurrency(P),
        rate: engine.formatPercent(rate, 1),
        years: years + ' yrs'
      },
      insights: [
        { icon: '🛡️', text: `Safe fixed return of ${engine.formatCurrency(interest)} over ${years} years.` },
        { icon: '📊', text: `Effective annual yield: ${engine.formatPercent(effective, 2)} with ${n}x compounding.` },
        { icon: '💡', text: `Senior citizen rates (~1% higher) could add ${engine.formatCurrency(P * 0.01 * years)} more.` },
        { icon: '🏦', text: `Laddering FDs across tenures can improve liquidity and blended returns.` }
      ]
    });

    return { amount, interest, P };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: (d) => {
      const amt = d.principal * Math.pow(1 + d.rate / 100 / (d.compound || 4), (d.compound || 4) * d.years);
      return engine.formatCurrency(amt);
    },
    apply: (d, f) => {
      ['principal', 'rate', 'years'].forEach((k) => setField(f, k, d[k]));
      if (d.compound) f.querySelector('#compound').value = d.compound;
      engine.calculate();
    }
  });

  function setField(f, id, val) {
    const input = f.querySelector('#' + id);
    const range = f.querySelector('#' + id + '-range');
    if (input) { input.value = val; input.dispatchEvent(new Event('input', { bubbles: true })); }
    if (range) range.value = val;
  }
});
