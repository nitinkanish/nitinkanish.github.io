document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calc-form');
  const results = document.getElementById('calc-results');
  if (!form) return;

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
    engine.renderResults(results, {
      primary: `${engine.formatNumber(result, 4)} ${toUnit.value}`,
      primaryLabel: 'Converted Value',
      items: [
        { label: 'From', value: `${val} ${fromUnit.value}` },
        { label: 'Meters', value: engine.formatNumber(meters, 4) }
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
