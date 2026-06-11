document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calc-form');
  const results = document.getElementById('calc-results');
  if (!form) return;

  const engine = new CalculatorEngine({ form });
  engine.onCalculate = (v) => {
    const mode = v.mode || 'of';
    const a = engine.parseNumber(v.value1);
    const b = engine.parseNumber(v.value2);
    if (!a || !b) return null;

    let primary, label, items = [];

    switch (mode) {
      case 'of':
        primary = engine.formatNumber((a / 100) * b, 2);
        label = `${a}% of ${b}`;
        items = [{ label: 'Percentage', value: `${a}%` }, { label: 'Of', value: b }];
        break;
      case 'what':
        primary = engine.formatPercent((a / b) * 100, 2);
        label = `${a} is what % of ${b}`;
        break;
      case 'change':
        primary = engine.formatPercent(((b - a) / a) * 100, 2);
        label = 'Percentage Change';
        items = [{ label: 'From', value: a }, { label: 'To', value: b }];
        break;
      case 'increase':
        primary = engine.formatNumber(a * (1 + b / 100), 2);
        label = `${a} + ${b}%`;
        break;
      case 'decrease':
        primary = engine.formatNumber(a * (1 - b / 100), 2);
        label = `${a} - ${b}%`;
        break;
      default:
        return null;
    }

    const result = { primary, primaryLabel: label, items };
    engine.renderResults(results, result);
    return result;
  };
  engine.init();
});
