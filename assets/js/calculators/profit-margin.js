document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calc-form');
  const results = document.getElementById('calc-results');
  if (!form) return;

  const engine = new CalculatorEngine({ form, locale: 'en-IN', currency: 'INR' });
  engine.onCalculate = (v) => {
    const revenue = engine.parseNumber(v.revenue);
    const cost = engine.parseNumber(v.cost);
    if (!revenue || cost === undefined) return null;

    const profit = revenue - cost;
    const margin = (profit / revenue) * 100;
    const markup = cost > 0 ? (profit / cost) * 100 : 0;

    const result = {
      primary: engine.formatPercent(margin, 2),
      primaryLabel: 'Profit Margin',
      items: [
        { label: 'Profit', value: engine.formatCurrency(profit) },
        { label: 'Markup', value: engine.formatPercent(markup, 2) },
        { label: 'Revenue', value: engine.formatCurrency(revenue) }
      ]
    };
    engine.renderResults(results, result);
    return result;
  };
  engine.init();
});
