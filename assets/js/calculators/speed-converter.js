document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="speed-converter"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const units = { ms: 1, kmh: 3.6, mph: 2.23694, knots: 1.94384, fts: 3.28084 };
  const engine = new CalculatorEngine({ form });
  const fromInput = form.querySelector('[name="from_value"]');
  const toInput = form.querySelector('[name="to_value"]');
  const fromUnit = form.querySelector('[name="from_unit"]');
  const toUnit = form.querySelector('[name="to_unit"]');

  function convert() {
    const val = engine.parseNumber(fromInput.value);
    if (val === undefined || val === null) return;
    const ms = val / units[fromUnit.value];
    const result = ms * units[toUnit.value];
    toInput.value = engine.formatNumber(result, 4);

    UI.publishDashboard(engine, {
      primary: engine.formatNumber(result, 4) + ' ' + toUnit.value,
      metrics: [val + ' ' + fromUnit.value, toUnit.value, engine.formatNumber(ms, 4) + ' m/s'],
      compare: engine.formatNumber(result, 4) + ' ' + toUnit.value,
      shareBadge: fromUnit.value + ' → ' + toUnit.value,
      shareText: `${val} ${fromUnit.value} = ${engine.formatNumber(result, 4)} ${toUnit.value}`,
      insights: [
        { icon: '🚗', text: `${val} ${fromUnit.value} = ${engine.formatNumber(result, 4)} ${toUnit.value}.` },
        { icon: '🔢', text: `In m/s: ${engine.formatNumber(ms, 4)} m/s.` },
        { icon: '✈️', text: '1 knot = 1.852 km/h · 1 mph = 1.609344 km/h.' },
        { icon: '💡', text: 'Use swap to reverse conversion instantly.' }
      ]
    });
  }

  form.addEventListener('input', convert);
  form.querySelector('.swap-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    const tmp = fromUnit.value;
    fromUnit.value = toUnit.value;
    toUnit.value = tmp;
    fromInput.value = toInput.value;
    convert();
  });
  convert();
});
