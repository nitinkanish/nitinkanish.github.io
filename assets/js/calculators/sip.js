document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calc-form');
  const results = document.getElementById('calc-results');
  if (!form) return;

  const engine = new CalculatorEngine({ form, locale: 'en-IN', currency: 'INR' });
  engine.onCalculate = (v) => {
    const P = engine.parseNumber(v.monthly);
    const annualReturn = engine.parseNumber(v.return);
    const years = engine.parseNumber(v.years);
    if (!P || !annualReturn || !years) return null;

    const months = years * 12;
    const r = annualReturn / 12 / 100;
    const invested = P * months;
    const fv = P * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    const gains = fv - invested;

    const result = {
      primary: engine.formatCurrency(fv),
      primaryLabel: 'Estimated Returns',
      items: [
        { label: 'Invested Amount', value: engine.formatCurrency(invested) },
        { label: 'Wealth Gained', value: engine.formatCurrency(gains) },
        { label: 'Annual Return', value: engine.formatPercent(annualReturn, 1) }
      ]
    };
    engine.renderResults(results, result);
    return result;
  };
  engine.init();
});
