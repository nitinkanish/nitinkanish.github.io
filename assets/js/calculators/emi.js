document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calc-form');
  const results = document.getElementById('calc-results');
  if (!form) return;

  const engine = new CalculatorEngine({ form, locale: 'en-IN', currency: 'INR' });
  engine.onCalculate = (v) => {
    const P = engine.parseNumber(v.principal);
    const annualRate = engine.parseNumber(v.rate);
    const months = engine.parseNumber(v.tenure);
    if (!P || !annualRate || !months) return null;

    const r = annualRate / 12 / 100;
    const emi = P * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
    const total = emi * months;
    const interest = total - P;

    const result = {
      primary: engine.formatCurrency(emi),
      primaryLabel: 'Monthly EMI',
      items: [
        { label: 'Principal', value: engine.formatCurrency(P) },
        { label: 'Total Interest', value: engine.formatCurrency(interest) },
        { label: 'Total Payment', value: engine.formatCurrency(total) }
      ]
    };
    engine.renderResults(results, result);
    return result;
  };
  engine.init();
});
