document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calc-form');
  const results = document.getElementById('calc-results');
  if (!form) return;

  const engine = new CalculatorEngine({ form, locale: 'en-IN', currency: 'INR' });
  engine.onCalculate = (v) => {
    const P = engine.parseNumber(v.principal);
    const rate = engine.parseNumber(v.rate);
    const years = engine.parseNumber(v.years);
    const n = engine.parseNumber(v.compound) || 12;
    const PMT = engine.parseNumber(v.monthly) || 0;
    if (!P || !rate || !years) return null;

    const r = rate / 100 / n;
    const periods = n * years;
    let amount = P * Math.pow(1 + r, periods);
    if (PMT > 0) {
      amount += PMT * ((Math.pow(1 + r, periods) - 1) / r);
    }
    const invested = P + PMT * periods;
    const interest = amount - invested;

    const result = {
      primary: engine.formatCurrency(amount),
      primaryLabel: 'Final Amount',
      items: [
        { label: 'Total Invested', value: engine.formatCurrency(invested) },
        { label: 'Interest Earned', value: engine.formatCurrency(interest) },
        { label: 'Growth', value: engine.formatPercent((interest / invested) * 100, 1) }
      ]
    };
    engine.renderResults(results, result);
    return result;
  };
  engine.init();
});
