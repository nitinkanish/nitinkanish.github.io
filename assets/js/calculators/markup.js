document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="markup"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form, locale: 'en-IN', currency: 'INR' });
  UI.bindSliders(form);
  UI.bindChips(form);

  engine.onCalculate = (v) => {
    const cost = engine.parseNumber(v.cost);
    const markup = engine.parseNumber(v.markup);
    if (cost === undefined || markup === undefined) return null;

    const profit = cost * (markup / 100);
    const price = cost + profit;
    const margin = price > 0 ? (profit / price) * 100 : 0;

    UI.publishDashboard(engine, {
      primary: price,
      metrics: [
        engine.formatCurrency(profit),
        engine.formatPercent(markup, 1) + ' markup',
        engine.formatPercent(margin, 1) + ' margin'
      ],
      compare: engine.formatCurrency(price),
      shareBadge: engine.formatCurrency(price) + ' sell',
      shareText: `Cost ${engine.formatCurrency(cost)} + ${markup}% markup = ${engine.formatCurrency(price)}`,
      insights: [
        { icon: '💰', text: `Selling price: ${engine.formatCurrency(price)} (${engine.formatPercent(markup, 1)} markup on cost).` },
        { icon: '📊', text: `Profit: ${engine.formatCurrency(profit)} · Margin: ${engine.formatPercent(margin, 1)}.` },
        { icon: '⚖️', text: `${markup}% markup ≠ ${markup}% margin. Margin is lower than markup.` },
        { icon: '🏪', text: markup >= 50 ? 'Typical retail markup range.' : 'Consider if markup covers overhead and profit goals.' }
      ]
    });
    return { price, profit, margin };
  };

  engine.init();
  engine.calculate();
});
