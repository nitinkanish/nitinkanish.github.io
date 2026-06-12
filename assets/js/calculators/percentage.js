document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="percentage"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });

  engine.onCalculate = (v) => {
    const mode = v.mode || 'of';
    const a = engine.parseNumber(v.value1);
    const b = engine.parseNumber(v.value2);
    if (!a || !b) return null;

    let primary, typeLabel, formula;
    switch (mode) {
      case 'of':
        primary = (a / 100) * b;
        typeLabel = `${a}% of ${b}`;
        formula = `(${a}/100) × ${b}`;
        break;
      case 'what':
        primary = (a / b) * 100;
        typeLabel = `${a} is what % of ${b}`;
        formula = `(${a}/${b}) × 100`;
        break;
      case 'change':
        primary = ((b - a) / a) * 100;
        typeLabel = 'Percentage change';
        formula = `((${b}-${a})/${a}) × 100`;
        break;
      case 'increase':
        primary = a * (1 + b / 100);
        typeLabel = `${a} + ${b}%`;
        formula = `${a} × (1 + ${b}/100)`;
        break;
      case 'decrease':
        primary = a * (1 - b / 100);
        typeLabel = `${a} − ${b}%`;
        formula = `${a} × (1 − ${b}/100)`;
        break;
      default:
        return null;
    }

    const isPercent = mode === 'what' || mode === 'change';
    UI.publishDashboard(engine, {
      primary,
      primaryFormat: isPercent ? 'percent' : 'number',
      decimals: 2,
      metrics: [typeLabel, `${a}, ${b}`, formula],
      compare: isPercent ? engine.formatPercent(primary, 2) : engine.formatNumber(primary, 2),
      shareBadge: typeLabel,
      shareText: `Percentage result: ${isPercent ? engine.formatPercent(primary, 2) : engine.formatNumber(primary, 2)}`,
      insights: [
        { icon: '🔢', text: `${typeLabel} = ${isPercent ? engine.formatPercent(primary, 2) : engine.formatNumber(primary, 2)}` },
        { icon: '📐', text: `Formula: ${formula}` },
        { icon: '💡', text: 'Switch calculation mode for increase, decrease, or percentage-of problems.' },
        { icon: '✅', text: 'Double-check units — percentages apply to the whole, not cumulative steps.' }
      ]
    });

    return { primary };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: (d) => {
      if (d.mode === 'of') return engine.formatNumber((d.value1 / 100) * d.value2, 2);
      if (d.mode === 'increase') return engine.formatNumber(d.value1 * (1 + d.value2 / 100), 2);
      return '—';
    },
    apply: (d, f) => {
      if (d.mode) f.querySelector('#mode').value = d.mode;
      setVal(f, 'value1', d.value1);
      setVal(f, 'value2', d.value2);
      engine.calculate();
    }
  });

  function setVal(f, id, val) {
    const el = f.querySelector('#' + id);
    if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
  }
});
