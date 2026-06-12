document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="profit-margin"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form, locale: 'en-IN', currency: 'INR' });

  UI.bindSliders(form);

  engine.onCalculate = (v) => {
    const revenue = engine.parseNumber(v.revenue);
    const cost = engine.parseNumber(v.cost);
    if (!revenue || cost === undefined) return null;

    const profit = revenue - cost;
    const margin = (profit / revenue) * 100;
    const markup = cost > 0 ? (profit / cost) * 100 : 0;

    UI.publishDashboard(engine, {
      primary: margin,
      primaryFormat: 'percent',
      decimals: 2,
      metrics: [
        engine.formatCurrency(profit),
        engine.formatPercent(markup, 2),
        engine.formatCurrency(revenue)
      ],
      compare: engine.formatPercent(margin, 2),
      shareBadge: engine.formatPercent(margin, 1) + ' margin',
      shareText: `Profit margin: ${engine.formatPercent(margin, 2)} on ${engine.formatCurrency(revenue)} revenue`,
      goalValue: margin,
      fieldDisplays: {
        revenue: engine.formatCurrency(revenue),
        cost: engine.formatCurrency(cost)
      },
      insights: [
        { icon: '💰', text: `Gross profit: ${engine.formatCurrency(profit)} (${engine.formatPercent(margin, 2)} margin).` },
        { icon: '📈', text: `Markup on cost: ${engine.formatPercent(markup, 2)} — different from margin %.` },
        { icon: '🏪', text: 'Retail averages 25–35% gross margin; SaaS often 70–80%.' },
        { icon: '💡', text: margin < 20 ? 'Consider reviewing pricing or reducing COGS.' : 'Healthy margin — focus on volume and retention.' }
      ]
    });

    return { margin, profit };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: (d) => {
      const m = ((d.revenue - d.cost) / d.revenue) * 100;
      return engine.formatPercent(m, 1);
    },
    apply: (d, f) => {
      setField(f, 'revenue', d.revenue);
      setField(f, 'cost', d.cost);
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
