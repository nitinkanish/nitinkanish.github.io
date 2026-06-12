document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="weight-converter"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const units = {
    mg: 0.000001, g: 0.001, kg: 1, t: 1000,
    oz: 0.0283495, lb: 0.453592, st: 6.35029
  };

  const engine = new CalculatorEngine({ form });
  const fromInput = form.querySelector('[name="from_value"]');
  const toInput = form.querySelector('[name="to_value"]');
  const fromUnit = form.querySelector('[name="from_unit"]');
  const toUnit = form.querySelector('[name="to_unit"]');

  function convert() {
    const val = engine.parseNumber(fromInput.value);
    if (!val) return;
    const kg = val * units[fromUnit.value];
    const result = kg / units[toUnit.value];
    toInput.value = engine.formatNumber(result, 6);

    UI.publishDashboard(engine, {
      primary: engine.formatNumber(result, 4) + ' ' + toUnit.value,
      metrics: [
        val + ' ' + fromUnit.value,
        toUnit.value,
        engine.formatNumber(kg, 4) + ' kg'
      ],
      compare: engine.formatNumber(result, 4) + ' ' + toUnit.value,
      shareBadge: fromUnit.value + ' → ' + toUnit.value,
      shareText: `${val} ${fromUnit.value} = ${engine.formatNumber(result, 4)} ${toUnit.value}`,
      insights: [
        { icon: '⚖️', text: `${val} ${fromUnit.value} equals ${engine.formatNumber(result, 4)} ${toUnit.value}.` },
        { icon: '🔢', text: `In kilograms: ${engine.formatNumber(kg, 4)} kg.` },
        { icon: '💡', text: '1 lb = 0.453592 kg · 1 kg = 2.20462 lb.' },
        { icon: '📦', text: 'Use metric for science; imperial for US/UK everyday use.' }
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
      const kg = d.from_value * units[d.from_unit];
      return engine.formatNumber(kg / units[d.to_unit], 2) + ' ' + d.to_unit;
    },
    apply: (d) => {
      fromInput.value = d.from_value;
      fromUnit.value = d.from_unit;
      toUnit.value = d.to_unit;
      convert();
    }
  });

  convert();
});
