document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="length-converter"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const units = {
    mm: 0.001, cm: 0.01, m: 1, km: 1000,
    in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344
  };

  const engine = new CalculatorEngine({ form });
  const fromInput = form.querySelector('[name="from_value"]');
  const toInput = form.querySelector('[name="to_value"]');
  const fromUnit = form.querySelector('[name="from_unit"]');
  const toUnit = form.querySelector('[name="to_unit"]');

  function convert() {
    const val = engine.parseNumber(fromInput.value);
    if (!val) return;
    const meters = val * units[fromUnit.value];
    const result = meters / units[toUnit.value];
    toInput.value = engine.formatNumber(result, 6);

    UI.publishDashboard(engine, {
      primary: engine.formatNumber(result, 4) + ' ' + toUnit.value,
      metrics: [
        val + ' ' + fromUnit.value,
        toUnit.value,
        engine.formatNumber(meters, 4) + ' m'
      ],
      compare: engine.formatNumber(result, 4) + ' ' + toUnit.value,
      shareBadge: fromUnit.value + ' → ' + toUnit.value,
      shareText: `${val} ${fromUnit.value} = ${engine.formatNumber(result, 4)} ${toUnit.value}`,
      insights: [
        { icon: '📏', text: `${val} ${fromUnit.value} equals ${engine.formatNumber(result, 4)} ${toUnit.value}.` },
        { icon: '🔢', text: `In meters: ${engine.formatNumber(meters, 4)} m.` },
        { icon: '💡', text: 'Use the swap button to reverse the conversion instantly.' },
        { icon: '🌍', text: '1 foot = 0.3048 m · 1 mile = 1.609344 km (exact).' }
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

  UI.bindExamples(form, {
    preview: (d) => {
      const m = d.from_value * units[d.from_unit];
      return engine.formatNumber(m / units[d.to_unit], 4) + ' ' + d.to_unit;
    },
    apply: (d, f) => {
      fromInput.value = d.from_value;
      fromUnit.value = d.from_unit;
      toUnit.value = d.to_unit;
      convert();
    }
  });

  convert();
});
