document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calc-form');
  const results = document.getElementById('calc-results');
  if (!form) return;

  const engine = new CalculatorEngine({ form, locale: 'en-IN', currency: 'INR' });
  engine.onCalculate = (v) => {
    const P = engine.parseNumber(v.principal);
    const rate = engine.parseNumber(v.rate);
    const years = engine.parseNumber(v.years);
    const n = engine.parseNumber(v.compound) || 4;
    if (!P || !rate || !years) return null;

    const amount = P * Math.pow(1 + rate / 100 / n, n * years);
    const interest = amount - P;

    const result = {
      primary: engine.formatCurrency(amount),
      primaryLabel: 'Maturity Amount',
      items: [
        { label: 'Principal', value: engine.formatCurrency(P) },
        { label: 'Interest Earned', value: engine.formatCurrency(interest) },
        { label: 'Effective Rate', value: engine.formatPercent(rate, 2) }
      ]
    };
    engine.renderResults(results, result);
    return result;
  };
  engine.init();
});
