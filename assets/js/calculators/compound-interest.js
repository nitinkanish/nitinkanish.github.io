document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="compound-interest"]');
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
    const n = engine.parseNumber(v.compound) || 12;
    const PMT = engine.parseNumber(v.monthly) || 0;
    if (!rate || !years) return null;

    const r = rate / 100 / n;
    const periods = n * years;
    let amount = P * Math.pow(1 + r, periods);
    if (PMT > 0) amount += PMT * ((Math.pow(1 + r, periods) - 1) / r);
    const invested = P + PMT * periods;
    const interest = amount - invested;
    const multiplier = invested > 0 ? amount / invested : 0;

    const yearlyData = [];
    for (let y = 1; y <= years; y++) {
      const p = n * y;
      let bal = P * Math.pow(1 + r, p);
      if (PMT > 0) bal += PMT * ((Math.pow(1 + r, p) - 1) / r);
      const inv = P + PMT * p;
      yearlyData.push({ year: y, balance: bal, invested: inv, gains: bal - inv, amount: bal });
    }

    const milestones = [1, 5, 10, years].filter((y) => y <= years).map((y) => {
      const row = yearlyData[y - 1];
      return {
        label: 'Year ' + y,
        balance: engine.formatCurrency(row.balance),
        growth: '+' + engine.formatNumber(row.invested > 0 ? (row.gains / row.invested) * 100 : 0, 0) + '%',
        milestone: row.balance >= 1000000 ? '🎯 ₹10L+' : '📈 Compounding'
      };
    });

    UI.publishDashboard(engine, {
      primary: amount,
      metrics: [
        engine.formatCurrency(invested),
        engine.formatCurrency(interest),
        engine.formatNumber(multiplier, 1) + 'x'
      ],
      compare: engine.formatCurrency(amount),
      shareBadge: engine.formatNumber(multiplier, 1) + 'x growth',
      shareText: `Compound growth: ${engine.formatCurrency(amount)} in ${years} years`,
      timeline: milestones,
      goalValue: amount,
      yearlyData,
      chartValueFn: UI.financeChartFn,
      fieldDisplays: {
        principal: engine.formatCurrency(P),
        monthly: engine.formatCurrency(PMT),
        rate: engine.formatPercent(rate, 1),
        years: years + ' yrs'
      },
      insights: [
        { icon: '⚡', text: `Compounding earned ${engine.formatCurrency(interest)} — ${engine.formatNumber(multiplier, 1)}x your investment.` },
        { icon: '📊', text: `At ${engine.formatPercent(rate, 1)}, wealth doubles roughly every ${engine.formatNumber(Math.log(2) / Math.log(1 + rate / 100), 1)} years.` },
        { icon: '💡', text: `Starting 5 years earlier could more than double your final corpus.` },
        { icon: '🚀', text: `Monthly contributions of ${engine.formatCurrency(PMT)} accelerate long-term wealth significantly.` }
      ]
    });

    return { amount, invested, interest };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: (d) => engine.formatCurrency(compute(d)),
    apply: (d, f) => {
      ['principal', 'monthly', 'rate', 'years'].forEach((k) => { if (d[k] != null) setField(f, k, d[k]); });
      if (d.compound) f.querySelector('#compound').value = d.compound;
      engine.calculate();
    }
  });

  function compute(d) {
    const r = d.rate / 100 / (d.compound || 12);
    const p = (d.compound || 12) * d.years;
    let a = (d.principal || 0) * Math.pow(1 + r, p);
    if (d.monthly) a += d.monthly * ((Math.pow(1 + r, p) - 1) / r);
    return a;
  }

  function setField(f, id, val) {
    const input = f.querySelector('#' + id);
    const range = f.querySelector('#' + id + '-range');
    if (input) { input.value = val; input.dispatchEvent(new Event('input', { bubbles: true })); }
    if (range) range.value = val;
  }
});
