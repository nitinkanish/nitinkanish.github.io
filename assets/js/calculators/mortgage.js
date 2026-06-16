document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="mortgage"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form, locale: 'en-US', currency: 'USD' });

  UI.bindSliders(form);
  UI.bindChips(form);

  engine.onCalculate = (v) => {
    const P = engine.parseNumber(v.principal);
    const annualRate = engine.parseNumber(v.rate);
    const months = engine.parseNumber(v.tenure);
    if (!P || !annualRate || !months) return null;

    const data = computeMortgage(P, annualRate, months);
    publish(data, engine, P, annualRate, months);
    return data;
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: (d) => {
      const r = computeMortgage(d.principal, d.rate, d.tenure);
      return engine.formatCurrency(r.payment) + '/mo';
    },
    apply: (d, f) => {
      setField(f, 'principal', d.principal);
      setField(f, 'rate', d.rate);
      setField(f, 'tenure', d.tenure);
      engine.calculate();
    }
  });

  function computeMortgage(P, annualRate, months) {
    const r = annualRate / 12 / 100;
    const payment = P * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
    const total = payment * months;
    const interest = total - P;
    const years = Math.ceil(months / 12);

    const yearlyData = [];
    let balance = P;
    let principalPaid = 0;
    let interestPaid = 0;

    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12 && (y - 1) * 12 + m < months; m++) {
        const intPmt = balance * r;
        const prinPmt = payment - intPmt;
        interestPaid += intPmt;
        principalPaid += prinPmt;
        balance -= prinPmt;
      }
      yearlyData.push({ year: y, balance: Math.max(balance, 0), principalPaid, interestPaid, amount: Math.max(balance, 0) });
    }

    const milestoneYears = [1, 5, 10, 15, years].filter((y, i, a) => y <= years && a.indexOf(y) === i).sort((a, b) => a - b);
    const milestones = milestoneYears.map((y) => {
      const row = yearlyData[Math.min(y, yearlyData.length) - 1];
      const pct = P > 0 ? ((P - row.balance) / P) * 100 : 0;
      return {
        label: 'Year ' + y,
        balance: engine.formatCurrency(row.balance) + ' remaining',
        growth: engine.formatNumber(pct, 0) + '% paid off',
        milestone: row.balance <= 0 ? '✅ Mortgage Free' : '🏠 Building equity'
      };
    });

    return { payment, total, interest, P, yearlyData, milestones, years, annualRate, months };
  }

  function publish(d, eng, P, rate, months) {
    const savedWithLower = computeMortgage(P, rate - 0.5, months).payment;
    UI.publishDashboard(eng, {
      primary: d.payment,
      metrics: [
        eng.formatCurrency(P),
        eng.formatCurrency(d.interest),
        eng.formatCurrency(d.total)
      ],
      compare: eng.formatCurrency(d.payment) + '/mo',
      shareBadge: eng.formatCurrency(d.total) + ' total',
      shareText: `My mortgage: ${eng.formatCurrency(d.payment)}/month for ${Math.floor(months / 12)} years`,
      timeline: d.milestones,
      goalValue: d.total,
      yearlyData: d.yearlyData,
      chartValueFn: UI.financeChartFn,
      fieldDisplays: {
        principal: eng.formatCurrency(P),
        rate: eng.formatPercent(rate, 2),
        tenure: months + ' mo (' + Math.floor(months / 12) + ' yr)'
      },
      insights: [
        { icon: '🏠', text: `Total interest: ${eng.formatCurrency(d.interest)} — ${eng.formatNumber((d.interest / P) * 100, 0)}% of loan amount.` },
        { icon: '📅', text: `${Math.floor(months / 12)}-year term at ${eng.formatPercent(rate, 2)} APR.` },
        { icon: '💡', text: `A 0.5% lower rate could reduce payment to ~${eng.formatCurrency(savedWithLower)}/month.` },
        { icon: '⚡', text: 'Extra principal payments can shave years off your mortgage and save thousands in interest.' }
      ]
    });
  }

  function setField(f, id, val) {
    const input = f.querySelector('#' + id);
    const range = f.querySelector('#' + id + '-range');
    if (input) { input.value = val; input.dispatchEvent(new Event('input', { bubbles: true })); }
    if (range) range.value = val;
  }
});
